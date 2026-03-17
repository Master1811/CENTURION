"""
Authentication Service Module
=============================
Handles Supabase JWT verification and user authorization.

Security Model:
- Supabase handles all authentication (Magic Link)
- Backend verifies JWTs on every protected request
- Subscription status determines feature access

JWT Claims from Supabase:
- sub: User UUID
- email: User's email address  
- role: 'authenticated' for logged-in users
- aud: 'authenticated' (audience claim)
- exp: Token expiration timestamp

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone

import jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.supabase import supabase_service

logger = logging.getLogger("100cr_engine.auth")

# HTTP Bearer token extractor
security = HTTPBearer(auto_error=False)
security_required = HTTPBearer(auto_error=True)


class AuthConfig:
    """
    Authentication configuration loaded from environment.
    
    Required environment variables:
    - SUPABASE_JWT_SECRET: JWT secret for token verification
    - SUPABASE_URL: Supabase project URL (for issuer validation)
    """
    JWT_SECRET: str = os.environ.get('SUPABASE_JWT_SECRET', '')
    SUPABASE_URL: str = os.environ.get('SUPABASE_URL', '')
    
    # If JWT secret not provided, try to decode from anon key
    # Supabase JWTs can be verified with the anon key's secret
    ANON_KEY: str = os.environ.get('SUPABASE_ANON_KEY', '')
    
    @classmethod
    def get_jwt_secret(cls) -> str:
        """
        Get the JWT secret for token verification.
        
        Priority:
        1. SUPABASE_JWT_SECRET if set
        2. Derive from SUPABASE_ANON_KEY (base64 decode)
        3. Return empty string (will fail verification)
        """
        if cls.JWT_SECRET and cls.JWT_SECRET != 'placeholder':
            return cls.JWT_SECRET
        
        # Supabase uses the same secret for all JWTs in a project
        # The anon key itself can be used for verification
        if cls.ANON_KEY:
            return cls.ANON_KEY
            
        return ''


async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token and return the decoded payload.
    
    Verification checks:
    1. Signature is valid (using project's JWT secret)
    2. Token has not expired
    3. Audience claim matches 'authenticated'
    
    Args:
        token: The JWT token string from Authorization header
        
    Returns:
        Decoded JWT payload as a dictionary
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or missing
    """
    jwt_secret = AuthConfig.get_jwt_secret()
    
    if not jwt_secret:
        logger.error("JWT secret not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication not configured"
        )
    
    try:
        # Decode and verify the JWT
        # Note: Supabase uses HS256 algorithm
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
        
        logger.debug(f"JWT verified for user: {payload.get('sub')}")
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    except jwt.InvalidAudienceError:
        logger.warning("JWT audience mismatch")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )


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
    
    Example:
        @router.get("/profile")
        async def get_profile(user: Dict = Depends(require_auth)):
            return {"user_id": user['id']}
    
    Returns:
        User info dict
        
    Raises:
        HTTPException: 401 if not authenticated
    """
    payload = await verify_jwt_token(credentials.credentials)
    
    return {
        'id': payload.get('sub'),
        'email': payload.get('email'),
        'role': payload.get('role'),
        'metadata': payload.get('user_metadata', {})
    }


async def require_paid_subscription(
    credentials: HTTPAuthorizationCredentials = Depends(security_required)
) -> Dict[str, Any]:
    """
    FastAPI dependency that requires an active paid subscription.
    
    Checks:
    1. User is authenticated (valid JWT)
    2. User has an active subscription in the database
    3. Subscription has not expired
    
    Use this for Founder Plan premium features.
    
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
    # First verify authentication
    user = await require_auth(credentials)
    
    # Fetch subscription status from database
    subscription = await supabase_service.get_subscription(user['id'])
    
    if not subscription:
        logger.info(f"No subscription found for user {user['id']}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_required',
                'message': 'This feature requires a Founder Plan subscription.',
                'upgrade_url': '/pricing'
            }
        )
    
    if subscription.get('status') != 'active':
        logger.info(f"Subscription not active for user {user['id']}: {subscription.get('status')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_inactive',
                'message': 'Your subscription is not active. Please renew to continue.',
                'upgrade_url': '/pricing'
            }
        )
    
    # Check expiration
    expires_at = subscription.get('expires_at')
    if expires_at:
        try:
            expiry = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
            if expiry < datetime.now(timezone.utc):
                logger.info(f"Subscription expired for user {user['id']}")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        'error': 'subscription_expired',
                        'message': 'Your subscription has expired. Please renew to continue.',
                        'upgrade_url': '/pricing'
                    }
                )
        except ValueError:
            pass  # Invalid date format, skip expiry check
    
    # Attach subscription info to user
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
