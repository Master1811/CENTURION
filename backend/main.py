"""
100Cr Engine - Production Backend
==================================

A scalable FastAPI backend for the revenue milestone prediction platform.

Architecture:
├── routers/     - API endpoint handlers
├── services/    - Business logic and external integrations
├── models/      - Pydantic models for validation
└── tasks/       - Background tasks (cron jobs)

Features:
- Supabase PostgreSQL for data persistence
- Supabase Magic Link authentication
- Rate limiting (in-memory with Redis-ready architecture)
- AI coaching via Claude (Anthropic API)
- Encrypted API key storage for connectors

Author: 100Cr Engine Team
Version: 3.0.0
"""

import os
import sys
import uuid
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any

from fastapi import FastAPI, APIRouter, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr

from dotenv import load_dotenv

# ============================================================================
# PATH SETUP
# ============================================================================

# Add backend directory to path for imports
ROOT_DIR = Path(__file__).parent
sys.path.insert(0, str(ROOT_DIR))

# Load environment variables
load_dotenv(ROOT_DIR / '.env')

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("100cr_engine")

# ============================================================================
# IMPORTS FROM MODULES
# ============================================================================

from routers import (
    engine_router,
    benchmarks_router,
    ai_router,
    reports_router,
    connectors_router,
    admin_router,
)
from routers.payments import router as payments_router
from services import (
    supabase_service,
    get_current_user,
    require_auth,
    require_paid_subscription,
)
from models import (
    UserProfile,
    MagicLinkRequest,
    MagicLinkResponse,
    ProjectionInputs,
    CRORE,
)

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """Application configuration from environment."""
    ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
    SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', '')

config = Config()

# ============================================================================
# APPLICATION LIFECYCLE
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    
    Startup:
    - Verify Supabase connection
    - Initialize services
    
    Shutdown:
    - Clean up connections
    """
    logger.info("=" * 60)
    logger.info("Starting 100Cr Engine API v3.0.0")
    logger.info("=" * 60)
    
    # Log configuration status
    if supabase_service.is_configured:
        logger.info("✓ Supabase configured")
    else:
        logger.warning("⚠ Supabase not configured - using mock mode")
    
    logger.info(f"✓ Environment: {config.ENVIRONMENT}")
    logger.info("✓ API ready at /api")
    
    yield
    
    logger.info("Shutting down 100Cr Engine API...")
    logger.info("✓ Cleanup complete")

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="100Cr Engine API",
    description="Revenue milestone prediction platform for Indian founders",
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
# Read from environment, fallback to localhost for development
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MAIN API ROUTER
# ============================================================================

api_router = APIRouter(prefix="/api")

# Health check
@api_router.get("/")
async def root():
    """API root endpoint."""
    return {
        "name": "100Cr Engine API",
        "version": "3.0.0",
        "status": "operational"
    }

@api_router.get("/health")
async def health_check():
    """Health check for load balancers."""
    return {
        "status": "ok",
        "version": "3.0.0",
        "environment": config.ENVIRONMENT,
        "supabase": "connected" if supabase_service.is_configured else "mock"
    }

# ============================================================================
# USER ROUTES
# ============================================================================

user_router = APIRouter(prefix="/user", tags=["User"])

@user_router.get("/profile")
async def get_user_profile(user: Dict[str, Any] = Depends(require_auth)):
    """Get current user's profile."""
    profile = await supabase_service.get_profile(user['id'])
    subscription = await supabase_service.get_subscription(user['id'])
    
    return {
        'user': {
            'id': user['id'],
            'email': user['email'],
            **(profile or {})
        },
        'subscription': subscription
    }

@user_router.put("/profile")
async def update_user_profile(
    profile: UserProfile,
    user: Dict[str, Any] = Depends(require_auth)
):
    """Update user profile."""
    profile_data = {
        'id': user['id'],
        'email': user['email'],
        **profile.model_dump(exclude_none=True),
    }
    
    result = await supabase_service.upsert_profile(profile_data)
    
    return {'success': True, 'profile': result}

@user_router.post("/onboarding")
async def complete_onboarding(
    profile: UserProfile,
    user: Dict[str, Any] = Depends(require_auth)
):
    """Complete user onboarding."""
    from routers.engine import predict_trajectory
    
    # Persist onboarding using field names expected by the onboarding UI/tests.
    # Also fall back to older field names if they are present.
    profile_data = {
        'id': user['id'],
        'email': user['email'],
        'company_name': profile.company_name or profile.company,
        'website': profile.website,
        'stage': profile.stage,
        'sector': profile.sector or profile.industry,
        'current_mrr': profile.current_mrr,
        'onboarding_completed': True,
    }
    
    result = await supabase_service.upsert_profile(profile_data)
    
    # Generate initial projection if data provided
    projection = None
    if profile.current_mrr and profile.growth_rate:
        inputs = ProjectionInputs(
            currentMRR=profile.current_mrr,
            growthRate=profile.growth_rate
        )
        projection = predict_trajectory(inputs)
    
    return {
        'success': True,
        'profile': result,
        'initial_projection': projection.model_dump() if projection else None
    }


@user_router.delete("/delete")
async def delete_user_account(
    user: Dict[str, Any] = Depends(require_auth)
):
    """
    Complete cascading hard-delete of user's entire dataset and Auth identity.
    
    CRITICAL: This is irreversible. Deletes:
    - All check-ins
    - All projections
    - All connector keys
    - All AI usage logs
    - Profile data
    - Subscription data
    - Auth identity (via Supabase Admin API)
    
    Returns:
        Confirmation of deletion
    """
    user_id = user['id']
    logger.warning(f"User deletion initiated for: {user_id}")
    
    try:
        # Execute cascading delete via Supabase
        success = await supabase_service.delete_user_complete(user_id)
        
        if success:
            logger.info(f"User {user_id} completely deleted")
            return {
                'success': True,
                'message': 'Your account and all associated data have been permanently deleted.',
                'deleted_user_id': user_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail='Failed to delete user data. Please contact support.'
            )
            
    except Exception as e:
        logger.error(f"User deletion failed for {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='An error occurred during account deletion. Please contact support.'
        )

api_router.include_router(user_router)

# ============================================================================
# QUIZ ROUTES (Lead Generation)
# ============================================================================

quiz_router = APIRouter(prefix="/quiz", tags=["Quiz"])

class QuizSubmission(BaseModel):
    """Founder DNA Quiz submission."""
    answers: Dict[str, Any]
    email: Optional[EmailStr] = None

@quiz_router.post("/submit")
async def submit_quiz(submission: QuizSubmission, request: Request):
    """
    Submit Founder DNA Quiz and get personalized projection.
    Rate limited to prevent spam submissions.
    """
    from routers.engine import predict_trajectory
    from routers.benchmarks import calculate_percentile, generate_insight, INDIA_SAAS_BENCHMARKS
    from services.rate_limiter import rate_limiter
    from services.auth import get_client_identifier

    # Rate limit by IP
    identifier = get_client_identifier(request)
    limit_status = await rate_limiter.check(identifier, 'projection', False)
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                'error': 'rate_limited',
                'message': "Too many quiz submissions. Please try again later.",
                'reset_in': limit_status['reset_in']
            }
        )

    answers = submission.answers
    
    # Map quiz answers to projection parameters
    mrr_mapping = {
        'less-than-1l': 50000,
        '1l-5l': 250000,
        '5l-20l': 1000000,
        '20l-50l': 3500000,
        'more-than-50l': 7500000,
    }
    
    growth_mapping = {
        'declining': -0.02,
        'flat': 0.02,
        'slow': 0.05,
        'moderate': 0.08,
        'fast': 0.12,
        'explosive': 0.20,
    }
    
    stage_mapping = {
        'idea': 'pre-seed',
        'mvp': 'pre-seed',
        'early-traction': 'pre-seed',
        'product-market-fit': 'seed',
        'scaling': 'series-a',
    }
    
    # Extract values
    mrr = mrr_mapping.get(answers.get('revenue_range'), 200000)
    growth = growth_mapping.get(answers.get('growth_speed'), 0.08)
    stage = stage_mapping.get(answers.get('startup_stage'), 'pre-seed')
    
    # Generate projection
    inputs = ProjectionInputs(currentMRR=mrr, growthRate=max(0.01, growth))
    projection = predict_trajectory(inputs)
    
    # Get benchmark comparison
    benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
    percentile, status = calculate_percentile(growth, benchmark)
    insight = generate_insight(growth, percentile, status, stage)
    
    # Store submission
    await supabase_service.save_quiz_submission({
        'answers': answers,
        'email': submission.email,
        'result': projection.model_dump(),
        'percentile': percentile,
        'ip': request.client.host if request.client else None,
    })
    
    # Increment rate limit counter
    await rate_limiter.increment(identifier, 'projection', False)

    return {
        'projection': projection,
        'benchmark': {
            'percentile': percentile,
            'status': status,
        },
        'insight': insight,
    }

api_router.include_router(quiz_router)

# ============================================================================
# INCLUDE ALL ROUTERS
# ============================================================================

api_router.include_router(engine_router)
api_router.include_router(benchmarks_router)
api_router.include_router(ai_router)
api_router.include_router(reports_router)
api_router.include_router(connectors_router)
api_router.include_router(admin_router)

# Add main router to app
app.include_router(api_router)
app.include_router(
    payments_router,
    prefix="/api"
)

# ============================================================================
# MIDDLEWARE
# ============================================================================

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add unique request ID for tracing."""
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            'error': True,
            'status_code': exc.status_code,
            'detail': exc.detail,
            'request_id': getattr(request.state, 'request_id', None)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            'error': True,
            'status_code': 500,
            'detail': 'An unexpected error occurred. Please try again.',
            'request_id': getattr(request.state, 'request_id', None)
        }
    )

# ============================================================================
# RUN DIRECTLY (for development)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
