from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class SkillDefinition:
    key: str
    name: str
    description: str
    input_schema: dict[str, Any]
    output_schema: dict[str, Any]
    approval_required: bool


SKILL_REGISTRY: dict[str, SkillDefinition] = {}


def register_skill(skill: SkillDefinition) -> SkillDefinition:
    SKILL_REGISTRY[skill.key] = skill
    return skill

