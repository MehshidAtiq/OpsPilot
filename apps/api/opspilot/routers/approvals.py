"""/approvals — list, retrieve, and decide pending approvals.

Decisions are the only place AI suggestions become real-world side effects.
Every decision audits both the approval verb and the effector outcome.
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import User
from ..schemas.approval import ApprovalDecideRequest, ApprovalResponse
from ..services.approvals import (
    ApprovalError,
    decide_approval,
    get_approval,
    list_approvals,
)

router = APIRouter(prefix="/approvals", tags=["approvals"])


@router.get("", response_model=list[ApprovalResponse])
async def list_endpoint(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[ApprovalResponse]:
    rows = await list_approvals(
        session, company_id=user.company_id, status_filter=status_filter
    )
    return [ApprovalResponse.model_validate(row) for row in rows]


@router.get("/{approval_id}", response_model=ApprovalResponse)
async def get_endpoint(
    approval_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> ApprovalResponse:
    approval = await get_approval(
        session, company_id=user.company_id, approval_id=approval_id
    )
    if approval is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Approval not found"
        )
    return ApprovalResponse.model_validate(approval)


@router.post("/{approval_id}/decide", response_model=ApprovalResponse)
async def decide_endpoint(
    approval_id: uuid.UUID,
    payload: ApprovalDecideRequest,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> ApprovalResponse:
    approval = await get_approval(
        session, company_id=user.company_id, approval_id=approval_id
    )
    if approval is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Approval not found"
        )
    try:
        decided = await decide_approval(
            session,
            approval=approval,
            decision=payload.decision,
            user_id=user.id,
            edited_payload=payload.edited_payload,
        )
    except ApprovalError as exc:
        # Effector failure or already-decided. The approval row has been
        # marked execute_failed already; surface as 422 so the operator UI
        # can show the underlying error.
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    return ApprovalResponse.model_validate(decided)
