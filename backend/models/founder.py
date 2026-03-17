"""
Founder/User Models
===================
Pydantic models for user profiles and subscriptions.

Author: 100Cr Engine Team
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


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
    
    name: Optional[str] = Field(None, max_length=100)
    company: Optional[str] = Field(None, max_length=100)
    stage: str = Field(
        default='pre-seed',
        pattern='^(pre-seed|seed|series-a|series-b)$'
    )
    current_mrr: Optional[float] = Field(None, gt=0)
    growth_rate: Optional[float] = Field(None, ge=0, le=2.0)
    industry: Optional[str] = None
    team_size: Optional[int] = Field(None, ge=1)


class UserProfileResponse(BaseModel):
    """Response when fetching user profile."""
    id: str
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    stage: str = 'pre-seed'
    current_mrr: Optional[float] = None
    growth_rate: Optional[float] = None
    onboarding_completed: bool = False
    current_streak: int = 0
    created_at: Optional[str] = None


class OnboardingData(BaseModel):
    """Data collected during onboarding flow."""
    name: str = Field(..., min_length=1, max_length=100)
    company: str = Field(..., min_length=1, max_length=100)
    stage: str = Field(
        ...,
        pattern='^(pre-seed|seed|series-a|series-b)$'
    )
    current_mrr: float = Field(..., gt=0)
    growth_rate: float = Field(..., ge=0, le=2.0)
    industry: Optional[str] = None


# ============================================================================
# SUBSCRIPTION MODELS
# ============================================================================

class SubscriptionStatus(BaseModel):
    """Subscription status response."""
    user_id: str
    status: str  # 'active', 'cancelled', 'expired', 'trialing'
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
