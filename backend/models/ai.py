"""
AI Models
=========
Pydantic models for AI-powered features.

Author: 100Cr Engine Team
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

from services.validation import sanitize_text, sanitize_basic_text


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

    @field_validator('focus_areas', mode='before')
    @classmethod
    def _sanitize_focus_areas(cls, value: Optional[List[str]]):  # noqa: ANN001
        if value is None:
            return None
        return [sanitize_basic_text(item, 'focus_areas', max_length=120) for item in value if item is not None]


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
    actual: float = Field(ge=0, le=1e9)
    projected: float = Field(ge=0, le=1e9)
    note: Optional[str] = None

    @field_validator('note', mode='before')
    @classmethod
    def _sanitize_note(cls, value: Optional[str]):  # noqa: ANN001
        return sanitize_basic_text(value, 'note', max_length=500)


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

    @field_validator('content', mode='before')
    @classmethod
    def _sanitize_content(cls, value: str):  # noqa: ANN001
        return sanitize_text(value, 'content', max_length=2000)


class CoachChatRequest(BaseModel):
    """Request to chat with AI coach."""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_history: Optional[List[CoachChatMessage]] = None

    @field_validator('message', mode='before')
    @classmethod
    def _sanitize_message(cls, value: str):  # noqa: ANN001
        return sanitize_text(value, 'message', max_length=2000)


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
