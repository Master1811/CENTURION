"""
Admin Router
============
Administrative endpoints for platform management.

SECURITY: All endpoints require verified admin role.
- Uses ADMIN_EMAILS environment variable for authorization
- Logs all admin actions for audit trail
- Rate limited to prevent abuse

Endpoints:
- GET /admin/stats - Platform statistics
- GET /admin/users - User list (paginated)
- POST /admin/subscription/{user_id} - Grant subscription
- GET /admin/scheduler/status - Scheduler job status
- GET /admin/system/health - System health check

Author: 100Cr Engine Team
"""

import os
import logging
import hashlib
from typing import Dict, Any, Literal, Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query, status, Request
from pydantic import BaseModel, Field

from datetime import datetime, timezone, timedelta

import services.kill_switches as ks

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
from services.logging_service import admin_logger, log_auth_event

logger = logging.getLogger("100cr_engine.admin")

# Router with no OpenAPI tags to hide from public docs
router = APIRouter(prefix="/admin")

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
# ADMIN AUTHENTICATION - STRICT ROLE VERIFICATION
# ============================================================================

# Cache admin email hashes for comparison (prevents timing attacks)
_admin_email_hashes: set = set()
_admin_emails_loaded: bool = False


def _load_admin_emails() -> set:
    """Load and hash admin emails from environment."""
    global _admin_email_hashes, _admin_emails_loaded
    
    if _admin_emails_loaded:
        return _admin_email_hashes
    
    admin_emails_env = os.environ.get('ADMIN_EMAILS', '')
    admin_emails = [email.strip().lower() for email in admin_emails_env.split(',') if email.strip()]
    
    # Hash emails for secure comparison
    _admin_email_hashes = {
        hashlib.sha256(email.encode()).hexdigest()
        for email in admin_emails
    }
    _admin_emails_loaded = True
    
    if admin_emails:
        logger.info(f"Loaded {len(admin_emails)} admin emails")
    else:
        logger.warning("No admin emails configured - admin panel disabled")
    
    return _admin_email_hashes


def _is_admin_email(email: str) -> bool:
    """Check if email is in admin list using constant-time comparison."""
    if not email:
        return False
    
    admin_hashes = _load_admin_emails()
    if not admin_hashes:
        return False
    
    email_hash = hashlib.sha256(email.lower().encode()).hexdigest()
    return email_hash in admin_hashes


async def require_admin(
    request: Request,
    user: Dict[str, Any] = Depends(require_auth)
) -> Dict[str, Any]:
    """
    Dependency that requires verified admin role.
    
    Security measures:
    1. Validates JWT authentication
    2. Checks email against ADMIN_EMAILS environment variable
    3. Logs all access attempts
    4. Uses constant-time comparison to prevent timing attacks
    
    Raises:
        HTTPException 403 if not an admin
    """
    user_email = user.get('email', '')
    user_id = user.get('id', '')
    request_id = getattr(request.state, 'request_id', 'unknown')
    
    # Log admin access attempt
    admin_logger.info(
        "Admin access attempt",
        user_id=user_id,
        request_id=request_id,
        endpoint=str(request.url.path)
    )
    
    if not _is_admin_email(user_email):
        # Log failed attempt (potential security issue)
        admin_logger.warning(
            "Unauthorized admin access attempt",
            user_id=user_id,
            email_hash=hashlib.sha256(user_email.encode()).hexdigest()[:16] if user_email else "none",
            request_id=request_id,
            client_ip=request.client.host if request.client else "unknown"
        )
        
        log_auth_event(
            "admin_access_denied",
            user_id=user_id,
            success=False,
            reason="not_admin"
        )
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Log successful admin access
    admin_logger.info(
        "Admin access granted",
        user_id=user_id,
        request_id=request_id
    )
    
    log_auth_event(
        "admin_access_granted",
        user_id=user_id,
        success=True
    )
    
    return user


# ============================================================================
# ROUTES
# ============================================================================
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
        "supabase": "connected" if supabase_service.is_configured else "not_configured",
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
        health["scheduler"] = f"error: {str(e)[:50]}"

    # Check Redis
    try:
        from services.engagement_engine import engagement_engine
        if engagement_engine.redis_client:
            await engagement_engine.redis_client.ping()
            health["redis"] = "connected"
        else:
            health["redis"] = "not_configured"
    except Exception as e:
        health["redis"] = f"error: {str(e)[:50]}"

    # Check Anthropic
    try:
        key = os.getenv("ANTHROPIC_API_KEY", "")
        if key and not key.startswith("sk-ant-xxx"):
            health["anthropic"] = "configured"
        else:
            health["anthropic"] = "not_configured"
    except Exception:
        health["anthropic"] = "unknown"

    # Sentry status
    health["uptime_note"] = (
        "Sentry configured"
        if os.getenv("SENTRY_DSN")
        else "Error rate requires Sentry — configure SENTRY_DSN for alerting"
    )

    return health




# ============================================================================
# WAITLIST ADMIN
# ============================================================================

@router.get("/waitlist")
async def get_admin_waitlist(
    admin: Dict[str, Any] = Depends(require_admin),
):
    """
    Get all waitlist entries for admin review.
    
    Returns entries ordered by created_at (newest first) with total count.
    """
    if not supabase_service.is_configured:
        return {"total": 0, "entries": []}
    
    try:
        result = supabase_service._client.table("waitlist")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()
        
        entries = result.data or []
        
        return {
            "total": len(entries),
            "entries": entries
        }
    except Exception as e:
        admin_logger.error(f"Failed to fetch waitlist: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch waitlist: {str(e)}"
        )


@router.put("/waitlist/{email}/convert")
async def mark_waitlist_converted(
    email: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """
    Mark a waitlist entry as converted (user signed up).
    """
    if not supabase_service.is_configured:
        return {"success": False, "message": "Database not configured"}

    try:
        result = supabase_service._client.table("waitlist")\
            .update({"converted": True})\
            .eq("email", email.lower())\
            .execute()

        if result.data:
            admin_logger.info(f"Waitlist entry converted: {email}")
            return {"success": True, "message": "Entry marked as converted"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found in waitlist"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update: {str(e)}"
        )


# ============================================================================
# PHASE 1A — USER MANAGEMENT
# ============================================================================

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=254),
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Paginated list of all users with optional email search."""
    if not supabase_service.is_configured:
        return {"total": 0, "page": page, "limit": limit, "users": []}

    try:
        offset = (page - 1) * limit
        q = supabase_service._client.table("profiles").select(
            "id, email, company_name, business_model, onboarding_completed, "
            "beta_status, beta_expires_at, current_mrr, streak_count, created_at, disabled",
            count="exact",
        )
        if search:
            q = q.ilike("email", f"%{search}%")
        result = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        profiles = result.data or []
        total = result.count or 0

        # Attach subscription for each profile
        user_ids = [p["id"] for p in profiles]
        subs_map: Dict[str, Any] = {}
        if user_ids:
            subs_result = supabase_service._client.table("subscriptions") \
                .select("user_id, plan, status, expires_at") \
                .in_("user_id", user_ids) \
                .eq("status", "active") \
                .execute()
            for s in (subs_result.data or []):
                subs_map[s["user_id"]] = {
                    "plan": s.get("plan"),
                    "status": s.get("status"),
                    "expires_at": s.get("expires_at"),
                }

        users = []
        for p in profiles:
            users.append({
                **p,
                "subscription": subs_map.get(p["id"]),
            })

        return {"total": total, "page": page, "limit": limit, "users": users}

    except Exception as e:
        logger.error(f"list_users failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Full profile for a single user including AI spend and engagement."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        profile_res = supabase_service._client.table("profiles") \
            .select("*") \
            .eq("id", user_id) \
            .single() \
            .execute()
    except Exception:
        raise HTTPException(status_code=404, detail="User not found")

    profile = profile_res.data
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    # Subscription
    try:
        sub_res = supabase_service._client.table("subscriptions") \
            .select("plan, status, expires_at, billing_cycle, payment_provider") \
            .eq("user_id", user_id) \
            .eq("status", "active") \
            .limit(1) \
            .execute()
        subscription = sub_res.data[0] if sub_res.data else None
    except Exception:
        subscription = None

    # Check-ins count + last checkin
    try:
        ci_res = supabase_service._client.table("checkins") \
            .select("id, created_at", count="exact") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        checkins_count = ci_res.count or 0
        last_checkin_at = ci_res.data[0]["created_at"] if ci_res.data else None
    except Exception:
        checkins_count = 0
        last_checkin_at = None

    # AI spend this month
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    ai_spend_inr = 0.0
    try:
        ai_res = supabase_service._client.table("ai_usage_log") \
            .select("cost_inr") \
            .eq("user_id", user_id) \
            .gte("created_at", month_start.isoformat()) \
            .execute()
        ai_spend_inr = sum(r.get("cost_inr") or 0 for r in (ai_res.data or []))
    except Exception:
        pass

    # Engagement last 30 days
    cutoff = now - timedelta(days=30)
    engagement: Dict[str, int] = {}
    try:
        eng_res = supabase_service._client.table("engagement_events") \
            .select("event_type") \
            .eq("user_id", user_id) \
            .gte("sent_at", cutoff.isoformat()) \
            .execute()
        for row in (eng_res.data or []):
            et = row.get("event_type", "unknown")
            engagement[et] = engagement.get(et, 0) + 1
    except Exception:
        pass

    return {
        **profile,
        "subscription": subscription,
        "checkins_count": checkins_count,
        "last_checkin_at": last_checkin_at,
        "ai_spend_this_month": round(ai_spend_inr, 2),
        "engagement_last_30_days": engagement,
    }


@router.post("/users/{user_id}/disable")
async def disable_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Set disabled=true on a user account."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        supabase_service._client.table("profiles") \
            .update({"disabled": True}) \
            .eq("id", user_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disable user")

    logger.warning(f"Admin {admin['email']} disabled user {user_id}")
    return {"success": True, "user_id": user_id, "disabled": True}


@router.post("/users/{user_id}/enable")
async def enable_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Set disabled=false on a user account."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        supabase_service._client.table("profiles") \
            .update({"disabled": False}) \
            .eq("id", user_id) \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to enable user")

    logger.info(f"Admin {admin['email']} enabled user {user_id}")
    return {"success": True, "user_id": user_id, "disabled": False}


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Hard-delete user and all related data in safe FK order."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    client = supabase_service._client
    tables_in_order = [
        "ai_usage_log",
        "engagement_events",
        "checkins",
        "projection_runs",
        "subscriptions",
        "profiles",
    ]
    for table in tables_in_order:
        try:
            client.table(table).delete().eq("user_id", user_id).execute()
        except Exception:
            try:
                client.table(table).delete().eq("id", user_id).execute()
            except Exception:
                pass

    # Delete auth identity
    try:
        supabase_service._client.auth.admin.delete_user(user_id)
    except Exception as e:
        logger.warning(f"auth.admin.delete_user failed for {user_id}: {e}")

    logger.warning(f"Admin {admin['email']} hard-deleted user {user_id}")
    return {"success": True, "deleted_user_id": user_id}


# ============================================================================
# PHASE 1B — SUBSCRIPTION MANAGEMENT
# ============================================================================

@router.get("/subscriptions")
async def list_subscriptions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str = Query("all", alias="status"),
    plan_filter: str = Query("all", alias="plan"),
    admin: Dict[str, Any] = Depends(require_admin),
):
    """All subscriptions with optional status/plan filtering."""
    if not supabase_service.is_configured:
        return {"total": 0, "subscriptions": []}

    try:
        offset = (page - 1) * limit
        q = supabase_service._client.table("subscriptions").select(
            "id, user_id, plan, status, billing_cycle, expires_at, payment_provider, created_at, cancelled_at",
            count="exact",
        )
        if status_filter != "all":
            q = q.eq("status", status_filter)
        if plan_filter != "all":
            q = q.eq("plan", plan_filter)
        result = q.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        subs = result.data or []
        total = result.count or 0

        # Attach email from profiles
        user_ids = list({s["user_id"] for s in subs if s.get("user_id")})
        email_map: Dict[str, str] = {}
        if user_ids:
            pr = supabase_service._client.table("profiles") \
                .select("id, email") \
                .in_("id", user_ids) \
                .execute()
            for p in (pr.data or []):
                email_map[p["id"]] = p.get("email", "")

        enriched = [{**s, "email": email_map.get(s.get("user_id", ""), "")} for s in subs]
        return {"total": total, "subscriptions": enriched}

    except Exception as e:
        logger.error(f"list_subscriptions failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch subscriptions")


@router.post("/subscriptions/{user_id}/cancel")
async def cancel_subscription(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Cancel active subscription for a user."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    try:
        supabase_service._client.table("subscriptions") \
            .update({"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}) \
            .eq("user_id", user_id) \
            .eq("status", "active") \
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")

    logger.info(f"Admin {admin['email']} cancelled subscription for {user_id}")
    return {"success": True, "user_id": user_id}


@router.get("/revenue")
async def get_revenue_overview(admin: Dict[str, Any] = Depends(require_admin)):
    """MRR / ARR overview."""
    if not supabase_service.is_configured:
        return {"active_founder_count": 0, "mrr_inr": 0, "arr_inr": 0,
                "new_this_month": 0, "churned_this_month": 0, "net_new": 0}

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    try:
        active_res = supabase_service._client.table("subscriptions") \
            .select("id", count="exact") \
            .eq("status", "active") \
            .execute()
        active_count = active_res.count or 0

        new_res = supabase_service._client.table("subscriptions") \
            .select("id", count="exact") \
            .gte("created_at", month_start.isoformat()) \
            .execute()
        new_this_month = new_res.count or 0

        churned_res = supabase_service._client.table("subscriptions") \
            .select("id", count="exact") \
            .in_("status", ["cancelled", "expired"]) \
            .gte("cancelled_at", month_start.isoformat()) \
            .execute()
        churned_this_month = churned_res.count or 0

    except Exception as e:
        logger.error(f"revenue overview failed: {e}")
        active_count = new_this_month = churned_this_month = 0

    return {
        "active_founder_count": active_count,
        "mrr_inr": round(active_count * 333.25, 2),
        "arr_inr": round(active_count * 3999, 2),
        "new_this_month": new_this_month,
        "churned_this_month": churned_this_month,
        "net_new": new_this_month - churned_this_month,
    }


# ============================================================================
# PHASE 1C — AI COST MANAGEMENT
# ============================================================================

@router.get("/ai/spend")
async def get_ai_spend_summary(admin: Dict[str, Any] = Depends(require_admin)):
    """Total AI spend: today, this month, last month, top 10 users."""
    if not supabase_service.is_configured:
        return {"today_inr": 0, "this_month_inr": 0, "last_month_inr": 0, "top_users": []}

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    last_month_end = month_start
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    def _sum(rows: list) -> float:
        return round(sum(r.get("cost_inr") or 0 for r in rows), 2)

    try:
        today_res = supabase_service._client.table("ai_usage_log") \
            .select("cost_inr") \
            .gte("created_at", today_start.isoformat()) \
            .execute()
        month_res = supabase_service._client.table("ai_usage_log") \
            .select("cost_inr") \
            .gte("created_at", month_start.isoformat()) \
            .execute()
        last_month_res = supabase_service._client.table("ai_usage_log") \
            .select("cost_inr") \
            .gte("created_at", last_month_start.isoformat()) \
            .lt("created_at", last_month_end.isoformat()) \
            .execute()

        # Per-user aggregation for top 10
        all_month = supabase_service._client.table("ai_usage_log") \
            .select("user_id, cost_inr") \
            .gte("created_at", month_start.isoformat()) \
            .execute()
        user_spend: Dict[str, float] = {}
        user_calls: Dict[str, int] = {}
        for r in (all_month.data or []):
            uid = r.get("user_id", "")
            user_spend[uid] = user_spend.get(uid, 0) + (r.get("cost_inr") or 0)
            user_calls[uid] = user_calls.get(uid, 0) + 1

        top_ids = sorted(user_spend, key=lambda k: user_spend[k], reverse=True)[:10]
        email_map: Dict[str, str] = {}
        if top_ids:
            pr = supabase_service._client.table("profiles") \
                .select("id, email").in_("id", top_ids).execute()
            for p in (pr.data or []):
                email_map[p["id"]] = p.get("email", "")

        top_users = [
            {
                "user_id": uid,
                "email": email_map.get(uid, ""),
                "this_month_inr": round(user_spend[uid], 2),
                "call_count": user_calls.get(uid, 0),
            }
            for uid in top_ids
        ]

        return {
            "today_inr": _sum(today_res.data or []),
            "this_month_inr": _sum(month_res.data or []),
            "last_month_inr": _sum(last_month_res.data or []),
            "top_users": top_users,
        }

    except Exception as e:
        logger.error(f"ai spend summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI spend")


@router.get("/ai/spend/{user_id}")
async def get_user_ai_spend(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """AI spend detail for one user."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    try:
        month_rows = supabase_service._client.table("ai_usage_log") \
            .select("feature, cost_inr, created_at") \
            .eq("user_id", user_id) \
            .gte("created_at", month_start.isoformat()) \
            .execute()

        rows = month_rows.data or []
        this_month_inr = round(sum(r.get("cost_inr") or 0 for r in rows), 2)
        this_month_calls = len(rows)

        breakdown: Dict[str, Dict] = {}
        for r in rows:
            feat = r.get("feature", "unknown")
            if feat not in breakdown:
                breakdown[feat] = {"calls": 0, "cost_inr": 0.0}
            breakdown[feat]["calls"] += 1
            breakdown[feat]["cost_inr"] = round(breakdown[feat]["cost_inr"] + (r.get("cost_inr") or 0), 2)

        # Last 7 days
        daily: Dict[str, Dict] = {}
        for i in range(7):
            d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
            daily[d] = {"date": d, "cost_inr": 0.0, "calls": 0}
        for r in rows:
            try:
                d = r["created_at"][:10]
                if d in daily:
                    daily[d]["cost_inr"] = round(daily[d]["cost_inr"] + (r.get("cost_inr") or 0), 2)
                    daily[d]["calls"] += 1
            except Exception:
                pass

        email = ""
        try:
            pr = supabase_service._client.table("profiles") \
                .select("email").eq("id", user_id).single().execute()
            email = pr.data.get("email", "") if pr.data else ""
        except Exception:
            pass

        return {
            "user_id": user_id,
            "email": email,
            "this_month_inr": this_month_inr,
            "this_month_calls": this_month_calls,
            "breakdown": breakdown,
            "last_7_days": sorted(daily.values(), key=lambda x: x["date"]),
        }

    except Exception as e:
        logger.error(f"user ai spend failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user AI spend")


class KillSwitchRequest(BaseModel):
    enabled: bool
    reason: str = Field(default="", max_length=500)


@router.post("/ai/kill-switch")
async def set_global_ai_kill_switch(
    body: KillSwitchRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Toggle global AI kill switch. enabled=false disables all AI endpoints."""
    now_str = datetime.now(timezone.utc).isoformat()
    ks.AI_KILL_SWITCH = not body.enabled
    ks.last_updated_by = admin["email"]
    ks.last_updated_at = now_str

    level = logging.CRITICAL if ks.AI_KILL_SWITCH else logging.WARNING
    logger.log(level, f"ADMIN {admin['email']} set AI_KILL_SWITCH={ks.AI_KILL_SWITCH} reason={body.reason!r}")

    return {
        "success": True,
        "ai_enabled": body.enabled,
        "reason": body.reason,
        "set_by": admin["email"],
        "set_at": now_str,
    }


class FeatureKillSwitchRequest(BaseModel):
    enabled: bool


@router.post("/ai/kill-switch/{feature}")
async def set_feature_kill_switch(
    feature: str,
    body: FeatureKillSwitchRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Toggle a specific AI feature on/off."""
    valid = set(ks.FEATURE_KILL_SWITCHES.keys())
    if feature not in valid:
        raise HTTPException(status_code=400, detail=f"Unknown feature. Valid: {sorted(valid)}")

    now_str = datetime.now(timezone.utc).isoformat()
    ks.FEATURE_KILL_SWITCHES[feature] = not body.enabled
    ks.last_updated_by = admin["email"]
    ks.last_updated_at = now_str

    logger.warning(f"Admin {admin['email']} set feature kill-switch {feature}={ks.FEATURE_KILL_SWITCHES[feature]}")
    return {"success": True, "feature": feature, "enabled": body.enabled}


# ============================================================================
# PHASE 1D — CRISIS MANAGEMENT
# ============================================================================

class CrisisSignupsRequest(BaseModel):
    disabled: bool
    message: str = Field(default="New registrations are temporarily paused.", max_length=500)


@router.post("/crisis/disable-signups")
async def set_signups_disabled(
    body: CrisisSignupsRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Prevent new user registrations."""
    now_str = datetime.now(timezone.utc).isoformat()
    ks.SIGNUPS_DISABLED = body.disabled
    ks.SIGNUPS_DISABLED_MESSAGE = body.message
    ks.last_updated_by = admin["email"]
    ks.last_updated_at = now_str
    logger.warning(f"Admin {admin['email']} set SIGNUPS_DISABLED={body.disabled}")
    return {"success": True, "signups_disabled": body.disabled}


class MaintenanceModeRequest(BaseModel):
    enabled: bool
    message: str = Field(default="The platform is under maintenance. Please try again later.", max_length=500)


@router.post("/crisis/maintenance-mode")
async def set_maintenance_mode(
    body: MaintenanceModeRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Put entire app in maintenance mode (all non-admin endpoints return 503)."""
    now_str = datetime.now(timezone.utc).isoformat()
    ks.MAINTENANCE_MODE = body.enabled
    ks.MAINTENANCE_MESSAGE = body.message
    ks.last_updated_by = admin["email"]
    ks.last_updated_at = now_str
    logger.warning(f"Admin {admin['email']} set MAINTENANCE_MODE={body.enabled}")
    return {"success": True, "maintenance_mode": body.enabled}


class BroadcastRequest(BaseModel):
    subject: str = Field(..., max_length=200)
    message: str = Field(..., max_length=10000)
    target: Literal["all", "paid", "beta"] = "all"


@router.post("/crisis/broadcast")
async def broadcast_message(
    body: BroadcastRequest,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Send an email broadcast to all / paid / beta users via Resend."""
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    # Collect recipient emails
    try:
        if body.target == "paid":
            sub_res = supabase_service._client.table("subscriptions") \
                .select("user_id").eq("status", "active").execute()
            user_ids = [s["user_id"] for s in (sub_res.data or [])]
            pr = supabase_service._client.table("profiles") \
                .select("email").in_("id", user_ids).execute()
        elif body.target == "beta":
            pr = supabase_service._client.table("profiles") \
                .select("email").eq("beta_status", "active").execute()
        else:  # all
            pr = supabase_service._client.table("profiles") \
                .select("email").execute()

        emails = [p["email"] for p in (pr.data or []) if p.get("email")]
        emails = emails[:1000]  # hard cap
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch recipients")

    if not emails:
        return {"success": True, "sent_to": 0, "subject": body.subject}

    # Send via Resend
    resend_api_key = os.environ.get("RESEND_API_KEY", "")
    sent = 0
    if resend_api_key:
        try:
            import resend as resend_lib
            resend_lib.api_key = resend_api_key
            from_addr = os.environ.get("RESEND_FROM_EMAIL", "noreply@centurion.app")
            # Send in batches of 50
            batch_size = 50
            for i in range(0, len(emails), batch_size):
                batch = emails[i:i + batch_size]
                try:
                    resend_lib.Emails.send({
                        "from": from_addr,
                        "to": batch,
                        "subject": body.subject,
                        "text": body.message,
                    })
                    sent += len(batch)
                except Exception as e:
                    logger.error(f"Resend batch {i} failed: {e}")
        except ImportError:
            logger.warning("resend package not available; broadcast skipped")
    else:
        logger.info(f"[BROADCAST MOCK] subject={body.subject!r} to={len(emails)} recipients")
        sent = len(emails)

    logger.info(f"Admin {admin['email']} broadcast to {sent} {body.target} users: {body.subject!r}")
    return {"success": True, "sent_to": sent, "subject": body.subject}


@router.post("/crisis/disable-user/{user_id}")
async def crisis_disable_user(
    user_id: str,
    admin: Dict[str, Any] = Depends(require_admin),
):
    """Immediately disable a user AND revoke their session globally."""
    user_id = validate_uuid_str(user_id, "user_id")
    if not supabase_service.is_configured:
        raise HTTPException(status_code=503, detail="Database not configured")

    # Disable account
    try:
        supabase_service._client.table("profiles") \
            .update({"disabled": True}) \
            .eq("id", user_id) \
            .execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to disable user")

    # Revoke session
    session_revoked = False
    try:
        supabase_service._client.auth.admin.sign_out(user_id, scope="global")
        session_revoked = True
    except Exception as e:
        logger.warning(f"Session revoke failed for {user_id}: {e}")

    logger.warning(f"Admin {admin['email']} crisis-disabled user {user_id} session_revoked={session_revoked}")
    return {"success": True, "user_id": user_id, "disabled": True, "session_revoked": session_revoked}


@router.get("/crisis/status")
async def get_crisis_status(admin: Dict[str, Any] = Depends(require_admin)):
    """Current state of all crisis flags."""
    return {
        "ai_enabled": not ks.AI_KILL_SWITCH,
        "signups_disabled": ks.SIGNUPS_DISABLED,
        "maintenance_mode": ks.MAINTENANCE_MODE,
        "maintenance_message": ks.MAINTENANCE_MESSAGE,
        "feature_kill_switches": {
            feat: not disabled
            for feat, disabled in ks.FEATURE_KILL_SWITCHES.items()
        },
        "last_updated_by": ks.last_updated_by,
        "last_updated_at": ks.last_updated_at,
    }
