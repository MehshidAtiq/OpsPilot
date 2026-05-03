import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base
from .base import IdMixin, TimestampMixin


class Integration(IdMixin, TimestampMixin, Base):
    __tablename__ = "integrations"
    __table_args__ = (
        UniqueConstraint("company_id", "kind", name="uq_integrations_company_kind"),
    )

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    kind: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="disconnected")
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    connected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

