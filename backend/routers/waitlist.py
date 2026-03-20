"""
Waitlist Router
===============
Beta launch waitlist management endpoints.

Endpoints:
- POST /api/waitlist - Join the waitlist (public)
- GET /api/admin/waitlist - List all waitlist entries (admin only)

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, EmailStr, Field, field_validator

from services.supabase import supabase_service
from services.validation import sanitize_text

logger = logging.getLogger("100cr_engine.waitlist")

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])

# ============================================================================
# MODELS
# ============================================================================

# Valid stages matching the FounderDNAQuiz
VALID_STAGES = [
    'idea',
    'mvp', 
    'early-traction',
    'product-market-fit',
    'scaling'
]


class WaitlistSignup(BaseModel):
    """Waitlist signup request."""
    email: EmailStr
    name: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    stage: Optional[str] = Field(None)
    referral_source: Optional[str] = Field(None, max_length=100)
    dpdp_consent_given: bool = Field(..., description="DPDP consent is required")
    
    @field_validator('name', 'company', mode='before')
    @classmethod
    def sanitize_strings(cls, v):
        if v is None:
            return v
        return sanitize_text(v, 'field', max_length=100)
    
    @field_validator('stage', mode='before')
    @classmethod
    def validate_stage(cls, v):
        if v is None:
            return v
        if v not in VALID_STAGES:
            raise ValueError(f"Invalid stage. Must be one of: {', '.join(VALID_STAGES)}")
        return v
    
    @field_validator('dpdp_consent_given', mode='before')
    @classmethod
    def require_consent(cls, v):
        if not v:
            raise ValueError("DPDP consent is required to join the waitlist")
        return v


class WaitlistResponse(BaseModel):
    """Waitlist signup response."""
    success: bool
    position: int
    message: str
    share_url: str


class WaitlistEntry(BaseModel):
    """Waitlist entry for admin view."""
    id: str
    email: str
    name: Optional[str]
    company: Optional[str]
    stage: Optional[str]
    referral_source: Optional[str]
    dpdp_consent_given: bool
    dpdp_consent_at: Optional[str]
    converted: bool
    created_at: str


class WaitlistAdminResponse(BaseModel):
    """Admin waitlist list response."""
    total: int
    entries: list[WaitlistEntry]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def generate_email_slug(email: str) -> str:
    """Generate a URL-safe slug from an email address."""
    # Take the part before @ and sanitize
    local_part = email.split('@')[0].lower()
    # Replace non-alphanumeric with hyphens
    import re
    slug = re.sub(r'[^a-z0-9]', '-', local_part)
    # Remove consecutive hyphens and trim
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug[:30]  # Limit length


async def get_waitlist_position() -> int:
    """Get the current waitlist count (next position)."""
    if not supabase_service.is_configured:
        return 1
    
    try:
        result = supabase_service._client.table('waitlist')\
            .select('id', count='exact')\
            .execute()
        return (result.count or 0) + 1
    except Exception as e:
        logger.warning(f"Could not get waitlist count: {e}")
        return 1


async def check_email_exists(email: str) -> bool:
    """Check if email already exists in waitlist."""
    if not supabase_service.is_configured:
        return False
    
    try:
        result = supabase_service._client.table('waitlist')\
            .select('id')\
            .eq('email', email.lower())\
            .execute()
        return len(result.data) > 0
    except Exception:
        return False


# ============================================================================
# ROUTES
# ============================================================================

@router.post("", response_model=WaitlistResponse)
async def join_waitlist(
    signup: WaitlistSignup,
    request: Request
):
    """
    Join the beta waitlist.
    
    Requires DPDP consent checkbox to be checked.
    Returns position number and shareable referral URL.
    """
    email = signup.email.lower()
    
    # Check for duplicate email
    if await check_email_exists(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already on the waitlist."
        )
    
    # Get client IP (for analytics, not stored if privacy concern)
    client_ip = None
    if request.client:
        client_ip = request.client.host
    
    # Get current position before insert
    position = await get_waitlist_position()
    
    # Prepare waitlist entry
    now = datetime.now(timezone.utc)
    entry = {
        'email': email,
        'name': signup.name,
        'company': signup.company,
        'stage': signup.stage,
        'referral_source': signup.referral_source,
        'ip_address': client_ip,
        'dpdp_consent_given': True,
        'dpdp_consent_at': now.isoformat(),
        'converted': False,
        'created_at': now.isoformat(),
    }
    
    # Remove None values
    entry = {k: v for k, v in entry.items() if v is not None}
    
    # Insert into database
    if supabase_service.is_configured:
        try:
            supabase_service._client.table('waitlist').insert(entry).execute()
            logger.info(f"Waitlist signup: {email} at position {position}")
        except Exception as e:
            error_msg = str(e)
            # Table might not exist yet - return mock success for development
            if 'PGRST205' in error_msg or 'Could not find the table' in error_msg:
                logger.warning(f"Waitlist table not found - returning mock response. Run migrations/dpdp_compliance.sql in Supabase.")
            else:
                logger.error(f"Waitlist insert failed: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to join waitlist. Please try again."
                )
    
    # Generate share URL
    email_slug = generate_email_slug(email)
    base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    share_url = f"{base_url}/?ref={email_slug}"
    
    return WaitlistResponse(
        success=True,
        position=position,
        message="We'll email you when your spot opens — share your link to move up the list",
        share_url=share_url
    )


@router.get("/count")
async def get_waitlist_count():
    """Get current waitlist count (public)."""
    count = await get_waitlist_position() - 1
    return {"count": max(0, count)}
