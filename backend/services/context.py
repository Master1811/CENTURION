"""
Founder Context Service Module
==============================
Builds comprehensive context objects for AI features.

The FounderContext aggregates data from multiple sources to provide
the AI with complete understanding of a founder's situation.

Data Sources:
- User profile (stage, company info)
- Recent check-ins (revenue history)
- Subscription status
- Benchmark comparisons
- Projection results

Author: 100Cr Engine Team
"""

import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict

from services.supabase import supabase_service

logger = logging.getLogger("100cr_engine.context")


@dataclass
class FounderContext:
    """
    Comprehensive context object for a founder.
    
    Used by AI services to generate personalized insights,
    reports, and coaching based on the founder's complete picture.
    """
    
    # Identity
    user_id: str
    email: str
    name: Optional[str] = None
    company_name: Optional[str] = None
    
    # Business Metrics
    stage: str = 'pre-seed'
    current_mrr: float = 0
    growth_rate: float = 0
    current_arr: float = 0
    
    # Projections
    months_to_1cr: Optional[int] = None
    months_to_10cr: Optional[int] = None
    months_to_100cr: Optional[int] = None
    
    # History
    checkins: List[Dict[str, Any]] = None
    streak: int = 0
    days_since_checkin: int = 0
    
    # Subscription
    is_paid: bool = False
    subscription_plan: Optional[str] = None
    
    # Benchmarks
    benchmark_percentile: Optional[int] = None
    benchmark_status: Optional[str] = None
    
    # Challenges & Goals
    biggest_challenge: Optional[str] = None
    quarterly_goals: List[str] = None
    
    def __post_init__(self):
        """Set defaults for list fields."""
        if self.checkins is None:
            self.checkins = []
        if self.quarterly_goals is None:
            self.quarterly_goals = []
        
        # Calculate ARR from MRR
        if self.current_mrr and not self.current_arr:
            self.current_arr = self.current_mrr * 12
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)
    
    def get_recent_checkins(self, months: int = 6) -> List[Dict[str, Any]]:
        """Get the most recent N months of check-ins."""
        return self.checkins[:months] if self.checkins else []
    
    def calculate_growth_trend(self) -> Optional[str]:
        """Determine if growth is accelerating, stable, or decelerating."""
        if len(self.checkins) < 3:
            return None
        
        # Compare recent 3 months growth
        recent = self.checkins[:3]
        growth_rates = []
        
        for i in range(len(recent) - 1):
            prev = recent[i + 1].get('actual_revenue', 0)
            curr = recent[i].get('actual_revenue', 0)
            if prev > 0:
                growth_rates.append((curr - prev) / prev)
        
        if len(growth_rates) < 2:
            return 'stable'
        
        if growth_rates[0] > growth_rates[1] + 0.02:
            return 'accelerating'
        elif growth_rates[0] < growth_rates[1] - 0.02:
            return 'decelerating'
        else:
            return 'stable'


class ContextBuilder:
    """
    Builder for creating FounderContext objects.
    
    Aggregates data from multiple services and databases
    to build a complete picture of a founder's situation.
    
    Usage:
        builder = ContextBuilder()
        context = await builder.build(user_id)
        
        # Use context for AI features
        report = await ai_service.generate_board_report(context.to_dict())
    """
    
    def __init__(self):
        """Initialize context builder."""
        self._supabase = supabase_service
    
    async def build(self, user_id: str, email: str = '') -> FounderContext:
        """
        Build a complete FounderContext for a user.
        
        Args:
            user_id: Supabase user UUID
            email: User's email (from JWT)
            
        Returns:
            Populated FounderContext object
        """
        # Fetch all data in parallel where possible
        profile = await self._supabase.get_profile(user_id)
        subscription = await self._supabase.get_subscription(user_id)
        checkins = await self._supabase.get_checkins(user_id, limit=12)
        
        # Build context
        context = FounderContext(
            user_id=user_id,
            email=email or (profile.get('email', '') if profile else ''),
            name=profile.get('name') if profile else None,
            company_name=profile.get('company') if profile else None,
            stage=profile.get('stage', 'pre-seed') if profile else 'pre-seed',
            current_mrr=self._get_current_mrr(profile, checkins),
            growth_rate=self._calculate_growth_rate(profile, checkins),
            checkins=checkins,
            streak=profile.get('current_streak', 0) if profile else 0,
            days_since_checkin=self._calculate_days_since_checkin(checkins),
            is_paid=subscription.get('status') == 'active' if subscription else False,
            subscription_plan=subscription.get('plan') if subscription else None,
        )
        
        # Add projection milestones
        self._add_projection_milestones(context)
        
        # Add benchmark comparison
        self._add_benchmark_comparison(context)
        
        return context
    
    def _get_current_mrr(
        self,
        profile: Optional[Dict[str, Any]],
        checkins: List[Dict[str, Any]]
    ) -> float:
        """Get current MRR from most recent check-in or profile."""
        if checkins:
            return checkins[0].get('actual_revenue', 0)
        if profile:
            return profile.get('current_mrr', 0)
        return 0
    
    def _calculate_growth_rate(
        self,
        profile: Optional[Dict[str, Any]],
        checkins: List[Dict[str, Any]]
    ) -> float:
        """Calculate MoM growth rate from check-ins."""
        if len(checkins) >= 2:
            current = checkins[0].get('actual_revenue', 0)
            previous = checkins[1].get('actual_revenue', 0)
            if previous > 0:
                return (current - previous) / previous
        
        if profile:
            return profile.get('growth_rate', 0.08)
        
        return 0.08  # Default assumption
    
    def _calculate_days_since_checkin(
        self,
        checkins: List[Dict[str, Any]]
    ) -> int:
        """Calculate days since last check-in."""
        if not checkins:
            return 999  # Large number to indicate never checked in
        
        try:
            last_checkin = checkins[0]
            created_at = last_checkin.get('created_at', '')
            if created_at:
                checkin_date = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
                return (datetime.now(timezone.utc) - checkin_date).days
        except (ValueError, TypeError):
            pass
        
        return 30  # Default assumption
    
    def _add_projection_milestones(self, context: FounderContext) -> None:
        """Add projection milestone calculations to context."""
        import math
        
        if context.current_mrr <= 0 or context.growth_rate <= 0:
            return
        
        # Calculate months to each milestone
        milestones = {
            'months_to_1cr': 10_000_000,    # ₹1 Crore ARR
            'months_to_10cr': 100_000_000,  # ₹10 Crore ARR
            'months_to_100cr': 1_000_000_000,  # ₹100 Crore ARR
        }
        
        for attr, target_arr in milestones.items():
            target_mrr = target_arr / 12
            
            if context.current_mrr >= target_mrr:
                setattr(context, attr, 0)
            else:
                try:
                    months = math.log(target_mrr / context.current_mrr) / math.log(1 + context.growth_rate)
                    setattr(context, attr, int(months) if months < 240 else None)
                except (ValueError, ZeroDivisionError):
                    setattr(context, attr, None)
    
    def _add_benchmark_comparison(self, context: FounderContext) -> None:
        """Add benchmark comparison to context."""
        # Static benchmarks by stage
        benchmarks = {
            'pre-seed': {'median': 0.08, 'p75': 0.14, 'p90': 0.20},
            'seed': {'median': 0.06, 'p75': 0.10, 'p90': 0.15},
            'series-a': {'median': 0.04, 'p75': 0.07, 'p90': 0.10},
        }
        
        benchmark = benchmarks.get(context.stage, benchmarks['pre-seed'])
        growth = context.growth_rate
        
        # Calculate percentile
        if growth >= benchmark['p90']:
            percentile = min(99, 90 + int(9 * (growth - benchmark['p90']) / (benchmark['p90'] * 0.5)))
            status = 'exceptional'
        elif growth >= benchmark['p75']:
            percentile = 75 + int(15 * (growth - benchmark['p75']) / (benchmark['p90'] - benchmark['p75']))
            status = 'above-average'
        elif growth >= benchmark['median']:
            percentile = 50 + int(25 * (growth - benchmark['median']) / (benchmark['p75'] - benchmark['median']))
            status = 'average'
        else:
            percentile = max(1, int(50 * growth / benchmark['median']))
            status = 'below-average'
        
        context.benchmark_percentile = percentile
        context.benchmark_status = status


# Global instance
context_builder = ContextBuilder()
