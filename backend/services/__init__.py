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
    get_client_identifier
)
from services.rate_limiter import rate_limiter, RateLimitConfig
from services.encryption import encryption_service
from services.anthropic import ai_service
from services.context import context_builder, FounderContext

__all__ = [
    # Supabase
    'supabase_service',
    
    # Auth
    'verify_jwt_token',
    'get_current_user',
    'require_auth',
    'require_paid_subscription',
    'get_client_identifier',
    
    # Rate Limiting
    'rate_limiter',
    'RateLimitConfig',
    
    # Encryption
    'encryption_service',
    
    # AI
    'ai_service',
    
    # Context
    'context_builder',
    'FounderContext',
]
