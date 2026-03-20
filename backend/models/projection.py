"""
Projection Models
=================
Pydantic models for revenue projections and milestones.

Used for:
- Request/response validation
- API documentation
- Type-safe operations

Author: 100Cr Engine Team
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ============================================================================
# CONSTANTS
# ============================================================================

CRORE = 10_000_000      # ₹1 Crore = ₹10,000,000
LAKH = 100_000          # ₹1 Lakh = ₹100,000
DEFAULT_TARGET = 100 * CRORE  # ₹100 Crore
DEFAULT_MONTHS = 120    # 10 years


# ============================================================================
# INPUT MODELS
# ============================================================================

class ProjectionInputs(BaseModel):
    """
    Input parameters for revenue projection calculation.
    
    Validates:
    - currentMRR: Positive, up to ₹50 Crore
    - growthRate: Between 0% and 200%
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "currentMRR": 500000,
                "growthRate": 0.08,
                "monthsToProject": 120,
                "targetRevenue": 1000000000
            }
        }
    )
    
    currentMRR: float = Field(
        ...,
        ge=0,
        le=50 * CRORE,
        description="Current Monthly Recurring Revenue in INR"
    )
    growthRate: float = Field(
        ...,
        ge=-1,
        le=2.0,
        description="Monthly growth rate as decimal (0.08 = 8%)"
    )
    monthsToProject: int = Field(
        default=DEFAULT_MONTHS,
        ge=1,
        le=240,
        description="Number of months to project"
    )
    targetRevenue: float = Field(
        default=DEFAULT_TARGET,
        description="Target annual revenue (default: ₹100 Crore)"
    )


class ScenarioInputs(BaseModel):
    """
    Input for scenario analysis (what-if modeling).
    """
    currentMRR: float = Field(..., ge=0)
    baseGrowthRate: float = Field(..., ge=-1, le=2.0)
    optimisticGrowthRate: float = Field(..., ge=-1, le=2.0)
    pessimisticGrowthRate: float = Field(..., ge=-1, le=2.0)
    monthsToProject: int = Field(default=60, ge=1, le=240)


# ============================================================================
# OUTPUT MODELS
# ============================================================================

class Milestone(BaseModel):
    """A revenue milestone with its projected achievement date."""
    value: float = Field(description="Milestone value in INR")
    label: str = Field(description="Human-readable label (e.g., '₹1 Crore')")
    reached: bool = Field(description="Whether milestone is already reached")
    monthsToReach: Optional[int] = Field(description="Months from now to reach")
    date: Optional[str] = Field(description="Projected date (ISO format)")


class Sensitivity(BaseModel):
    """Sensitivity analysis: impact of 1% growth increase."""
    growthIncrease: float = Field(description="Growth rate increase tested")
    monthsGained: Optional[int] = Field(description="Months saved to target")


class TrajectoryPoint(BaseModel):
    """A single point on the revenue trajectory."""
    month: int
    date: str
    mrr: float
    arr: float


class ProjectionResult(BaseModel):
    """Complete projection result with milestones and analysis."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "inputs": {"currentMRR": 500000, "growthRate": 0.08},
                "currentARR": 6000000,
                "milestones": [
                    {"value": 10000000, "label": "₹1 Crore", "reached": False, "monthsToReach": 7, "date": "2025-10-01"}
                ],
                "sensitivity": {"growthIncrease": 0.01, "monthsGained": 5},
                "slug": "abc12345"
            }
        }
    )
    
    inputs: Dict[str, float]
    currentARR: float
    milestones: List[Milestone]
    sensitivity: Sensitivity
    slug: Optional[str] = None
    trajectory: Optional[List[TrajectoryPoint]] = None


class ScenarioResult(BaseModel):
    """Result of scenario (what-if) analysis."""
    base: ProjectionResult
    optimistic: ProjectionResult
    pessimistic: ProjectionResult
    comparison: Dict[str, Any]


# ============================================================================
# SHARED PROJECTION MODELS
# ============================================================================

class SharedProjection(BaseModel):
    """A projection that can be shared via URL."""
    slug: str
    inputs: Dict[str, Any]
    result: Dict[str, Any]
    created_at: str
    user_id: Optional[str] = None
