from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="100Cr Engine API", version="2.0")

# Create routers
api_router = APIRouter(prefix="/api")

# ============ CONSTANTS ============
CRORE = 10_000_000
LAKH = 100_000
DEFAULT_TARGET = 100 * CRORE
MILESTONE_VALUES = [CRORE, 10 * CRORE, 50 * CRORE, 100 * CRORE]
DEFAULT_MONTHS_TO_PROJECT = 120

# Benchmark data
INDIA_SAAS_BENCHMARKS = {
    'pre-seed': {'median': 0.08, 'p75': 0.14, 'p90': 0.20, 'sample_size': 150},
    'seed': {'median': 0.06, 'p75': 0.10, 'p90': 0.15, 'sample_size': 200},
    'series-a': {'median': 0.04, 'p75': 0.07, 'p90': 0.10, 'sample_size': 100},
}

# ============ RATE LIMITING (In-Memory) ============
# Key: IP or user_id, Value: {feature: {count, reset_at}}
rate_limit_store: Dict[str, Dict[str, Dict[str, Any]]] = {}

RATE_LIMITS = {
    'free_projection': {'limit': 10, 'window': 'day'},
    'free_scenario': {'limit': 3, 'window': 'day'},
    'free_pdf': {'limit': 1, 'window': 'day'},
}

def get_rate_limit_key(ip: str, feature: str) -> tuple:
    """Get rate limit info for a feature"""
    now = datetime.now(timezone.utc)
    today = now.date().isoformat()
    
    if ip not in rate_limit_store:
        rate_limit_store[ip] = {}
    
    if feature not in rate_limit_store[ip]:
        rate_limit_store[ip][feature] = {'count': 0, 'date': today}
    
    # Reset if new day
    if rate_limit_store[ip][feature]['date'] != today:
        rate_limit_store[ip][feature] = {'count': 0, 'date': today}
    
    current = rate_limit_store[ip][feature]
    limit = RATE_LIMITS.get(feature, {}).get('limit', 100)
    
    return current['count'], limit

def increment_rate_limit(ip: str, feature: str):
    """Increment rate limit counter"""
    today = datetime.now(timezone.utc).date().isoformat()
    
    if ip not in rate_limit_store:
        rate_limit_store[ip] = {}
    
    if feature not in rate_limit_store[ip]:
        rate_limit_store[ip][feature] = {'count': 0, 'date': today}
    
    rate_limit_store[ip][feature]['count'] += 1

# ============ MODELS ============

class ProjectionInputs(BaseModel):
    currentMRR: float = Field(..., gt=0, le=50 * CRORE)
    growthRate: float = Field(..., ge=0, le=2.0)
    monthsToProject: int = Field(default=DEFAULT_MONTHS_TO_PROJECT)
    targetRevenue: float = Field(default=DEFAULT_TARGET)

class Milestone(BaseModel):
    value: float
    label: str
    reached: bool
    monthsToReach: Optional[int]
    date: Optional[str]

class Sensitivity(BaseModel):
    growthIncrease: float
    monthsGained: Optional[int]

class ProjectionResult(BaseModel):
    inputs: Dict[str, float]
    currentARR: float
    milestones: List[Milestone]
    sensitivity: Sensitivity
    slug: Optional[str] = None

class BenchmarkData(BaseModel):
    stage: str
    median: float
    p75: float
    p90: Optional[float] = None
    sample_size: int
    source: str = 'static'

class BenchmarkComparison(BaseModel):
    growthRate: float
    stage: str
    percentile: int
    status: str
    benchmark: BenchmarkData

# ============ ENGINE FUNCTIONS ============

def calculate_revenue_at_month(current_mrr: float, growth_rate: float, months: int) -> float:
    """R_t = R_0 × (1 + g)^t"""
    if current_mrr <= 0 or growth_rate < 0:
        return current_mrr
    return current_mrr * math.pow(1 + growth_rate, months)

def find_milestone_month(current_mrr: float, growth_rate: float, target_annual: float, max_months: int = DEFAULT_MONTHS_TO_PROJECT) -> Optional[int]:
    """Find the month when target annual revenue is reached"""
    if current_mrr <= 0 or growth_rate <= 0:
        return None
    
    target_monthly = target_annual / 12
    
    if current_mrr >= target_monthly:
        return 0
    
    # Solve: t = ln(target/current) / ln(1 + g)
    try:
        months = math.log(target_monthly / current_mrr) / math.log(1 + growth_rate)
        if months > max_months or not math.isfinite(months):
            return None
        return math.ceil(months)
    except (ValueError, ZeroDivisionError):
        return None

def predict_trajectory(inputs: ProjectionInputs) -> ProjectionResult:
    """Main projection function"""
    now = datetime.now(timezone.utc)
    current_arr = inputs.currentMRR * 12
    
    # Calculate milestones
    milestone_labels = {
        CRORE: '₹1 Crore',
        10 * CRORE: '₹10 Crore',
        50 * CRORE: '₹50 Crore',
        100 * CRORE: '₹100 Crore',
    }
    
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
                label=milestone_labels[value],
                reached=current_arr >= value,
                monthsToReach=None,
                date=None
            ))
        else:
            target_date = datetime(now.year, now.month, 1) + \
                          __import__('dateutil.relativedelta', fromlist=['relativedelta']).relativedelta(months=months_to_reach)
            milestones.append(Milestone(
                value=value,
                label=milestone_labels[value],
                reached=months_to_reach == 0,
                monthsToReach=months_to_reach,
                date=target_date.isoformat()
            ))
    
    # Sensitivity analysis
    higher_growth = inputs.growthRate + 0.01
    months_current = find_milestone_month(inputs.currentMRR, inputs.growthRate, inputs.targetRevenue, inputs.monthsToProject)
    months_higher = find_milestone_month(inputs.currentMRR, higher_growth, inputs.targetRevenue, inputs.monthsToProject)
    
    months_gained = None
    if months_current is not None and months_higher is not None:
        months_gained = months_current - months_higher
    
    return ProjectionResult(
        inputs={'currentMRR': inputs.currentMRR, 'growthRate': inputs.growthRate},
        currentARR=current_arr,
        milestones=milestones,
        sensitivity=Sensitivity(growthIncrease=0.01, monthsGained=months_gained)
    )

def compare_to_benchmark(growth_rate: float, stage: str) -> BenchmarkComparison:
    """Compare growth rate to benchmark for a stage"""
    benchmark = INDIA_SAAS_BENCHMARKS.get(stage, INDIA_SAAS_BENCHMARKS['pre-seed'])
    
    # Calculate percentile
    if growth_rate >= benchmark.get('p90', benchmark['p75'] * 1.5):
        percentile = min(99, 90 + int(10 * (growth_rate - benchmark.get('p90', benchmark['p75'] * 1.5)) / (benchmark.get('p90', benchmark['p75'] * 1.5) * 0.5)))
        status = 'exceptional'
    elif growth_rate >= benchmark['p75']:
        percentile = 75 + int(15 * (growth_rate - benchmark['p75']) / (benchmark.get('p90', benchmark['p75'] * 1.5) - benchmark['p75']))
        status = 'above-average'
    elif growth_rate >= benchmark['median']:
        percentile = 50 + int(25 * (growth_rate - benchmark['median']) / (benchmark['p75'] - benchmark['median']))
        status = 'average'
    else:
        percentile = max(1, int(50 * growth_rate / benchmark['median']))
        status = 'below-average'
    
    return BenchmarkComparison(
        growthRate=growth_rate,
        stage=stage,
        percentile=percentile,
        status=status,
        benchmark=BenchmarkData(
            stage=stage,
            median=benchmark['median'],
            p75=benchmark['p75'],
            p90=benchmark.get('p90'),
            sample_size=benchmark['sample_size'],
            source='static'
        )
    )

# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "100Cr Engine API", "version": "2.0"}

@api_router.get("/health")
async def health():
    return {"status": "ok", "version": "2.0"}

@api_router.post("/engine/projection", response_model=ProjectionResult)
async def run_projection(inputs: ProjectionInputs):
    """Run a revenue projection calculation"""
    # Rate limiting would check IP here in production
    result = predict_trajectory(inputs)
    
    # Generate a slug for sharing
    slug = str(uuid.uuid4())[:8]
    result.slug = slug
    
    # Store projection (optional, for sharing)
    doc = {
        'slug': slug,
        'inputs': inputs.model_dump(),
        'result': result.model_dump(),
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    await db.projection_runs.insert_one(doc)
    
    return result

@api_router.get("/engine/projection/{slug}")
async def get_shared_projection(slug: str):
    """Get a shared projection by slug"""
    doc = await db.projection_runs.find_one({'slug': slug}, {'_id': 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Projection not found")
    return doc

@api_router.get("/benchmarks/{stage}", response_model=BenchmarkData)
async def get_benchmarks(stage: str):
    """Get benchmark data for a funding stage"""
    if stage not in INDIA_SAAS_BENCHMARKS:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {list(INDIA_SAAS_BENCHMARKS.keys())}")
    
    benchmark = INDIA_SAAS_BENCHMARKS[stage]
    return BenchmarkData(
        stage=stage,
        median=benchmark['median'],
        p75=benchmark['p75'],
        p90=benchmark.get('p90'),
        sample_size=benchmark['sample_size'],
        source='static'
    )

@api_router.post("/benchmarks/compare", response_model=BenchmarkComparison)
async def compare_benchmark(growth_rate: float = Query(..., ge=0, le=2.0), stage: str = Query(...)):
    """Compare a growth rate to benchmark"""
    if stage not in INDIA_SAAS_BENCHMARKS:
        raise HTTPException(status_code=400, detail=f"Invalid stage")
    
    return compare_to_benchmark(growth_rate, stage)

# Include routers
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
