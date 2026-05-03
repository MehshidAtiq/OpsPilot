"""LLM client abstraction.

Phase 3 routes every model call through the ``LLMClient`` protocol so skills
never know which provider answered. Today: OpenRouter (free tier) for chat,
with a deterministic mock as the fallback whenever the API key is missing.
Tomorrow: swap in Anthropic / OpenAI / Gemini behind the same interface.

Skills MUST depend on this protocol — never instantiate provider clients
directly. That is the seam that keeps "the LLM has read tools only" honest:
all writes happen via effectors after Approval.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Protocol

import httpx

from opspilot.config import Settings, settings

logger = logging.getLogger(__name__)


class LLMError(RuntimeError):
    """Raised when the underlying provider returns an unrecoverable error."""


class LLMClient(Protocol):
    async def complete_json(
        self, *, prompt: str, schema: dict[str, Any]
    ) -> dict[str, Any]:
        """Return a JSON object matching ``schema``."""

    async def complete_text(self, *, prompt: str) -> str:
        """Return free-form text. Used for drafts, summaries, etc."""


# --- Mock client ----------------------------------------------------------

class MockLLMClient:
    """Deterministic fallback used in tests and when no API key is set.

    Returns a stub object that satisfies the JSON contract without claiming
    to be real model output — callers can detect the ``mock: true`` marker.
    """

    name = "mock"

    async def complete_json(
        self, *, prompt: str, schema: dict[str, Any]
    ) -> dict[str, Any]:
        return {
            "mock": True,
            "note": "MockLLMClient — set LLM_PROVIDER and an API key to use a real model.",
            "schema_keys": sorted((schema.get("properties") or {}).keys()),
        }

    async def complete_text(self, *, prompt: str) -> str:
        return (
            "[mock LLM output] "
            "Set LLM_PROVIDER=openrouter and OPENROUTER_API_KEY to enable real generation."
        )


# --- OpenRouter client ----------------------------------------------------

class OpenRouterLLMClient:
    """Thin async wrapper over OpenRouter's OpenAI-compatible chat endpoint.

    Kept intentionally small. We do not wire streaming, function-calling, or
    tool use here — Phase 3 skills only need ``complete_json`` and
    ``complete_text``. Everything fancier waits until we have a reason.
    """

    name = "openrouter"

    def __init__(
        self,
        *,
        api_key: str,
        model: str,
        base_url: str,
        referer: str | None,
        app_title: str,
        timeout_seconds: float,
    ) -> None:
        self._model = model
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout_seconds
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-Title": app_title,
        }
        if referer:
            # OpenRouter uses HTTP-Referer (yes, the misspelled HTTP one) for
            # attribution. Optional — only set if configured.
            headers["HTTP-Referer"] = referer
        self._headers = headers

    async def complete_text(self, *, prompt: str) -> str:
        data = await self._chat(messages=[{"role": "user", "content": prompt}])
        return _extract_message_content(data)

    async def complete_json(
        self, *, prompt: str, schema: dict[str, Any]
    ) -> dict[str, Any]:
        # OpenRouter forwards OpenAI's response_format. The free Qwen model
        # may not honour it strictly — we still ask for it, then fall back to
        # parsing the first JSON object out of the text.
        system = (
            "You are a JSON API. Respond with a single JSON object that matches "
            "the provided schema. Do not include prose, markdown, or code fences."
        )
        user = (
            f"Schema:\n{json.dumps(schema)}\n\n"
            f"Task:\n{prompt}\n\n"
            "Return only the JSON object."
        )
        data = await self._chat(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
        )
        raw = _extract_message_content(data)
        return _parse_json_object(raw)

    async def _chat(
        self,
        *,
        messages: list[dict[str, str]],
        response_format: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        body: dict[str, Any] = {"model": self._model, "messages": messages}
        if response_format is not None:
            body["response_format"] = response_format
        url = f"{self._base_url}/chat/completions"
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(url, headers=self._headers, json=body)
        except httpx.HTTPError as exc:
            raise LLMError(f"OpenRouter request failed: {exc}") from exc

        if response.status_code >= 400:
            # Don't leak the auth header; the response body is safe.
            snippet = response.text[:500]
            raise LLMError(
                f"OpenRouter HTTP {response.status_code}: {snippet}"
            )
        return response.json()


def _extract_message_content(data: dict[str, Any]) -> str:
    try:
        return data["choices"][0]["message"]["content"] or ""
    except (KeyError, IndexError, TypeError) as exc:
        raise LLMError(f"OpenRouter response missing choices/message: {data}") from exc


def _parse_json_object(raw: str) -> dict[str, Any]:
    """Best-effort JSON parse — strips fences, then locates the first object."""
    text = raw.strip()
    if text.startswith("```"):
        # ```json ... ``` or ``` ... ```
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start : end + 1])
        raise LLMError(f"Could not parse JSON from model output: {raw[:200]!r}")


# --- Factory --------------------------------------------------------------

def build_llm_client(cfg: Settings | None = None) -> LLMClient:
    """Choose a client based on settings. Falls back to mock when unconfigured.

    The fallback is deliberate: skills should be runnable in tests and in
    CI without leaking real API calls, and a missing key should not crash
    the API server on boot.
    """
    cfg = cfg or settings
    provider = (cfg.llm_provider or "mock").lower()

    if provider == "mock":
        return MockLLMClient()

    if provider == "openrouter":
        if not cfg.openrouter_api_key:
            logger.warning(
                "LLM_PROVIDER=openrouter but OPENROUTER_API_KEY is missing — "
                "falling back to MockLLMClient.",
            )
            return MockLLMClient()
        return OpenRouterLLMClient(
            api_key=cfg.openrouter_api_key,
            model=cfg.openrouter_model,
            base_url=cfg.openrouter_base_url,
            referer=cfg.openrouter_referer,
            app_title=cfg.openrouter_app_title,
            timeout_seconds=cfg.llm_timeout_seconds,
        )

    logger.warning(
        "Unknown LLM_PROVIDER=%r — falling back to MockLLMClient. "
        "Supported: 'mock', 'openrouter'.",
        provider,
    )
    return MockLLMClient()


# Module-level singleton for convenience. Skills should depend on the
# protocol type so they can be passed a different client in tests.
llm_client: LLMClient = build_llm_client()


# Backwards-compat shim: the Phase 2 stub class some code may still import.
class NotConfiguredLLMClient(MockLLMClient):
    """Deprecated alias kept for one release; use MockLLMClient instead."""
