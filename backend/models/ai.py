"""
AI Models
=========
Pydantic models for AI-powered features.

Author: 100Cr Engine Team
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ============================================================================
# REPORT MODELS
# ============================================================================

class BoardReportRequest(BaseModel):
    """Request to generate a board report."""
    month: Optional[str] = None  # YYYY-MM, defaults to current
    include_projections: bool = True
    include_benchmarks: bool = True


class BoardReportResponse(BaseModel):
    """Generated board report."""
    summary: str
    metrics: str
    analysis: str
    next_steps: str
    full_content: str
    generated_at: str


class StrategyBriefRequest(BaseModel):
    """Request to generate a strategy brief."""
    quarter: Optional[str] = None  # Q1, Q2, Q3, Q4
    year: Optional[int] = None
    focus_areas: Optional[List[str]] = None


class StrategyBriefResponse(BaseModel):
    """Generated strategy brief."""
    content: str
    generated_at: str


class InvestorUpdateRequest(BaseModel):
    """Request to generate an investor update."""
    include_metrics: bool = True
    include_milestones: bool = True
    custom_highlights: Optional[List[str]] = None


class InvestorUpdateResponse(BaseModel):
    """Generated investor update."""
    content: str
    generated_at: str


# ============================================================================
# COACHING MODELS
# ============================================================================

class DailyPulseResponse(BaseModel):
    """Daily pulse insight for dashboard."""
    greeting: str
    content: str
    highlights: Optional[List[str]] = None
    action: Optional[str] = None
    generated_at: str


class WeeklyQuestionResponse(BaseModel):
    """Weekly strategic question for reflection."""
    question: str
    hint: str
    generated_at: str


class DeviationAnalysisRequest(BaseModel):
    """Request to analyze revenue deviation."""
    actual: float
    projected: float
    note: Optional[str] = None


class DeviationAnalysisResponse(BaseModel):
    """AI analysis of revenue deviation."""
    deviation_pct: float
    direction: str  # 'above' or 'below'
    analysis: str
    recommendation: str


# ============================================================================
# CHAT MODELS
# ============================================================================

class CoachChatMessage(BaseModel):
    """A message in the AI coach chat."""
    role: str = Field(pattern='^(user|assistant)$')
    content: str


class CoachChatRequest(BaseModel):
    """Request to chat with AI coach."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_history: Optional[List[CoachChatMessage]] = None


class CoachChatResponse(BaseModel):
    """Response from AI coach chat."""
    response: str
    suggestions: Optional[List[str]] = None


# ============================================================================
# USAGE TRACKING
# ============================================================================

class AIUsageStats(BaseModel):
    """AI feature usage statistics for a user."""
    board_reports_used: int = 0
    board_reports_limit: int = 2
    strategy_briefs_used: int = 0
    strategy_briefs_limit: int = 1
    daily_pulses_used: int = 0
    daily_pulses_limit: int = 30
    period: str = 'month'
    reset_at: str
