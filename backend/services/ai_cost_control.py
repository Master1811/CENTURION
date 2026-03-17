"""
AI Cost Control Service
=======================
Manages AI budget per user and implements overflow routing to cheaper models.

Critical Features:
- Per-user monthly budget tracking in INR
- Silent fallback to Haiku when Sonnet budget exceeded
- Never expose model switch to users
- Always return a response

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass

logger = logging.getLogger("100cr_engine.ai_cost")


# ============================================================================
# COST CONFIGURATION
# ============================================================================

@dataclass
class AIModelConfig:
    """Configuration for an AI model."""
    model_id: str
    input_cost_per_1k: float   # INR per 1K input tokens
    output_cost_per_1k: float  # INR per 1K output tokens
    max_tokens: int
    

# Model configurations with INR costs (approximate)
MODELS = {
    'sonnet': AIModelConfig(
        model_id='claude-sonnet-4-20250514',
        input_cost_per_1k=0.25,    # ~$0.003 * 83 INR
        output_cost_per_1k=1.25,   # ~$0.015 * 83 INR
        max_tokens=4096,
    ),
    'haiku': AIModelConfig(
        model_id='claude-haiku-4-5-20251001',
        input_cost_per_1k=0.08,    # ~$0.001 * 83 INR
        output_cost_per_1k=0.42,   # ~$0.005 * 83 INR
        max_tokens=4096,
    ),
}

# Budget configuration
SONNET_MONTHLY_BUDGET_PER_USER_INR = 25.0

# Overflow routing: when Sonnet budget exceeded, use these models
OVERFLOW_ROUTING = {
    'board_report':      'haiku',
    'strategy_brief':    'haiku',
    'investor_narrator': 'haiku',
    'what_if_story':     'haiku',
    'checkin_interpret': 'haiku',
    'daily_pulse':       'haiku',
    'weekly_question':   'haiku',
}

# Default model for each feature when within budget
DEFAULT_MODELS = {
    'board_report':      'sonnet',
    'strategy_brief':    'sonnet',
    'investor_narrator': 'sonnet',
    'what_if_story':     'sonnet',
    'checkin_interpret': 'sonnet',
    'daily_pulse':       'haiku',    # Always use Haiku for frequent features
    'weekly_question':   'haiku',    # Always use Haiku for frequent features
}


class AICostController:
    """
    Controls AI costs per user with budget limits and overflow routing.
    
    Usage:
        controller = AICostController()
        
        # Get model to use for a feature
        model_id, is_overflow = await controller.get_model_for_feature(
            user_id='xxx',
            feature='board_report'
        )
        
        # After API call, record usage
        await controller.record_usage(
            user_id='xxx',
            feature='board_report',
            model='sonnet',
            input_tokens=500,
            output_tokens=1500
        )
    """
    
    def __init__(self):
        """Initialize cost controller."""
        # In-memory usage tracking (would use Redis/DB in production)
        self._usage_cache: Dict[str, Dict[str, float]] = {}
        logger.info("✓ AI Cost Controller initialized")
    
    def _get_month_key(self) -> str:
        """Get current month key for tracking."""
        now = datetime.now(timezone.utc)
        return f"{now.year}-{now.month:02d}"
    
    def _get_user_key(self, user_id: str) -> str:
        """Get cache key for user's monthly usage."""
        return f"{user_id}:{self._get_month_key()}"
    
    async def get_user_budget_usage(self, user_id: str) -> float:
        """
        Get user's current month AI spend in INR.
        
        Args:
            user_id: User UUID
            
        Returns:
            Total INR spent this month
        """
        key = self._get_user_key(user_id)
        usage = self._usage_cache.get(key, {})
        return usage.get('total_inr', 0.0)
    
    async def get_remaining_budget(self, user_id: str) -> float:
        """
        Get user's remaining Sonnet budget for the month.
        
        Args:
            user_id: User UUID
            
        Returns:
            Remaining budget in INR
        """
        spent = await self.get_user_budget_usage(user_id)
        return max(0, SONNET_MONTHLY_BUDGET_PER_USER_INR - spent)
    
    async def is_budget_exceeded(self, user_id: str) -> bool:
        """
        Check if user has exceeded their monthly Sonnet budget.
        
        Args:
            user_id: User UUID
            
        Returns:
            True if budget exceeded
        """
        remaining = await self.get_remaining_budget(user_id)
        return remaining <= 0
    
    async def get_model_for_feature(
        self,
        user_id: str,
        feature: str
    ) -> Tuple[str, bool]:
        """
        Determine which model to use for a feature based on budget.
        
        Implements silent fallback - NEVER expose model switch to user.
        
        Args:
            user_id: User UUID
            feature: Feature being used (e.g., 'board_report')
            
        Returns:
            Tuple of (model_id, is_overflow)
        """
        # Get default model for this feature
        default_model_key = DEFAULT_MODELS.get(feature, 'haiku')
        
        # If default is already Haiku, just use it
        if default_model_key == 'haiku':
            return MODELS['haiku'].model_id, False
        
        # Check if Sonnet budget exceeded
        if await self.is_budget_exceeded(user_id):
            # Silently route to overflow model
            overflow_key = OVERFLOW_ROUTING.get(feature, 'haiku')
            logger.debug(f"User {user_id} budget exceeded - routing {feature} to {overflow_key}")
            return MODELS[overflow_key].model_id, True
        
        # Within budget - use default (Sonnet)
        return MODELS[default_model_key].model_id, False
    
    async def record_usage(
        self,
        user_id: str,
        feature: str,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> Dict[str, Any]:
        """
        Record AI usage and update budget tracking.
        
        Args:
            user_id: User UUID
            feature: Feature used
            model: Model key ('sonnet' or 'haiku')
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Usage record with cost
        """
        # Get model config
        model_config = MODELS.get(model, MODELS['haiku'])
        
        # Calculate cost
        input_cost = (input_tokens / 1000) * model_config.input_cost_per_1k
        output_cost = (output_tokens / 1000) * model_config.output_cost_per_1k
        total_cost = input_cost + output_cost
        
        # Update cache
        key = self._get_user_key(user_id)
        if key not in self._usage_cache:
            self._usage_cache[key] = {
                'total_inr': 0.0,
                'sonnet_inr': 0.0,
                'haiku_inr': 0.0,
                'requests': 0,
            }
        
        self._usage_cache[key]['total_inr'] += total_cost
        self._usage_cache[key]['requests'] += 1
        
        if model == 'sonnet':
            self._usage_cache[key]['sonnet_inr'] += total_cost
        else:
            self._usage_cache[key]['haiku_inr'] += total_cost
        
        record = {
            'user_id': user_id,
            'feature': feature,
            'model': model,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'cost_inr': total_cost,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }
        
        logger.debug(f"AI usage recorded: {record}")
        
        return record
    
    async def get_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get user's AI usage statistics for the current month.
        
        Args:
            user_id: User UUID
            
        Returns:
            Usage statistics
        """
        key = self._get_user_key(user_id)
        usage = self._usage_cache.get(key, {
            'total_inr': 0.0,
            'sonnet_inr': 0.0,
            'haiku_inr': 0.0,
            'requests': 0,
        })
        
        return {
            'month': self._get_month_key(),
            'budget_inr': SONNET_MONTHLY_BUDGET_PER_USER_INR,
            'spent_inr': usage['total_inr'],
            'remaining_inr': max(0, SONNET_MONTHLY_BUDGET_PER_USER_INR - usage['total_inr']),
            'sonnet_spend_inr': usage['sonnet_inr'],
            'haiku_spend_inr': usage['haiku_inr'],
            'total_requests': usage['requests'],
            'is_budget_exceeded': usage['total_inr'] >= SONNET_MONTHLY_BUDGET_PER_USER_INR,
        }
    
    def estimate_cost(
        self,
        model: str,
        estimated_input_tokens: int,
        estimated_output_tokens: int
    ) -> float:
        """
        Estimate cost for a request before making it.
        
        Args:
            model: Model key
            estimated_input_tokens: Expected input tokens
            estimated_output_tokens: Expected output tokens
            
        Returns:
            Estimated cost in INR
        """
        config = MODELS.get(model, MODELS['haiku'])
        input_cost = (estimated_input_tokens / 1000) * config.input_cost_per_1k
        output_cost = (estimated_output_tokens / 1000) * config.output_cost_per_1k
        return input_cost + output_cost


# Global instance
ai_cost_controller = AICostController()
