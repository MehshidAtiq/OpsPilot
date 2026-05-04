"""/meetings — list and read meetings.

Read-only. The summary skill writes back via ``meeting_summary`` and
emits approval rows for action items; this router never mutates rows.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import Meeting, User
from ..schemas.message import MeetingResponse

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("", response_model=list[MeetingResponse])
async def list_meetings(
    limit: int = Query(default=100, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[MeetingResponse]:
    query = (
        select(Meeting)
        .where(Meeting.company_id == user.company_id)
        .order_by(Meeting.scheduled_at.desc())
        .limit(limit)
    )
    rows = (await session.execute(query)).scalars()
    return [MeetingResponse.model_validate(row) for row in rows]


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> MeetingResponse:
    row = (
        await session.execute(
            select(Meeting).where(
                Meeting.id == meeting_id, Meeting.company_id == user.company_id
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )
    return MeetingResponse.model_validate(row)
