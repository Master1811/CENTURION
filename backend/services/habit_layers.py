import asyncio
from datetime import datetime, timezone, timedelta

from services.engagement_engine import (
    APP_URL,
    MILESTONES_INR,
    dedup_key,
    is_deduped,
    mark_sent,
    email_opted_in,
    mom_change_pct,
    days_to_milestone,
    fmt_inr,
    current_week,
    current_month,
    current_day,
    haiku_call,
    run_batch_job,
    send_email_batch,
    _mem_dedup,
    _log_email_locally,
)
from services.supabase import supabase_service


# ============================================================================
# Shared HTML helpers
# ============================================================================
def _base_email(content: str, preheader: str = "") -> str:
    pre = (preheader or "").replace("\n", " ").strip()[:140]

    return f"""
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAFAFA;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      {pre}
    </div>

    <div style="max-width:560px;margin:0 auto;padding:18px;">
      <div style="background:#ffffff;border-radius:14px;overflow:hidden;">
        <div style="background:#09090B;padding:18px 20px;color:#B8962E;font-family:Arial,Helvetica,sans-serif;font-weight:800;letter-spacing:0.06em;">
          CENTURION
        </div>
        <div style="padding:18px 20px;color:#111827;font-family:Arial,Helvetica,sans-serif;">
          {content}
        </div>
        <div style="padding:16px 20px;background:#F9FAFB;border-top:1px solid #E5E7EB;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B7280;">
          <a href="{APP_URL + '/dashboard/settings'}" style="color:#111827;text-decoration:underline;">
            Manage email preferences
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
""".strip()


def _cta(text: str, url: str) -> str:
    return f"""
<a href="{url}"
   style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;
          padding:12px 24px;border-radius:10px;font-weight:700;margin-top:14px;">
  {text}
</a>
""".strip()


def _divider() -> str:
    return '<hr style="border:none;border-top:1px solid #E4E4E7;margin:16px 0;" />'


def _question_block(question: str, border: str = "#B8962E", label: str = "BOARD QUESTION") -> str:
    q = (question or "").strip()
    return f"""
<div style="margin-top:10px;">
  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:{border};">
    {label}
  </div>
  <div style="border-left:4px solid {border};padding-left:14px;margin-top:6px;color:#111827;">
    <div style="font-style:italic;line-height:1.5;">
      {q}
    </div>
  </div>
</div>
""".strip()


# ============================================================================
# LAYER 1 — Monday Morning Digest
# ============================================================================
async def _build_digest_payload(user: dict, semaphore: asyncio.Semaphore):
    if not email_opted_in(user, "weekly_digest"):
        return None

    user_id = user["id"]
    window = current_week()
    key = dedup_key(user_id, "digest", window)
    if is_deduped(key):
        return None

    checkins = await supabase_service.get_recent_checkins(user_id, limit=2)

    current_mrr = user.get("current_mrr") or 0
    previous_mrr = (
        checkins[1].get("actual_revenue", current_mrr)
        if len(checkins) > 1
        else current_mrr
    )

    growth_rate = user.get("growth_rate") or 0.08
    stage = user.get("stage") or "seed"
    streak = user.get("streak_count") or 0

    change = mom_change_pct(current_mrr, previous_mrr)
    sign = "+" if change >= 0 else ""

    next_label, days = days_to_milestone(current_mrr, growth_rate)
    cohort_rank = await supabase_service.get_cohort_percentile(growth_rate, stage)
    cohort_size = await supabase_service.get_cohort_size(stage)

    question_prompt = (
        "You are a board member reviewing one metric.\n"
        "Ask one uncomfortable question.\n\n"
        "FACTS:\n"
        f"- MRR growth this month: {sign}{change:.1f}%\n"
        f"- Cohort rank: {cohort_rank}th percentile\n"
        f"  (n={cohort_size}, {stage}-stage India)\n"
        f"- Check-in streak: {streak} months\n\n"
        "RULES:\n"
        "- Exactly 1 sentence ending with ?\n"
        "- Cold boardroom tone\n"
        "- Reference the specific numbers\n"
        "- No advice, no encouragement"
    )

    fallback = (
        "Your growth rate changed "
        f"{sign}{change:.1f}% - what is the single root cause?"
    )

    question = await haiku_call(question_prompt, semaphore, fallback=fallback)

    arrow = "↑" if change >= 0 else "↓"
    company = user.get("company_name") or user.get("company") or "Company"
    subject = f"{company} — MRR {fmt_inr(current_mrr)} ({sign}{change:.1f}%) {arrow}"

    mom_color = "#10B981" if change >= 0 else "#EF4444"
    streak_line = ""
    if streak > 0:
        streak_line = f'<div style="margin-top:8px;color:#B8962E;font-weight:800;">🔥 {streak}-month streak</div>'

    tiles = f"""
<div style="display:flex;gap:12px;margin-top:14px;">
  <div style="flex:1;background:#0B0B10;border-radius:12px;padding:14px;color:#ffffff;">
    <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;font-weight:800;">
      NEXT MILESTONE
    </div>
    <div style="font-size:26px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;margin-top:8px;">
      {days} days
    </div>
    <div style="margin-top:6px;color:#B8962E;font-weight:800;">
      to {next_label}
    </div>
  </div>

  <div style="flex:1;background:#0B0B10;border-radius:12px;padding:14px;color:#ffffff;">
    <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;font-weight:800;">
      COHORT RANK
    </div>
    <div style="font-size:26px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;margin-top:8px;">
      {cohort_rank}th
    </div>
    <div style="margin-top:6px;color:#B8962E;font-weight:800;">
      percentile this week
    </div>
  </div>
</div>
""".strip()

    content = f"""
<div>
  <div style="font-size:16px;font-weight:800;margin-bottom:8px;">
    Good morning, {user.get("full_name")}. Here is where {company} stands this week.
  </div>

  <div style="margin-top:12px;background:#0B0B10;border-radius:14px;padding:16px;color:#ffffff;">
    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;font-weight:800;">
      Current MRR
    </div>
    <div style="font-size:34px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;margin-top:6px;">
      {fmt_inr(current_mrr)}
    </div>
    <div style="margin-top:6px;color:{mom_color};font-weight:900;">
      MoM change: {sign}{change:.1f}%
    </div>
    {streak_line}
  </div>

  {_divider()}
  {tiles}

  {_divider()}
  {_question_block(question, label="THIS WEEK'S BOARD QUESTION")}

  {_cta("Open your dashboard →", APP_URL + "/dashboard")}
</div>
""".strip()

    html = _base_email(content, preheader=f"{company} — MRR {fmt_inr(current_mrr)} ({sign}{change:.1f}%)")

    return {
        "user_id": user_id,
        "to": user.get("email"),
        "subject": subject,
        "html": html,
        "metadata": {
            "mrr": current_mrr,
            "mom_change": change,
            "cohort_rank": cohort_rank,
        },
    }


async def run_monday_digest():
    users = await supabase_service.get_paid_users_for_digest()
    return await run_batch_job(
        job_name="digest",
        users=users,
        build_fn=_build_digest_payload,
        dedup_window=current_week(),
        dedup_ttl=8 * 24 * 3600,
    )


# ============================================================================
# LAYER 2 — Check-in Reminder
# ============================================================================
async def _build_checkin_reminder_payload(user: dict, semaphore: asyncio.Semaphore):
    if not email_opted_in(user, "checkin_reminders"):
        return None

    user_id = user["id"]
    window = current_month()
    key = dedup_key(user_id, "checkin_reminder", window)
    if is_deduped(key):
        return None

    streak = user.get("streak_count") or 0
    company = user.get("company_name") or "Company"
    current_mrr = user.get("current_mrr") or 0

    if streak > 0:
        nudge = f"You have a {streak}-month streak. Don't break it now."
        nudge_color = "#B8962E"
        streak_text = f"{streak}-month streak"
    else:
        nudge = "Start your first check-in today."
        nudge_color = "#52525B"
        streak_text = "0-month streak"

    subject = f"{company} — your monthly check-in is due"
    if streak > 0:
        subject += f" (streak: {streak}mo)"

    content = f"""
<div>
  <div style="font-size:16px;font-weight:900;">
    Monthly check-in due
  </div>
  <div style="margin-top:10px;color:#6B7280;">
    Your {company} board expects one simple action every month.
  </div>

  <div style="margin-top:14px;background:#0B0B10;border-radius:14px;padding:16px;color:#ffffff;">
    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;font-weight:800;">
      Current MRR
    </div>
    <div style="font-size:26px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;margin-top:6px;">
      {fmt_inr(current_mrr)}
    </div>

    <div style="margin-top:10px;color:{nudge_color};font-weight:900;">
      {streak_text}
    </div>
    <div style="margin-top:8px;color:{nudge_color};font-weight:800;line-height:1.5;">
      {nudge}
    </div>
  </div>

  {_cta("Submit this month's check-in →", APP_URL + "/dashboard")}
</div>
""".strip()

    html = _base_email(content, preheader=f"{company} — monthly check-in due")

    return {
        "user_id": user_id,
        "to": user.get("email"),
        "subject": subject,
        "html": html,
        "metadata": {"mrr": current_mrr, "streak": streak},
    }


async def run_checkin_reminder():
    users = await supabase_service.get_paid_users_for_digest()

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=25)

    async def needs_reminder(u: dict) -> dict | None:
        profile = await supabase_service.get_profile_by_id(u["id"])
        last_checkin_at = (profile or {}).get("last_checkin_at")
        if not last_checkin_at:
            return u
        if isinstance(last_checkin_at, str):
            last_checkin_at = datetime.fromisoformat(
                last_checkin_at.replace("Z", "+00:00")
            )
        if last_checkin_at < cutoff:
            return u
        return None

    # Filter users in parallel.
    filtered = await asyncio.gather(*(needs_reminder(u) for u in users))
    due_users = [u for u in filtered if u is not None]

    return await run_batch_job(
        job_name="checkin_reminder",
        users=due_users,
        build_fn=_build_checkin_reminder_payload,
        dedup_window=current_month(),
        dedup_ttl=32 * 24 * 3600,
    )


# ============================================================================
# LAYER 3 — Milestone Countdown
# ============================================================================
MILESTONE_WINDOWS = [30, 14, 7, 3, 1]


async def _build_milestone_payload(user: dict, semaphore: asyncio.Semaphore):
    if not email_opted_in(user, "milestone_alerts"):
        return None

    current_mrr = user.get("current_mrr") or 0
    growth_rate = user.get("growth_rate") or 0

    label, days = days_to_milestone(current_mrr, growth_rate)
    if days not in MILESTONE_WINDOWS:
        return None

    user_id = user["id"]
    key = dedup_key(user_id, "milestone_countdown", current_day())
    if is_deduped(key):
        return None

    urgency = {
        1: "Tomorrow. This is it.",
        3: "3 days away. Stay on track.",
        7: "One week away.",
        14: "Two weeks away.",
        30: "30 days away. You're on pace.",
    }.get(days, "")

    urgency_color = "#B8962E" if days <= 7 else "#52525B"
    company = user.get("company_name") or "Company"

    content = f"""
<div>
  <div style="background:#0B0B10;border-radius:14px;padding:18px;color:#ffffff;">
    <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#9CA3AF;font-weight:800;">
      NEXT MILESTONE
    </div>
    <div style="font-size:40px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;margin-top:8px;">
      {label}
    </div>

    <div style="font-size:18px;margin-top:8px;color:#ffffff;font-weight:900;">
      {days} day{"s" if days != 1 else ""} left
    </div>

    <div style="margin-top:10px;color:#B8962E;font-weight:900;">
      Current MRR: {fmt_inr(current_mrr)}
    </div>

    <div style="margin-top:10px;color:{urgency_color};font-weight:900;">
      {urgency}
    </div>
  </div>

  {_divider()}
  {_cta("See your full trajectory →", APP_URL + "/tools/100cr-calculator")}
</div>
""".strip()

    subject = f"{company} — {label} in {days} day(s) 🎯"
    html = _base_email(content, preheader=subject)

    return {
        "user_id": user_id,
        "to": user.get("email"),
        "subject": subject,
        "html": html,
        "metadata": {"days": days, "milestone": label},
    }


async def run_milestone_countdown():
    users = await supabase_service.get_paid_users_for_digest()
    active = []
    for u in users:
        if (u.get("current_mrr") or 0) > 0 and (u.get("growth_rate") or 0) > 0:
            active.append(u)

    return await run_batch_job(
        job_name="milestone_countdown",
        users=active,
        build_fn=_build_milestone_payload,
        dedup_window=current_day(),
        dedup_ttl=26 * 3600,
    )


# ============================================================================
# LAYER 4 — Streak Protection
# ============================================================================
async def _build_streak_payload(user: dict, semaphore: asyncio.Semaphore):
    streak = user.get("streak_count") or 0
    if streak <= 0:
        return None

    if not email_opted_in(user, "streak_reminders"):
        return None

    key = dedup_key(user["id"], "streak_protection", current_day())
    if is_deduped(key):
        return None

    last_checkin_at = user.get("last_checkin_at")
    if not last_checkin_at:
        return None

    if isinstance(last_checkin_at, str):
        last_checkin_at = datetime.fromisoformat(last_checkin_at.replace("Z", "+00:00"))

    now_utc = datetime.now(timezone.utc)
    days_since = (now_utc - last_checkin_at).days
    days_left = max(0, 30 - days_since)
    if days_left <= 0:
        return None

    urgency_color = "#EF4444" if days_left <= 3 else "#B8962E"
    company = user.get("company_name") or "Company"

    content = f"""
<div>
  <div style="text-align:center;margin-top:6px;">
    <div style="font-size:54px;line-height:1;color:#B8962E;">🔥</div>
    <div style="font-size:28px;font-weight:900;color:#0B0B10;margin-top:6px;">
      {streak}-month
    </div>
    <div style="margin-top:6px;color:#6B7280;font-weight:800;">
      {streak} consecutive months
    </div>
    <div style="margin-top:10px;font-weight:900;color:{urgency_color};">
      Expires in {days_left} day{"s" if days_left != 1 else ""}.
    </div>
  </div>

  <div style="margin-top:14px;color:#111827;line-height:1.6;">
    Submit your monthly check-in to protect your streak.
  </div>

  {_cta("Protect my streak →", APP_URL + "/dashboard")}
</div>
""".strip()

    subject = f"Your {streak}-month streak expires in {days_left} day(s)"
    html = _base_email(content, preheader=subject)

    return {
        "user_id": user["id"],
        "to": user.get("email"),
        "subject": subject,
        "html": html,
        "metadata": {"streak": streak, "days_left": days_left},
    }


async def run_streak_protection():
    users = await supabase_service.get_paid_users_for_digest()
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=20)

    async def enrich_if_at_risk(u: dict) -> dict | None:
        if (u.get("streak_count") or 0) <= 0:
            return None
        profile = await supabase_service.get_profile_by_id(u["id"])
        last_checkin_at = (profile or {}).get("last_checkin_at")
        if not last_checkin_at:
            return None
        if isinstance(last_checkin_at, str):
            last_dt = datetime.fromisoformat(last_checkin_at.replace("Z", "+00:00"))
        else:
            last_dt = last_checkin_at
        if last_dt < cutoff:
            u = dict(u)
            u["last_checkin_at"] = last_checkin_at
            return u
        return None

    filtered = await asyncio.gather(*(enrich_if_at_risk(u) for u in users))
    at_risk = [u for u in filtered if u is not None]

    return await run_batch_job(
        job_name="streak_protection",
        users=at_risk,
        build_fn=_build_streak_payload,
        dedup_window=current_day(),
        dedup_ttl=26 * 3600,
    )


# ============================================================================
# LAYER 5 — Anomaly Alert (event-driven)
# ============================================================================
async def fire_anomaly_alert(user_id: str, new_mrr: float, previous_mrr: float) -> bool:
    change_pct = mom_change_pct(new_mrr, previous_mrr)
    if change_pct >= -10:
        return False

    alert_key = dedup_key(user_id, "anomaly", current_day())
    if is_deduped(alert_key):
        return False

    profile = await supabase_service.get_profile_by_id(user_id)
    if not profile:
        return False

    if not email_opted_in(profile, "anomaly_alerts"):
        return False

    stage = profile.get("stage") or "seed"
    growth = profile.get("growth_rate") or 0.08

    prev_rank = await supabase_service.get_cohort_percentile(growth, stage)
    adj_rate = growth * (new_mrr / previous_mrr if previous_mrr > 0 else 1)
    curr_rank = await supabase_service.get_cohort_percentile(adj_rate, stage)
    cohort_sz = await supabase_service.get_cohort_size(stage)

    rank_drop = prev_rank - curr_rank
    if rank_drop < 5 and abs(change_pct) < 10:
        return False

    semaphore = asyncio.Semaphore(1)
    sign = "+" if change_pct >= 0 else ""
    company = profile.get("company_name") or profile.get("company") or "Company"

    question_prompt = (
        "You are a board member reviewing anomaly.\n\n"
        "FACTS:\n"
        f"- MRR change: {sign}{change_pct:.1f}%\n"
        f"- Cohort rank: {prev_rank}th -> {curr_rank}th percentile\n"
        f"- Cohort size: n={cohort_sz}\n"
        f"- Stage: {stage}-stage India\n\n"
        "RULES:\n"
        "- 1 sentence ending with ?\n"
        "- Cold tone\n"
        "- No advice"
    )

    fallback = (
        f"Your MRR dropped {change_pct:.1f}% - what is the root cause?"
    )

    question = await haiku_call(question_prompt, semaphore, fallback=fallback)

    content = f"""
<div>
  <div style="background:#EF4444;border-radius:14px;padding:14px;color:#ffffff;font-weight:900;">
    ⚠ MRR alert
  </div>

  <div style="margin-top:12px;font-size:34px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;font-weight:900;color:#EF4444;">
    {sign}{change_pct:.1f}%
  </div>

  <div style="margin-top:8px;color:#111827;font-weight:900;">
    Cohort rank shift: {prev_rank}th → {curr_rank}th percentile
  </div>

  {_divider()}
  {_question_block(question, border="#EF4444", label="ANOMALY DETECTED")}
  {_cta("View full analysis →", APP_URL + "/dashboard/coach")}
</div>
""".strip()

    subject = f"⚠ {company} — MRR alert ({sign}{change_pct:.1f}%)"
    html = _base_email(content, preheader=subject)

    payload = {
        "user_id": user_id,
        "to": profile.get("email") or profile.get("user_email") or None,
        "subject": subject,
        "html": html,
        "metadata": {"change_pct": change_pct, "rank_drop": rank_drop},
    }

    sent, _ = send_email_batch([payload])
    if sent <= 0:
        return False

    mark_sent(alert_key, 72 * 3600)

    try:
        await supabase_service.log_engagement_events(
            [
                {
                    "user_id": user_id,
                    "event_type": "anomaly",
                    "channel": "email",
                    "metadata": payload.get("metadata") or {},
                }
            ]
        )
    except Exception as e:
        print("[anomaly] engagement_events log failed:", e)

    return True

