"""Retrieval-augmented generation: chunk → embed → upsert + similarity query.

The pgvector column is declared as a hand-rolled SQLAlchemy ``UserDefinedType``
(no pgvector Python lib), so we ship vectors over the wire as strings and
let Postgres parse them via ``::vector`` casts. Cheap and works.

Retrieval is always scoped by ``company_id`` — we never let one tenant's
documents leak into another tenant's prompt.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from opspilot.ai.embeddings import EMBEDDING_DIM, EmbeddingsClient
from opspilot.models import Document, DocumentChunk


def chunk_text(
    text: str, *, target_chars: int = 3200, overlap_chars: int = 400
) -> list[str]:
    """Naive char-window chunker. Good enough for short ops/legal docs.

    Smarter splitters (recursive, semantic) are easy to swap in later — the
    skills don't see chunking, only the retrieved spans.
    """
    if target_chars <= overlap_chars:
        raise ValueError("target_chars must be greater than overlap_chars")
    if not text:
        return []
    chunks: list[str] = []
    cursor = 0
    while cursor < len(text):
        chunks.append(text[cursor : cursor + target_chars])
        if cursor + target_chars >= len(text):
            break
        cursor += target_chars - overlap_chars
    return chunks


def _format_vector(vec: list[float]) -> str:
    """pgvector input literal: ``[0.1,0.2,...]``. SQL casts to ``::vector``."""
    if len(vec) != EMBEDDING_DIM:
        raise ValueError(
            f"Embedding has {len(vec)} dims, expected {EMBEDDING_DIM}",
        )
    return "[" + ",".join(f"{v:.7f}" for v in vec) + "]"


async def embed_and_upsert_document(
    session: AsyncSession,
    *,
    document: Document,
    body: str,
    embeddings: EmbeddingsClient,
) -> int:
    """Replace any existing chunks for ``document`` and re-embed ``body``.

    Idempotent: re-running on the same document refreshes the index. Returns
    the number of chunks written.
    """
    # Wipe existing chunks. CASCADE on document delete already covers this on
    # the destructive path; here we only refresh.
    await session.execute(
        delete(DocumentChunk).where(DocumentChunk.document_id == document.id)
    )

    pieces = chunk_text(body)
    if not pieces:
        return 0

    vectors = await embeddings.embed_batch(pieces)
    for index, (chunk, vector) in enumerate(zip(pieces, vectors, strict=True)):
        await session.execute(
            text(
                """
                INSERT INTO document_chunks
                    (id, document_id, chunk_index, text, embedding, token_count,
                     created_at, updated_at)
                VALUES
                    (gen_random_uuid(), :doc_id, :idx, :text,
                     CAST(:embedding AS vector),
                     :tokens, now(), now())
                """
            ),
            {
                "doc_id": document.id,
                "idx": index,
                "text": chunk,
                "embedding": _format_vector(vector),
                # Approximate: 1 token ≈ 4 chars. Real tokenization is the
                # provider's problem; this is just for skill_run accounting.
                "tokens": max(1, len(chunk) // 4),
            },
        )

    document.status = "indexed"
    return len(pieces)


@dataclass(frozen=True)
class RetrievedChunk:
    document_id: uuid.UUID
    document_title: str
    chunk_index: int
    text: str
    score: float  # 0..1, higher is better (cosine similarity)


async def search_chunks(
    session: AsyncSession,
    *,
    company_id: uuid.UUID,
    query: str,
    embeddings: EmbeddingsClient,
    top_k: int = 5,
) -> list[RetrievedChunk]:
    """Cosine-similarity retrieval over the company's chunks.

    Uses ``<=>`` (cosine distance) and converts to similarity = ``1 - dist``
    so callers see "higher is better".
    """
    if not query.strip():
        return []
    [vector] = await embeddings.embed_batch([query])
    rows = await session.execute(
        text(
            """
            SELECT
                d.id          AS document_id,
                d.title       AS document_title,
                c.chunk_index AS chunk_index,
                c.text        AS chunk_text,
                1 - (c.embedding <=> CAST(:embedding AS vector)) AS score
            FROM document_chunks c
            JOIN documents d ON d.id = c.document_id
            WHERE d.company_id = :company_id
              AND c.embedding IS NOT NULL
            ORDER BY c.embedding <=> CAST(:embedding AS vector)
            LIMIT :top_k
            """
        ),
        {
            "embedding": _format_vector(vector),
            "company_id": company_id,
            "top_k": top_k,
        },
    )
    return [
        RetrievedChunk(
            document_id=row.document_id,
            document_title=row.document_title,
            chunk_index=row.chunk_index,
            text=row.chunk_text,
            score=float(row.score),
        )
        for row in rows
    ]
