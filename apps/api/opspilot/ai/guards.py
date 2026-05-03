import re


EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


def redact_pii_for_log(value: str) -> str:
    return EMAIL_RE.sub("[email-redacted]", value)

