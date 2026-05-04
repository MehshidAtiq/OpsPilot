"""Embedding client.

Phase 3 indexes documents into the ``document_chunks.embedding`` pgvector
column. We use OpenAI ``text-embedding-3-small`` (1536 dims, matches the
column we provisioned in Phase 2 — swapping models invalidates the index).

Mock mode is deterministic so tests and CI stay hermetic without a key.
"""

from __future__ import annotations

import hashlib
import logging
from typing import Protocol

from opspilot.config import Settings, settings

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 1536


class EmbeddingsError(RuntimeError):
    pass


class EmbeddingsClient(Protocol):
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        ...


# --- Mock --------------------------------------------------------------------


class MockEmbeddings:
    """Deterministic pseudo-embeddings derived from a SHA-256 hash.

    Vectors are normalised to unit length so cosine distance returns sensible
    relative orderings — different texts get different vectors, identical
    texts collide. Useful in CI; useless for real retrieval quality.
    """

    name = "mock"

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(t) for t in texts]

    @staticmethod
    def _embed_one(text: str) -> list[float]:
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        # Stretch the 32-byte digest to 1536 floats by hashing variants.
        chunks: list[bytes] = []
        for i in range((EMBEDDING_DIM * 2 + 31) // 32):
            chunks.append(hashlib.sha256(seed + i.to_bytes(2, "big")).digest())
        joined = b"".join(chunks)
        # Map bytes pairs into [-1, 1).
        floats: list[float] = []
        for i in range(EMBEDDING_DIM):
            value = int.from_bytes(joined[i * 2 : i * 2 + 2], "big")
            floats.append(value / 32768.0 - 1.0)
        # L2-normalise.
        norm = sum(v * v for v in floats) ** 0.5 or 1.0
        return [v / norm for v in floats]


# --- OpenAI ------------------------------------------------------------------


class OpenAIEmbeddings:
    """Async embeddings via the official OpenAI SDK.

    Single batch call per ``embed_batch`` invocation. The SDK handles retries
    for transient HTTP errors; we surface anything else as ``EmbeddingsError``.
    """

    name = "openai"

    def __init__(self, *, api_key: str, model: str, timeout_seconds: float) -> None:
        # Lazy import — keeps the dep optional at module import time.
        from openai import AsyncOpenAI

        self._client = AsyncOpenAI(api_key=api_key, timeout=timeout_seconds)
        self._model = model

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            response = await self._client.embeddings.create(
                model=self._model, input=texts
            )
        except Exception as exc:  # pragma: no cover — surfaces real errors
            raise EmbeddingsError(f"OpenAI embeddings call failed: {exc}") from exc
        return [item.embedding for item in response.data]


# --- Resilient wrapper -------------------------------------------------------


class FallbackEmbeddings:
    """Try ``primary`` first, fall back to ``backup`` on failure.

    Demo-friendly: an OpenAI 429 / quota error shouldn't kill a skill run.
    The first failure flips the wrapper into "use backup permanently" mode so
    we don't retry-then-fall-back on every call. Mock vectors aren't
    retrieval-quality, but they keep the pipeline exercisable end-to-end.
    """

    name = "fallback"

    def __init__(self, primary: EmbeddingsClient, backup: EmbeddingsClient) -> None:
        self._primary = primary
        self._backup = backup
        self._tripped = False

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        if self._tripped:
            return await self._backup.embed_batch(texts)
        try:
            return await self._primary.embed_batch(texts)
        except EmbeddingsError as exc:
            logger.warning(
                "primary embeddings (%s) failed (%s); switching to backup (%s) "
                "for the rest of this process",
                getattr(self._primary, "name", "?"),
                str(exc)[:140],
                getattr(self._backup, "name", "?"),
            )
            self._tripped = True
            return await self._backup.embed_batch(texts)


# --- Factory -----------------------------------------------------------------


def build_embeddings_client(cfg: Settings | None = None) -> EmbeddingsClient:
    cfg = cfg or settings
    provider = (cfg.embeddings_provider or "mock").lower()

    if provider == "mock":
        return MockEmbeddings()

    if provider == "openai":
        if not cfg.openai_api_key:
            logger.warning(
                "EMBEDDINGS_PROVIDER=openai but OPENAI_API_KEY missing — "
                "falling back to MockEmbeddings.",
            )
            return MockEmbeddings()
        # Wrap the real client so the demo survives quota / network failures.
        return FallbackEmbeddings(
            primary=OpenAIEmbeddings(
                api_key=cfg.openai_api_key,
                model=cfg.embeddings_model,
                timeout_seconds=cfg.llm_timeout_seconds,
            ),
            backup=MockEmbeddings(),
        )

    logger.warning(
        "Unknown EMBEDDINGS_PROVIDER=%r — falling back to MockEmbeddings.",
        provider,
    )
    return MockEmbeddings()


embeddings_client: EmbeddingsClient = build_embeddings_client()
