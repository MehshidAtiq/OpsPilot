import logging
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..ai.embeddings import EmbeddingsError, embeddings_client
from ..db import get_session
from ..deps import get_current_user
from ..models import Document, User
from ..schemas.document import DocumentResponse
from ..services.audit import write_audit_log
from ..services.rag import embed_and_upsert_document
from ..services.storage import document_storage

logger = logging.getLogger(__name__)

_INDEXABLE_MIMES = {
    "text/plain",
    "text/markdown",
    "text/x-markdown",
    "text/html",
    "application/json",
    "application/x-yaml",
    "text/csv",
}

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
    mime = file.content_type or "application/octet-stream"
    document = Document(
        company_id=user.company_id,
        uploader_id=user.id,
        title=file.filename or "Untitled document",
        source="upload",
        storage_key=storage_key,
        mime=mime,
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

    # --- Index for RAG (Phase 3) ---
    # We only handle text-y MIME types here. Binary formats (PDF, DOCX) need
    # extractors we haven't built yet — they stay status="pending".
    indexed_chunks = 0
    if mime in _INDEXABLE_MIMES:
        body = await _read_text_body(user.company_id, storage_key)
        if body:
            try:
                indexed_chunks = await embed_and_upsert_document(
                    session,
                    document=document,
                    body=body,
                    embeddings=embeddings_client,
                )
            except EmbeddingsError as exc:
                # Don't fail the upload — the file is saved. Log and let the
                # user retry indexing later.
                logger.warning("Embedding failed for %s: %s", document.id, exc)
                document.status = "embed_failed"
            else:
                await write_audit_log(
                    session,
                    company_id=user.company_id,
                    user_id=user.id,
                    action="doc_indexed",
                    entity_type="document",
                    entity_id=str(document.id),
                    metadata={"chunks": indexed_chunks},
                )

    await session.commit()
    await session.refresh(document)
    return DocumentResponse.model_validate(document)


async def _read_text_body(company_id: uuid.UUID, storage_key: str) -> str:
    """Read the just-saved file back as UTF-8 text. Local FS only for now."""
    from pathlib import Path

    from ..config import settings as cfg

    if cfg.use_minio:
        # Minio path: re-fetch via the SDK. Skipped for Phase 3 — local FS
        # is what the demo uses.
        return ""
    target = cfg.local_storage_dir / Path(storage_key)
    try:
        return target.read_text(encoding="utf-8", errors="replace")
    except FileNotFoundError:
        return ""


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


@router.post("/{document_id}/reindex", response_model=DocumentResponse)
async def reindex_document(
    document_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> DocumentResponse:
    """Re-run chunk + embed for a stored document. Idempotent."""
    result = await session.execute(
        select(Document).where(
            Document.id == document_id,
            Document.company_id == user.company_id,
        )
    )
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Document not found"
        )
    body = await _read_text_body(user.company_id, document.storage_key)
    if not body:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document body unavailable for indexing",
        )
    try:
        chunks = await embed_and_upsert_document(
            session, document=document, body=body, embeddings=embeddings_client
        )
    except EmbeddingsError as exc:
        document.status = "embed_failed"
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Embedding provider failed: {exc}",
        ) from exc
    await write_audit_log(
        session,
        company_id=user.company_id,
        user_id=user.id,
        action="doc_indexed",
        entity_type="document",
        entity_id=str(document.id),
        metadata={"chunks": chunks, "trigger": "reindex"},
    )
    await session.commit()
    await session.refresh(document)
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

