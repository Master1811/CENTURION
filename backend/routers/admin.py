"""
Admin Router
============
Administrative endpoints for platform management.

All endpoints require admin role (not implemented in MVP).

Endpoints:
- GET /admin/stats - Platform statistics
- GET /admin/users - User list (paginated)
- POST /admin/subscription/{user_id} - Grant subscription

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Dict, Any, Literal

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field

from datetime import datetime, timezone

from services.auth import require_auth
from services.supabase import supabase_service
from services.validation import validate_uuid_str
from services.habit_layers import (
    run_monday_digest,
    run_checkin_reminder,
    run_milestone_countdown,
    run_streak_protection,
)
from services.engagement_engine import _mem_dedup

logger = logging.getLogger("100cr_engine.admin")

router = APIRouter(prefix="/admin", tags=["Admin"])

JOB_MAP = {
    "digest": run_monday_digest,
    "checkin_reminder": run_checkin_reminder,
    "milestone_countdown": run_milestone_countdown,
    "streak_protection": run_streak_protection,
}


# ============================================================================
# MODELS
# ============================================================================

class PlatformStats(BaseModel):
    """Platform-wide statistics."""
    total_users: int
    active_subscriptions: int
    total_projections: int
    total_checkins: int


class GrantSubscription(BaseModel):
    """Request to grant a subscription."""
    plan: Literal['founder'] = 'founder'
    duration_days: int = Field(default=365, ge=1, le=3650)


class BetaGrantRequest(BaseModel):
    """Request to grant beta access."""
    days: int = Field(default=60, ge=1, le=365)


# ============================================================================
# ADMIN HELPERS
# ============================================================================

async def require_admin(user: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """
    Dependency that requires admin role.
    
    Uses ADMIN_EMAILS environment variable for authorization.
    """
    # Get admin emails from environment variable (comma-separated)
    admin_emails_env = os.environ.get('ADMIN_EMAILS', '')
    admin_emails = [email.strip().lower() for email in admin_emails_env.split(',') if email.strip()]

    # Also check database for admin role if available
    # TODO: Check admin role from profiles table or JWT metadata

    user_email = user.get('email', '').lower()

    if not admin_emails or user_email not in admin_emails:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return user


# ============================================================================
# ROUTES
# ============================================================================

@router.get("/stats", response_model=PlatformStats)
async def get_platform_stats(admin: Dict[str, Any] = Depends(require_admin)):
    """
    Get platform-wide statistics.
    
    Returns:
        Counts of users, subscriptions, projections, etc.
    """
    try:
        # Fetch actual counts from Supabase
        if supabase_service.is_configured:
            # Count users
            users_result = supabase_service._client.table("profiles").select("id", count="exact").execute()
            total_users = users_result.count or 0
            
            # Count active subscriptions
            subs_result = supabase_service._client.table("subscriptions").select("id", count="exact").eq("status", "active").execute()
            active_subs = subs_result.count or 0
            
            # Count projections
            proj_result = supabase_service._client.table("projection_runs").select("id", count="exact").execute()
            total_projections = proj_result.count or 0
            
            # Count checkins
            checkins_result = supabase_service._client.table("checkins").select("id", count="exact").execute()
            total_checkins = checkins_result.count or 0
            
            return PlatformStats(
                total_users=total_users,
                active_subscriptions=active_subs,
                total_projections=total_projections,
                total_checkins=total_checkins
            )
    except Exception as e:
        logger.warning(f"Failed to fetch platform stats: {e}")
    
    return PlatformStats(
        total_users=0,
        active_subscriptions=0,
        total_projections=0,
        total_checkins=0
    )


@router.post("/subscription/{user_id}")
async def grant_subscription(
    user_id: str,
    request: GrantSubscription,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """
    Grant or extend a subscription for a user.
    
    Used for:
    - Free trials
    - Partner deals
    - Support cases
    """
    from datetime import datetime, timezone, timedelta
    
    user_id = validate_uuid_str(user_id, 'user_id')

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=request.duration_days)
    
    subscription_data = {
        'user_id': user_id,
        'plan': request.plan,
        'status': 'active',
        'starts_at': now.isoformat(),
        'expires_at': expires_at.isoformat(),
        'payment_provider': 'admin_granted',
    }
    
    await supabase_service.create_subscription(subscription_data)
    
    logger.info(f"Admin {admin['email']} granted {request.plan} to {user_id}")
    
    return {
        'success': True,
        'message': f'Subscription granted until {expires_at.date()}',
        'subscription': subscription_data
    }


@router.post("/beta/{user_id}")
async def grant_beta_access(
    user_id: str,
    request: BetaGrantRequest,
    admin: Dict[str, Any] = Depends(require_admin)
):
    """
    Grant beta access to a user.

    Used for:
    - Beta program invitations
    - Partner access
    - Testing

    Sets beta_status to 'active' and beta_expires_at to now + days.
    """
    from datetime import datetime, timezone, timedelta

    user_id = validate_uuid_str(user_id, 'user_id')

    expires_at = datetime.now(timezone.utc) + timedelta(days=request.days)

    await supabase_service.update_profile(
        user_id,
        {
            "beta_status": "active",
            "beta_expires_at": expires_at.isoformat(),
        }
    )

    logger.info(f"Admin {admin['email']} granted {request.days}-day beta to {user_id}")

    return {
        'success': True,
        'user_id': user_id,
        'beta_status': 'active',
        'beta_expires_at': expires_at.isoformat(),
        'days': request.days,
    }


@router.post("/trigger/{job_name}")
async def trigger_job(
    job_name: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """
    Trigger a habit engine job immediately (localhost/admin-only).
    """
    if job_name not in JOB_MAP:
        raise HTTPException(status_code=400, detail="Invalid job name")

    result = await JOB_MAP[job_name]()
    return result


@router.get("/engagement/stats")
async def get_engagement_stats(
    admin: Dict[str, Any] = Depends(require_admin),
):
    from datetime import timedelta

    if not supabase_service.is_configured:
        return {"last_30_days": {}, "total": 0}

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    try:
        result = (
            supabase_service._client.table("engagement_events")
            .select("event_type")
            .gte("sent_at", cutoff.isoformat())
            .execute()
        )
        rows = result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")

    counts: Dict[str, int] = {}
    for r in rows:
        event_type = r.get("event_type")
        if not event_type:
            continue
        counts[event_type] = counts.get(event_type, 0) + 1

    return {"last_30_days": counts, "total": len(rows)}


@router.get("/engagement/user/{user_id}")
async def get_user_engagement(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    from datetime import timedelta

    if not supabase_service.is_configured:
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(days=90)
    try:
        result = (
            supabase_service._client.table("engagement_events")
            .select("*")
            .eq("user_id", user_id)
            .gte("sent_at", cutoff.isoformat())
            .order("sent_at", desc=True)
            .execute()
        )
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


@router.get("/dedup/status")
async def get_dedup_status(
    admin: Dict[str, Any] = Depends(require_admin),
):
    now_ts = datetime.now(timezone.utc).timestamp()
    items = []

    for key, expiry in _mem_dedup.items():
        expires_at = datetime.fromtimestamp(expiry, tz=timezone.utc).isoformat()
        expired = now_ts > expiry
        items.append(
            {
                "key": key,
                "expires_at": expires_at,
                "expired": expired,
            }
        )

    items.sort(key=lambda x: x["expires_at"], reverse=True)
    return items


@router.get("/scheduler/status")
async def get_scheduler_status(
    admin: Dict[str, Any] = Depends(require_admin),
):
    """
    Get current scheduler status and job information.
    """
    from services.scheduler import get_scheduler
    
    scheduler = get_scheduler()
    jobs = []
    
    for job in scheduler.get_jobs():
        next_run = job.next_run_time.isoformat() if job.next_run_time else None
        jobs.append({
            "id": job.id,
            "name": job.name or job.id,
            "next_run": next_run,
            "trigger": str(job.trigger),
            "pending": job.pending,
        })
    
    return {
        "running": scheduler.running,
        "jobs": jobs,
        "timezone": str(scheduler.timezone),
    }


@router.get("/system/health")
async def get_system_health(
    admin: Dict[str, Any] = Depends(require_admin),
):
    """
    Get comprehensive system health information for monitoring.
    """
    import sys
    import platform
    
    health = {
        "api": "ok",
        "supabase": supabase_service.is_configured and "connected" or "not_configured",
        "python_version": sys.version,
        "platform": platform.platform(),
        "scheduler": "unknown",
        "dedup_entries": len(_mem_dedup),
    }
    
    # Check scheduler
    try:
        from services.scheduler import get_scheduler
        scheduler = get_scheduler()
        health["scheduler"] = "running" if scheduler.running else "stopped"
        health["scheduled_jobs"] = len(scheduler.get_jobs())
    except Exception as e:
        health["scheduler"] = f"error: {str(e)}"
    
    return health

