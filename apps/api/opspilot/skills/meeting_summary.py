"""meeting_summary — turn a transcript into summary + decisions + action items.

Input: ``{ "meeting_id": str, "transcript"?: str }`` — if transcript is absent,
we read it off the meeting row.

Process:
  1. Ask the LLM for ``{ summary, decisions[], action_items[] }``.
  2. Persist the structured output onto the ``meetings`` row.
  3. Emit one ``task_create`` ApprovalRequest per action item.

The LLM never gets to write to the meeting row directly — the runner /
this skill does that, after we validated the JSON shape.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import select

from opspilot.models import Meeting
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
        "meeting_id": {"type": "string"},
        "transcript": {"type": "string"},
    },
    "required": ["meeting_id"],
}

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "decisions": {"type": "array"},
        "action_items": {"type": "array"},
    },
}

_LLM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "decisions": {"type": "array", "items": {"type": "string"}},
        "action_items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "owner": {"type": "string"},
                    "priority": {"type": "string"},
                },
                "required": ["title"],
            },
        },
    },
    "required": ["summary", "decisions", "action_items"],
}


async def handler(ctx: SkillContext, payload: dict[str, Any]) -> SkillOutput:
    meeting_id = payload["meeting_id"]

    meeting = (
        await ctx.session.execute(
            select(Meeting).where(
                Meeting.id == meeting_id, Meeting.company_id == ctx.company_id
            )
        )
    ).scalar_one_or_none()
    if meeting is None:
        raise ValueError(f"Meeting {meeting_id!r} not found for this company")

    transcript = payload.get("transcript") or meeting.transcript or ""
    if not transcript.strip():
        raise ValueError("Meeting has no transcript to summarise")

    prompt = (
        "You are summarising a business meeting. Output strictly JSON with three keys:\n"
        '  summary       — 3-5 sentence overview\n'
        '  decisions     — array of strings, each a concrete decision made\n'
        '  action_items  — array of objects: {title, owner?, priority?}\n\n'
        "Be precise. Do not invent decisions or owners that aren't in the transcript.\n\n"
        f"--- TRANSCRIPT ---\n{transcript[:12000]}\n--- END ---"
    )

    response = await ctx.llm.complete_json(prompt=prompt, schema=_LLM_SCHEMA)

    if response.get("mock"):
        response = {
            "summary": (
                "Stub summary: LLM unavailable. Configure an API key to get a real summary."
            ),
            "decisions": ["(stub) No decisions extracted — LLM unavailable."],
            "action_items": [
                {"title": "Review meeting transcript manually", "priority": "med"}
            ],
        }

    summary = str(response.get("summary", "")).strip()
    decisions = [str(d) for d in (response.get("decisions") or []) if d]
    action_items = [
        {
            "title": str(a.get("title", "Untitled"))[:240],
            "owner": a.get("owner"),
            "priority": _clean_priority(a.get("priority")),
        }
        for a in (response.get("action_items") or [])
        if a.get("title")
    ]

    # Persist on the meeting row. This is a *read-after-LLM* update done by
    # our code, not the LLM.
    meeting.ai_summary = summary
    meeting.ai_decisions = [{"text": d} for d in decisions]
    meeting.ai_action_items = action_items

    approvals: list[ApprovalRequest] = []
    for item in action_items:
        approvals.append(
            ApprovalRequest(
                action_type="task_create",
                payload={
                    "title": item["title"],
                    "description": (
                        f"From meeting '{meeting.title}'"
                        + (f" — owner: {item['owner']}" if item.get("owner") else "")
                    ),
                    "priority": item["priority"],
                    "source_type": "meeting",
                    "source_id": str(meeting.id),
                },
                rationale=f"Action item from meeting '{meeting.title}'.",
                sources=[{"type": "meeting", "id": str(meeting.id)}],
            )
        )

    return SkillOutput(
        output={
            "summary": summary,
            "decisions": decisions,
            "action_items": action_items,
        },
        approvals=approvals,
        tokens_in=len(prompt) // 4,
        tokens_out=(len(summary) + sum(len(d) for d in decisions)) // 4,
    )


def _clean_priority(value: Any) -> str:
    if isinstance(value, str) and value.lower() in {"low", "med", "high"}:
        return value.lower()
    return "med"


SKILL = register_skill(
    SkillDefinition(
        key="meeting_summary",
        name="Meeting summary",
        description="Turns a transcript into summary + decisions + action items.",
        input_schema=INPUT_SCHEMA,
        output_schema=OUTPUT_SCHEMA,
        approval_required=True,
        handler=handler,
    )
)
