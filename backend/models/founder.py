"""
Founder/User Models
===================
Pydantic models for user profiles and subscriptions.

Author: 100Cr Engine Team
"""

from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator

from services.validation import sanitize_basic_text, sanitize_url, validate_phone


# ============================================================================
# PROFILE MODELS
# ============================================================================

class UserProfile(BaseModel):
    """User profile data for onboarding and settings."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Priya Sharma",
                "company": "TechStartup India",
                "stage": "seed",
                "current_mrr": 500000,
                "growth_rate": 0.08
            }
        }
    )
    
    name: Optional[str] = Field(None, max_length=80, pattern=r"^[A-Za-z0-9\s\-&\.,'()]+$")
    company: Optional[str] = Field(None, max_length=100, pattern=r"^[A-Za-z0-9\s\-&\.,'()]+$")
    # Preferred onboarding field names (expected by onboarding tests/UI)
    company_name: Optional[str] = Field(None, max_length=100, pattern=r"^[A-Za-z0-9\s\-&\.,'()]+$")
    website: Optional[str] = Field(None, max_length=255)
    stage: Literal['pre-seed', 'seed', 'series-a', 'series-b'] = 'pre-seed'
    current_mrr: Optional[float] = Field(None, ge=0, le=1e9)
    growth_rate: Optional[float] = Field(None, ge=-1, le=2.0)
    industry: Optional[str] = Field(None, max_length=50, pattern=r"^[A-Za-z0-9\s\-&\.,'()]+$")
    sector: Optional[Literal['B2B SaaS', 'D2C', 'EdTech', 'FinTech', 'HealthTech', 'Other']] = None
    team_size: Optional[int] = Field(None, ge=1)
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^[0-9+\-\s]{7,20}$")
    timezone: Optional[str] = Field(None, max_length=50, pattern=r"^[A-Za-z0-9_+\-/]{1,50}$")

    @field_validator('name', 'company', 'company_name', 'industry', mode='before')
    @classmethod
    def _sanitize_text_fields(cls, value: Optional[str], info):  # noqa: ANN001
        return sanitize_basic_text(value, info.field_name, max_length=100)

    @field_validator('phone', mode='before')
    @classmethod
    def _validate_phone(cls, value: Optional[str]):  # noqa: ANN001
        return validate_phone(value)

    @field_validator('website', mode='before')
    @classmethod
    def _sanitize_website(cls, value: Optional[str]):  # noqa: ANN001
        return sanitize_url(value, 'website')


class UserProfileResponse(BaseModel):
    """Response when fetching user profile."""
    id: str
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    company_name: Optional[str] = None
    website: Optional[str] = None
    stage: str = 'pre-seed'
    current_mrr: Optional[float] = None
    growth_rate: Optional[float] = None
    onboarding_completed: bool = False
    current_streak: int = 0
    created_at: Optional[str] = None
    # Beta access fields
    beta_status: str = 'inactive'
    beta_expires_at: Optional[datetime] = None


class OnboardingData(BaseModel):
    """Data collected during onboarding flow."""
    company_name: str = Field(..., min_length=1, max_length=100, pattern=r"^[A-Za-z0-9\s\-&\.,'()]+$")
    website: Optional[str] = Field(None, max_length=255)
    stage: Literal['pre-seed', 'seed', 'series-a', 'series-b']
    current_mrr: float = Field(..., ge=0, le=1e9)
    sector: Optional[Literal['B2B SaaS', 'D2C', 'EdTech', 'FinTech', 'HealthTech', 'Other']] = None


# ============================================================================
# SUBSCRIPTION MODELS
# ============================================================================

class SubscriptionStatus(BaseModel):
    """Subscription status response."""
    user_id: str
    status: str  # 'active', 'cancelled', 'expired'
    plan: str  # 'founder'
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    payment_provider: Optional[str] = None  # 'razorpay', 'stripe'
    razorpay_subscription_id: Optional[str] = None


class CreateSubscription(BaseModel):
    """Request to create a subscription."""
    plan: str = 'founder'
    payment_provider: str = Field(pattern='^(razorpay|stripe)$')
    payment_id: str


# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class AuthUser(BaseModel):
    """Authenticated user info from JWT."""
    id: str
    email: str
    role: str = 'authenticated'
    metadata: dict = {}


class MagicLinkRequest(BaseModel):
    """Request for magic link authentication."""
    email: EmailStr


class MagicLinkResponse(BaseModel):
    """Response after sending magic link."""
    success: bool
    message: str
