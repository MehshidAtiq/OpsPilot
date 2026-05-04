"""/messages — read inbox messages, filter by thread.

Read-only for Phase 3. Outbound sends happen via ``email_reply`` approvals,
not directly from this router.
"""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import Message, User
from ..schemas.message import MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("", response_model=list[MessageResponse])
async def list_messages(
    thread_id: Optional[str] = Query(default=None),
    direction: Optional[str] = Query(default=None),
    unread: Optional[bool] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[MessageResponse]:
    query = select(Message).where(Message.company_id == user.company_id)
    if thread_id:
        query = query.where(Message.thread_id == thread_id)
    if direction:
        query = query.where(Message.direction == direction)
    if unread is not None:
        query = query.where(Message.is_read.is_(not unread))
    query = query.order_by(Message.received_at.desc()).limit(limit)
    rows = (await session.execute(query)).scalars()
    return [MessageResponse.model_validate(row) for row in rows]


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> MessageResponse:
    row = (
        await session.execute(
            select(Message).where(
                Message.id == message_id, Message.company_id == user.company_id
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )
    return MessageResponse.model_validate(row)
