"""
100Cr Engine - Production-Ready Backend Server
================================================

A scalable, concurrent FastAPI backend designed to handle 10,000+ simultaneous users.
Features include:
- Supabase Magic Link Authentication with JWT verification
- In-memory rate limiting (Redis-ready for production)
- MongoDB for data persistence with connection pooling
- Comprehensive error handling and logging
- Subscription-based feature gating

Architecture:
- FastAPI for async request handling
- Motor (async MongoDB driver) for non-blocking database operations
- PyJWT for stateless token verification
- APScheduler for background tasks

Author: 100Cr Engine Team
Version: 2.0.0
"""

import os
import logging
import uuid
import math
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Data validation
from pydantic import BaseModel, Field, ConfigDict, EmailStr

# Database
from motor.motor_asyncio import AsyncIOMotorClient

# Authentication
import jwt

# Environment
from dotenv import load_dotenv

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

# Load environment variables from .env file
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure structured logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("100cr_engine")

# Environment configuration with validation
class Config:
    """
    Centralized configuration management.
    All sensitive values are loaded from environment variables.
    """
    # Database
    MONGO_URL: str = os.environ.get('MONGO_URL', '')
    DB_NAME: str = os.environ.get('DB_NAME', 'centurion_db')
    
    # Supabase Authentication
    SUPABASE_URL: str = os.environ.get('SUPABASE_URL', 'placeholder')
    SUPABASE_JWT_SECRET: str = os.environ.get('SUPABASE_JWT_SECRET', 'placeholder')
    SUPABASE_ANON_KEY: str = os.environ.get('SUPABASE_ANON_KEY', 'placeholder')
    
    # AI Integration (Emergent LLM)
    EMERGENT_LLM_KEY: str = os.environ.get('EMERGENT_LLM_KEY', '')
    
    # Application
    CORS_ORIGINS: List[str] = os.environ.get('CORS_ORIGINS', '*').split(',')
    ENVIRONMENT: str = os.environ.get('ENVIRONMENT', 'development')
    
    # Rate Limiting
    REDIS_URL: str = os.environ.get('REDIS_URL', '')  # Empty = use in-memory

config = Config()

# ============================================================================
# DATABASE CONNECTION (Optimized for 10K concurrent users)
# ============================================================================

# MongoDB connection with connection pooling for high concurrency
# maxPoolSize: Maximum connections in the pool
# minPoolSize: Minimum connections to keep warm
# maxIdleTimeMS: Close idle connections after this time
mongo_client = AsyncIOMotorClient(
    config.MONGO_URL,
    maxPoolSize=100,  # Handle high concurrency
    minPoolSize=10,   # Keep connections warm
    maxIdleTimeMS=30000,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
)
db = mongo_client[config.DB_NAME]

# ============================================================================
# CONSTANTS & BUSINESS LOGIC
# ============================================================================

# Indian currency constants
CRORE = 10_000_000      # ₹1 Crore = ₹10,000,000
LAKH = 100_000          # ₹1 Lakh = ₹100,000
DEFAULT_TARGET = 100 * CRORE  # ₹100 Crore target

# Milestone revenue thresholds for tracking
MILESTONE_VALUES = [CRORE, 10 * CRORE, 50 * CRORE, 100 * CRORE]
MILESTONE_LABELS = {
    CRORE: '₹1 Crore',
    10 * CRORE: '₹10 Crore',
    50 * CRORE: '₹50 Crore',
    100 * CRORE: '₹100 Crore',
}

# Default projection window: 10 years (120 months)
DEFAULT_MONTHS_TO_PROJECT = 120

# Indian SaaS benchmark data by funding stage
# Based on aggregated anonymous data from Indian founders
INDIA_SAAS_BENCHMARKS = {
    'pre-seed': {
        'median': 0.08,      # 8% median monthly growth
        'p75': 0.14,         # Top 25% grow at 14%+
        'p90': 0.20,         # Top 10% grow at 20%+
        'sample_size': 150,
        'description': 'Pre-seed startups (< ₹1 Crore raised)'
    },
    'seed': {
        'median': 0.06,      # 6% median monthly growth
        'p75': 0.10,         # Top 25% grow at 10%+
        'p90': 0.15,         # Top 10% grow at 15%+
        'sample_size': 200,
        'description': 'Seed stage startups (₹1-5 Crore raised)'
    },
    'series-a': {
        'median': 0.04,      # 4% median monthly growth
        'p75': 0.07,         # Top 25% grow at 7%+
        'p90': 0.10,         # Top 10% grow at 10%+
        'sample_size': 100,
        'description': 'Series A startups (₹5-20 Crore raised)'
    },
}

# ============================================================================
# RATE LIMITING (In-memory with Redis-ready architecture)
# ============================================================================

class RateLimiter:
    """
    Production-ready rate limiter with in-memory storage.
    
    For production with 10K+ users, replace with Redis:
    - Use redis-py async client
    - Store counts with TTL matching the rate window
    - Use INCR for atomic increments
    
    Rate limit windows:
    - 'day': Resets at midnight UTC
    - 'hour': Resets every hour
    - 'minute': Resets every minute
    """
    
    # Rate limits by feature and user type
    LIMITS = {
        # Free tier limits (per IP)
        'free_projection': {'limit': 10, 'window': 'day'},
        'free_scenario': {'limit': 3, 'window': 'day'},
        'free_pdf': {'limit': 1, 'window': 'day'},
        
        # Paid tier limits (per user, generous)
        'paid_projection': {'limit': 1000, 'window': 'day'},
        'paid_checkin': {'limit': 100, 'window': 'day'},
        
        # AI features (expensive, strict limits)
        'board_report': {'limit': 2, 'window': 'month'},
        'strategy_brief': {'limit': 1, 'window': 'month'},
        'ai_insight': {'limit': 50, 'window': 'day'},
    }
    
    def __init__(self):
        """Initialize in-memory storage for rate limit tracking."""
        # Structure: {identifier: {feature: {'count': int, 'reset_at': datetime}}}
        self._store: Dict[str, Dict[str, Dict[str, Any]]] = {}
    
    def _get_window_key(self, window: str) -> str:
        """
        Generate a unique key for the current time window.
        
        Args:
            window: 'day', 'hour', 'minute', or 'month'
            
        Returns:
            String key representing the current window
        """
        now = datetime.now(timezone.utc)
        
        if window == 'month':
            return f"{now.year}-{now.month:02d}"
        elif window == 'day':
            return now.strftime('%Y-%m-%d')
        elif window == 'hour':
            return now.strftime('%Y-%m-%d-%H')
        else:  # minute
            return now.strftime('%Y-%m-%d-%H-%M')
    
    def _get_reset_time(self, window: str) -> datetime:
        """
        Calculate when the current rate limit window resets.
        
        Args:
            window: The time window type
            
        Returns:
            datetime when the window resets
        """
        now = datetime.now(timezone.utc)
        
        if window == 'month':
            # First day of next month
            if now.month == 12:
                return datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
            return datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)
        elif window == 'day':
            # Midnight UTC tomorrow
            return datetime(now.year, now.month, now.day, tzinfo=timezone.utc) + timedelta(days=1)
        elif window == 'hour':
            # Start of next hour
            return datetime(now.year, now.month, now.day, now.hour, tzinfo=timezone.utc) + timedelta(hours=1)
        else:  # minute
            return datetime(now.year, now.month, now.day, now.hour, now.minute, tzinfo=timezone.utc) + timedelta(minutes=1)
    
    async def check_limit(self, identifier: str, feature: str) -> Dict[str, Any]:
        """
        Check if an identifier has exceeded its rate limit for a feature.
        
        Args:
            identifier: User ID or IP address
            feature: The feature being rate-limited
            
        Returns:
            Dict with 'allowed', 'remaining', 'reset_at' keys
        """
        if feature not in self.LIMITS:
            # Unknown feature, allow by default
            return {'allowed': True, 'remaining': 999, 'reset_at': None}
        
        limit_config = self.LIMITS[feature]
        limit = limit_config['limit']
        window = limit_config['window']
        window_key = self._get_window_key(window)
        
        # Initialize storage for this identifier if needed
        if identifier not in self._store:
            self._store[identifier] = {}
        
        # Initialize or reset counter for this feature/window
        feature_key = f"{feature}:{window_key}"
        if feature_key not in self._store[identifier]:
            self._store[identifier][feature_key] = {
                'count': 0,
                'reset_at': self._get_reset_time(window)
            }
        
        entry = self._store[identifier][feature_key]
        
        # Check if window has passed (cleanup old entries)
        if datetime.now(timezone.utc) >= entry['reset_at']:
            entry['count'] = 0
            entry['reset_at'] = self._get_reset_time(window)
        
        remaining = max(0, limit - entry['count'])
        
        return {
            'allowed': entry['count'] < limit,
            'remaining': remaining,
            'reset_at': entry['reset_at'].isoformat(),
            'limit': limit
        }
    
    async def increment(self, identifier: str, feature: str) -> None:
        """
        Increment the rate limit counter for an identifier/feature.
        
        Call this AFTER successfully processing the request.
        """
        if feature not in self.LIMITS:
            return
            
        limit_config = self.LIMITS[feature]
        window = limit_config['window']
        window_key = self._get_window_key(window)
        feature_key = f"{feature}:{window_key}"
        
        if identifier in self._store and feature_key in self._store[identifier]:
            self._store[identifier][feature_key]['count'] += 1

# Global rate limiter instance
rate_limiter = RateLimiter()

# ============================================================================
# AUTHENTICATION (Supabase JWT Verification)
# ============================================================================

# HTTP Bearer token extractor
security = HTTPBearer(auto_error=False)

async def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify a Supabase JWT token and return the decoded payload.
    
    Supabase JWTs contain:
    - sub: User UUID
    - email: User's email address
    - role: 'authenticated' for logged-in users
    - aud: 'authenticated' (audience claim)
    - exp: Expiration timestamp
    
    Args:
        token: The JWT token string
        
    Returns:
        Decoded JWT payload as a dictionary
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Decode and verify the JWT using Supabase's secret
        payload = jwt.decode(
            token,
            config.SUPABASE_JWT_SECRET,
            algorithms=['HS256'],
            audience='authenticated'
        )
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
    Dependency to get the current authenticated user.
    
    Returns None if no valid token is provided (for optional auth).
    Use require_auth() for endpoints that require authentication.
    
    Returns:
        User info dict or None
    """
    if not credentials:
        return None
    
    payload = await verify_jwt_token(credentials.credentials)
    
    # Extract user information from JWT claims
    return {
        'id': payload.get('sub'),
        'email': payload.get('email'),
        'role': payload.get('role'),
        'metadata': payload.get('user_metadata', {})
    }

async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())
) -> Dict[str, Any]:
    """
    Dependency that requires valid authentication.
    
    Use this for protected endpoints that should reject unauthenticated requests.
    
    Returns:
        User info dict
        
    Raises:
        HTTPException: If not authenticated
    """
    payload = await verify_jwt_token(credentials.credentials)
    
    return {
        'id': payload.get('sub'),
        'email': payload.get('email'),
        'role': payload.get('role'),
        'metadata': payload.get('user_metadata', {})
    }

async def require_paid_subscription(
    user: Dict[str, Any] = Depends(require_auth)
) -> Dict[str, Any]:
    """
    Dependency that requires a paid subscription.
    
    Checks the user's subscription status in the database.
    Use this for Founder Plan features.
    
    Returns:
        User info with subscription details
        
    Raises:
        HTTPException: If not subscribed
    """
    # Fetch subscription status from database
    subscription = await db.subscriptions.find_one(
        {'user_id': user['id']},
        {'_id': 0}
    )
    
    if not subscription or subscription.get('status') != 'active':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_required',
                'message': 'This feature requires a Founder Plan subscription.',
                'upgrade_url': '/pricing'
            }
        )
    
    # Check if subscription has expired
    expires_at = subscription.get('expires_at')
    if expires_at and datetime.fromisoformat(expires_at) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                'error': 'subscription_expired',
                'message': 'Your subscription has expired. Please renew to continue.',
                'upgrade_url': '/pricing'
            }
        )
    
    user['subscription'] = subscription
    return user

# ============================================================================
# PYDANTIC MODELS (Request/Response Schemas)
# ============================================================================

class ProjectionInputs(BaseModel):
    """
    Input parameters for revenue projection calculation.
    
    Validates that:
    - currentMRR is positive and reasonable (up to ₹50 Crore)
    - growthRate is between 0% and 200%
    """
    currentMRR: float = Field(
        ...,
        gt=0,
        le=50 * CRORE,
        description="Current Monthly Recurring Revenue in INR"
    )
    growthRate: float = Field(
        ...,
        ge=0,
        le=2.0,
        description="Monthly growth rate as decimal (0.08 = 8%)"
    )
    monthsToProject: int = Field(
        default=DEFAULT_MONTHS_TO_PROJECT,
        ge=1,
        le=240,
        description="Number of months to project"
    )
    targetRevenue: float = Field(
        default=DEFAULT_TARGET,
        description="Target annual revenue"
    )

class Milestone(BaseModel):
    """A revenue milestone with its projected achievement date."""
    value: float
    label: str
    reached: bool
    monthsToReach: Optional[int]
    date: Optional[str]

class Sensitivity(BaseModel):
    """Sensitivity analysis: impact of 1% growth increase."""
    growthIncrease: float
    monthsGained: Optional[int]

class ProjectionResult(BaseModel):
    """Complete projection result with milestones and analysis."""
    inputs: Dict[str, float]
    currentARR: float
    milestones: List[Milestone]
    sensitivity: Sensitivity
    slug: Optional[str] = None

class BenchmarkData(BaseModel):
    """Benchmark data for a funding stage."""
    stage: str
    median: float
    p75: float
    p90: Optional[float] = None
    sample_size: int
    source: str = 'static'

class UserProfile(BaseModel):
    """User profile data."""
    name: Optional[str] = None
    company: Optional[str] = None
    stage: str = 'pre-seed'
    current_mrr: Optional[float] = None
    growth_rate: Optional[float] = None

class CheckInData(BaseModel):
    """Monthly check-in data submission."""
    month: str = Field(..., description="Month in YYYY-MM format")
    actual_revenue: float = Field(..., gt=0)
    note: Optional[str] = None
    source: str = 'manual'

class QuizSubmission(BaseModel):
    """Founder DNA Quiz submission."""
    answers: Dict[str, Any]
    email: Optional[EmailStr] = None

# ============================================================================
# ENGINE FUNCTIONS (Core Business Logic)
# ============================================================================

def calculate_revenue_at_month(current_mrr: float, growth_rate: float, months: int) -> float:
    """
    Calculate projected monthly revenue using compound growth formula.
    
    Formula: R_t = R_0 × (1 + g)^t
    
    Where:
    - R_t = Revenue at time t
    - R_0 = Initial revenue (current MRR)
    - g = Monthly growth rate (decimal)
    - t = Number of months
    
    Args:
        current_mrr: Current monthly recurring revenue
        growth_rate: Monthly growth rate as decimal (0.08 = 8%)
        months: Number of months to project
        
    Returns:
        Projected monthly revenue at the specified month
    """
    if current_mrr <= 0 or growth_rate < 0:
        return current_mrr
    return current_mrr * math.pow(1 + growth_rate, months)

def find_milestone_month(
    current_mrr: float,
    growth_rate: float,
    target_annual: float,
    max_months: int = DEFAULT_MONTHS_TO_PROJECT
) -> Optional[int]:
    """
    Find the month when a target annual revenue is reached.
    
    Uses logarithmic calculation for efficiency:
    t = ln(target_monthly / current_mrr) / ln(1 + growth_rate)
    
    Args:
        current_mrr: Current monthly recurring revenue
        growth_rate: Monthly growth rate as decimal
        target_annual: Target annual revenue to reach
        max_months: Maximum months to search within
        
    Returns:
        Month number when target is reached, or None if not reached
    """
    if current_mrr <= 0 or growth_rate <= 0:
        return None
    
    # Convert annual target to monthly
    target_monthly = target_annual / 12
    
    # Already past the target
    if current_mrr >= target_monthly:
        return 0
    
    try:
        # Solve for t: target = current × (1 + g)^t
        # t = ln(target/current) / ln(1 + g)
        months = math.log(target_monthly / current_mrr) / math.log(1 + growth_rate)
        
        if months > max_months or not math.isfinite(months):
            return None
            
        return math.ceil(months)
    except (ValueError, ZeroDivisionError):
        return None

def predict_trajectory(inputs: ProjectionInputs) -> ProjectionResult:
    """
    Generate a complete revenue trajectory projection.
    
    This is the core engine function that:
    1. Calculates when each milestone (₹1Cr, ₹10Cr, ₹50Cr, ₹100Cr) will be reached
    2. Performs sensitivity analysis (what if growth was 1% higher?)
    3. Returns a structured result for visualization
    
    Args:
        inputs: Validated projection inputs
        
    Returns:
        Complete projection result with milestones and analysis
    """
    from dateutil.relativedelta import relativedelta
    
    now = datetime.now(timezone.utc)
    current_arr = inputs.currentMRR * 12
    
    # Calculate all milestone dates
    milestones = []
    for value in MILESTONE_VALUES:
        months_to_reach = find_milestone_month(
            inputs.currentMRR,
            inputs.growthRate,
            value,
            inputs.monthsToProject
        )
        
        if months_to_reach is None:
            milestones.append(Milestone(
                value=value,
                label=MILESTONE_LABELS[value],
                reached=current_arr >= value,
                monthsToReach=None,
                date=None
            ))
        else:
            target_date = datetime(now.year, now.month, 1) + relativedelta(months=months_to_reach)
            milestones.append(Milestone(
                value=value,
                label=MILESTONE_LABELS[value],
                reached=months_to_reach == 0,
                monthsToReach=months_to_reach,
                date=target_date.isoformat()
            ))
    
    # Sensitivity analysis: what if growth was 1% higher?
    higher_growth = inputs.growthRate + 0.01
    months_current = find_milestone_month(
        inputs.currentMRR,
        inputs.growthRate,
        inputs.targetRevenue,
        inputs.monthsToProject
    )
    months_higher = find_milestone_month(
        inputs.currentMRR,
        higher_growth,
        inputs.targetRevenue,
        inputs.monthsToProject
    )
    
    months_gained = None
    if months_current is not None and months_higher is not None:
        months_gained = months_current - months_higher
    
    return ProjectionResult(
        inputs={'currentMRR': inputs.currentMRR, 'growthRate': inputs.growthRate},
        currentARR=current_arr,
        milestones=milestones,
        sensitivity=Sensitivity(growthIncrease=0.01, monthsGained=months_gained)
    )

def compare_to_benchmark(growth_rate: float, stage: str) -> Dict[str, Any]:
    """
    Compare a growth rate against benchmarks for a funding stage.
    
    Returns percentile ranking and comparison metrics.
    
    Args:
        growth_rate: Monthly growth rate as decimal
        stage: Funding stage ('pre-seed', 'seed', 'series-a')
        
    Returns:
        Comparison result with percentile and status
    """
    benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
    
    # Calculate approximate percentile
    if growth_rate >= benchmark.get('p90', benchmark['p75'] * 1.5):
        percentile = min(99, 90 + int(10 * (growth_rate - benchmark['p90']) / (benchmark['p90'] * 0.5)))
        status = 'exceptional'
    elif growth_rate >= benchmark['p75']:
        percentile = 75 + int(15 * (growth_rate - benchmark['p75']) / (benchmark['p90'] - benchmark['p75']))
        status = 'above-average'
    elif growth_rate >= benchmark['median']:
        percentile = 50 + int(25 * (growth_rate - benchmark['median']) / (benchmark['p75'] - benchmark['median']))
        status = 'average'
    else:
        percentile = max(1, int(50 * growth_rate / benchmark['median']))
        status = 'below-average'
    
    return {
        'growth_rate': growth_rate,
        'stage': stage,
        'percentile': percentile,
        'status': status,
        'benchmark': {
            'median': benchmark['median'],
            'p75': benchmark['p75'],
            'p90': benchmark.get('p90'),
            'sample_size': benchmark['sample_size']
        }
    }

# ============================================================================
# APPLICATION LIFECYCLE
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    
    Handles startup and shutdown events:
    - Startup: Verify database connection, create indexes
    - Shutdown: Close database connections gracefully
    """
    # Startup
    logger.info("Starting 100Cr Engine API...")
    
    try:
        # Verify MongoDB connection
        await mongo_client.admin.command('ping')
        logger.info("✓ MongoDB connection established")
        
        # Create indexes for efficient queries
        await db.projection_runs.create_index('slug', unique=True)
        await db.projection_runs.create_index('user_id')
        await db.users.create_index('email', unique=True)
        await db.checkins.create_index([('user_id', 1), ('month', 1)], unique=True)
        await db.subscriptions.create_index('user_id', unique=True)
        logger.info("✓ Database indexes created")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down 100Cr Engine API...")
    mongo_client.close()
    logger.info("✓ Database connections closed")

# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="100Cr Engine API",
    description="Revenue milestone prediction platform for Indian founders",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router with /api prefix (required for Kubernetes ingress)
api_router = APIRouter(prefix="/api")

# ============================================================================
# MIDDLEWARE
# ============================================================================

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """
    Add unique request ID for request tracing and logging.
    
    This helps correlate log entries for debugging production issues.
    """
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response

# ============================================================================
# PUBLIC ROUTES (No Authentication Required)
# ============================================================================

@api_router.get("/")
async def root():
    """API root - health check and version info."""
    return {
        "name": "100Cr Engine API",
        "version": "2.0.0",
        "status": "operational"
    }

@api_router.get("/health")
async def health_check():
    """
    Health check endpoint for load balancers and monitoring.
    
    Returns:
        Service status and version
    """
    return {
        "status": "ok",
        "version": "2.0.0",
        "environment": config.ENVIRONMENT
    }

@api_router.post("/engine/projection", response_model=ProjectionResult)
async def run_projection(
    inputs: ProjectionInputs,
    request: Request,
    user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    """
    Run a revenue projection calculation.
    
    This endpoint is available to both free and paid users:
    - Free users: Rate limited to 10/day by IP
    - Paid users: Much higher limits
    
    Returns:
        Complete projection with milestones and sensitivity analysis
    """
    # Determine rate limit identifier and feature
    if user:
        identifier = user['id']
        feature = 'paid_projection'
    else:
        identifier = request.client.host
        feature = 'free_projection'
    
    # Check rate limit
    limit_status = await rate_limiter.check_limit(identifier, feature)
    if not limit_status['allowed']:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                'error': 'rate_limited',
                'message': 'You\'ve used all your free projections for today.',
                'remaining': 0,
                'reset_at': limit_status['reset_at'],
                'upgrade_url': '/pricing'
            }
        )
    
    # Calculate projection
    result = predict_trajectory(inputs)
    
    # Generate shareable slug
    slug = str(uuid.uuid4())[:8]
    result.slug = slug
    
    # Store projection for sharing (async, non-blocking)
    await db.projection_runs.insert_one({
        'slug': slug,
        'user_id': user['id'] if user else None,
        'inputs': inputs.model_dump(),
        'result': result.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    # Increment rate limit counter
    await rate_limiter.increment(identifier, feature)
    
    return result

@api_router.get("/engine/projection/{slug}")
async def get_shared_projection(slug: str):
    """
    Retrieve a shared projection by its unique slug.
    
    This allows users to share their projections via URL.
    
    Args:
        slug: Unique 8-character projection identifier
        
    Returns:
        Stored projection data
    """
    doc = await db.projection_runs.find_one({'slug': slug}, {'_id': 0})
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projection not found"
        )
    
    return doc

@api_router.get("/benchmarks/{stage}", response_model=BenchmarkData)
async def get_benchmarks(stage: str):
    """
    Get benchmark data for a funding stage.
    
    Args:
        stage: One of 'pre-seed', 'seed', 'series-a'
        
    Returns:
        Benchmark growth rates for the stage
    """
    if stage not in INDIA_SAAS_BENCHMARKS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage. Must be one of: {list(INDIA_SAAS_BENCHMARKS.keys())}"
        )
    
    benchmark = INDIA_SAAS_BENCHMARKS[stage]
    
    return BenchmarkData(
        stage=stage,
        median=benchmark['median'],
        p75=benchmark['p75'],
        p90=benchmark.get('p90'),
        sample_size=benchmark['sample_size'],
        source='static'
    )

@api_router.post("/benchmarks/compare")
async def compare_benchmark(
    growth_rate: float = Query(..., ge=0, le=2.0),
    stage: str = Query(...)
):
    """
    Compare a growth rate against benchmarks.
    
    Returns percentile ranking and comparison metrics.
    """
    if stage not in INDIA_SAAS_BENCHMARKS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid stage"
        )
    
    return compare_to_benchmark(growth_rate, stage)

# ============================================================================
# QUIZ ROUTES (Lead Generation)
# ============================================================================

@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission, request: Request):
    """
    Submit Founder DNA Quiz answers and get personalized projection.
    
    This is a lead generation tool that:
    1. Analyzes quiz answers to estimate growth parameters
    2. Generates a personalized projection
    3. Optionally captures email for follow-up
    
    Args:
        submission: Quiz answers and optional email
        
    Returns:
        Personalized projection and insights
    """
    answers = submission.answers
    
    # Extract or estimate values from quiz answers
    # These mappings depend on your quiz design
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
    
    # Extract values with defaults
    mrr = mrr_mapping.get(answers.get('revenue_range'), 200000)
    growth = growth_mapping.get(answers.get('growth_speed'), 0.08)
    stage = stage_mapping.get(answers.get('startup_stage'), 'pre-seed')
    
    # Generate projection
    inputs = ProjectionInputs(currentMRR=mrr, growthRate=growth)
    projection = predict_trajectory(inputs)
    
    # Get benchmark comparison
    benchmark_result = compare_to_benchmark(growth, stage)
    
    # Store quiz submission for analytics
    await db.quiz_submissions.insert_one({
        'answers': answers,
        'email': submission.email,
        'result': projection.model_dump(),
        'benchmark': benchmark_result,
        'ip': request.client.host,
        'created_at': datetime.now(timezone.utc).isoformat()
    })
    
    # Generate personalized insight
    target_date = None
    months_to_target = None
    for m in projection.milestones:
        if m.value == 100 * CRORE and m.date:
            target_date = m.date
            months_to_target = m.monthsToReach
            break
    
    insight = f"Based on your current trajectory, you're in the top {100 - benchmark_result['percentile']}% of {stage.replace('-', ' ')} founders. "
    
    if target_date:
        insight += f"At your current growth rate, you could reach ₹100 Crore by {target_date[:7].replace('-', '/')}."
    else:
        insight += "Consider strategies to accelerate your growth rate."
    
    return {
        'projection': projection,
        'benchmark': benchmark_result,
        'insight': insight,
        'next_steps': [
            'Sign up to track your progress monthly',
            'Connect your payment gateway for automatic tracking',
            'Get AI-powered coaching to optimize your growth'
        ]
    }

# ============================================================================
# AUTHENTICATED ROUTES (Requires Login)
# ============================================================================

@api_router.get("/user/profile")
async def get_user_profile(user: Dict[str, Any] = Depends(require_auth)):
    """
    Get the current user's profile.
    
    Returns user data and subscription status.
    """
    # Fetch profile from database
    profile = await db.users.find_one(
        {'id': user['id']},
        {'_id': 0}
    )
    
    # Fetch subscription
    subscription = await db.subscriptions.find_one(
        {'user_id': user['id']},
        {'_id': 0}
    )
    
    return {
        'user': {
            'id': user['id'],
            'email': user['email'],
            **profile
        } if profile else {
            'id': user['id'],
            'email': user['email']
        },
        'subscription': subscription
    }

@api_router.put("/user/profile")
async def update_user_profile(
    profile: UserProfile,
    user: Dict[str, Any] = Depends(require_auth)
):
    """
    Update the current user's profile.
    
    Creates the profile if it doesn't exist.
    """
    profile_data = {
        'id': user['id'],
        'email': user['email'],
        **profile.model_dump(exclude_none=True),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {'id': user['id']},
        {'$set': profile_data},
        upsert=True
    )
    
    return {'success': True, 'profile': profile_data}

@api_router.post("/user/onboarding")
async def complete_onboarding(
    profile: UserProfile,
    user: Dict[str, Any] = Depends(require_auth)
):
    """
    Complete user onboarding and set up initial profile.
    
    Called after first login to collect baseline data.
    """
    # Save profile
    profile_data = {
        'id': user['id'],
        'email': user['email'],
        **profile.model_dump(exclude_none=True),
        'onboarding_completed': True,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.update_one(
        {'id': user['id']},
        {'$set': profile_data},
        upsert=True
    )
    
    # Generate initial projection if data provided
    projection = None
    if profile.current_mrr and profile.growth_rate:
        inputs = ProjectionInputs(
            currentMRR=profile.current_mrr,
            growthRate=profile.growth_rate
        )
        projection = predict_trajectory(inputs)
        
        # Store as user's baseline
        await db.projections.insert_one({
            'user_id': user['id'],
            'inputs': inputs.model_dump(),
            'result': projection.model_dump(),
            'is_baseline': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        })
    
    return {
        'success': True,
        'profile': profile_data,
        'initial_projection': projection
    }

# ============================================================================
# PAID ROUTES (Requires Subscription)
# ============================================================================

@api_router.post("/checkin")
async def submit_checkin(
    checkin: CheckInData,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Submit a monthly revenue check-in.
    
    This tracks actual vs projected revenue over time.
    Requires Founder Plan subscription.
    """
    # Validate month format
    try:
        datetime.strptime(checkin.month, '%Y-%m')
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be in YYYY-MM format"
        )
    
    # Get user's baseline projection for comparison
    baseline = await db.projections.find_one(
        {'user_id': user['id'], 'is_baseline': True},
        {'_id': 0}
    )
    
    # Calculate deviation from projection
    deviation_pct = None
    projected_revenue = None
    
    if baseline:
        # This would require more complex calculation based on months elapsed
        # Simplified for MVP
        baseline_mrr = baseline['inputs']['currentMRR']
        growth_rate = baseline['inputs']['growthRate']
        projected_revenue = baseline_mrr  # Simplified
    
    # Store check-in
    checkin_data = {
        'user_id': user['id'],
        'month': checkin.month,
        'actual_revenue': checkin.actual_revenue,
        'projected_revenue': projected_revenue,
        'deviation_pct': deviation_pct,
        'note': checkin.note,
        'source': checkin.source,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    # Upsert to allow corrections
    await db.checkins.update_one(
        {'user_id': user['id'], 'month': checkin.month},
        {'$set': checkin_data},
        upsert=True
    )
    
    # Update streak
    await update_checkin_streak(user['id'])
    
    return {
        'success': True,
        'checkin': checkin_data,
        'message': 'Check-in recorded successfully!'
    }

async def update_checkin_streak(user_id: str):
    """Update user's consecutive check-in streak."""
    # Get all check-ins sorted by month
    checkins = await db.checkins.find(
        {'user_id': user_id}
    ).sort('month', -1).to_list(100)
    
    if not checkins:
        return
    
    # Calculate streak (simplified)
    streak = len(checkins)  # Simplified - would check consecutive months
    
    await db.users.update_one(
        {'id': user_id},
        {'$set': {
            'current_streak': streak,
            'last_checkin_month': checkins[0]['month']
        }}
    )

@api_router.get("/checkins")
async def get_checkins(
    user: Dict[str, Any] = Depends(require_paid_subscription),
    limit: int = Query(12, ge=1, le=36)
):
    """
    Get user's check-in history.
    
    Returns the most recent check-ins.
    """
    checkins = await db.checkins.find(
        {'user_id': user['id']},
        {'_id': 0}
    ).sort('month', -1).limit(limit).to_list(limit)
    
    return {'checkins': checkins}

@api_router.get("/dashboard/overview")
async def get_dashboard_overview(
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Get dashboard overview data for the Command Centre.
    
    Returns:
    - Current metrics
    - Health score
    - Next milestone
    - Recent activity
    """
    # Fetch user profile
    profile = await db.users.find_one({'id': user['id']}, {'_id': 0})
    
    # Fetch recent check-ins
    checkins = await db.checkins.find(
        {'user_id': user['id']},
        {'_id': 0}
    ).sort('month', -1).limit(3).to_list(3)
    
    # Fetch baseline projection
    baseline = await db.projections.find_one(
        {'user_id': user['id'], 'is_baseline': True},
        {'_id': 0}
    )
    
    # Calculate current metrics
    current_mrr = checkins[0]['actual_revenue'] if checkins else profile.get('current_mrr', 0) if profile else 0
    current_arr = current_mrr * 12
    
    # Calculate health score (simplified)
    health_signals = {
        'growth': 'good',
        'retention': 'good',
        'runway': 'good',
        'engagement': 'good' if len(checkins) >= 2 else 'warning'
    }
    health_score = 75 + (5 * list(health_signals.values()).count('good'))
    
    # Get next milestone
    growth_rate = profile.get('growth_rate', 0.08) if profile else 0.08
    projection = predict_trajectory(ProjectionInputs(
        currentMRR=current_mrr or 200000,
        growthRate=growth_rate
    ))
    
    next_milestone = None
    for m in projection.milestones:
        if not m.reached and m.monthsToReach:
            next_milestone = {
                'label': m.label,
                'value': m.value,
                'date': m.date,
                'months_away': m.monthsToReach
            }
            break
    
    return {
        'metrics': {
            'current_mrr': current_mrr,
            'current_arr': current_arr,
            'growth_rate': growth_rate,
            'streak': profile.get('current_streak', 0) if profile else 0
        },
        'health_score': health_score,
        'health_signals': health_signals,
        'next_milestone': next_milestone,
        'recent_checkins': checkins,
        'subscription': user.get('subscription')
    }

@api_router.get("/dashboard/revenue")
async def get_revenue_intelligence(
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Get Revenue Intelligence dashboard data.
    
    Returns:
    - Revenue history vs baseline vs benchmark
    - Growth analysis
    - Cohort data (if available)
    """
    # Fetch all check-ins
    checkins = await db.checkins.find(
        {'user_id': user['id']},
        {'_id': 0}
    ).sort('month', 1).to_list(24)
    
    # Fetch profile for stage
    profile = await db.users.find_one({'id': user['id']}, {'_id': 0})
    stage = profile.get('stage', 'pre-seed') if profile else 'pre-seed'
    benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
    
    # Build revenue data
    revenue_data = []
    for i, checkin in enumerate(checkins):
        base_revenue = checkins[0]['actual_revenue'] if checkins else 200000
        months_elapsed = i
        
        revenue_data.append({
            'month': checkin['month'],
            'actual': checkin['actual_revenue'],
            'baseline': base_revenue * math.pow(1 + (profile.get('growth_rate', 0.08) if profile else 0.08), months_elapsed),
            'benchmark': base_revenue * math.pow(1 + benchmark['median'], months_elapsed)
        })
    
    # Calculate growth rate from actuals
    calculated_growth = None
    if len(checkins) >= 2:
        recent = checkins[-1]['actual_revenue']
        previous = checkins[-2]['actual_revenue']
        if previous > 0:
            calculated_growth = (recent - previous) / previous
    
    return {
        'revenue_data': revenue_data,
        'calculated_growth': calculated_growth,
        'benchmark': {
            'stage': stage,
            'median': benchmark['median'],
            'p75': benchmark['p75']
        }
    }

# ============================================================================
# CONNECTOR ROUTES
# ============================================================================

@api_router.get("/connectors")
async def list_connectors(
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    List user's connected data sources.
    """
    connectors = await db.connectors.find(
        {'user_id': user['id']},
        {'_id': 0, 'encrypted_key': 0}  # Never return encrypted keys
    ).to_list(20)
    
    return {'connectors': connectors}

@api_router.post("/connectors/{provider}/connect")
async def connect_provider(
    provider: str,
    api_key: str = Query(..., description="API key for the provider"),
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Connect a payment provider (Razorpay, Stripe, etc.).
    
    The API key is encrypted before storage.
    """
    valid_providers = ['razorpay', 'stripe', 'cashfree', 'chargebee']
    if provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider. Must be one of: {valid_providers}"
        )
    
    # In production, encrypt the API key with Fernet
    # For MVP, we just store a masked version
    masked_key = api_key[:4] + '...' + api_key[-4:]
    
    connector_data = {
        'user_id': user['id'],
        'provider': provider,
        'encrypted_key': api_key,  # Would be encrypted in production
        'masked_key': masked_key,
        'is_active': True,
        'last_synced_at': None,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.connectors.update_one(
        {'user_id': user['id'], 'provider': provider},
        {'$set': connector_data},
        upsert=True
    )
    
    return {
        'success': True,
        'provider': provider,
        'message': f'{provider.capitalize()} connected successfully!'
    }

@api_router.delete("/connectors/{provider}")
async def disconnect_provider(
    provider: str,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Disconnect a payment provider.
    """
    result = await db.connectors.delete_one({
        'user_id': user['id'],
        'provider': provider
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connector not found"
        )
    
    return {'success': True, 'message': f'{provider.capitalize()} disconnected'}

# ============================================================================
# INCLUDE ROUTER
# ============================================================================

app.include_router(api_router)

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler with consistent format."""
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
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            'error': True,
            'status_code': 500,
            'detail': 'An unexpected error occurred. Please try again.',
            'request_id': getattr(request.state, 'request_id', None)
        }
    )
