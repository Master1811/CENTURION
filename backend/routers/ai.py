"""
AI Router
=========
AI-powered features using Claude via Emergent LLM Key.

All endpoints require paid subscription.
Some endpoints require STUDIO tier or higher.

CRITICAL: Plan tier is validated BEFORE any expensive operations.

Endpoints:
- POST /ai/board-report - Generate monthly board report (STUDIO+)
- POST /ai/strategy-brief - Generate quarterly strategy brief (STUDIO+)
- GET /ai/daily-pulse - Get daily insights
- GET /ai/weekly-question - Get weekly reflection question
- POST /ai/deviation - Analyze revenue deviation

Author: 100Cr Engine Team
"""

import logging
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Depends, status

from models.ai import (
    BoardReportRequest,
    BoardReportResponse,
    StrategyBriefRequest,
    StrategyBriefResponse,
    DailyPulseResponse,
    WeeklyQuestionResponse,
    DeviationAnalysisRequest,
    DeviationAnalysisResponse,
    AIUsageStats,
)
from services.auth import (
    require_paid_subscription,
    PlanTier,
    get_user_plan_tier,
    validate_feature_access,
)
from services.anthropic import ai_service
from services.context import context_builder
from services.rate_limiter import rate_limiter
from services.supabase import supabase_service
from services.ai_cost_control import ai_cost_controller

logger = logging.getLogger("100cr_engine.ai")

router = APIRouter(prefix="/ai", tags=["AI Coach"])


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

async def check_ai_rate_limit(user_id: str, feature: str) -> None:
    """Check rate limit for AI features."""
    limit_status = await rate_limiter.check(f"user:{user_id}", feature, is_paid=True)
    
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                'error': 'ai_limit_reached',
                'feature': feature,
                'message': f"You've reached your {feature.replace('_', ' ')} limit for this month.",
                'reset_in': limit_status['reset_in'],
            }
        )


async def log_ai_usage(user_id: str, feature: str) -> None:
    """Log AI feature usage for tracking."""
    await supabase_service.log_ai_usage({
        'user_id': user_id,
        'feature': feature,
    })
    await rate_limiter.increment(f"user:{user_id}", feature, is_paid=True)


# ============================================================================
# ROUTES
# ============================================================================

@router.get("/usage", response_model=AIUsageStats)
async def get_ai_usage(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Get AI feature usage statistics for the current billing period.
    
    Returns:
        Usage counts and limits for all AI features
    """
    user_id = user['id']
    
    # Get usage counts
    board_reports = await supabase_service.get_ai_usage_count(user_id, 'board_report', 'month')
    strategy_briefs = await supabase_service.get_ai_usage_count(user_id, 'strategy_brief', 'month')
    daily_pulses = await supabase_service.get_ai_usage_count(user_id, 'daily_pulse', 'month')
    
    from datetime import datetime, timezone
    from calendar import monthrange
    
    now = datetime.now(timezone.utc)
    last_day = monthrange(now.year, now.month)[1]
    reset_at = now.replace(day=last_day, hour=23, minute=59, second=59)
    
    return AIUsageStats(
        board_reports_used=board_reports,
        board_reports_limit=2,
        strategy_briefs_used=strategy_briefs,
        strategy_briefs_limit=1,
        daily_pulses_used=daily_pulses,
        daily_pulses_limit=30,
        period='month',
        reset_at=reset_at.isoformat()
    )


@router.post("/board-report", response_model=BoardReportResponse)
async def generate_board_report(
    request: BoardReportRequest,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Generate an AI-powered monthly board report.
    
    REQUIRES: STUDIO or VC_PORTFOLIO plan tier.
    
    Plan tier is validated BEFORE any expensive operations.
    
    Includes:
    - Executive summary
    - Key metrics with MoM changes
    - Growth analysis
    - Next month priorities
    
    Rate limit: 2 per month
    """
    user_id = user['id']
    
    # CRITICAL: Validate plan tier BEFORE any expensive operations
    plan_tier = await get_user_plan_tier(user_id)
    if plan_tier not in [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'plan_upgrade_required',
                'message': 'Board reports require STUDIO or VC_PORTFOLIO plan.',
                'current_tier': plan_tier.value,
                'required_tiers': ['STUDIO', 'VC_PORTFOLIO'],
                'upgrade_url': '/upgrade'
            }
        )
    
    # Check rate limit
    await check_ai_rate_limit(user_id, 'board_report')
    
    # Get model to use (with cost control)
    model_id, is_overflow = await ai_cost_controller.get_model_for_feature(
        user_id, 'board_report'
    )
    
    # Build context
    context = await context_builder.build(user_id, user.get('email', ''))
    
    # Generate report
    report = await ai_service.generate_board_report(context.to_dict())
    
    # Log usage
    await log_ai_usage(user_id, 'board_report')
    
    logger.info(f"Board report generated for user {user_id} using {model_id}")
    
    return BoardReportResponse(**report)


@router.post("/strategy-brief", response_model=StrategyBriefResponse)
async def generate_strategy_brief(
    request: StrategyBriefRequest,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Generate a quarterly growth strategy brief.
    
    REQUIRES: STUDIO or VC_PORTFOLIO plan tier.
    
    Plan tier is validated BEFORE any expensive operations.
    
    Includes:
    - Situation analysis
    - Growth opportunities
    - Risk factors
    - Quarterly goals
    - Key initiatives
    
    Rate limit: 1 per month
    """
    user_id = user['id']
    
    # CRITICAL: Validate plan tier BEFORE any expensive operations
    plan_tier = await get_user_plan_tier(user_id)
    if plan_tier not in [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'plan_upgrade_required',
                'message': 'Strategy briefs require STUDIO or VC_PORTFOLIO plan.',
                'current_tier': plan_tier.value,
                'required_tiers': ['STUDIO', 'VC_PORTFOLIO'],
                'upgrade_url': '/upgrade'
            }
        )
    
    await check_ai_rate_limit(user_id, 'strategy_brief')
    
    # Get model with cost control
    model_id, is_overflow = await ai_cost_controller.get_model_for_feature(
        user_id, 'strategy_brief'
    )
    
    context = await context_builder.build(user_id, user.get('email', ''))
    brief = await ai_service.generate_strategy_brief(context.to_dict())
    
    await log_ai_usage(user_id, 'strategy_brief')
    
    logger.info(f"Strategy brief generated for user {user_id} using {model_id}")
    
    return StrategyBriefResponse(**brief)


@router.get("/daily-pulse", response_model=DailyPulseResponse)
async def get_daily_pulse(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Get AI-generated daily pulse insights.
    
    Provides:
    - Morning greeting
    - Key observations
    - One actionable suggestion
    
    Rate limit: 30 per month (roughly 1 per day)
    """
    user_id = user['id']
    
    await check_ai_rate_limit(user_id, 'daily_pulse')
    
    context = await context_builder.build(user_id, user.get('email', ''))
    pulse = await ai_service.generate_daily_pulse(context.to_dict())
    
    await log_ai_usage(user_id, 'daily_pulse')
    
    return DailyPulseResponse(**pulse)


@router.get("/weekly-question", response_model=WeeklyQuestionResponse)
async def get_weekly_question(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Get a weekly strategic reflection question.
    
    Returns:
    - A thought-provoking question tailored to the founder's stage
    - A hint to guide their thinking
    """
    user_id = user['id']
    
    context = await context_builder.build(user_id, user.get('email', ''))
    question = await ai_service.generate_weekly_question(context.to_dict())
    
    return WeeklyQuestionResponse(**question)


@router.post("/deviation", response_model=DeviationAnalysisResponse)
async def analyze_deviation(
    request: DeviationAnalysisRequest,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Analyze why actual revenue deviated from projection.
    
    Provides:
    - Deviation percentage
    - Likely causes
    - Actionable recommendation
    """
    deviation_pct = ((request.actual - request.projected) / request.projected) * 100 if request.projected > 0 else 0
    direction = 'above' if deviation_pct > 0 else 'below'
    
    analysis = await ai_service.generate_deviation_analysis({
        'actual': request.actual,
        'projected': request.projected,
        'note': request.note,
        'deviation_pct': deviation_pct
    })
    
    return DeviationAnalysisResponse(
        deviation_pct=abs(deviation_pct),
        direction=direction,
        analysis=analysis,
        recommendation=f"Focus on {'maintaining momentum' if direction == 'above' else 'getting back on track'}."
    )
