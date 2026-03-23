"""
Authentication Service Module
=============================
Handles Supabase JWT verification and user authorization.

Security Model:
- Supabase handles all authentication (Magic Link)
- Backend verifies JWTs on every protected request
- Plan tier determines feature access
- Subscription status determines premium features

Plan Tiers:
- FREE: Basic calculator access
- PRO: Dashboard, check-ins, basic AI
- STUDIO: Board reports, data room
- VC_PORTFOLIO: Multi-company management

Author: 100Cr Engine Team
"""

import os
import logging
import base64
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from enum import Enum
from functools import lru_cache

import jwt
from jwt import PyJWKClient
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.supabase import supabase_service

logger = logging.getLogger("100cr_engine.auth")

# HTTP Bearer token extractor
security = HTTPBearer(auto_error=False)
security_required = HTTPBearer(auto_error=True)

# JWKS client cache (singleton)
_jwks_client: Optional[PyJWKClient] = None


class PlanTier(str, Enum):
    """User plan tiers."""
    FREE = 'FREE'
    PRO = 'PRO'
    STUDIO = 'STUDIO'
    VC_PORTFOLIO = 'VC_PORTFOLIO'


# Features available per plan tier
PLAN_FEATURES = {
    PlanTier.FREE: [
        'projection',
        'benchmark_view',
        'quiz',
    ],
    PlanTier.PRO: [
        'projection',
        'benchmark_view',
        'quiz',
        'checkin',
        'dashboard',
        'revenue_intelligence',
        'forecasting',
        'benchmark_compare',
        'connectors',
        'daily_pulse',
        'weekly_question',
    ],
    PlanTier.STUDIO: [
        # All PRO features plus:
        'board_report',
        'strategy_brief',
        'investor_narrator',
        'data_room',
        'pdf_export',
        'what_if_story',
    ],
    PlanTier.VC_PORTFOLIO: [
        # All STUDIO features plus:
        'multi_company',
        'portfolio_analytics',
        'aggregate_reports',
    ],
}

# Routes that require specific plan tiers
PREMIUM_ROUTES = {
    '/api/dashboard/board-reports': [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
    '/api/dashboard/data-room': [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
    '/api/ai/board-report': [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
    '/api/ai/strategy-brief': [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
    '/api/ai/investor-narrator': [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
}


class AuthConfig:
    """
    Authentication configuration loaded from environment.
    
    Supports two verification modes:
    1. JWKS (recommended): Fetches public keys from Supabase JWKS endpoint
    2. HS256 (legacy): Uses JWT_SECRET for symmetric verification
    """
    JWT_SECRET: str = os.environ.get('SUPABASE_JWT_SECRET', '')
    SUPABASE_URL: str = os.environ.get('SUPABASE_URL', '')
    ANON_KEY: str = os.environ.get('SUPABASE_ANON_KEY', '')
    
    # Placeholder values to ignore
    PLACEHOLDER_VALUES = {'placeholder', 'your-jwt-secret', 'your_jwt_secret', ''}
    
    @classmethod
    def get_project_ref(cls) -> str:
        """Extract project reference from Supabase URL."""
        if cls.SUPABASE_URL:
            # URL format: https://<project-ref>.supabase.co
            try:
                return cls.SUPABASE_URL.split('//')[1].split('.')[0]
            except (IndexError, AttributeError):
                pass
        return ''
    
    @classmethod
    def get_jwks_url(cls) -> str:
        """Get the JWKS endpoint URL for this Supabase project."""
        project_ref = cls.get_project_ref()
        if project_ref:
            return f"https://{project_ref}.supabase.co/auth/v1/.well-known/jwks.json"
        return ''
    
    @classmethod
    def get_jwt_secret(cls) -> str:
        """
        Get the JWT secret for HS256 token verification (legacy mode).
        
        Priority:
        1. SUPABASE_JWT_SECRET if set and not a placeholder
        2. SUPABASE_ANON_KEY (works for some Supabase configurations)
        3. Return empty string (will use JWKS fallback)
        """
        if cls.JWT_SECRET and cls.JWT_SECRET.lower() not in cls.PLACEHOLDER_VALUES:
            return cls.JWT_SECRET
        
        if cls.ANON_KEY:
            return cls.ANON_KEY
            
        return ''
    
    @classmethod
    def use_jwks(cls) -> bool:
        """Determine if JWKS verification should be used."""
        # Use JWKS if we have a project URL and no valid HS256 secret
        has_valid_secret = cls.JWT_SECRET and cls.JWT_SECRET.lower() not in cls.PLACEHOLDER_VALUES
        has_project_url = bool(cls.get_project_ref())
        
        # Prefer JWKS if available, unless a valid secret is explicitly set
        return has_project_url and not has_valid_secret


def get_jwks_client() -> Optional[PyJWKClient]:
    """Get or create the JWKS client singleton with SSL handling."""
    global _jwks_client
    
    if _jwks_client is not None:
        return _jwks_client
    
    jwks_url = AuthConfig.get_jwks_url()
    if not jwks_url:
        return None
    
    try:
        # Check if SSL verification should be skipped (for local dev behind corporate proxy)
        skip_ssl = os.environ.get('SKIP_SSL_VERIFY', 'false').lower() == 'true'
        
        if skip_ssl:
            import ssl
            import urllib.request
            
            # Create SSL context that doesn't verify certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # PyJWKClient uses urllib internally, so we need to install a custom opener
            https_handler = urllib.request.HTTPSHandler(context=ssl_context)
            opener = urllib.request.build_opener(https_handler)
            urllib.request.install_opener(opener)
            
            logger.warning("⚠️ SSL verification disabled for JWKS client - development mode only")
        
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=3600)
        logger.info(f"JWKS client initialized for {jwks_url}")
        return _jwks_client
    except Exception as e:
        logger.warning(f"Failed to initialize JWKS client: {e}")
        return None


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token and return the decoded payload.
    
    Supports multiple verification modes:
    1. JWKS (RS256/ES256) - Recommended for production (asymmetric)
    2. HS256 - Legacy symmetric verification
    
    Verification checks:
    1. Signature is valid
    2. Token has not expired
    3. Audience claim matches 'authenticated'
    
    Args:
        token: The JWT token string from Authorization header
        
    Returns:
        Decoded JWT payload as a dictionary
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or missing
    """
    # First, try to decode without verification to get the algorithm
    try:
        unverified_header = jwt.get_unverified_header(token)
        algorithm = unverified_header.get('alg', 'HS256')
        logger.debug(f"Token algorithm detected: {algorithm}")
    except jwt.exceptions.DecodeError as e:
        logger.warning(f"Invalid token format: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Asymmetric algorithms that require JWKS verification
    ASYMMETRIC_ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512']
    
    # Try JWKS verification for asymmetric algorithms (RS256, ES256, etc.)
    if algorithm in ASYMMETRIC_ALGORITHMS:
        jwks_client = get_jwks_client()
        if jwks_client:
            try:
                signing_key = jwks_client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=[algorithm],  # Use the actual algorithm from the token
                    audience='authenticated',
                    options={'verify_exp': True, 'verify_aud': True}
                )
                logger.debug(f"JWT verified via JWKS ({algorithm}) for user: {payload.get('sub')}")
                return payload
            except jwt.ExpiredSignatureError:
                logger.warning(f"JWT token expired (JWKS/{algorithm})")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            except jwt.InvalidAudienceError:
                logger.warning(f"JWT audience mismatch (JWKS/{algorithm})")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token audience",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            except jwt.InvalidSignatureError as e:
                logger.error(f"JWT signature verification failed (JWKS/{algorithm}): {e}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token signature",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            except Exception as e:
                logger.error(f"JWKS verification failed for {algorithm}: {e}")
                # For asymmetric algorithms, don't fall back to HS256 - it won't work
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Token verification failed: {str(e)}",
                    headers={"WWW-Authenticate": "Bearer"}
                )
        else:
            logger.error(f"JWKS client unavailable for {algorithm} token verification")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service unavailable. Please try again later."
            )
    
    # HS256 verification (legacy or fallback)
    jwt_secret = AuthConfig.get_jwt_secret()
    
    if not jwt_secret:
        logger.error("No JWT secret configured and JWKS unavailable")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured"
        )
    
    try:
        # Decode and verify the JWT with HS256
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            audience='authenticated',
            options={
                'verify_exp': True,
                'verify_aud': True,
            }
        )
        
        logger.debug(f"JWT verified via HS256 for user: {payload.get('sub')}")
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    except jwt.InvalidAudienceError:
        # Log unverified claims for debugging
        _log_token_debug_info(token, "JWT audience mismatch")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    except jwt.InvalidTokenError as e:
        _log_token_debug_info(token, f"Invalid JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )


def _log_token_debug_info(token: str, message: str) -> None:
    """Log debug information about a failed token verification."""
    try:
        unverified_header = jwt.get_unverified_header(token)
        _, payload_b64, _ = token.split(".", 2)
        padded = payload_b64 + "=="
        unverified_payload = json.loads(base64.urlsafe_b64decode(padded))
        
        logger.warning(
            "%s | alg=%s aud=%s iss=%s sub=%s",
            message,
            unverified_header.get("alg"),
            unverified_payload.get("aud"),
            unverified_payload.get("iss"),
            unverified_payload.get("sub"),
        )
    except Exception:
        logger.warning(message)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    FastAPI dependency to get the current authenticated user.
    
    Returns None if no valid token is provided.
    Use this for endpoints with optional authentication.
    
    Example:
        @router.get("/projection")
        async def get_projection(user: Optional[Dict] = Depends(get_current_user)):
            if user:
                # Logged in user
            else:
                # Anonymous user
    
    Returns:
        User info dict with id, email, role, metadata, or None
    """
    if not credentials:
        return None
    
    try:
        payload = await verify_jwt_token(credentials.credentials)
        
        return {
            'id': payload.get('sub'),
            'email': payload.get('email'),
            'role': payload.get('role'),
            'metadata': payload.get('user_metadata', {})
        }
    except HTTPException:
        return None


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security_required)
) -> Dict[str, Any]:
    """
    FastAPI dependency that requires valid authentication.

    Use this for protected endpoints that should reject unauthenticated requests.

    Returns:
        User info dict

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 403 if account is disabled
    """
    payload = await verify_jwt_token(credentials.credentials)

    user = {
        'id': payload.get('sub'),
        'email': payload.get('email'),
        'role': payload.get('role'),
        'metadata': payload.get('user_metadata', {})
    }

    # Check if the account has been disabled by an admin
    if supabase_service.is_configured:
        try:
            profile = supabase_service._client \
                .table('profiles') \
                .select('disabled') \
                .eq('id', user['id']) \
                .single() \
                .execute()
            if profile.data and profile.data.get('disabled'):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account has been disabled. Contact support."
                )
        except HTTPException:
            raise
        except Exception:
            pass  # Do not block auth if the check itself fails

    return user


async def require_paid_subscription(
    credentials: HTTPAuthorizationCredentials = Depends(security_required)
) -> Dict[str, Any]:
    """
    FastAPI dependency that requires an active paid subscription.
    
    Checks:
    1. User is authenticated (valid JWT)
    2. User has an active subscription in the database
    3. Subscription has not expired
    
    Paid plans: founder, studio, vc_portfolio
    Valid statuses: active
    
    Example:
        @router.post("/checkin")
        async def submit_checkin(
            data: CheckinData,
            user: Dict = Depends(require_paid_subscription)
        ):
            # Only accessible to paid users
    
    Returns:
        User info dict with subscription details
        
    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 403 if not subscribed or subscription expired
    """
    from services.logging_service import auth_logger, log_auth_event
    
    # Paid plans list — only active annual plans
    PAID_PLANS = ['founder', 'studio', 'vc_portfolio']
    # Valid subscription statuses
    ACTIVE_STATUSES = ['active']

    # First verify authentication
    user = await require_auth(credentials)
    user_id = user['id']
    
    # Fetch subscription status from database
    subscription = await supabase_service.get_subscription(user_id)
    
    if not subscription:
        log_auth_event(
            "subscription_check_failed",
            user_id=user_id,
            success=False,
            reason="no_subscription"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_required',
                'message': 'This feature requires a paid subscription.',
                'upgrade_url': '/pricing'
            }
        )
    
    plan = subscription.get('plan', '').lower()
    status_value = subscription.get('status', '').lower()
    
    # Check plan is a paid plan
    if plan not in PAID_PLANS:
        log_auth_event(
            "subscription_check_failed",
            user_id=user_id,
            success=False,
            reason="free_plan",
            plan=plan
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_required',
                'message': 'This feature requires a paid subscription.',
                'current_plan': plan,
                'upgrade_url': '/pricing'
            }
        )

    # Check subscription status
    if status_value not in ACTIVE_STATUSES:
        log_auth_event(
            "subscription_check_failed",
            user_id=user_id,
            success=False,
            reason="inactive_status",
            status=status_value
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_inactive',
                'message': 'Your subscription is not active. Please renew to continue.',
                'status': status_value,
                'upgrade_url': '/pricing'
            }
        )
    
    # Check expiration
    expires_at = subscription.get('expires_at')
    if expires_at:
        try:
            if isinstance(expires_at, str):
                expiry = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            else:
                expiry = expires_at
            
            if expiry < datetime.now(timezone.utc):
                log_auth_event(
                    "subscription_check_failed",
                    user_id=user_id,
                    success=False,
                    reason="expired",
                    expires_at=str(expires_at)
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        'error': 'subscription_expired',
                        'message': 'Your subscription has expired. Please renew to continue.',
                        'expired_at': str(expires_at),
                        'upgrade_url': '/pricing'
                    }
                )
        except ValueError:
            logger.warning(f"Invalid expiry date format for user {user_id}: {expires_at}")
    
    # Success - attach subscription info to user
    log_auth_event(
        "subscription_check_passed",
        user_id=user_id,
        success=True,
        plan=plan,
        status=status_value
    )
    
    user['subscription'] = subscription
    return user


def get_client_identifier(request) -> str:
    """
    Get a unique identifier for rate limiting.
    
    For authenticated users: user_id
    For anonymous users: IP address
    
    Args:
        request: FastAPI Request object
        
    Returns:
        Identifier string
    """
    # Check for user in request state (if auth was processed)
    if hasattr(request.state, 'user') and request.state.user:
        return f"user:{request.state.user['id']}"
    
    # Fall back to IP address
    # Handle X-Forwarded-For for users behind proxies/load balancers
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        # First IP in the chain is the original client
        return f"ip:{forwarded.split(',')[0].strip()}"
    
    return f"ip:{request.client.host}"



async def get_user_plan_tier(user_id: str) -> PlanTier:
    """
    Get user's plan tier from database.
    
    Args:
        user_id: User UUID
        
    Returns:
        PlanTier enum value
    """
    profile = await supabase_service.get_profile(user_id)
    if not profile:
        return PlanTier.FREE
    
    tier_str = profile.get('plan_tier', 'FREE')
    try:
        return PlanTier(tier_str)
    except ValueError:
        return PlanTier.FREE


def has_feature_access(plan_tier: PlanTier, feature: str) -> bool:
    """
    Check if a plan tier has access to a specific feature.
    
    Args:
        plan_tier: User's plan tier
        feature: Feature to check
        
    Returns:
        True if access granted
    """
    # Get all features for this tier and higher tiers
    tier_order = [PlanTier.FREE, PlanTier.PRO, PlanTier.STUDIO, PlanTier.VC_PORTFOLIO]
    tier_index = tier_order.index(plan_tier)
    
    # Collect features from current tier and all lower tiers
    available_features = set()
    for i in range(tier_index + 1):
        available_features.update(PLAN_FEATURES.get(tier_order[i], []))
    
    return feature in available_features


async def require_plan_tier(
    required_tiers: List[PlanTier],
    credentials: HTTPAuthorizationCredentials = Depends(security_required)
) -> Dict[str, Any]:
    """
    Factory for creating plan tier requirement dependencies.
    
    Usage:
        @router.get("/board-reports")
        async def board_reports(
            user: Dict = Depends(lambda c: require_plan_tier([PlanTier.STUDIO, PlanTier.VC_PORTFOLIO], c))
        ):
            ...
    """
    user = await require_auth(credentials)
    plan_tier = await get_user_plan_tier(user['id'])
    
    if plan_tier not in required_tiers:
        logger.warning(f"User {user['id']} with tier {plan_tier} denied access to {required_tiers}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'plan_upgrade_required',
                'message': f'This feature requires {" or ".join([t.value for t in required_tiers])} plan.',
                'current_tier': plan_tier.value,
                'required_tiers': [t.value for t in required_tiers],
                'upgrade_url': '/upgrade'
            }
        )
    
    user['plan_tier'] = plan_tier
    return user


def require_studio_or_higher():
    """Dependency that requires STUDIO or VC_PORTFOLIO plan."""
    async def dependency(
        credentials: HTTPAuthorizationCredentials = Depends(security_required)
    ) -> Dict[str, Any]:
        return await require_plan_tier(
            [PlanTier.STUDIO, PlanTier.VC_PORTFOLIO],
            credentials
        )
    return dependency


async def validate_feature_access(
    user_id: str,
    feature: str
) -> bool:
    """
    Validate if user can access a specific feature.
    
    CRITICAL: This must be called BEFORE expensive DB queries or AI calls.
    
    Args:
        user_id: User UUID
        feature: Feature being accessed
        
    Returns:
        True if access allowed
        
    Raises:
        HTTPException: 403 if access denied
    """
    plan_tier = await get_user_plan_tier(user_id)
    
    if not has_feature_access(plan_tier, feature):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'feature_not_available',
                'message': f'The {feature} feature is not available on your plan.',
                'current_tier': plan_tier.value,
                'upgrade_url': '/upgrade'
            }
        )
    
    return True
