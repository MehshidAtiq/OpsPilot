class SkillRunner:
    async def run(self, key: str, payload: dict) -> dict:
        raise RuntimeError(f"Skill {key!r} is not implemented until Phase 3")


skill_runner = SkillRunner()

