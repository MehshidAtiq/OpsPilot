"""Skill runner: orchestrates one execution of a registered skill.

Phase 3 keeps execution synchronous (inside the request handler). The
provider call is the only slow step and 30-60s is acceptable for a demo.
A real worker queue is a Phase 4+ swap — the runner doesn't care, since
``SKILL_REGISTRY`` lookups, ``SkillRun`` writes, and approval enqueuing all
work the same from a worker.

Failure semantics: any exception is caught, the ``SkillRun`` row is marked
``failed`` with the error message, an ``audit_logs`` row records the failure,
and the caller sees ``SkillRunFailed``. The API never crashes because the
LLM had a hiccup.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.ai.embeddings import embeddings_client
from opspilot.ai.llm import LLMError, llm_client
from opspilot.config import settings
from opspilot.models import Approval, Skill, SkillRun
from opspilot.services.audit import write_audit_log
from opspilot.skills.base import (
    SKILL_REGISTRY,
    ApprovalRequest,
    SkillContext,
    SkillOutput,
)

logger = logging.getLogger(__name__)


class SkillRunFailed(RuntimeError):
    """Wraps the underlying error along with the persisted ``skill_run.id``."""

    def __init__(self, *, run_id: uuid.UUID, message: str) -> None:
        super().__init__(message)
        self.run_id = run_id


async def run_skill(
    session: AsyncSession,
    *,
    skill_key: str,
    input_payload: dict[str, Any],
    company_id: uuid.UUID,
    user_id: Optional[uuid.UUID],
    triggered_by: str = "user",
    timeout_seconds: Optional[float] = None,
) -> SkillRun:
    """Execute ``skill_key`` and persist a ``skill_runs`` row.

    Side effects on success:
    - one ``skill_runs`` row (status=succeeded, output=<...>)
    - zero or more ``approvals`` rows (one per ``ApprovalRequest`` returned)
    - audit log entries: ``skill_run_started``, ``approval_created`` per
      approval, ``skill_run_succeeded`` (or ``skill_run_failed``).

    On failure: ``skill_runs`` row is status=failed with the error message,
    no approvals are written, and ``SkillRunFailed`` is raised.
    """
    definition = SKILL_REGISTRY.get(skill_key)
    if definition is None:
        raise ValueError(f"Unknown skill {skill_key!r}")

    skill_row = await _ensure_skill_row(session, definition)
    timeout = timeout_seconds or settings.llm_timeout_seconds * 2

    started = datetime.now(timezone.utc)
    run = SkillRun(
        company_id=company_id,
        skill_id=skill_row.id,
        triggered_by=triggered_by,
        trigger_user_id=user_id,
        input=input_payload,
        output={},
        status="running",
        started_at=started,
    )
    session.add(run)
    await session.flush()

    await write_audit_log(
        session,
        company_id=company_id,
        user_id=user_id,
        action="skill_run_started",
        entity_type="skill_run",
        entity_id=str(run.id),
        metadata={"skill": definition.key, "input_keys": sorted(input_payload.keys())},
    )
    await session.commit()

    # We commit the "running" row before invoking the model so a crash
    # leaves a tombstone in the DB. Then we re-fetch to update.
    await session.refresh(run)

    ctx = SkillContext(
        session=session,
        company_id=company_id,
        user_id=user_id,
        llm=llm_client,
        embeddings=embeddings_client,
    )

    try:
        result: SkillOutput = await asyncio.wait_for(
            definition.handler(ctx, input_payload), timeout=timeout
        )
    except (asyncio.TimeoutError, LLMError, Exception) as exc:
        return await _mark_failed(session, run, exc, company_id=company_id, user_id=user_id)

    # Success path — persist approvals + audit + run row.
    approval_ids: list[str] = []
    if definition.approval_required:
        for request in result.approvals:
            approval = await _persist_approval(
                session,
                request=request,
                company_id=company_id,
                skill_run_id=run.id,
                requester=user_id and str(user_id) or "system",
            )
            approval_ids.append(str(approval.id))
            await write_audit_log(
                session,
                company_id=company_id,
                user_id=user_id,
                action="approval_created",
                entity_type="approval",
                entity_id=str(approval.id),
                sources=request.sources,
                metadata={
                    "skill_run_id": str(run.id),
                    "action_type": request.action_type,
                    "rationale": request.rationale[:200],
                },
            )
    elif result.approvals:
        logger.warning(
            "Skill %s returned approvals but is registered as approval_required=False; ignoring",
            definition.key,
        )

    run.output = {**result.output, "approval_ids": approval_ids}
    run.status = "succeeded"
    run.tokens_in = result.tokens_in
    run.tokens_out = result.tokens_out
    run.finished_at = datetime.now(timezone.utc)

    await write_audit_log(
        session,
        company_id=company_id,
        user_id=user_id,
        action="skill_run_succeeded",
        entity_type="skill_run",
        entity_id=str(run.id),
        metadata={
            "skill": definition.key,
            "approval_count": len(approval_ids),
            "tokens_in": result.tokens_in,
            "tokens_out": result.tokens_out,
        },
    )
    await session.commit()
    await session.refresh(run)
    return run


async def _persist_approval(
    session: AsyncSession,
    *,
    request: ApprovalRequest,
    company_id: uuid.UUID,
    skill_run_id: uuid.UUID,
    requester: str,
) -> Approval:
    approval = Approval(
        company_id=company_id,
        requester=requester,
        action_type=request.action_type,
        payload=request.payload,
        rationale=request.rationale,
        sources=request.sources,
        status="pending",
        skill_run_id=skill_run_id,
    )
    session.add(approval)
    await session.flush()
    return approval


async def _mark_failed(
    session: AsyncSession,
    run: SkillRun,
    exc: BaseException,
    *,
    company_id: uuid.UUID,
    user_id: Optional[uuid.UUID],
) -> SkillRun:
    """Roll back any partial work and write a clean failure record."""
    # Capture identifiers BEFORE rollback — rollback expires ORM attributes
    # and lazy-loading them in an async context blows up.
    run_id = run.id

    # Roll back any partial state from the handler (e.g. half-written rows).
    await session.rollback()

    # Re-fetch the run row in a clean transaction, then mark it failed.
    fresh = await session.execute(select(SkillRun).where(SkillRun.id == run_id))
    failed_run = fresh.scalar_one()
    failed_run.status = "failed"
    failed_run.error = f"{type(exc).__name__}: {exc}"[:2000]
    failed_run.finished_at = datetime.now(timezone.utc)

    await write_audit_log(
        session,
        company_id=company_id,
        user_id=user_id,
        action="skill_run_failed",
        entity_type="skill_run",
        entity_id=str(failed_run.id),
        metadata={"error_type": type(exc).__name__, "error": str(exc)[:500]},
    )
    await session.commit()
    await session.refresh(failed_run)
    raise SkillRunFailed(run_id=failed_run.id, message=str(exc))


async def _ensure_skill_row(session: AsyncSession, definition) -> Skill:
    """Upsert the ``skills`` table from the in-memory registry definition.

    The DB row is mostly cosmetic (it powers the ``/skills`` UI) but
    ``skill_runs.skill_id`` is a real FK, so the row must exist.
    """
    result = await session.execute(select(Skill).where(Skill.key == definition.key))
    skill = result.scalar_one_or_none()
    if skill is not None:
        return skill
    skill = Skill(
        key=definition.key,
        name=definition.name,
        description=definition.description,
        input_schema=definition.input_schema,
        output_schema=definition.output_schema,
        approval_required=definition.approval_required,
        enabled=True,
    )
    session.add(skill)
    await session.flush()
    return skill
