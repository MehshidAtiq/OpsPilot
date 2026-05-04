"""/audit — read-only audit log feed for the operator.

Every approval decision, skill run, and effector action writes one or more
rows here. The endpoint is filterable by entity_type / action / time range.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_session
from ..deps import get_current_user
from ..models import AuditLog, User
from ..schemas.audit import AuditLogResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditLogResponse])
async def list_audit(
    entity_type: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    since: Optional[datetime] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[AuditLogResponse]:
    query = select(AuditLog).where(AuditLog.company_id == user.company_id)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if action:
        query = query.where(AuditLog.action == action)
    if since:
        query = query.where(AuditLog.created_at >= since)
    query = query.order_by(AuditLog.created_at.desc()).limit(limit)
    rows = (await session.execute(query)).scalars()
    return [AuditLogResponse.model_validate(row) for row in rows]
