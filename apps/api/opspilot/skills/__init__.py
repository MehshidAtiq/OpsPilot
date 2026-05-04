"""Skill package — importing this module triggers ``register_skill()`` for
every concrete skill, populating ``SKILL_REGISTRY``.

The runner (``services/skill_runner.py``) imports ``SKILL_REGISTRY`` from
``.base``; the FastAPI app imports ``opspilot.skills`` once at startup so
the registry is fully populated before any request lands.
"""

from __future__ import annotations

from opspilot.skills.base import (
    ApprovalRequest,
    SKILL_REGISTRY,
    SkillContext,
    SkillDefinition,
    SkillOutput,
    register_skill,
)

# Import concrete skills for their side-effect of self-registering.
from opspilot.skills import (  # noqa: F401  (registry side-effects)
    daily_briefing,
    email_reply,
    follow_up_detector,
    meeting_summary,
    task_extraction,
)

__all__ = [
    "ApprovalRequest",
    "SKILL_REGISTRY",
    "SkillContext",
    "SkillDefinition",
    "SkillOutput",
    "register_skill",
]
