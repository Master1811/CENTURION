"""
AI Router
=========
AI-powered features using Claude via the Anthropic API.

All endpoints require paid subscription.
Some endpoints require STUDIO tier or higher.

CRITICAL: Plan tier is validated BEFORE any expensive operations.
CRITICAL: Model selection is passed to AI service.
CRITICAL: Usage is recorded after EVERY generation.

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

# ============================================================================
# AI CONFIGURATION
# ============================================================================

import os
from anthropic import Anthropic

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
AI_ENABLED = bool(ANTHROPIC_API_KEY and ANTHROPIC_API_KEY != "sk-ant-xxxxxxxxxxxx")

if AI_ENABLED:
    anthropic_client = Anthropic(api_key=ANTHROPIC_API_KEY)
else:
    anthropic_client = None
    print("[AI] ANTHROPIC_API_KEY not set or placeholder — AI features disabled, returning mock responses")

logger = logging.getLogger("100cr_engine.ai")

router = APIRouter(prefix="/ai", tags=["AI Coach"])


# ============================================================================
# DEPENDENCIES
# ============================================================================

async def require_ai(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    Dependency that checks AI is configured.
    Returns mock response hint if not.
    """
    if not AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "message": "AI features not configured",
                "mock": True,
                "question": "What is the single biggest action you can take today?",
            }
        )
    return user


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


async def log_ai_feature_usage(user_id: str, feature: str) -> None:
    """Log AI feature usage for rate limiting (separate from cost tracking)."""
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
    
    # Get cost stats
    cost_stats = await ai_cost_controller.get_usage_stats(user_id)

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
        reset_at=reset_at.isoformat(),
        # Include cost tracking
        budget_inr=cost_stats.get('budget_inr', 25.0),
        spent_inr=cost_stats.get('spent_inr', 0.0),
        remaining_inr=cost_stats.get('remaining_inr', 25.0),
    )


@router.post("/board-report", response_model=BoardReportResponse)
async def generate_board_report(
    request: BoardReportRequest,
    user: Dict[str, Any] = Depends(require_ai)
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
    
    # Generate report - PASS MODEL TO AI SERVICE
    report, usage = await ai_service.generate_board_report(
        context.to_dict(),
        model=model_id  # <-- CRITICAL FIX: Pass the model
    )

    # CRITICAL FIX: Record usage AFTER generation
    await ai_cost_controller.record_usage(
        user_id=user_id,
        feature='board_report',
        model=usage.get('model', model_id),
        input_tokens=usage.get('input_tokens', 0),
        output_tokens=usage.get('output_tokens', 0),
    )

    # Log feature usage for rate limiting
    await log_ai_feature_usage(user_id, 'board_report')

    logger.info(f"Board report generated for user {user_id} using {usage.get('model', model_id)}")

    return BoardReportResponse(**report)


@router.post("/strategy-brief", response_model=StrategyBriefResponse)
async def generate_strategy_brief(
    request: StrategyBriefRequest,
    user: Dict[str, Any] = Depends(require_ai)
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

    # Generate brief - PASS MODEL TO AI SERVICE
    brief, usage = await ai_service.generate_strategy_brief(
        context.to_dict(),
        model=model_id  # <-- CRITICAL FIX: Pass the model
    )

    # CRITICAL FIX: Record usage AFTER generation
    await ai_cost_controller.record_usage(
        user_id=user_id,
        feature='strategy_brief',
        model=usage.get('model', model_id),
        input_tokens=usage.get('input_tokens', 0),
        output_tokens=usage.get('output_tokens', 0),
    )

    await log_ai_feature_usage(user_id, 'strategy_brief')

    logger.info(f"Strategy brief generated for user {user_id} using {usage.get('model', model_id)}")

    return StrategyBriefResponse(**brief)


@router.get("/daily-pulse", response_model=DailyPulseResponse)
async def get_daily_pulse(user: Dict[str, Any] = Depends(require_ai)):
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
    
    # Daily pulse always uses Haiku for cost efficiency
    model_id, _ = await ai_cost_controller.get_model_for_feature(
        user_id, 'daily_pulse'
    )

    try:
        context = await context_builder.build(user_id, user.get('email', ''))
    except Exception as e:
        # Return graceful fallback when user profile is incomplete
        logging.warning(f"Context build failed for user {user_id}: {str(e)}")
        from datetime import datetime
        return DailyPulseResponse(
            greeting="Hello there! 👋",
            content=(
                "It looks like we're still setting up your profile. "
                "Once you complete onboarding, we'll provide personalized insights. "
                "For now, here's a universal truth: Focus on your most important revenue lever today."
            ),
            highlights=["Profile setup in progress"],
            action="Complete your onboarding profile",
            generated_at=datetime.utcnow().isoformat()
        )

    # Generate pulse - PASS MODEL TO AI SERVICE
    pulse, usage = await ai_service.generate_daily_pulse(
        context.to_dict(),
        model=model_id  # <-- CRITICAL FIX: Pass the model
    )

    # CRITICAL FIX: Record usage AFTER generation
    await ai_cost_controller.record_usage(
        user_id=user_id,
        feature='daily_pulse',
        model=usage.get('model', model_id),
        input_tokens=usage.get('input_tokens', 0),
        output_tokens=usage.get('output_tokens', 0),
    )

    await log_ai_feature_usage(user_id, 'daily_pulse')

    return DailyPulseResponse(**pulse)


@router.get("/weekly-question", response_model=WeeklyQuestionResponse)
async def get_weekly_question(user: Dict[str, Any] = Depends(require_ai)):
    """
    Get a weekly strategic reflection question.
    
    Returns:
    - A thought-provoking question tailored to the founder's stage
    - A hint to guide their thinking
    """
    user_id = user['id']
    
    # Weekly question always uses Haiku
    model_id, _ = await ai_cost_controller.get_model_for_feature(
        user_id, 'weekly_question'
    )

    try:
        context = await context_builder.build(user_id, user.get('email', ''))
    except Exception as e:
        logging.warning(f"Context build failed for {user_id}: {e}")
        from datetime import datetime
        return WeeklyQuestionResponse(
            question=(
                "What is the one constraint that, "
                "if removed, would most accelerate "
                "your revenue growth this quarter?"
            ),
            hint=(
                "Think about people, process, "
                "or product bottlenecks."
            ),
            generated_at=datetime.utcnow().isoformat(),
        )

    # Generate question - PASS MODEL TO AI SERVICE
    question, usage = await ai_service.generate_weekly_question(
        context.to_dict(),
        model=model_id  # <-- CRITICAL FIX: Pass the model
    )

    # CRITICAL FIX: Record usage AFTER generation
    await ai_cost_controller.record_usage(
        user_id=user_id,
        feature='weekly_question',
        model=usage.get('model', model_id),
        input_tokens=usage.get('input_tokens', 0),
        output_tokens=usage.get('output_tokens', 0),
    )

    return WeeklyQuestionResponse(**question)


@router.post("/deviation", response_model=DeviationAnalysisResponse)
async def analyze_deviation(
    request: DeviationAnalysisRequest,
    user: Dict[str, Any] = Depends(require_ai)
):
    """
    Analyze why actual revenue deviated from projection.
    
    Provides:
    - Deviation percentage
    - Likely causes
    - Actionable recommendation
    """
    user_id = user['id']

    deviation_pct = ((request.actual - request.projected) / request.projected) * 100 if request.projected > 0 else 0
    direction = 'above' if deviation_pct > 0 else 'below'
    
    # Deviation analysis uses Haiku
    model_id, _ = await ai_cost_controller.get_model_for_feature(
        user_id, 'deviation'
    )

    # Generate analysis - PASS MODEL TO AI SERVICE
    analysis, usage = await ai_service.generate_deviation_analysis(
        {
            'actual': request.actual,
            'projected': request.projected,
            'note': request.note,
            'deviation_pct': deviation_pct
        },
        model=model_id  # <-- CRITICAL FIX: Pass the model
    )

    # CRITICAL FIX: Record usage AFTER generation
    await ai_cost_controller.record_usage(
        user_id=user_id,
        feature='deviation',
        model=usage.get('model', model_id),
        input_tokens=usage.get('input_tokens', 0),
        output_tokens=usage.get('output_tokens', 0),
    )

    return DeviationAnalysisResponse(
        deviation_pct=abs(deviation_pct),
        direction=direction,
        analysis=analysis,
        recommendation=f"Focus on {'maintaining momentum' if direction == 'above' else 'getting back on track'}."
    )
