import os
import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.habit_layers import (
    run_monday_digest,
    run_checkin_reminder,
    run_milestone_countdown,
    run_streak_protection,
)

scheduler_logger = logging.getLogger("100cr_engine.scheduler")


scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


def setup_scheduler() -> None:
    if os.getenv("SCHEDULER_ENABLED", "true").lower() != "true":
        print("[SCHEDULER] Disabled via env")
        return

    jobs = [
        {
            "func": run_monday_digest,
            "id": "monday_digest",
            "trigger": CronTrigger(
                day_of_week="mon",
                hour=8,
                minute=0,
                timezone="Asia/Kolkata",
            ),
            "misfire_grace_time": 3600,
        },
        {
            "func": run_checkin_reminder,
            "id": "checkin_reminder",
            "trigger": CronTrigger(
                day=25,
                hour=10,
                minute=0,
                timezone="Asia/Kolkata",
            ),
            "misfire_grace_time": 7200,
        },
        {
            "func": run_milestone_countdown,
            "id": "milestone_countdown",
            "trigger": CronTrigger(
                hour=9,
                minute=0,
                timezone="Asia/Kolkata",
            ),
            "misfire_grace_time": 1800,
        },
        {
            "func": run_streak_protection,
            "id": "streak_protection",
            "trigger": CronTrigger(
                hour=18,
                minute=0,
                timezone="Asia/Kolkata",
            ),
            "misfire_grace_time": 1800,
        },
    ]

    for job in jobs:
        scheduler.add_job(
            func=job["func"],
            trigger=job["trigger"],
            id=job["id"],
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=job["misfire_grace_time"],
        )
        msg = f"[SCHEDULER] Registered: {job['id']}"
        print(msg, flush=True)
        scheduler_logger.info(msg)


def get_scheduler() -> AsyncIOScheduler:
    return scheduler

