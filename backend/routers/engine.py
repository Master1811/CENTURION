"""
Engine Router
=============
Core revenue projection and calculation endpoints.

Public endpoints (optional auth for saving):
- POST /projection - Run a projection
- GET /projection/{slug} - Get shared projection
- POST /scenario - Run scenario analysis

Author: 100Cr Engine Team
"""

import math
import uuid
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

from fastapi import APIRouter, HTTPException, Depends, Request, status

from models.projection import (
    ProjectionInputs,
    ProjectionResult,
    Milestone,
    Sensitivity,
    ScenarioInputs,
    ScenarioResult,
    CRORE,
    LAKH,
    DEFAULT_MONTHS,
)
from services.auth import get_current_user, get_client_identifier
from services.rate_limiter import rate_limiter
from services.supabase import supabase_service

logger = logging.getLogger("100cr_engine.engine")

router = APIRouter(prefix="/engine", tags=["Engine"])


# ============================================================================
# CONSTANTS
# ============================================================================

MILESTONE_VALUES = [CRORE, 10 * CRORE, 50 * CRORE, 100 * CRORE]
MILESTONE_LABELS = {
    CRORE: '₹1 Crore',
    10 * CRORE: '₹10 Crore',
    50 * CRORE: '₹50 Crore',
    100 * CRORE: '₹100 Crore',
}


# ============================================================================
# ENGINE FUNCTIONS
# ============================================================================

def calculate_revenue_at_month(current_mrr: float, growth_rate: float, months: int) -> float:
    """
    Calculate projected monthly revenue using compound growth formula.
    
    Formula: R_t = R_0 × (1 + g)^t
    
    Args:
        current_mrr: Current monthly recurring revenue
        growth_rate: Monthly growth rate as decimal (0.08 = 8%)
        months: Number of months to project
        
    Returns:
        Projected monthly revenue at the specified month
    """
    if current_mrr <= 0 or growth_rate < 0:
        return current_mrr
    return current_mrr * math.pow(1 + growth_rate, months)


def find_milestone_month(
    current_mrr: float,
    growth_rate: float,
    target_annual: float,
    max_months: int = DEFAULT_MONTHS
) -> Optional[int]:
    """
    Find the month when a target annual revenue is reached.
    
    Uses logarithmic calculation:
    t = ln(target_monthly / current_mrr) / ln(1 + growth_rate)
    
    Args:
        current_mrr: Current monthly recurring revenue
        growth_rate: Monthly growth rate as decimal
        target_annual: Target annual revenue to reach
        max_months: Maximum months to search within
        
    Returns:
        Month number when target is reached, or None if not reachable
    """
    if current_mrr <= 0 or growth_rate <= 0:
        return None
    
    target_monthly = target_annual / 12
    
    # Already past the target
    if current_mrr >= target_monthly:
        return 0
    
    try:
        months = math.log(target_monthly / current_mrr) / math.log(1 + growth_rate)
        
        if months > max_months or not math.isfinite(months):
            return None
            
        return math.ceil(months)
    except (ValueError, ZeroDivisionError):
        return None


def predict_trajectory(inputs: ProjectionInputs) -> ProjectionResult:
    """
    Generate a complete revenue trajectory projection.
    
    This is the core engine function that:
    1. Calculates when each milestone will be reached
    2. Performs sensitivity analysis
    3. Returns structured result for visualization
    """
    now = datetime.now(timezone.utc)
    current_arr = inputs.currentMRR * 12
    
    # Calculate all milestone dates
    milestones = []
    for value in MILESTONE_VALUES:
        months_to_reach = find_milestone_month(
            inputs.currentMRR,
            inputs.growthRate,
            value,
            inputs.monthsToProject
        )
        
        if months_to_reach is None:
            milestones.append(Milestone(
                value=value,
                label=MILESTONE_LABELS[value],
                reached=current_arr >= value,
                monthsToReach=None,
                date=None
            ))
        else:
            target_date = datetime(now.year, now.month, 1) + relativedelta(months=months_to_reach)
            milestones.append(Milestone(
                value=value,
                label=MILESTONE_LABELS[value],
                reached=months_to_reach == 0,
                monthsToReach=months_to_reach,
                date=target_date.isoformat()
            ))
    
    # Sensitivity analysis: what if growth was 1% higher?
    higher_growth = inputs.growthRate + 0.01
    months_current = find_milestone_month(
        inputs.currentMRR,
        inputs.growthRate,
        inputs.targetRevenue,
        inputs.monthsToProject
    )
    months_higher = find_milestone_month(
        inputs.currentMRR,
        higher_growth,
        inputs.targetRevenue,
        inputs.monthsToProject
    )
    
    months_gained = None
    if months_current is not None and months_higher is not None:
        months_gained = months_current - months_higher
    
    return ProjectionResult(
        inputs={'currentMRR': inputs.currentMRR, 'growthRate': inputs.growthRate},
        currentARR=current_arr,
        milestones=milestones,
        sensitivity=Sensitivity(growthIncrease=0.01, monthsGained=months_gained)
    )


# ============================================================================
# ROUTES
# ============================================================================

@router.post("/projection", response_model=ProjectionResult)
async def run_projection(
    inputs: ProjectionInputs,
    request: Request,
    user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Run a revenue projection calculation.
    
    Available to both free and paid users with different rate limits:
    - Free users: 10 projections/day by IP
    - Paid users: 1000 projections/day
    
    Returns:
        Complete projection with milestones and sensitivity analysis
    """
    # Determine identifier and check if paid
    identifier = get_client_identifier(request)
    is_paid = user is not None and user.get('subscription', {}).get('status') == 'active' if user else False
    
    # Check rate limit
    limit_status = await rate_limiter.check(identifier, 'projection', is_paid)
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                'error': 'rate_limited',
                'message': "You've used all your free projections for today.",
                'remaining': 0,
                'reset_in': limit_status['reset_in'],
                'upgrade_url': '/pricing'
            }
        )
    
    # Calculate projection
    result = predict_trajectory(inputs)
    
    # Generate shareable slug
    slug = str(uuid.uuid4())[:8]
    result.slug = slug
    
    # Store projection for sharing
    await supabase_service.save_projection({
        'slug': slug,
        'user_id': user['id'] if user else None,
        'inputs': inputs.model_dump(),
        'result': result.model_dump(),
    })
    
    # Increment rate limit counter
    await rate_limiter.increment(identifier, 'projection', is_paid)
    
    logger.info(f"Projection created: {slug} for {'user:' + user['id'] if user else 'anonymous'}")
    
    return result


@router.get("/projection/{slug}")
async def get_shared_projection(slug: str, request: Request):
    """
    Retrieve a shared projection by its unique slug.
    
    This allows users to share their projections via URL.
    Rate limited to prevent abuse.

    Args:
        slug: Unique 8-character projection identifier
        
    Returns:
        Stored projection data
    """
    # Rate limit by IP for anonymous access
    identifier = get_client_identifier(request)
    limit_status = await rate_limiter.check(identifier, 'benchmark', False)  # Use benchmark limits
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                'error': 'rate_limited',
                'message': "Too many requests. Please try again later.",
                'reset_in': limit_status['reset_in']
            }
        )

    projection = await supabase_service.get_projection_by_slug(slug)
    
    if not projection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projection not found"
        )
    
    # Increment rate limit counter
    await rate_limiter.increment(identifier, 'benchmark', False)

    return projection


@router.post("/scenario", response_model=ScenarioResult)
async def run_scenario_analysis(
    inputs: ScenarioInputs,
    request: Request,
    user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Run scenario analysis with optimistic/pessimistic variants.
    
    Generates three projections:
    - Base case: Current growth rate
    - Optimistic: Higher growth scenario
    - Pessimistic: Lower growth scenario
    """
    # Check rate limit
    identifier = get_client_identifier(request)
    is_paid = user is not None and user.get('subscription', {}).get('status') == 'active' if user else False
    
    limit_status = await rate_limiter.check(identifier, 'scenario', is_paid)
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={'error': 'rate_limited', 'message': 'Scenario analysis limit reached'}
        )
    
    # Calculate all three scenarios
    base = predict_trajectory(ProjectionInputs(
        currentMRR=inputs.currentMRR,
        growthRate=inputs.baseGrowthRate,
        monthsToProject=inputs.monthsToProject
    ))
    
    optimistic = predict_trajectory(ProjectionInputs(
        currentMRR=inputs.currentMRR,
        growthRate=inputs.optimisticGrowthRate,
        monthsToProject=inputs.monthsToProject
    ))
    
    pessimistic = predict_trajectory(ProjectionInputs(
        currentMRR=inputs.currentMRR,
        growthRate=inputs.pessimisticGrowthRate,
        monthsToProject=inputs.monthsToProject
    ))
    
    # Build comparison
    comparison = {
        'months_difference_optimistic': None,
        'months_difference_pessimistic': None,
    }
    
    # Compare 100Cr milestone timing
    base_100cr = next((m for m in base.milestones if m.value == 100 * CRORE), None)
    opt_100cr = next((m for m in optimistic.milestones if m.value == 100 * CRORE), None)
    pes_100cr = next((m for m in pessimistic.milestones if m.value == 100 * CRORE), None)
    
    if base_100cr and base_100cr.monthsToReach and opt_100cr and opt_100cr.monthsToReach:
        comparison['months_difference_optimistic'] = base_100cr.monthsToReach - opt_100cr.monthsToReach
    if base_100cr and base_100cr.monthsToReach and pes_100cr and pes_100cr.monthsToReach:
        comparison['months_difference_pessimistic'] = pes_100cr.monthsToReach - base_100cr.monthsToReach
    
    await rate_limiter.increment(identifier, 'scenario', is_paid)
    
    return ScenarioResult(
        base=base,
        optimistic=optimistic,
        pessimistic=pessimistic,
        comparison=comparison
    )
