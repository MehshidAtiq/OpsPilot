import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import Document, User
from ..schemas.document import DocumentResponse
from ..services.audit import write_audit_log
from ..services.storage import document_storage

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    result = await session.execute(
        select(Document)
        .where(Document.company_id == user.company_id)
        .order_by(Document.created_at.desc())
    )
    return [DocumentResponse.model_validate(document) for document in result.scalars()]


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> DocumentResponse:
    storage_key, size_bytes = await document_storage.save(user.company_id, file)
    document = Document(
        company_id=user.company_id,
        uploader_id=user.id,
        title=file.filename or "Untitled document",
        source="upload",
        storage_key=storage_key,
        mime=file.content_type or "application/octet-stream",
        size_bytes=size_bytes,
        status="pending",
        metadata_={},
    )
    session.add(document)
    await session.flush()
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="doc_uploaded",
        entity_type="document",
        entity_id=str(document.id),
        metadata={"title": document.title, "size_bytes": size_bytes},
    )
    await session.commit()
    await session.refresh(document)
    return DocumentResponse.model_validate(document)


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> DocumentResponse:
    result = await session.execute(
        select(Document).where(
            Document.id == document_id,
            Document.company_id == user.company_id,
        )
    )
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocumentResponse.model_validate(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> None:
    result = await session.execute(
        select(Document).where(
            Document.id == document_id,
            Document.company_id == user.company_id,
        )
    )
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    await session.delete(document)
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="doc_deleted",
        entity_type="document",
        entity_id=str(document_id),
    )
    await session.commit()

