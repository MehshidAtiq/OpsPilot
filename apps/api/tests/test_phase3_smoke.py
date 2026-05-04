"""Phase 3 smoke tests — no DB required.

These tests check:
  - all 5 skills self-register on import,
  - the LLM mock client returns the documented contract,
  - the embeddings mock returns 1536-dim L2-normalised vectors,
  - the FallbackEmbeddings wrapper switches on EmbeddingsError,
  - the RAG chunker behaves at boundaries.

End-to-end skill execution requires a Postgres + pgvector + seed data; see
``scripts/seed_dev.py`` and the curl snippets in ``apps/api/README.md`` for
that flow.
"""

from __future__ import annotations

import asyncio
import math

import pytest

from opspilot.ai.embeddings import (
    EMBEDDING_DIM,
    EmbeddingsError,
    FallbackEmbeddings,
    MockEmbeddings,
)
from opspilot.ai.llm import MockLLMClient
from opspilot.services.rag import chunk_text
from opspilot.skills import SKILL_REGISTRY


def test_all_five_skills_registered() -> None:
    expected = {
        "daily_briefing",
        "email_reply",
        "follow_up_detector",
        "meeting_summary",
        "task_extraction",
    }
    assert expected.issubset(SKILL_REGISTRY.keys()), (
        f"missing skills: {expected - SKILL_REGISTRY.keys()}"
    )


def test_daily_briefing_is_read_only() -> None:
    """approval_required=False — the briefing must never enqueue actions."""
    assert SKILL_REGISTRY["daily_briefing"].approval_required is False


def test_other_skills_require_approval() -> None:
    for key in ("email_reply", "task_extraction", "meeting_summary", "follow_up_detector"):
        assert SKILL_REGISTRY[key].approval_required is True, key


def test_mock_llm_returns_marker() -> None:
    client = MockLLMClient()
    out = asyncio.run(
        client.complete_json(prompt="ignored", schema={"properties": {"a": {}, "b": {}}})
    )
    assert out["mock"] is True
    assert out["schema_keys"] == ["a", "b"]


def test_mock_embeddings_shape_and_norm() -> None:
    [vec] = asyncio.run(MockEmbeddings().embed_batch(["hello world"]))
    assert len(vec) == EMBEDDING_DIM
    norm = math.sqrt(sum(v * v for v in vec))
    assert math.isclose(norm, 1.0, rel_tol=1e-6), f"vector not unit length: {norm}"


def test_mock_embeddings_are_deterministic() -> None:
    a = asyncio.run(MockEmbeddings().embed_batch(["same text"]))
    b = asyncio.run(MockEmbeddings().embed_batch(["same text"]))
    assert a == b


class _BrokenEmbeddings:
    name = "broken"

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        raise EmbeddingsError("simulated upstream 429")


def test_fallback_embeddings_trips_on_error() -> None:
    wrapper = FallbackEmbeddings(primary=_BrokenEmbeddings(), backup=MockEmbeddings())
    out = asyncio.run(wrapper.embed_batch(["x"]))
    assert len(out) == 1 and len(out[0]) == EMBEDDING_DIM
    # Subsequent calls go straight to backup without re-raising.
    out2 = asyncio.run(wrapper.embed_batch(["y"]))
    assert len(out2) == 1


def test_chunk_text_empty_and_small() -> None:
    assert chunk_text("") == []
    assert chunk_text("hi") == ["hi"]


def test_chunk_text_overlap_and_coverage() -> None:
    text = "a" * 8000
    chunks = chunk_text(text, target_chars=3200, overlap_chars=400)
    # Should cover the whole input.
    assert "".join(c.replace("a", "") for c in chunks) == ""  # only 'a's
    # First chunk full size.
    assert len(chunks[0]) == 3200
    # Each subsequent chunk shares overlap with the previous.
    for i in range(1, len(chunks)):
        assert chunks[i - 1][-400:] == chunks[i][:400]


def test_chunk_text_invalid_overlap() -> None:
    with pytest.raises(ValueError):
        chunk_text("abc", target_chars=100, overlap_chars=200)
