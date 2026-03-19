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
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel

from services.auth import require_auth
from services.supabase import supabase_service

logger = logging.getLogger("100cr_engine.admin")

router = APIRouter(prefix="/admin", tags=["Admin"])


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
    plan: str = 'founder'
    duration_days: int = 365


class BetaGrantRequest(BaseModel):
    """Request to grant beta access."""
    days: int = 60


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
    # TODO: Implement actual counts from database
    
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

