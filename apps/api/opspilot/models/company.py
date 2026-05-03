from typing import Any, List

from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base
from .base import IdMixin, TimestampMixin


class Company(IdMixin, TimestampMixin, Base):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    services: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    target_clients: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tone_profile: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    primary_language: Mapped[str] = mapped_column(String(8), nullable=False, default="en")
    default_formality: Mapped[str] = mapped_column(String(8), nullable=False, default="sie")
    settings: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    users = relationship("User", back_populates="company", cascade="all, delete-orphan")

