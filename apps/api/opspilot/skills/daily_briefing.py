"""daily_briefing — 3 priorities for today.

Input: ``{}`` (uses company context only).
Process:
  1. Pull urgent unread inbound messages, today's meetings, stale outbound
     threads, and a count of pending approvals.
  2. Ask the LLM to rank the top 3 priorities with rationale.
  3. Return a structured object — *no approvals*, this is read-only output.

Why approval_required=False: a briefing is information, not an action.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select

from opspilot.models import Approval, Meeting, Message
from opspilot.skills.base import (
    SkillContext,
    SkillDefinition,
    SkillOutput,
    register_skill,
)

INPUT_SCHEMA: dict[str, Any] = {"type": "object", "properties": {}}

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "priorities": {"type": "array"},
        "context": {"type": "object"},
    },
}

_LLM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "priorities": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "rationale": {"type": "string"},
                    "source_type": {"type": "string"},
                    "source_id": {"type": "string"},
                },
                "required": ["title", "rationale"],
            },
        }
    },
    "required": ["priorities"],
}


async def handler(ctx: SkillContext, payload: dict[str, Any]) -> SkillOutput:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    stale_cutoff = now - timedelta(days=4)

    # --- urgent unread inbound ---
    msgs = await ctx.session.execute(
        select(Message)
        .where(
            Message.company_id == ctx.company_id,
            Message.direction == "inbound",
            Message.is_read.is_(False),
        )
        .order_by(Message.received_at.desc())
        .limit(8)
    )
    urgent_msgs = [
        {
            "id": str(m.id),
            "thread_id": m.thread_id,
            "subject": m.subject,
            "sender": m.sender,
            "snippet": (m.snippet or m.body[:160]),
            "received_at": m.received_at.isoformat(),
        }
        for m in msgs.scalars()
    ]

    # --- today's meetings ---
    meetings_q = await ctx.session.execute(
        select(Meeting)
        .where(
            Meeting.company_id == ctx.company_id,
            Meeting.scheduled_at >= today_start,
            Meeting.scheduled_at < today_end,
        )
        .order_by(Meeting.scheduled_at.asc())
    )
    today_meetings = [
        {
            "id": str(m.id),
            "title": m.title,
            "scheduled_at": m.scheduled_at.isoformat(),
            "attendees": list(m.attendees or []),
        }
        for m in meetings_q.scalars()
    ]

    # --- stale outbound threads (no reply in N days) ---
    stale_q = await ctx.session.execute(
        select(Message)
        .where(
            Message.company_id == ctx.company_id,
            Message.direction == "outbound",
            Message.received_at < stale_cutoff,
        )
        .order_by(Message.received_at.asc())
        .limit(5)
    )
    stale_threads = [
        {
            "thread_id": m.thread_id,
            "subject": m.subject,
            "last_outbound_at": m.received_at.isoformat(),
        }
        for m in stale_q.scalars()
    ]

    # --- pending approvals count ---
    pending_count = (
        await ctx.session.execute(
            select(func.count())
            .select_from(Approval)
            .where(
                Approval.company_id == ctx.company_id,
                Approval.status == "pending",
            )
        )
    ).scalar_one()

    context = {
        "urgent_messages": urgent_msgs,
        "today_meetings": today_meetings,
        "stale_threads": stale_threads,
        "pending_approvals": pending_count,
        "as_of": now.isoformat(),
    }

    # If nothing's going on, skip the LLM.
    if not (urgent_msgs or today_meetings or stale_threads or pending_count):
        return SkillOutput(
            output={
                "priorities": [],
                "context": context,
            }
        )

    prompt = _build_prompt(context)
    response = await ctx.llm.complete_json(prompt=prompt, schema=_LLM_SCHEMA)

    if response.get("mock"):
        priorities = _stub_priorities(context)
    else:
        priorities = [
            {
                "title": str(p.get("title", ""))[:200],
                "rationale": str(p.get("rationale", ""))[:500],
                "source_type": p.get("source_type"),
                "source_id": p.get("source_id"),
            }
            for p in (response.get("priorities") or [])[:3]
            if p.get("title")
        ]

    return SkillOutput(
        output={"priorities": priorities, "context": context},
        approvals=[],  # read-only briefing
        tokens_in=len(prompt) // 4,
        tokens_out=sum(
            len(p.get("title", "")) + len(p.get("rationale", "")) for p in priorities
        )
        // 4,
    )


def _build_prompt(context: dict[str, Any]) -> str:
    return (
        "You are an executive assistant. Pick the TOP 3 priorities for today "
        "based on the snapshot below. Order by impact + urgency. "
        "Each priority needs a 1-2 sentence rationale citing the specific "
        "input (e.g. \"Müller GmbH M365 enquiry — 4 days unanswered\").\n\n"
        "Output strictly JSON: "
        '{"priorities": [{"title": "...", "rationale": "...", "source_type": "message|meeting|approval", "source_id": "..."}]}\n\n'
        f"--- SNAPSHOT ---\n{context}\n--- END ---"
    )


def _stub_priorities(context: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    if context["urgent_messages"]:
        m = context["urgent_messages"][0]
        out.append(
            {
                "title": f"Reply to: {m['subject']}",
                "rationale": f"Unread inbound from {m['sender']}.",
                "source_type": "message",
                "source_id": m["id"],
            }
        )
    if context["today_meetings"]:
        m = context["today_meetings"][0]
        out.append(
            {
                "title": f"Prep for {m['title']}",
                "rationale": f"On the calendar at {m['scheduled_at']}.",
                "source_type": "meeting",
                "source_id": m["id"],
            }
        )
    if context["stale_threads"]:
        s = context["stale_threads"][0]
        out.append(
            {
                "title": f"Follow up: {s['subject']}",
                "rationale": f"No reply since {s['last_outbound_at']}.",
                "source_type": "thread",
                "source_id": s["thread_id"],
            }
        )
    return out[:3]


SKILL = register_skill(
    SkillDefinition(
        key="daily_briefing",
        name="Daily briefing",
        description="Top 3 priorities for the operator, derived from inbox + calendar + approvals.",
        input_schema=INPUT_SCHEMA,
        output_schema=OUTPUT_SCHEMA,
        approval_required=False,  # read-only, no actions
        handler=handler,
    )
)
