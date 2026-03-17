"""
Benchmarks Router
=================
Benchmark data and comparison endpoints.

Public endpoints:
- GET /benchmarks/{stage} - Get benchmarks for a stage
- POST /benchmarks/compare - Compare growth to benchmarks
- GET /benchmarks/stages - List all stages

Author: 100Cr Engine Team
"""

import logging
from typing import Dict, Any, List

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

logger = logging.getLogger("100cr_engine.benchmarks")

router = APIRouter(prefix="/benchmarks", tags=["Benchmarks"])


# ============================================================================
# BENCHMARK DATA
# ============================================================================

# Indian SaaS benchmark data by funding stage
# Based on aggregated anonymous data from Indian founders
INDIA_SAAS_BENCHMARKS = {
    'pre-seed': {
        'median': 0.08,      # 8% median monthly growth
        'p75': 0.14,         # Top 25% grow at 14%+
        'p90': 0.20,         # Top 10% grow at 20%+
        'sample_size': 150,
        'description': 'Pre-seed startups (< ₹1 Crore raised)',
        'arr_range': '₹0 - ₹50L ARR'
    },
    'seed': {
        'median': 0.06,      # 6% median monthly growth
        'p75': 0.10,         # Top 25% grow at 10%+
        'p90': 0.15,         # Top 10% grow at 15%+
        'sample_size': 200,
        'description': 'Seed stage startups (₹1-5 Crore raised)',
        'arr_range': '₹50L - ₹2Cr ARR'
    },
    'series-a': {
        'median': 0.04,      # 4% median monthly growth
        'p75': 0.07,         # Top 25% grow at 7%+
        'p90': 0.10,         # Top 10% grow at 10%+
        'sample_size': 100,
        'description': 'Series A startups (₹5-20 Crore raised)',
        'arr_range': '₹2Cr - ₹10Cr ARR'
    },
    'series-b': {
        'median': 0.03,      # 3% median monthly growth
        'p75': 0.05,         # Top 25% grow at 5%+
        'p90': 0.08,         # Top 10% grow at 8%+
        'sample_size': 50,
        'description': 'Series B startups (₹20+ Crore raised)',
        'arr_range': '₹10Cr+ ARR'
    },
}


# ============================================================================
# RESPONSE MODELS
# ============================================================================

class BenchmarkData(BaseModel):
    """Benchmark data for a funding stage."""
    stage: str
    median: float
    p75: float
    p90: float
    sample_size: int
    description: str
    arr_range: str
    source: str = 'aggregated_anonymous'


class BenchmarkComparison(BaseModel):
    """Result of comparing growth to benchmarks."""
    growth_rate: float
    stage: str
    percentile: int
    status: str  # 'exceptional', 'above-average', 'average', 'below-average'
    benchmark: Dict[str, Any]
    insight: str


class StageInfo(BaseModel):
    """Information about a funding stage."""
    stage: str
    description: str
    arr_range: str


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def calculate_percentile(growth_rate: float, benchmark: Dict[str, Any]) -> tuple:
    """
    Calculate percentile ranking for a growth rate.
    
    Returns tuple of (percentile, status).
    """
    if growth_rate >= benchmark.get('p90', benchmark['p75'] * 1.5):
        percentile = min(99, 90 + int(9 * (growth_rate - benchmark['p90']) / (benchmark['p90'] * 0.5)))
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
    
    return percentile, status


def generate_insight(growth_rate: float, percentile: int, status: str, stage: str) -> str:
    """Generate a personalized insight based on benchmark comparison."""
    stage_display = stage.replace('-', ' ').title()
    
    if status == 'exceptional':
        return f"Your {growth_rate*100:.1f}% growth puts you in the top 10% of {stage_display} founders. You're on track for rapid scaling."
    elif status == 'above-average':
        return f"At {growth_rate*100:.1f}% growth, you're outperforming most {stage_display} founders. Keep pushing to reach the top 10%."
    elif status == 'average':
        return f"Your {growth_rate*100:.1f}% growth is solid for {stage_display} stage. To accelerate, focus on your highest-leverage growth lever."
    else:
        return f"At {growth_rate*100:.1f}% growth, there's room to improve. The median for {stage_display} is {INDIA_SAAS_BENCHMARKS[stage]['median']*100:.0f}%."


# ============================================================================
# ROUTES
# ============================================================================

@router.get("/stages", response_model=List[StageInfo])
async def list_stages():
    """
    List all available funding stages.
    
    Returns:
        List of stages with descriptions
    """
    return [
        StageInfo(
            stage=stage,
            description=data['description'],
            arr_range=data['arr_range']
        )
        for stage, data in INDIA_SAAS_BENCHMARKS.items()
    ]


@router.get("/{stage}", response_model=BenchmarkData)
async def get_benchmarks(stage: str):
    """
    Get benchmark data for a funding stage.
    
    Args:
        stage: One of 'pre-seed', 'seed', 'series-a', 'series-b'
        
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
        p90=benchmark['p90'],
        sample_size=benchmark['sample_size'],
        description=benchmark['description'],
        arr_range=benchmark['arr_range'],
    )


@router.post("/compare", response_model=BenchmarkComparison)
async def compare_benchmark(
    growth_rate: float = Query(..., ge=0, le=2.0, description="Monthly growth rate as decimal"),
    stage: str = Query(..., description="Funding stage")
):
    """
    Compare a growth rate against benchmarks for a stage.
    
    Returns percentile ranking and personalized insight.
    
    Args:
        growth_rate: Monthly growth rate (0.08 = 8%)
        stage: Funding stage for comparison
        
    Returns:
        Comparison result with percentile and insight
    """
    if stage not in INDIA_SAAS_BENCHMARKS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid stage. Must be one of: {list(INDIA_SAAS_BENCHMARKS.keys())}"
        )
    
    benchmark = INDIA_SAAS_BENCHMARKS[stage]
    percentile, status = calculate_percentile(growth_rate, benchmark)
    insight = generate_insight(growth_rate, percentile, status, stage)
    
    return BenchmarkComparison(
        growth_rate=growth_rate,
        stage=stage,
        percentile=percentile,
        status=status,
        benchmark={
            'median': benchmark['median'],
            'p75': benchmark['p75'],
            'p90': benchmark['p90'],
            'sample_size': benchmark['sample_size']
        },
        insight=insight
    )
