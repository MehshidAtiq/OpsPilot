"""Pydantic schemas for /audit."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import ConfigDict, Field

from .common import OrmModel


class AuditLogResponse(OrmModel):
    """Mirrors ``AuditLog`` rows. The DB column is ``metadata`` but the
    Python attribute is ``metadata_`` (SQLAlchemy reserved name); we expose
    it as ``metadata`` in JSON via serialization alias."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    company_id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    sources: list[dict[str, Any]]
    metadata_: dict[str, Any] = Field(serialization_alias="metadata")
    created_at: datetime
