from typing import Any, Protocol


class LLMClient(Protocol):
    async def complete_json(self, *, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        ...


class NotConfiguredLLMClient:
    async def complete_json(self, *, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("LLM workflows are not implemented until Phase 3")

