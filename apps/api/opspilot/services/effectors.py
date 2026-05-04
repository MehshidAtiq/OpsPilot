"""Effectors: the only place where approvals turn into real-world effects.

In Phase 3 every external send is *mocked* — we log the payload, write an
audit row, and move on. Real Gmail / Calendar / Drive integrations are
Phase 4. The point of this seam is that the LLM never reaches them: skills
emit ``ApprovalRequest`` objects; only ``execute_approval`` calls effectors;
and effectors are the only code that touches outbound channels.

``create_task`` is a real DB write, not a mock — that one is internal.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.models import Task

logger = logging.getLogger(__name__)


async def send_email_mock(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    payload: dict[str, Any],
) -> dict[str, Any]:
    """Pretend we sent an email. Real send is Phase 4 (Gmail OAuth)."""
    logger.info(
        "MOCK send_email company=%s to=%s subject=%r",
        company_id,
        payload.get("to"),
        payload.get("subject"),
    )
    return {
        "status": "sent_mock",
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "to": payload.get("to"),
        "subject": payload.get("subject"),
    }


async def create_task_effector(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    payload: dict[str, Any],
    skill_run_id: uuid.UUID | None,
) -> dict[str, Any]:
    """Real internal effect: insert a ``tasks`` row in ``proposed`` status.

    The task is created in the same transaction as the approval execute,
    so a rollback would unwind it cleanly.
    """
    task = Task(
        company_id=company_id,
        title=payload.get("title", "Untitled task"),
        description=payload.get("description"),
        priority=payload.get("priority", "med"),
        status="approved",  # operator approved the proposal
        source_type=payload.get("source_type"),
        source_id=payload.get("source_id"),
        created_by_skill_run_id=skill_run_id,
    )
    session.add(task)
    await session.flush()
    return {"status": "created", "task_id": str(task.id), "title": task.title}


async def create_calendar_event_mock(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    payload: dict[str, Any],
) -> dict[str, Any]:
    logger.info(
        "MOCK create_calendar_event company=%s title=%r at=%s",
        company_id,
        payload.get("title"),
        payload.get("scheduled_at"),
    )
    return {
        "status": "created_mock",
        "title": payload.get("title"),
        "scheduled_at": payload.get("scheduled_at"),
    }


async def write_doc_mock(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    payload: dict[str, Any],
) -> dict[str, Any]:
    logger.info(
        "MOCK write_doc company=%s title=%r",
        company_id,
        payload.get("title"),
    )
    return {"status": "written_mock", "title": payload.get("title")}
