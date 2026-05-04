"""follow_up_detector — flag stale outbound threads, draft polite reminders.

Input: ``{ "stale_after_days"?: int }`` (defaults to 4).

Process:
  1. Find threads where the last message is outbound and older than the cutoff,
     with no inbound reply since.
  2. For each stale thread, ask the LLM for a short reminder draft.
  3. Emit one ``email_reply`` ApprovalRequest per stale thread.

Output: ``{ "stale_threads": [...], "drafts": N }``.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import select

from opspilot.models import Message
from opspilot.skills.base import (
    ApprovalRequest,
    SkillContext,
    SkillDefinition,
    SkillOutput,
    register_skill,
)

INPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "stale_after_days": {"type": "integer", "minimum": 1, "maximum": 60},
    },
}

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "stale_threads": {"type": "array"},
        "drafts": {"type": "integer"},
    },
}

_LLM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "subject": {"type": "string"},
        "body": {"type": "string"},
        "rationale": {"type": "string"},
    },
    "required": ["subject", "body"],
}

_MAX_THREADS = 5  # cap fan-out per run; demo doesn't need more


async def handler(ctx: SkillContext, payload: dict[str, Any]) -> SkillOutput:
    stale_after_days = int(payload.get("stale_after_days") or 4)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=stale_after_days)

    # Pull recent messages, group by thread, decide which are stale.
    msgs_q = await ctx.session.execute(
        select(Message)
        .where(Message.company_id == ctx.company_id)
        .order_by(Message.received_at.desc())
        .limit(500)
    )
    by_thread: dict[str, list[Message]] = {}
    for m in msgs_q.scalars():
        by_thread.setdefault(m.thread_id, []).append(m)

    stale: list[dict[str, Any]] = []
    for thread_id, items in by_thread.items():
        # items are desc by received_at; latest first.
        latest = items[0]
        if latest.direction != "outbound":
            continue
        if latest.received_at >= cutoff:
            continue
        # Has there been any inbound since this outbound? (no — latest is outbound)
        stale.append(
            {
                "thread_id": thread_id,
                "subject": latest.subject,
                "recipient": (latest.recipients or [latest.sender])[0]
                if latest.recipients
                else latest.sender,
                "last_outbound_at": latest.received_at.isoformat(),
                "days_stale": (now - latest.received_at).days,
                "_message": latest,
            }
        )
        if len(stale) >= _MAX_THREADS:
            break

    if not stale:
        return SkillOutput(
            output={"stale_threads": [], "drafts": 0},
            approvals=[],
        )

    approvals: list[ApprovalRequest] = []
    tokens_in = 0
    tokens_out = 0
    for entry in stale:
        msg: Message = entry.pop("_message")
        prompt = _build_prompt(msg, entry["days_stale"])
        response = await ctx.llm.complete_json(prompt=prompt, schema=_LLM_SCHEMA)
        if response.get("mock"):
            response = _stub_reminder(msg.subject, entry["days_stale"])
        subject = str(response.get("subject") or f"Re: {msg.subject}")[:240]
        body = str(response.get("body") or "")[:4000]
        rationale = str(
            response.get("rationale")
            or f"No reply for {entry['days_stale']} days on thread '{msg.subject}'."
        )[:500]

        approvals.append(
            ApprovalRequest(
                action_type="email_reply",
                payload={
                    "to": entry["recipient"],
                    "thread_id": entry["thread_id"],
                    "subject": subject,
                    "body": body,
                    "is_follow_up": True,
                },
                rationale=rationale,
                sources=[
                    {
                        "type": "message",
                        "message_id": str(msg.id),
                        "thread_id": entry["thread_id"],
                    }
                ],
            )
        )
        tokens_in += len(prompt) // 4
        tokens_out += len(body) // 4

    return SkillOutput(
        output={
            "stale_threads": stale,
            "drafts": len(approvals),
        },
        approvals=approvals,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
    )


def _build_prompt(msg: Message, days_stale: int) -> str:
    return (
        "You are drafting a polite follow-up reminder. The recipient has not "
        f"responded for {days_stale} days. Keep it short (under 120 words), "
        "friendly, no guilt-tripping. Reference the original subject. "
        "Do not invent new commitments.\n\n"
        "Output strictly JSON: "
        '{"subject": "...", "body": "...", "rationale": "why follow up now"}\n\n'
        f"--- ORIGINAL OUTBOUND ---\n"
        f"Subject: {msg.subject}\n"
        f"Body: {msg.body[:2000]}\n"
        f"--- END ---"
    )


def _stub_reminder(subject: str, days_stale: int) -> dict[str, str]:
    return {
        "subject": f"Re: {subject}",
        "body": (
            "Hello,\n\n"
            f"Just a gentle follow-up on my earlier message regarding '{subject}'. "
            f"It's been about {days_stale} days and I wanted to check whether you "
            "had a chance to review.\n\nHappy to clarify anything if helpful.\n\n"
            "Best regards"
        ),
        "rationale": "Stub reminder (LLM unavailable).",
    }


SKILL = register_skill(
    SkillDefinition(
        key="follow_up_detector",
        name="Follow-up detector",
        description="Finds stale outbound threads and drafts polite reminders.",
        input_schema=INPUT_SCHEMA,
        output_schema=OUTPUT_SCHEMA,
        approval_required=True,
        handler=handler,
    )
)
