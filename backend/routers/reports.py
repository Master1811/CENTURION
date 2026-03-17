"""
Reports Router
==============
Dashboard data and reporting endpoints.

All endpoints require authentication.

Endpoints:
- GET /dashboard/overview - Command Centre data
- GET /dashboard/revenue - Revenue Intelligence data
- POST /checkin - Submit monthly check-in
- GET /checkins - Get check-in history

Author: 100Cr Engine Team
"""

import logging
import math
from typing import Dict, Any, List
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, Query, status

from models.checkin import CheckInData, CheckInResponse, CheckInHistory
from models.projection import ProjectionInputs, CRORE
from services.auth import require_auth, require_paid_subscription
from services.supabase import supabase_service
from services.rate_limiter import rate_limiter
from routers.engine import predict_trajectory

logger = logging.getLogger("100cr_engine.reports")

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# ============================================================================
# BENCHMARK DATA (duplicated for self-containment)
# ============================================================================

INDIA_SAAS_BENCHMARKS = {
    'pre-seed': {'median': 0.08, 'p75': 0.14, 'p90': 0.20},
    'seed': {'median': 0.06, 'p75': 0.10, 'p90': 0.15},
    'series-a': {'median': 0.04, 'p75': 0.07, 'p90': 0.10},
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_health_score(
    checkins: List[Dict[str, Any]],
    profile: Dict[str, Any]
) -> tuple:
    """
    Calculate health score and signals.
    
    Returns:
        Tuple of (score: int, signals: Dict[str, str])
    """
    signals = {
        'growth': 'good',
        'retention': 'good',  # Would need cohort data
        'runway': 'good',     # Would need burn rate data
        'engagement': 'good' if len(checkins) >= 2 else 'warning'
    }
    
    # Check growth vs benchmark
    if len(checkins) >= 2:
        current = checkins[0].get('actual_revenue', 0)
        previous = checkins[1].get('actual_revenue', 0)
        if previous > 0:
            growth = (current - previous) / previous
            stage = profile.get('stage', 'pre-seed') if profile else 'pre-seed'
            benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
            
            if growth < benchmark['median'] * 0.5:
                signals['growth'] = 'critical'
            elif growth < benchmark['median']:
                signals['growth'] = 'warning'
    
    # Calculate score (0-100)
    score_map = {'good': 25, 'warning': 15, 'critical': 5}
    score = sum(score_map[s] for s in signals.values())
    
    return score, signals


def get_next_milestone(
    current_mrr: float,
    growth_rate: float
) -> Dict[str, Any]:
    """Get the next milestone and time to reach it."""
    projection = predict_trajectory(ProjectionInputs(
        currentMRR=current_mrr or 200000,
        growthRate=growth_rate or 0.08
    ))
    
    for m in projection.milestones:
        if not m.reached and m.monthsToReach:
            return {
                'label': m.label,
                'value': m.value,
                'date': m.date,
                'months_away': m.monthsToReach
            }
    
    return None


# ============================================================================
# ROUTES
# ============================================================================

@router.get("/overview")
async def get_dashboard_overview(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Get Command Centre dashboard data.
    
    Returns:
    - Current metrics (MRR, ARR, growth rate)
    - Health score and signals
    - Next milestone
    - Recent check-ins
    - Action queue
    """
    user_id = user['id']
    
    # Fetch data
    profile = await supabase_service.get_profile(user_id)
    checkins = await supabase_service.get_checkins(user_id, limit=3)
    
    # Calculate current metrics
    current_mrr = checkins[0]['actual_revenue'] if checkins else (profile.get('current_mrr', 0) if profile else 0)
    
    # Calculate growth rate from recent check-ins
    growth_rate = profile.get('growth_rate', 0.08) if profile else 0.08
    if len(checkins) >= 2:
        current = checkins[0].get('actual_revenue', 0)
        previous = checkins[1].get('actual_revenue', 0)
        if previous > 0:
            growth_rate = (current - previous) / previous
    
    # Calculate health
    health_score, health_signals = calculate_health_score(checkins, profile)
    
    # Get next milestone
    next_milestone = get_next_milestone(current_mrr, growth_rate)
    
    # Build action queue
    action_queue = []
    
    # Check if monthly check-in is due
    if not checkins or _is_checkin_due(checkins[0].get('month', '')):
        action_queue.append({
            'id': 1,
            'label': 'Complete monthly check-in',
            'type': 'checkin',
            'urgent': True
        })
    
    # Check connector status
    connectors = await supabase_service.get_connectors(user_id)
    if not connectors:
        action_queue.append({
            'id': 2,
            'label': 'Connect payment gateway for auto-sync',
            'type': 'connector',
            'urgent': False
        })
    
    return {
        'metrics': {
            'current_mrr': current_mrr,
            'current_arr': current_mrr * 12,
            'growth_rate': growth_rate,
            'streak': profile.get('current_streak', 0) if profile else 0
        },
        'health_score': health_score,
        'health_signals': health_signals,
        'next_milestone': next_milestone,
        'recent_checkins': checkins,
        'action_queue': action_queue,
        'subscription': user.get('subscription')
    }


def _is_checkin_due(last_month: str) -> bool:
    """Check if a new check-in is due."""
    now = datetime.now(timezone.utc)
    current_month = f"{now.year}-{now.month:02d}"
    return last_month != current_month


@router.get("/revenue")
async def get_revenue_intelligence(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Get Revenue Intelligence dashboard data.
    
    Returns:
    - Revenue history (actual vs baseline vs benchmark)
    - Calculated growth rate
    - Stage benchmark comparison
    """
    user_id = user['id']
    
    # Fetch data
    checkins = await supabase_service.get_checkins(user_id, limit=24)
    profile = await supabase_service.get_profile(user_id)
    
    # Get benchmark data
    stage = profile.get('stage', 'pre-seed') if profile else 'pre-seed'
    benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
    
    # Build revenue data with baseline and benchmark
    revenue_data = []
    if checkins:
        base_revenue = checkins[-1]['actual_revenue']  # Oldest check-in
        base_growth = profile.get('growth_rate', 0.08) if profile else 0.08
        
        for i, checkin in enumerate(reversed(checkins)):
            months_elapsed = i
            
            revenue_data.append({
                'month': checkin['month'],
                'actual': checkin['actual_revenue'],
                'baseline': base_revenue * math.pow(1 + base_growth, months_elapsed),
                'benchmark': base_revenue * math.pow(1 + benchmark['median'], months_elapsed)
            })
    
    # Calculate actual growth rate
    calculated_growth = None
    if len(checkins) >= 2:
        recent = checkins[0]['actual_revenue']
        previous = checkins[1]['actual_revenue']
        if previous > 0:
            calculated_growth = (recent - previous) / previous
    
    return {
        'revenue_data': revenue_data,
        'calculated_growth': calculated_growth,
        'benchmark': {
            'stage': stage,
            'median': benchmark['median'],
            'p75': benchmark['p75']
        },
        'total_checkins': len(checkins)
    }


# ============================================================================
# CHECK-IN ROUTES
# ============================================================================

check_router = APIRouter(tags=["Check-ins"])


@check_router.post("/checkin", response_model=CheckInResponse)
async def submit_checkin(
    checkin: CheckInData,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Submit a monthly revenue check-in.
    
    Tracks actual vs projected revenue over time.
    Requires Founder Plan subscription.
    """
    user_id = user['id']
    
    # Validate month format
    try:
        datetime.strptime(checkin.month, '%Y-%m')
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be in YYYY-MM format"
        )
    
    # Get baseline for deviation calculation
    profile = await supabase_service.get_profile(user_id)
    projected_revenue = profile.get('current_mrr', checkin.actual_revenue) if profile else checkin.actual_revenue
    
    deviation_pct = None
    if projected_revenue > 0:
        deviation_pct = ((checkin.actual_revenue - projected_revenue) / projected_revenue) * 100
    
    # Save check-in
    checkin_data = {
        'user_id': user_id,
        'month': checkin.month,
        'actual_revenue': checkin.actual_revenue,
        'projected_revenue': projected_revenue,
        'deviation_pct': deviation_pct,
        'note': checkin.note,
        'source': checkin.source,
    }
    
    saved = await supabase_service.upsert_checkin(checkin_data)
    
    # Update user profile with latest MRR
    await supabase_service.update_profile(user_id, {
        'current_mrr': checkin.actual_revenue,
        'last_checkin_month': checkin.month
    })
    
    # Update streak
    await _update_streak(user_id)
    
    logger.info(f"Check-in submitted for user {user_id}: {checkin.month}")
    
    return CheckInResponse(
        success=True,
        checkin=saved,
        message='Check-in recorded successfully!',
        deviation={'pct': deviation_pct, 'direction': 'above' if deviation_pct and deviation_pct > 0 else 'below'} if deviation_pct else None
    )


async def _update_streak(user_id: str) -> None:
    """Update user's check-in streak."""
    checkins = await supabase_service.get_checkins(user_id, limit=12)
    
    if not checkins:
        return
    
    # Simple streak calculation
    streak = len(checkins)  # Would check consecutive months in production
    
    await supabase_service.update_profile(user_id, {
        'current_streak': streak
    })


@check_router.get("/checkins", response_model=CheckInHistory)
async def get_checkins(
    user: Dict[str, Any] = Depends(require_paid_subscription),
    limit: int = Query(12, ge=1, le=36)
):
    """
    Get user's check-in history.
    
    Returns the most recent check-ins.
    """
    user_id = user['id']
    
    checkins = await supabase_service.get_checkins(user_id, limit)
    profile = await supabase_service.get_profile(user_id)
    
    return CheckInHistory(
        checkins=checkins,
        total_count=len(checkins),
        current_streak=profile.get('current_streak', 0) if profile else 0
    )


# Add check-in routes to main router
router.include_router(check_router)
