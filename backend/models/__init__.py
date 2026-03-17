"""
Models Package Initialization
=============================
Export all Pydantic models for API use.

Usage:
    from models import ProjectionInputs, ProjectionResult, CheckInData
"""

from models.projection import (
    ProjectionInputs,
    ProjectionResult,
    Milestone,
    Sensitivity,
    TrajectoryPoint,
    ScenarioInputs,
    ScenarioResult,
    SharedProjection,
    CRORE,
    LAKH,
    DEFAULT_TARGET,
    DEFAULT_MONTHS,
)

from models.founder import (
    UserProfile,
    UserProfileResponse,
    OnboardingData,
    SubscriptionStatus,
    CreateSubscription,
    AuthUser,
    MagicLinkRequest,
    MagicLinkResponse,
)

from models.checkin import (
    CheckInData,
    CheckInResponse,
    CheckInRecord,
    CheckInHistory,
    CheckInStats,
)

from models.ai import (
    BoardReportRequest,
    BoardReportResponse,
    StrategyBriefRequest,
    StrategyBriefResponse,
    InvestorUpdateRequest,
    InvestorUpdateResponse,
    DailyPulseResponse,
    WeeklyQuestionResponse,
    DeviationAnalysisRequest,
    DeviationAnalysisResponse,
    CoachChatRequest,
    CoachChatResponse,
    AIUsageStats,
)

__all__ = [
    # Projection
    'ProjectionInputs',
    'ProjectionResult',
    'Milestone',
    'Sensitivity',
    'TrajectoryPoint',
    'ScenarioInputs',
    'ScenarioResult',
    'SharedProjection',
    'CRORE',
    'LAKH',
    'DEFAULT_TARGET',
    'DEFAULT_MONTHS',
    
    # Founder
    'UserProfile',
    'UserProfileResponse',
    'OnboardingData',
    'SubscriptionStatus',
    'CreateSubscription',
    'AuthUser',
    'MagicLinkRequest',
    'MagicLinkResponse',
    
    # Check-in
    'CheckInData',
    'CheckInResponse',
    'CheckInRecord',
    'CheckInHistory',
    'CheckInStats',
    
    # AI
    'BoardReportRequest',
    'BoardReportResponse',
    'StrategyBriefRequest',
    'StrategyBriefResponse',
    'InvestorUpdateRequest',
    'InvestorUpdateResponse',
    'DailyPulseResponse',
    'WeeklyQuestionResponse',
    'DeviationAnalysisRequest',
    'DeviationAnalysisResponse',
    'CoachChatRequest',
    'CoachChatResponse',
    'AIUsageStats',
]
