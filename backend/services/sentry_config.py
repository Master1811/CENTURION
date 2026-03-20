"""
Sentry Configuration
====================
Production-grade error tracking and performance monitoring.

Features:
- Error tracking with full stack traces
- Performance monitoring
- Release tracking
- Environment-based configuration
- PII filtering and security

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Optional

logger = logging.getLogger("100cr_engine.sentry")

# Environment configuration
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
SENTRY_DSN = os.environ.get('SENTRY_DSN', '')
RELEASE_VERSION = os.environ.get('RELEASE_VERSION', '3.0.0')

# Sample rates (adjust for production)
TRACES_SAMPLE_RATE = float(os.environ.get('SENTRY_TRACES_SAMPLE_RATE', '1.0' if ENVIRONMENT == 'development' else '0.2'))
PROFILES_SAMPLE_RATE = float(os.environ.get('SENTRY_PROFILES_SAMPLE_RATE', '1.0' if ENVIRONMENT == 'development' else '0.1'))

# PII settings
SEND_DEFAULT_PII = os.environ.get('SENTRY_SEND_PII', 'false').lower() == 'true'


def before_send(event, hint):
    """
    Filter sensitive data before sending to Sentry.
    
    - Masks tokens, passwords, API keys
    - Filters out health check errors
    - Adds custom context
    """
    # Skip health check errors
    if 'request' in event and event['request'].get('url', '').endswith('/health'):
        return None
    
    # Mask sensitive headers
    if 'request' in event and 'headers' in event['request']:
        headers = event['request']['headers']
        sensitive_headers = ['authorization', 'cookie', 'x-api-key']
        for header in sensitive_headers:
            if header in headers:
                headers[header] = '[FILTERED]'
    
    # Mask sensitive data in request body
    if 'request' in event and 'data' in event['request']:
        data = event['request'].get('data', '')
        if isinstance(data, str):
            import re
            # Mask JWT tokens
            data = re.sub(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[JWT_REDACTED]', data)
            # Mask API keys
            data = re.sub(r'(api[_-]?key|password|secret|token)["\']?\s*[:=]\s*["\']?[^"\'}\s]+', r'\1=[REDACTED]', data, flags=re.IGNORECASE)
            event['request']['data'] = data
    
    return event


def before_send_transaction(event, hint):
    """
    Filter transactions before sending to Sentry.
    
    - Skip health checks from performance monitoring
    - Add custom tags
    """
    transaction_name = event.get('transaction', '')
    
    # Skip health check transactions
    if '/health' in transaction_name or '/api/health' in transaction_name:
        return None
    
    return event


def init_sentry():
    """
    Initialize Sentry SDK with proper configuration.
    
    Should be called before creating the FastAPI app.
    """
    if not SENTRY_DSN:
        logger.warning("SENTRY_DSN not configured - Sentry disabled")
        return False
    
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.starlette import StarletteIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration
        from sentry_sdk.integrations.asyncio import AsyncioIntegration
        
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            
            # Environment and release tracking
            environment=ENVIRONMENT,
            release=f"centurion-backend@{RELEASE_VERSION}",
            
            # Performance monitoring
            traces_sample_rate=TRACES_SAMPLE_RATE,
            profiles_sample_rate=PROFILES_SAMPLE_RATE,
            
            # Integrations
            integrations=[
                FastApiIntegration(
                    transaction_style="endpoint",
                    failed_request_status_codes={403, *range(500, 599)},
                ),
                StarletteIntegration(
                    transaction_style="endpoint",
                    failed_request_status_codes={403, *range(500, 599)},
                ),
                LoggingIntegration(
                    level=logging.INFO,
                    event_level=logging.ERROR,
                ),
                AsyncioIntegration(),
            ],
            
            # Privacy and security
            send_default_pii=SEND_DEFAULT_PII,
            before_send=before_send,
            before_send_transaction=before_send_transaction,
            
            # Additional options
            attach_stacktrace=True,
            include_local_variables=ENVIRONMENT == 'development',
            max_breadcrumbs=50,
            
            # Ignore common benign errors
            ignore_errors=[
                KeyboardInterrupt,
                SystemExit,
            ],
        )
        
        # Set global tags
        sentry_sdk.set_tag("service", "centurion-backend")
        sentry_sdk.set_tag("version", RELEASE_VERSION)
        
        logger.info(f"Sentry initialized: env={ENVIRONMENT}, traces={TRACES_SAMPLE_RATE}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
        return False


def capture_exception_with_context(exception: Exception, **context):
    """
    Capture an exception with additional context.
    
    Usage:
        capture_exception_with_context(
            e,
            user_id="123",
            action="payment_process",
            amount=4999
        )
    """
    try:
        import sentry_sdk
        
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_extra(key, value)
            sentry_sdk.capture_exception(exception)
            
    except Exception:
        # Don't let Sentry errors break the app
        pass


def set_user_context(user_id: str, email: Optional[str] = None, **extra):
    """
    Set user context for error tracking.
    
    Usage:
        set_user_context("user-123", email="user@example.com", plan="founder")
    """
    try:
        import sentry_sdk
        
        user_data = {"id": user_id}
        if email:
            # Only include email if PII is enabled
            if SEND_DEFAULT_PII:
                user_data["email"] = email
            else:
                # Use hashed email for identification without exposing PII
                import hashlib
                user_data["username"] = hashlib.sha256(email.encode()).hexdigest()[:12]
        
        user_data.update(extra)
        sentry_sdk.set_user(user_data)
        
    except Exception:
        pass


def add_breadcrumb(message: str, category: str = "custom", level: str = "info", **data):
    """
    Add a breadcrumb for debugging.
    
    Usage:
        add_breadcrumb("User clicked checkout", category="ui", level="info")
    """
    try:
        import sentry_sdk
        
        sentry_sdk.add_breadcrumb(
            category=category,
            message=message,
            level=level,
            data=data,
        )
    except Exception:
        pass
