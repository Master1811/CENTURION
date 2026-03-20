"""
Input validation helpers
========================
Centralized helpers for sanitizing and validating user-supplied values to
reduce risk of SQL/command/script injection and unsafe identifiers.

Rules enforced:
- Strip control chars and surrounding whitespace
- Reject angle brackets/backticks to block HTML/JS injection
- Reject obvious SQL meta sequences (";", "--", "/*")
- Constrain identifiers (slugs, providers, payment refs) to safe patterns
- Normalize URLs to http/https and require a host
"""

from __future__ import annotations

import re
from typing import Optional, Pattern
from urllib.parse import urlparse
from uuid import UUID

_CONTROL_CHARS = re.compile(r"[\x00-\x1f\x7f]")
_UNSAFE_SEQUENCES = (";", "--", "/*", "*/", "`", "<", ">")
_BASIC_TEXT_PATTERN: Pattern[str] = re.compile(r"^[A-Za-z0-9\s\-&\.,'()]+$")
_PHONE_PATTERN: Pattern[str] = re.compile(r"^[0-9+\-\s]{7,20}$")
_SAFE_PROVIDER = re.compile(r"^(razorpay|stripe|cashfree|chargebee)$")
_SAFE_SLUG = re.compile(r"^[A-Za-z0-9_-]{4,32}$")
_SAFE_PAYMENT_REF = re.compile(r"^[A-Za-z0-9_-]{6,80}$")
_SAFE_API_KEY = re.compile(r"^[A-Za-z0-9._-]{10,200}$")


def sanitize_text(
    value: Optional[str],
    field_name: str,
    max_length: int = 255,
    allow_pattern: Optional[Pattern[str]] = None,
) -> Optional[str]:
    """Strip control chars/whitespace and reject unsafe characters/patterns."""
    if value is None:
        return None

    cleaned = _CONTROL_CHARS.sub("", value).strip()
    if not cleaned:
        return None

    for seq in _UNSAFE_SEQUENCES:
        if seq in cleaned:
            raise ValueError(f"{field_name} contains unsafe characters")

    if allow_pattern and not allow_pattern.fullmatch(cleaned):
        raise ValueError(f"{field_name} has invalid characters")

    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]

    return cleaned


def sanitize_basic_text(value: Optional[str], field_name: str, max_length: int = 255) -> Optional[str]:
    """Allow only letters, numbers, spaces, and basic punctuation."""
    return sanitize_text(value, field_name, max_length=max_length, allow_pattern=_BASIC_TEXT_PATTERN)


def sanitize_url(url: Optional[str], field_name: str = "url") -> Optional[str]:
    """Allow only http/https URLs without dangerous characters."""
    if url is None:
        return None

    cleaned = sanitize_text(url, field_name, max_length=255)
    if cleaned is None:
        return None

    if not cleaned.lower().startswith(("http://", "https://")):
        cleaned = f"https://{cleaned}"

    parsed = urlparse(cleaned)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"{field_name} must be a valid http(s) URL")

    if parsed.scheme.lower() in ("javascript", "data"):
        raise ValueError(f"{field_name} must not use unsafe schemes")

    return cleaned


def validate_slug(slug: str) -> str:
    if not _SAFE_SLUG.fullmatch(slug or ""):
        raise ValueError("Invalid projection id")
    return slug


def validate_provider(provider: str) -> str:
    if not _SAFE_PROVIDER.fullmatch(provider or ""):
        raise ValueError("Invalid provider identifier")
    return provider


def sanitize_payment_reference(payment_ref: str) -> str:
    if not _SAFE_PAYMENT_REF.fullmatch(payment_ref or ""):
        raise ValueError("Invalid payment reference")
    return payment_ref


def sanitize_api_key(api_key: str) -> str:
    if not _SAFE_API_KEY.fullmatch(api_key or ""):
        raise ValueError("Invalid API key format")
    return api_key


def validate_phone(phone: Optional[str]) -> Optional[str]:
    """Validate phone numbers to a safe, minimal pattern."""
    if phone is None:
        return None
    if not _PHONE_PATTERN.fullmatch(phone.strip()):
        raise ValueError("Invalid phone number")
    return phone.strip()


def validate_uuid_str(value: str, field_name: str = "id") -> str:
    try:
        return str(UUID(value))
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"Invalid {field_name}") from exc

