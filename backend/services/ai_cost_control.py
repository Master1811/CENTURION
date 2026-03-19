"""
AI Cost Control Service
=======================
Manages AI budget per user and implements overflow routing to cheaper models.

Critical Features:
- Per-user monthly budget tracking in INR
- Silent fallback to Haiku when Sonnet budget exceeded
- Never expose model switch to users
- Always return a response
- Database-backed persistence (Supabase)

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
    model_key: str           # Internal key ('sonnet', 'haiku')
    input_cost_per_1k: float   # INR per 1K input tokens
    output_cost_per_1k: float  # INR per 1K output tokens
    max_tokens: int
    

# Model configurations with INR costs (approximate)
# IMPORTANT: These are the REAL Anthropic model IDs
MODELS = {
    'sonnet': AIModelConfig(
        model_id='claude-3-5-sonnet-20241022',
        model_key='sonnet',
        input_cost_per_1k=0.25,    # ~$0.003 * 83 INR
        output_cost_per_1k=1.25,   # ~$0.015 * 83 INR
        max_tokens=4096,
    ),
    'haiku': AIModelConfig(
        model_id='claude-3-haiku-20240307',
        model_key='haiku',
        input_cost_per_1k=0.02,    # ~$0.00025 * 83 INR
        output_cost_per_1k=0.10,   # ~$0.00125 * 83 INR
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
    'deviation':         'haiku',
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
    'deviation':         'haiku',    # Analysis is quick, use Haiku
}


class AICostController:
    """
    Controls AI costs per user with budget limits and overflow routing.
    
    CRITICAL: This uses Supabase for persistence, NOT in-memory storage.

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
        logger.info("✓ AI Cost Controller initialized (Supabase-backed)")

    def _get_month_key(self) -> str:
        """Get current month key for tracking."""
        now = datetime.now(timezone.utc)
        return f"{now.year}-{now.month:02d}"
    
    async def get_user_budget_usage(self, user_id: str) -> float:
        """
        Get user's current month AI spend in INR from Supabase.

        Args:
            user_id: User UUID
            
        Returns:
            Total INR spent this month
        """
        from services.supabase import supabase_service

        try:
            spent = await supabase_service.get_monthly_ai_spend(user_id)
            return spent
        except Exception as e:
            logger.error(f"Error getting AI spend for {user_id}: {e}")
            return 0.0

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
            logger.info(f"User {user_id} budget exceeded - routing {feature} to {overflow_key}")
            return MODELS[overflow_key].model_id, True
        
        # Within budget - use default (Sonnet)
        return MODELS[default_model_key].model_id, False
    
    def get_model_key_from_id(self, model_id: str) -> str:
        """
        Get the internal model key from a model ID.

        Args:
            model_id: Full Anthropic model ID

        Returns:
            Internal key ('sonnet' or 'haiku')
        """
        for key, config in MODELS.items():
            if config.model_id == model_id:
                return key

        # Default to haiku if unknown
        if 'haiku' in model_id.lower():
            return 'haiku'
        return 'sonnet'

    def calculate_cost(
        self,
        model_key: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """
        Calculate cost for a completed request.

        Args:
            model_key: 'sonnet' or 'haiku'
            input_tokens: Number of input tokens used
            output_tokens: Number of output tokens used

        Returns:
            Cost in INR
        """
        config = MODELS.get(model_key, MODELS['haiku'])
        input_cost = (input_tokens / 1000) * config.input_cost_per_1k
        output_cost = (output_tokens / 1000) * config.output_cost_per_1k
        return input_cost + output_cost

    async def record_usage(
        self,
        user_id: str,
        feature: str,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> Dict[str, Any]:
        """
        Record AI usage to Supabase and update budget tracking.

        CRITICAL: This must be called after every AI generation!

        Args:
            user_id: User UUID
            feature: Feature used
            model: Model ID or key (e.g., 'sonnet' or 'claude-3-5-sonnet-20241022')
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            
        Returns:
            Usage record with cost
        """
        from services.supabase import supabase_service

        # Resolve model key
        model_key = self.get_model_key_from_id(model) if 'claude' in model else model

        # Calculate cost
        total_cost = self.calculate_cost(model_key, input_tokens, output_tokens)

        # Record to Supabase
        record = {
            'user_id': user_id,
            'feature': feature,
            'model': model_key,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'cost_inr': total_cost,
        }

        try:
            await supabase_service.record_ai_transaction(record)
            logger.info(f"AI usage recorded: user={user_id}, feature={feature}, cost=₹{total_cost:.4f}")
        except Exception as e:
            logger.error(f"Failed to record AI usage: {e}")

        return {
            **record,
            'timestamp': datetime.now(timezone.utc).isoformat(),
        }

    async def get_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """
        Get user's AI usage statistics for the current month.
        
        Args:
            user_id: User UUID
            
        Returns:
            Usage statistics
        """
        from services.supabase import supabase_service

        try:
            spent = await supabase_service.get_monthly_ai_spend(user_id)

            return {
                'month': self._get_month_key(),
                'budget_inr': SONNET_MONTHLY_BUDGET_PER_USER_INR,
                'spent_inr': spent,
                'remaining_inr': max(0, SONNET_MONTHLY_BUDGET_PER_USER_INR - spent),
                'is_budget_exceeded': spent >= SONNET_MONTHLY_BUDGET_PER_USER_INR,
            }
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            return {
                'month': self._get_month_key(),
                'budget_inr': SONNET_MONTHLY_BUDGET_PER_USER_INR,
                'spent_inr': 0.0,
                'remaining_inr': SONNET_MONTHLY_BUDGET_PER_USER_INR,
                'is_budget_exceeded': False,
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
            model: Model key or ID
            estimated_input_tokens: Expected input tokens
            estimated_output_tokens: Expected output tokens
            
        Returns:
            Estimated cost in INR
        """
        model_key = self.get_model_key_from_id(model) if 'claude' in model else model
        return self.calculate_cost(model_key, estimated_input_tokens, estimated_output_tokens)


# Global instance
ai_cost_controller = AICostController()
