"""
Services Package Initialization
===============================
Export all services for easy importing.

Usage:
    from services import supabase_service, rate_limiter, ai_service
"""

from services.supabase import supabase_service
from services.auth import (
    verify_jwt_token,
    get_current_user,
    require_auth,
    require_paid_subscription,
    get_client_identifier,
    PlanTier,
    PLAN_FEATURES,
    PREMIUM_ROUTES,
    get_user_plan_tier,
    has_feature_access,
    require_plan_tier,
    require_studio_or_higher,
    validate_feature_access,
)
from services.rate_limiter import rate_limiter, RateLimitConfig
from services.encryption import encryption_service
from services.anthropic import ai_service
from services.context import context_builder, FounderContext
from services.ai_cost_control import ai_cost_controller, SONNET_MONTHLY_BUDGET_PER_USER_INR

__all__ = [
    # Supabase
    'supabase_service',
    
    # Auth
    'verify_jwt_token',
    'get_current_user',
    'require_auth',
    'require_paid_subscription',
    'get_client_identifier',
    'PlanTier',
    'PLAN_FEATURES',
    'PREMIUM_ROUTES',
    'get_user_plan_tier',
    'has_feature_access',
    'require_plan_tier',
    'require_studio_or_higher',
    'validate_feature_access',
    
    # Rate Limiting
    'rate_limiter',
    'RateLimitConfig',
    
    # Encryption
    'encryption_service',
    
    # AI
    'ai_service',
    'ai_cost_controller',
    'SONNET_MONTHLY_BUDGET_PER_USER_INR',
    
    # Context
    'context_builder',
    'FounderContext',
]
