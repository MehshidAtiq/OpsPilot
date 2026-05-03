import uuid
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from ..models import AuditLog


async def write_audit_log(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    user_id: Optional[uuid.UUID] = None,
    sources: Optional[list[dict[str, Any]]] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> AuditLog:
    log = AuditLog(
        company_id=company_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        sources=sources or [],
        metadata_=metadata or {},
    )
    session.add(log)
    return log

