"""Approvals service: list, decide, execute.

Approvals are the single point where AI-suggested actions become real-world
effects. The decide step is *deliberate* — the operator can ``approve``,
``edit`` (modify the payload first, then approve), or ``reject``.

Execute is dispatched by ``action_type``:
  - ``email_reply`` → ``send_email_mock``
  - ``task_create`` → ``create_task_effector`` (real DB row)
  - ``calendar_event`` → ``create_calendar_event_mock``
  - ``doc_write`` → ``write_doc_mock``
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.models import Approval
from opspilot.services.audit import write_audit_log
from opspilot.services.effectors import (
    create_calendar_event_mock,
    create_task_effector,
    send_email_mock,
    write_doc_mock,
)

logger = logging.getLogger(__name__)


class ApprovalError(RuntimeError):
    pass


async def list_approvals(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    status_filter: Optional[str] = None,
) -> list[Approval]:
    query = select(Approval).where(Approval.company_id == company_id)
    if status_filter:
        query = query.where(Approval.status == status_filter)
    query = query.order_by(Approval.created_at.desc())
    result = await session.execute(query)
    return list(result.scalars())


async def get_approval(
    session: AsyncSession, *, company_id: uuid.UUID, approval_id: uuid.UUID
) -> Optional[Approval]:
    result = await session.execute(
        select(Approval).where(
            Approval.id == approval_id, Approval.company_id == company_id
        )
    )
    return result.scalar_one_or_none()


async def decide_approval(
    session: AsyncSession,
    *,
    approval: Approval,
    decision: str,  # "approve" | "edit_and_approve" | "reject"
    user_id: uuid.UUID,
    edited_payload: Optional[dict[str, Any]] = None,
) -> Approval:
    """Mark an approval decided. If approved, execute the effector.

    Idempotent only insofar as: an approval that's already decided rejects
    further decisions. We don't allow undo — audit log is the source of
    truth.
    """
    if approval.status != "pending":
        raise ApprovalError(
            f"Approval {approval.id} is already {approval.status}; cannot decide again",
        )
    if decision not in {"approve", "edit_and_approve", "reject"}:
        raise ApprovalError(f"Unknown decision {decision!r}")

    now = datetime.now(timezone.utc)
    approval.decided_by_user_id = user_id
    approval.decided_at = now

    if decision == "reject":
        approval.status = "rejected"
        await write_audit_log(
            session,
            company_id=approval.company_id,
            user_id=user_id,
            action="approval_rejected",
            entity_type="approval",
            entity_id=str(approval.id),
            metadata={"action_type": approval.action_type},
        )
        await session.commit()
        await session.refresh(approval)
        return approval

    # approve or edit_and_approve
    if decision == "edit_and_approve":
        if edited_payload is None:
            raise ApprovalError("edit_and_approve requires edited_payload")
        approval.payload = edited_payload
        approval.status = "approved_edited"
    else:
        approval.status = "approved"

    # Execute the effector. Failures here roll the approval back to
    # ``executing_failed`` so the operator can investigate, but we don't
    # crash the API — every failure is audited.
    try:
        effect_result = await _execute_effect(session, approval)
    except Exception as exc:
        logger.exception("Effector failed for approval %s", approval.id)
        approval.status = "execute_failed"
        approval.executed_at = None
        await write_audit_log(
            session,
            company_id=approval.company_id,
            user_id=user_id,
            action="approval_execute_failed",
            entity_type="approval",
            entity_id=str(approval.id),
            metadata={
                "action_type": approval.action_type,
                "error": str(exc)[:500],
                "error_type": type(exc).__name__,
            },
        )
        await session.commit()
        await session.refresh(approval)
        raise ApprovalError(f"Effector failed: {exc}") from exc

    approval.executed_at = datetime.now(timezone.utc)

    await write_audit_log(
        session,
        company_id=approval.company_id,
        user_id=user_id,
        action="approval_approved" if decision == "approve" else "approval_edited",
        entity_type="approval",
        entity_id=str(approval.id),
        metadata={
            "action_type": approval.action_type,
            "effect_status": effect_result.get("status"),
        },
    )
    # Effector-specific audit row (e.g. email_sent_mock).
    effect_audit_action = _audit_action_for(approval.action_type)
    if effect_audit_action:
        await write_audit_log(
            session,
            company_id=approval.company_id,
            user_id=user_id,
            action=effect_audit_action,
            entity_type="approval",
            entity_id=str(approval.id),
            metadata=effect_result,
        )

    await session.commit()
    await session.refresh(approval)
    return approval


async def _execute_effect(session: AsyncSession, approval: Approval) -> dict[str, Any]:
    action = approval.action_type
    payload = approval.payload or {}
    if action == "email_reply":
        return await send_email_mock(
            session, company_id=approval.company_id, payload=payload
        )
    if action == "task_create":
        return await create_task_effector(
            session,
            company_id=approval.company_id,
            payload=payload,
            skill_run_id=approval.skill_run_id,
        )
    if action == "calendar_event":
        return await create_calendar_event_mock(
            session, company_id=approval.company_id, payload=payload
        )
    if action == "doc_write":
        return await write_doc_mock(
            session, company_id=approval.company_id, payload=payload
        )
    raise ApprovalError(f"No effector registered for action_type={action!r}")


def _audit_action_for(action_type: str) -> Optional[str]:
    return {
        "email_reply": "email_sent_mock",
        "task_create": "task_created_from_approval",
        "calendar_event": "calendar_event_created_mock",
        "doc_write": "doc_written_mock",
    }.get(action_type)
