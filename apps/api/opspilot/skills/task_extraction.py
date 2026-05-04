"""task_extraction — pull actionable tasks out of free-form text.

Input: ``{ "text": str, "source_type"?: str, "source_id"?: str }``.
Process:
  1. Ask the LLM for a JSON array ``[{ "title", "description", "priority" }]``.
  2. Emit one ApprovalRequest of type ``task_create`` per extracted task.

Output: list of proposed tasks (mirrored on skill_runs.output for audit).
"""

from __future__ import annotations

from typing import Any

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
        "text": {"type": "string"},
        "source_type": {"type": "string"},
        "source_id": {"type": "string"},
    },
    "required": ["text"],
}

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {"tasks": {"type": "array"}},
}

_LLM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "tasks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "priority": {
                        "type": "string",
                        "enum": ["low", "med", "high"],
                    },
                },
                "required": ["title"],
            },
        }
    },
    "required": ["tasks"],
}


async def handler(ctx: SkillContext, payload: dict[str, Any]) -> SkillOutput:
    text = payload["text"]
    source_type = payload.get("source_type")
    source_id = payload.get("source_id")

    prompt = (
        "Extract concrete, actionable tasks from the text below. "
        "A task is something a person needs to do — not background information. "
        "If there are none, return an empty array.\n\n"
        "Output strictly JSON: "
        '{"tasks": [{"title": "...", "description": "...", "priority": "low|med|high"}]}\n\n'
        "Title under 12 words. Description optional, single sentence. "
        "Priority defaults to med.\n\n"
        f"--- TEXT ---\n{text[:8000]}\n--- END ---"
    )
    response = await ctx.llm.complete_json(prompt=prompt, schema=_LLM_SCHEMA)

    if response.get("mock"):
        # Stub: emit a single placeholder task so the pipeline is exercisable.
        tasks = [
            {
                "title": "Review extracted text (LLM stub)",
                "description": text[:140],
                "priority": "med",
            }
        ]
    else:
        raw_tasks = response.get("tasks") or []
        tasks = [
            {
                "title": str(t.get("title", "Untitled task"))[:240],
                "description": t.get("description") or "",
                "priority": _clean_priority(t.get("priority")),
            }
            for t in raw_tasks
            if t.get("title")
        ]

    approvals: list[ApprovalRequest] = []
    for task in tasks:
        approvals.append(
            ApprovalRequest(
                action_type="task_create",
                payload={
                    **task,
                    "source_type": source_type,
                    "source_id": source_id,
                },
                rationale=f"Extracted from {source_type or 'text'}.",
                sources=(
                    [{"type": source_type, "id": source_id}]
                    if source_type and source_id
                    else []
                ),
            )
        )

    return SkillOutput(
        output={"tasks": tasks},
        approvals=approvals,
        tokens_in=len(prompt) // 4,
        tokens_out=sum(len(t["title"]) + len(t["description"]) for t in tasks) // 4,
    )


def _clean_priority(value: Any) -> str:
    if isinstance(value, str) and value.lower() in {"low", "med", "high"}:
        return value.lower()
    return "med"


SKILL = register_skill(
    SkillDefinition(
        key="task_extraction",
        name="Task extraction",
        description="Pulls actionable tasks out of free-form text or a transcript.",
        input_schema=INPUT_SCHEMA,
        output_schema=OUTPUT_SCHEMA,
        approval_required=True,
        handler=handler,
    )
)
