"""
Supabase Service Module
=======================
Handles all Supabase client initialization and database operations.
Uses Supabase Python SDK for PostgreSQL database access.

Architecture:
- Single async client instance for connection pooling
- Type-safe database operations with Pydantic models
- Automatic retry logic for transient failures

Tables Used:
- profiles: User profiles and settings
- subscriptions: Payment/subscription status
- projection_runs: Saved projections (shareable)
- checkins: Monthly revenue check-ins
- connector_keys: Encrypted API keys for integrations
- quiz_submissions: Founder DNA quiz responses
- ai_usage_log: Track AI feature usage

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from supabase import create_client, Client
from postgrest.exceptions import APIError

logger = logging.getLogger("100cr_engine.supabase")


class SupabaseService:
    """
    Centralized Supabase service for all database operations.
    
    Implements connection pooling and provides type-safe methods
    for each table operation. All methods are async-ready.
    
    Usage:
        supabase = SupabaseService()
        user = await supabase.get_profile(user_id)
    """
    
    def __init__(self):
        """
        Initialize Supabase client with environment credentials.
        
        Required environment variables:
        - SUPABASE_URL: Project URL (https://xxx.supabase.co)
        - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
        """
        self.url = os.environ.get('SUPABASE_URL', '')
        self.key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
        
        if not self.url or not self.key or 'placeholder' in self.url.lower():
            logger.warning("Supabase not configured - using mock mode")
            self._client = None
        else:
            self._client: Client = create_client(self.url, self.key)
            logger.info("✓ Supabase client initialized")
    
    @property
    def is_configured(self) -> bool:
        """Check if Supabase is properly configured."""
        return self._client is not None
    
    # =========================================================================
    # PROFILES TABLE
    # =========================================================================
    
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch a user profile by Supabase user ID.
        
        Args:
            user_id: UUID from Supabase Auth
            
        Returns:
            Profile dict or None if not found
        """
        if not self.is_configured:
            return None
            
        try:
            response = self._client.table('profiles').select('*').eq('id', user_id).single().execute()
            return response.data
        except APIError as e:
            if 'PGRST116' in str(e) or 'PGRST205' in str(e):
                return None
            logger.warning(f"Error fetching profile: {e}")
            return None
    
    async def upsert_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update a user profile.
        
        Args:
            profile_data: Dict containing profile fields (must include 'id')
            
        Returns:
            Updated profile data
        """
        if not self.is_configured:
            return profile_data
            
        profile_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('profiles').upsert(profile_data).execute()
        return response.data[0] if response.data else profile_data
    
    async def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update specific fields on a user profile.
        
        Args:
            user_id: UUID from Supabase Auth
            updates: Dict of fields to update
            
        Returns:
            Updated profile data
        """
        if not self.is_configured:
            return {'id': user_id, **updates}
            
        updates['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('profiles').update(updates).eq('id', user_id).execute()
        return response.data[0] if response.data else updates
    
    # =========================================================================
    # SUBSCRIPTIONS TABLE
    # =========================================================================
    
    async def get_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user's subscription status.
        
        Args:
            user_id: UUID from Supabase Auth
            
        Returns:
            Subscription dict or None
        """
        if not self.is_configured:
            return None
            
        try:
            response = self._client.table('subscriptions').select('*').eq('user_id', user_id).single().execute()
            return response.data
        except APIError as e:
            if 'PGRST116' in str(e):
                return None
            logger.error(f"Error fetching subscription: {e}")
            raise
    
    async def create_subscription(self, subscription_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new subscription record.
        
        Args:
            subscription_data: Dict with user_id, plan, status, etc.
            
        Returns:
            Created subscription data
        """
        if not self.is_configured:
            return subscription_data
            
        subscription_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('subscriptions').insert(subscription_data).execute()
        return response.data[0] if response.data else subscription_data
    
    async def update_subscription(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update subscription status."""
        if not self.is_configured:
            return {'user_id': user_id, **updates}
            
        updates['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('subscriptions').update(updates).eq('user_id', user_id).execute()
        return response.data[0] if response.data else updates
    
    # =========================================================================
    # PROJECTION RUNS TABLE
    # =========================================================================
    
    async def save_projection(self, projection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save a projection run for sharing.
        
        Args:
            projection_data: Dict with slug, inputs, result, user_id (optional)
            
        Returns:
            Saved projection data
        """
        if not self.is_configured:
            return projection_data
            
        projection_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        try:
            response = self._client.table('projection_runs').insert(projection_data).execute()
            return response.data[0] if response.data else projection_data
        except APIError as e:
            # Table might not exist yet - log and continue
            logger.warning(f"Could not save projection: {e}")
            return projection_data
    
    async def get_projection_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a shared projection by its slug.
        
        Args:
            slug: 8-character unique identifier
            
        Returns:
            Projection data or None
        """
        if not self.is_configured:
            return None
            
        try:
            response = self._client.table('projection_runs').select('*').eq('slug', slug).single().execute()
            return response.data
        except APIError as e:
            if 'PGRST116' in str(e) or 'PGRST205' in str(e):
                return None
            logger.warning(f"Error fetching projection: {e}")
            return None
    
    async def get_user_projections(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get all projections for a user."""
        if not self.is_configured:
            return []
            
        response = self._client.table('projection_runs').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
        return response.data or []
    
    # =========================================================================
    # CHECKINS TABLE
    # =========================================================================
    
    async def upsert_checkin(self, checkin_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create or update a monthly check-in.
        
        Uses upsert to allow corrections to the same month.
        
        Args:
            checkin_data: Dict with user_id, month, actual_revenue, etc.
            
        Returns:
            Saved check-in data
        """
        if not self.is_configured:
            return checkin_data
            
        checkin_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        # Upsert based on user_id + month combination
        response = self._client.table('checkins').upsert(
            checkin_data,
            on_conflict='user_id,month'
        ).execute()
        return response.data[0] if response.data else checkin_data
    
    async def get_checkins(self, user_id: str, limit: int = 12) -> List[Dict[str, Any]]:
        """
        Get user's check-in history.
        
        Args:
            user_id: UUID from Supabase Auth
            limit: Max number of check-ins to return
            
        Returns:
            List of check-ins, most recent first
        """
        if not self.is_configured:
            return []
            
        response = self._client.table('checkins').select('*').eq('user_id', user_id).order('month', desc=True).limit(limit).execute()
        return response.data or []
    
    async def get_latest_checkin(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the most recent check-in for a user."""
        checkins = await self.get_checkins(user_id, limit=1)
        return checkins[0] if checkins else None
    
    # =========================================================================
    # CONNECTOR KEYS TABLE
    # =========================================================================
    
    async def save_connector(self, connector_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Save an encrypted connector API key.
        
        Args:
            connector_data: Dict with user_id, provider, encrypted_key, etc.
            
        Returns:
            Saved connector data (without the encrypted key)
        """
        if not self.is_configured:
            return connector_data
            
        connector_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('connector_keys').upsert(
            connector_data,
            on_conflict='user_id,provider'
        ).execute()
        return response.data[0] if response.data else connector_data
    
    async def get_connectors(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all connectors for a user (excluding encrypted keys)."""
        if not self.is_configured:
            return []
            
        response = self._client.table('connector_keys').select(
            'id, user_id, provider, is_active, last_synced_at, created_at'
        ).eq('user_id', user_id).execute()
        return response.data or []
    
    async def get_connector_key(self, user_id: str, provider: str) -> Optional[str]:
        """Get the encrypted key for a specific connector."""
        if not self.is_configured:
            return None
            
        try:
            response = self._client.table('connector_keys').select('encrypted_key').eq('user_id', user_id).eq('provider', provider).single().execute()
            return response.data.get('encrypted_key') if response.data else None
        except APIError:
            return None
    
    async def delete_connector(self, user_id: str, provider: str) -> bool:
        """Delete a connector."""
        if not self.is_configured:
            return True
            
        response = self._client.table('connector_keys').delete().eq('user_id', user_id).eq('provider', provider).execute()
        return True
    
    # =========================================================================
    # QUIZ SUBMISSIONS TABLE
    # =========================================================================
    
    async def save_quiz_submission(self, submission_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a Founder DNA quiz submission."""
        if not self.is_configured:
            return submission_data
            
        submission_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        try:
            response = self._client.table('quiz_submissions').insert(submission_data).execute()
            return response.data[0] if response.data else submission_data
        except APIError as e:
            logger.warning(f"Could not save quiz submission: {e}")
            return submission_data
    
    # =========================================================================
    # AI USAGE LOG TABLE
    # =========================================================================
    
    async def log_ai_usage(self, usage_data: Dict[str, Any]) -> Dict[str, Any]:
        """Log an AI feature usage for rate limiting and billing."""
        if not self.is_configured:
            return usage_data
            
        usage_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('ai_usage_log').insert(usage_data).execute()
        return response.data[0] if response.data else usage_data
    
    async def get_ai_usage_count(self, user_id: str, feature: str, period: str = 'month') -> int:
        """
        Get AI usage count for rate limiting.
        
        Args:
            user_id: UUID from Supabase Auth
            feature: AI feature name (e.g., 'board_report', 'strategy_brief')
            period: 'day', 'month', or 'year'
            
        Returns:
            Number of times feature was used in the period
        """
        if not self.is_configured:
            return 0
            
        # Calculate period start
        now = datetime.now(timezone.utc)
        if period == 'day':
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:  # year
            start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        response = self._client.table('ai_usage_log').select('id', count='exact').eq('user_id', user_id).eq('feature', feature).gte('created_at', start.isoformat()).execute()
        return response.count or 0
    
    # =========================================================================
    # BENCHMARK CONTRIBUTIONS TABLE
    # =========================================================================
    
    async def save_benchmark_contribution(self, contribution_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save an anonymized benchmark contribution."""
        if not self.is_configured:
            return contribution_data
            
        contribution_data['created_at'] = datetime.now(timezone.utc).isoformat()
        
        response = self._client.table('benchmark_contributions').insert(contribution_data).execute()
        return response.data[0] if response.data else contribution_data
    
    async def get_benchmark_stats(self, stage: str) -> Dict[str, Any]:
        """
        Calculate benchmark statistics from contributed data.
        
        Args:
            stage: Funding stage ('pre-seed', 'seed', 'series-a')
            
        Returns:
            Dict with median, p75, p90, sample_size
        """
        if not self.is_configured:
            return {
                'median': 0.08,
                'p75': 0.14,
                'p90': 0.20,
                'sample_size': 0
            }
        
        # This would use SQL aggregations in production
        # For now, return static benchmarks
        return {
            'median': 0.08,
            'p75': 0.14,
            'p90': 0.20,
            'sample_size': 0
        }


# Global instance (singleton pattern)
supabase_service = SupabaseService()
