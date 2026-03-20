import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from anthropic import AsyncAnthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
APP_URL = os.getenv("APP_URL", "http://localhost:3000")

anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

HAIKU_MODEL = "claude-haiku-4-5-20251001"
HAIKU_PARALLEL = 50
RESEND_BATCH = 100
FROM_EMAIL = os.getenv("FROM_EMAIL", "pulse@100crengine.in")

LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
EMAIL_LOG = LOG_DIR / "emails.log"


# ============================================================================
# B — In-memory dedup store
# ============================================================================
_mem_dedup: dict[str, float] = {}


def dedup_key(user_id: str, event_type: str, window: str) -> str:
    return f"eng:{event_type}:{user_id}:{window}"


def is_deduped(key: str) -> bool:
    expiry = _mem_dedup.get(key)
    if expiry is None:
        return False
    now_ts = datetime.now(timezone.utc).timestamp()
    if now_ts > expiry:
        _mem_dedup.pop(key, None)
        return False
    return True


def mark_sent(key: str, ttl_seconds: int) -> None:
    now_ts = datetime.now(timezone.utc).timestamp()
    _mem_dedup[key] = now_ts + ttl_seconds


def mark_sent_pipeline(pairs: list[tuple[str, int]]) -> None:
    for key, ttl in pairs:
        mark_sent(key, ttl)


# ============================================================================
# C — Time window helpers
# ============================================================================
def current_week() -> str:
    return datetime.utcnow().strftime("%Y-W%W")


def current_month() -> str:
    return datetime.utcnow().strftime("%Y-%m")


def current_day() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")


# ============================================================================
# D — Email preference check
# ============================================================================
def email_opted_in(user_dict: dict, pref_key: str) -> bool:
    prefs = user_dict.get("email_preferences") or {}
    return prefs.get(pref_key, True)


# ============================================================================
# E — Math helpers
# ============================================================================
MILESTONES_INR = [
    (1_00_00_000, "₹1 Crore"),
    (10_00_00_000, "₹10 Crore"),
    (50_00_00_000, "₹50 Crore"),
    (100_00_00_000, "₹100 Crore"),
]


def mom_change_pct(current, previous) -> float:
    try:
        if previous in (None, 0):
            return 0.0
        change = ((current - previous) / previous) * 100
        return round(change, 1)
    except Exception:
        return 0.0


def days_to_milestone(current_mrr, growth_rate) -> tuple[str, int]:
    try:
        if growth_rate <= 0 or not current_mrr or current_mrr <= 0:
            return ("₹100 Crore", 9999)

        current_annual = float(current_mrr) * 12.0

        for target_annual, label in MILESTONES_INR:
            if current_annual >= float(target_annual):
                continue

            mrr = float(current_mrr)
            months = 0
            while months < 600:
                mrr *= (1.0 + float(growth_rate))
                months += 1
                if mrr * 12.0 >= float(target_annual):
                    return (label, months * 30)

            return (label, 600 * 30)

        return ("₹100 Crore", 0)
    except Exception:
        return ("₹100 Crore", 9999)


def fmt_inr(amount) -> str:
    try:
        amount = float(amount or 0)
        if amount >= 1_00_00_000:
            # Convert to Crores.
            cr = amount / 1_00_00_000
            return f"₹{cr:.1f}Cr"
        if amount >= 1_00_000:
            # Convert to Lakhs.
            l = amount / 1_00_000
            return f"₹{l:.1f}L"
        return f"₹{int(round(amount)):,}"
    except Exception:
        return "₹0"


# ============================================================================
# F — Async Haiku wrapper
# ============================================================================
async def haiku_call(prompt, semaphore: asyncio.Semaphore, fallback: str = "") -> str:
    async with semaphore:
        try:
            response = await anthropic_client.messages.create(
                model=HAIKU_MODEL,
                max_tokens=180,
                temperature=0,
                system=(
                    "Return the requested output only. "
                    "No preamble. No explanation."
                ),
                messages=[{"role": "user", "content": prompt}],
            )
            # AsyncAnthropic response content shape varies; be defensive.
            text = ""
            if response.content:
                # Usually: response.content[0].text
                text = getattr(response.content[0], "text", "") or ""
            return text.strip() or fallback
        except Exception as e:
            print("[HAIKU] Call failed:", e)
            return fallback


# ============================================================================
# G — Local email logger
# ============================================================================
def _log_email_locally(payloads: list[dict]) -> None:
    for payload in payloads:
        html = payload.get("html") or ""
        preview = html.replace("\n", " ").replace("\r", " ")
        preview = preview[:300]
        line = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "to": payload.get("to"),
            "subject": payload.get("subject"),
            "preview": preview,
        }
        with open(EMAIL_LOG, "a", encoding="utf-8") as f:
            f.write(json.dumps(line, ensure_ascii=False) + "\n")

    print("-" * 52)
    print(f"[EMAIL] {len(payloads)} email(s) - DEV MODE")
    for payload in payloads:
        print(f"  → {payload.get('to')} | {payload.get('subject')}")
    print(f"  Log: {EMAIL_LOG}")
    print("-" * 52)


# ============================================================================
# H — Email sender
# ============================================================================
def send_email_batch(payloads: list[dict]) -> tuple[int, int]:
    # TODO: swap for Resend when ready
    _log_email_locally(payloads)
    return (len(payloads), 0)

    # --- Resend code (disabled for localhost mode) ---
    # from resend import Resend
    # resend = Resend(os.getenv("RESEND_API_KEY"))
    # emails = []
    # for payload in payloads:
    #     emails.append({
    #         "from": FROM_EMAIL,
    #         "to": payload["to"],
    #         "subject": payload["subject"],
    #         "html": payload["html"],
    #     })
    # try:
    #     resend.batch.emails.send(emails=emails)
    #     return (len(payloads), 0)
    # except Exception as e:
    #     print("[RESEND] Send failed:", e)
    #     return (0, len(payloads))


# ============================================================================
# I — Generic batch job runner
# ============================================================================
async def run_batch_job(
    job_name: str,
    users: list[dict],
    build_fn,
    dedup_window: str,
    dedup_ttl: int,
) -> dict:
    if not users:
        print(f"{job_name} - no users")
        return {
            "job": job_name,
            "total": 0,
            "built": 0,
            "sent": 0,
            "skipped": 0,
            "errors": 0,
            "duration_s": 0,
            "mode": "dev",
        }

    start = datetime.utcnow()
    semaphore = asyncio.Semaphore(HAIKU_PARALLEL)
    print(f"[{job_name}] Starting - {len(users)} users")

    tasks = [build_fn(u, semaphore) for u in users]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    payloads: list[dict] = []
    skipped = 0
    build_errs: list[Exception] = []

    for r in results:
        if r is None:
            skipped += 1
        elif isinstance(r, Exception):
            build_errs.append(r)
        elif isinstance(r, dict):
            payloads.append(r)
        else:
            # Unknown type; treat as skipped.
            skipped += 1

    for e in build_errs:
        print(f"[{job_name}] Build error:", repr(e))

    sent_total = 0
    err_total = len(build_errs)

    for i in range(0, len(payloads), RESEND_BATCH):
        batch = payloads[i : i + RESEND_BATCH]
        sent, errors = send_email_batch(batch)
        sent_total += sent
        err_total += errors

    mark_pairs = [
        (dedup_key(p["user_id"], job_name, dedup_window), dedup_ttl)
        for p in payloads
    ]
    mark_sent_pipeline(mark_pairs)

    # Log to Supabase non-blocking
    if payloads:
        try:
            from services.supabase import supabase_service

            events = []
            for p in payloads:
                events.append(
                    {
                        "user_id": p["user_id"],
                        "event_type": job_name,
                        "channel": "email",
                        "metadata": p.get("metadata") or {},
                    }
                )
            await supabase_service.log_engagement_events(events)
        except Exception as e:
            print(f"[{job_name}] Supabase engagement log failed:", e)

    duration_s = (datetime.utcnow() - start).total_seconds()

    return {
        "job": job_name,
        "total": len(users),
        "built": len(payloads),
        "sent": sent_total,
        "skipped": skipped,
        "errors": err_total,
        "duration_s": duration_s,
        "mode": "dev",
    }

