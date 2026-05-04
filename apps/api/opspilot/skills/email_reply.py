"""email_reply — draft a reply to an email thread.

Input: ``thread_id``.
Process:
  1. Load the thread + all messages, scoped by company.
  2. Detect language from the latest inbound message (cheap heuristic).
  3. Run a RAG search over the company's documents using the thread subject +
     last inbound body as the query.
  4. Ask the LLM for a JSON ``{ "subject", "body", "rationale" }`` reply,
     using the company's tone profile and the retrieved chunks.
  5. Emit an ``ApprovalRequest`` of type ``email_reply`` with sources.

Output (persisted on skill_runs.output): the draft + sources.

Note: the LLM only sees retrieved text. It never gets the ability to send.
The send happens after operator approve, via ``send_email_mock`` effector.
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import select

from opspilot.models import Client, Company, Message
from opspilot.services.rag import search_chunks
from opspilot.skills.base import (
    ApprovalRequest,
    SkillContext,
    SkillDefinition,
    SkillOutput,
    register_skill,
)

INPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {"thread_id": {"type": "string"}},
    "required": ["thread_id"],
}

OUTPUT_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "draft_subject": {"type": "string"},
        "draft_body": {"type": "string"},
        "rationale": {"type": "string"},
        "sources": {"type": "array"},
        "language": {"type": "string"},
    },
}


_LLM_RESPONSE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "subject": {"type": "string"},
        "body": {"type": "string"},
        "rationale": {"type": "string"},
    },
    "required": ["subject", "body", "rationale"],
}


async def handler(ctx: SkillContext, payload: dict[str, Any]) -> SkillOutput:
    thread_id = payload["thread_id"]

    # 1. Load messages on this thread.
    msgs = await ctx.session.execute(
        select(Message)
        .where(
            Message.thread_id == thread_id,
            Message.company_id == ctx.company_id,
        )
        .order_by(Message.received_at.asc())
    )
    messages = list(msgs.scalars())
    if not messages:
        raise ValueError(f"No messages found for thread {thread_id!r}")

    last_inbound = next(
        (m for m in reversed(messages) if m.direction == "inbound"), messages[-1]
    )

    # Pull the company tone profile + client overrides.
    company = (
        await ctx.session.execute(
            select(Company).where(Company.id == ctx.company_id)
        )
    ).scalar_one()
    client = None
    if last_inbound.client_id:
        client = (
            await ctx.session.execute(
                select(Client).where(Client.id == last_inbound.client_id)
            )
        ).scalar_one_or_none()

    language = _detect_language(last_inbound.body, last_inbound.subject)
    formality = (client.formality_override if client else None) or company.default_formality

    # 2. RAG: retrieve relevant company knowledge.
    query = f"{last_inbound.subject}\n\n{last_inbound.body}"
    retrieved = await search_chunks(
        ctx.session,
        company_id=ctx.company_id,
        query=query,
        embeddings=ctx.embeddings,
        top_k=4,
    )
    sources = [
        {
            "type": "doc_chunk",
            "document_id": str(r.document_id),
            "title": r.document_title,
            "chunk_index": r.chunk_index,
            "score": round(r.score, 4),
        }
        for r in retrieved
    ]
    sources.append(
        {"type": "message", "message_id": str(last_inbound.id), "thread_id": thread_id}
    )

    # 3. Build prompt + ask the LLM.
    prompt = _build_prompt(
        company=company,
        client=client,
        thread_messages=messages,
        retrieved=retrieved,
        language=language,
        formality=formality,
    )
    draft = await ctx.llm.complete_json(prompt=prompt, schema=_LLM_RESPONSE_SCHEMA)

    # The mock LLM returns ``{"mock": True, ...}`` — fall back to a stub draft
    # so the rest of the pipeline is exercisable without a real key.
    if draft.get("mock"):
        draft = _stub_draft(last_inbound.subject, language)

    # 4. Emit approval.
    rationale = draft.get("rationale", "Drafted reply based on thread + KB.")
    approval = ApprovalRequest(
        action_type="email_reply",
        payload={
            "to": last_inbound.sender,
            "thread_id": thread_id,
            "subject": draft.get("subject") or f"Re: {last_inbound.subject}",
            "body": draft.get("body", ""),
            "language": language,
            "formality": formality,
        },
        rationale=rationale,
        sources=sources,
    )

    return SkillOutput(
        output={
            "draft_subject": approval.payload["subject"],
            "draft_body": approval.payload["body"],
            "rationale": rationale,
            "sources": sources,
            "language": language,
        },
        approvals=[approval],
        # Token accounting is best-effort until we read provider usage metadata.
        tokens_in=len(prompt) // 4,
        tokens_out=len(approval.payload["body"]) // 4,
    )


def _detect_language(*texts: str) -> str:
    """Tiny heuristic: look for a few high-signal German tokens.

    Good enough for a demo with German + English. Phase 5 swaps to
    ``langdetect`` (PLAN.md §11 recommendation).
    """
    sample = " ".join(t.lower() for t in texts if t)[:1000]
    de_markers = (
        " der ", " die ", " das ", " und ", " ist ", " nicht ",
        " sehr geehrte", " mit freundlichen", " gerne ", " bitte ",
    )
    hits = sum(1 for m in de_markers if m in f" {sample} ")
    return "de" if hits >= 2 else "en"


def _build_prompt(
    *,
    company,
    client,
    thread_messages,
    retrieved,
    language: str,
    formality: str,
) -> str:
    history = "\n\n".join(
        f"[{m.direction.upper()} {m.received_at.isoformat()}] {m.sender}\n"
        f"Subject: {m.subject}\n{m.body}"
        for m in thread_messages[-6:]  # last 6 messages is plenty
    )
    kb = "\n\n".join(
        f"[KB:{r.document_title} #{r.chunk_index} score={r.score:.2f}]\n{r.text}"
        for r in retrieved
    ) or "(no relevant documents found)"

    lang_label = "German" if language == "de" else "English"
    formality_hint = (
        "Use formal 'Sie' address." if formality == "sie"
        else "Use informal 'du' address."
    ) if language == "de" else "Use a polite professional tone."
    client_note = (
        f"This client (${client.name}) typically receives ${client.formality_override} tone."
        if client else "No prior client preferences on file."
    )

    return f"""You are drafting an email reply on behalf of {company.name}.
Industry: {company.industry or "n/a"}.
Reply in {lang_label}. {formality_hint}
{client_note}

Company tone notes: {company.tone_profile or "polite, factual, no marketing fluff"}.

--- THREAD HISTORY ---
{history}

--- RELEVANT INTERNAL KNOWLEDGE (cite implicitly, do not paste verbatim) ---
{kb}

Draft a reply addressing the latest inbound message. Output strictly JSON:
{{"subject": "...", "body": "...", "rationale": "Why this answer; mention which KB doc(s) helped"}}

Keep the body under 250 words. Do not invent facts that aren't in the thread or KB.
"""


def _stub_draft(subject: str, language: str) -> dict[str, str]:
    if language == "de":
        return {
            "subject": f"Re: {subject}",
            "body": (
                "Sehr geehrte Damen und Herren,\n\n"
                "vielen Dank für Ihre Nachricht. Wir prüfen Ihre Anfrage "
                "und melden uns kurzfristig mit einer detaillierten Antwort.\n\n"
                "Mit freundlichen Grüßen"
            ),
            "rationale": (
                "Stub draft (LLM unavailable). Real provider returns a context-aware reply."
            ),
        }
    return {
        "subject": f"Re: {subject}",
        "body": (
            "Hello,\n\nThank you for your message. We're reviewing your "
            "request and will follow up shortly with a detailed answer.\n\nBest regards"
        ),
        "rationale": (
            "Stub draft (LLM unavailable). Real provider returns a context-aware reply."
        ),
    }


SKILL = register_skill(
    SkillDefinition(
        key="email_reply",
        name="Email reply draft",
        description="Drafts a reply to an inbound thread using the company's KB.",
        input_schema=INPUT_SCHEMA,
        output_schema=OUTPUT_SCHEMA,
        approval_required=True,
        handler=handler,
    )
)
