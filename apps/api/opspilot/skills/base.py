"""Skill registry + base contract.

A *skill* is a typed AI workflow. It receives input, may use the LLM and RAG,
and emits a structured output. If the skill produces an external action, it
also emits ``ApprovalRequest`` objects — never effects directly. That seam
is how we keep the demo's safety property honest: the LLM has read tools only.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.ai.embeddings import EmbeddingsClient
from opspilot.ai.llm import LLMClient


@dataclass(frozen=True)
class ApprovalRequest:
    """Skill output ready to become a row in the ``approvals`` table.

    The runner persists these — skills only describe what they want.
    """

    action_type: str  # email_reply | task_create | calendar_event | doc_write
    payload: dict[str, Any]
    rationale: str
    sources: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class SkillContext:
    """Everything a skill handler can use. Passed in by the runner."""

    session: AsyncSession
    company_id: uuid.UUID
    user_id: Optional[uuid.UUID]
    llm: LLMClient
    embeddings: EmbeddingsClient


@dataclass
class SkillOutput:
    """What a skill returns to the runner.

    ``output`` is persisted on ``skill_runs.output`` (the audit-able record).
    ``approvals`` are queued via the approvals service. Skills can return
    zero, one, or many approvals — task_extraction emits N, email_reply 1,
    daily_briefing 0.
    """

    output: dict[str, Any]
    approvals: list[ApprovalRequest] = field(default_factory=list)
    tokens_in: int = 0
    tokens_out: int = 0


SkillHandler = Callable[["SkillContext", dict[str, Any]], Awaitable[SkillOutput]]


@dataclass(frozen=True)
class SkillDefinition:
    key: str
    name: str
    description: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    approval_required: bool
    handler: SkillHandler


SKILL_REGISTRY: dict[str, SkillDefinition] = {}


def register_skill(skill: SkillDefinition) -> SkillDefinition:
    if skill.key in SKILL_REGISTRY:
        raise ValueError(f"Skill {skill.key!r} already registered")
    SKILL_REGISTRY[skill.key] = skill
    return skill
