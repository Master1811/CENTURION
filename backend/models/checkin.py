"""
Check-in Models
===============
Pydantic models for monthly revenue check-ins.

Author: 100Cr Engine Team
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CheckInData(BaseModel):
    """Monthly check-in submission."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "month": "2025-03",
                "actual_revenue": 520000,
                "note": "Closed 2 enterprise deals",
                "source": "manual"
            }
        }
    )
    
    month: str = Field(
        ...,
        pattern=r'^\d{4}-(0[1-9]|1[0-2])$',
        description="Month in YYYY-MM format"
    )
    actual_revenue: float = Field(
        ...,
        gt=0,
        description="Actual MRR for the month"
    )
    note: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional note about the month"
    )
    source: str = Field(
        default='manual',
        pattern='^(manual|razorpay|stripe|cashfree|csv)$',
        description="Data source"
    )


class CheckInResponse(BaseModel):
    """Response after submitting a check-in."""
    success: bool
    checkin: dict
    message: str
    deviation: Optional[dict] = None


class CheckInRecord(BaseModel):
    """A stored check-in record."""
    user_id: str
    month: str
    actual_revenue: float
    projected_revenue: Optional[float] = None
    deviation_pct: Optional[float] = None
    note: Optional[str] = None
    source: str = 'manual'
    created_at: str


class CheckInHistory(BaseModel):
    """User's check-in history response."""
    checkins: List[CheckInRecord]
    total_count: int
    current_streak: int


class CheckInStats(BaseModel):
    """Statistics about check-in performance."""
    total_checkins: int
    current_streak: int
    longest_streak: int
    average_deviation: Optional[float] = None
    months_above_projection: int = 0
    months_below_projection: int = 0
