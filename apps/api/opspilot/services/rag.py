def chunk_text(text: str, *, target_chars: int = 3200, overlap_chars: int = 400) -> list[str]:
    if target_chars <= overlap_chars:
        raise ValueError("target_chars must be greater than overlap_chars")
    chunks: list[str] = []
    cursor = 0
    while cursor < len(text):
        chunks.append(text[cursor : cursor + target_chars])
        cursor += target_chars - overlap_chars
    return chunks

