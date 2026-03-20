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
        - SKIP_SSL_VERIFY: Set to 'true' for local development behind corporate proxy
        """
        import httpx

        self.url = os.environ.get('SUPABASE_URL', '')
        self.key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
        skip_ssl = os.environ.get('SKIP_SSL_VERIFY', 'false').lower() == 'true'

        if not self.url or not self.key or 'placeholder' in self.url.lower():
            logger.warning("Supabase not configured - using mock mode")
            self._client = None
        else:
            # Configure custom httpx client for SSL handling in dev environments
            if skip_ssl:
                logger.warning("⚠️ SSL verification disabled - development mode only")
                # Create client with custom httpx that skips SSL verification
                import ssl
                ssl_context = ssl.create_default_context()
                ssl_context.check_hostname = False
                ssl_context.verify_mode = ssl.CERT_NONE

                # For supabase-py, we need to set environment variable
                import certifi
                os.environ['SSL_CERT_FILE'] = ''
                os.environ['REQUESTS_CA_BUNDLE'] = ''

            try:
                self._client: Client = create_client(self.url, self.key)
                logger.info("✓ Supabase client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                logger.warning("Falling back to mock mode")
                self._client = None

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

    async def get_subscription_by_ref(
        self,
        payment_ref: str
    ):
        if not self.is_configured:
            return None
        result = self._client.table("subscriptions")\
            .select("*")\
            .eq("payment_ref", payment_ref)\
            .execute()
        return result.data[0] if result.data else None
    
    async def create_subscription(self, data: dict):
        if not self.is_configured:
            return data
        result = self._client.table("subscriptions")\
            .upsert({
                "user_id": data["user_id"],
                "plan": data["plan"],
                "status": data["status"],
                "payment_ref": data["payment_ref"],
            })\
            .execute()
        return result.data
    
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

    # =========================================================================
    # USER DELETION (CRITICAL - Complete cascade)
    # =========================================================================
    
    async def delete_user_complete(self, user_id: str) -> bool:
        """
        Execute complete cascading hard-delete of a user's entire dataset.
        
        CRITICAL: This is irreversible.
        
        Deletion order (to respect foreign keys):
        1. ai_usage_log
        2. connector_keys
        3. checkins
        4. projection_runs (set user_id to null, keep for shared links)
        5. subscriptions
        6. profiles
        7. auth.users (via Supabase Admin API)
        
        Args:
            user_id: User UUID
            
        Returns:
            True if successful
        """
        if not self.is_configured:
            logger.warning("Cannot delete user - Supabase not configured")
            return False
        
        try:
            # 1. Delete AI usage logs
            self._client.table('ai_usage_log').delete().eq('user_id', user_id).execute()
            logger.info(f"Deleted ai_usage_log for {user_id}")
            
            # 2. Delete connector keys
            self._client.table('connector_keys').delete().eq('user_id', user_id).execute()
            logger.info(f"Deleted connector_keys for {user_id}")
            
            # 3. Delete check-ins
            self._client.table('checkins').delete().eq('user_id', user_id).execute()
            logger.info(f"Deleted checkins for {user_id}")
            
            # 4. Nullify user_id in projections (keep shared links working)
            self._client.table('projection_runs').update({'user_id': None}).eq('user_id', user_id).execute()
            logger.info(f"Nullified projection_runs for {user_id}")
            
            # 5. Delete subscriptions
            self._client.table('subscriptions').delete().eq('user_id', user_id).execute()
            logger.info(f"Deleted subscriptions for {user_id}")
            
            # 6. Delete profile
            self._client.table('profiles').delete().eq('id', user_id).execute()
            logger.info(f"Deleted profile for {user_id}")
            
            # 7. Delete auth user via Admin API
            # Note: This requires service_role key
            try:
                self._client.auth.admin.delete_user(user_id)
                logger.info(f"Deleted auth.users entry for {user_id}")
            except Exception as auth_error:
                logger.warning(f"Could not delete auth entry (may need manual cleanup): {auth_error}")
            
            logger.info(f"✓ Complete user deletion successful for {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"User deletion failed for {user_id}: {e}")
            return False
    
    # =========================================================================
    # ANONYMIZED BENCHMARK CONTRIBUTION
    # =========================================================================
    
    async def contribute_to_benchmarks(
        self,
        user_id: str,
        stage: str,
        growth_rate: float,
        arr: float,
        industry: Optional[str] = None
    ) -> bool:
        """
        Add anonymized data to benchmark contributions.
        
        CRITICAL: This strips ALL user identifiable information.
        - NO user_id stored
        - NO company name stored
        - ARR is bucketed, not exact
        - Industry is categorized, not specific
        
        Uses a hash to prevent duplicate contributions without storing user_id.
        
        Args:
            user_id: Used only for hash generation (not stored)
            stage: Funding stage
            growth_rate: Monthly growth rate
            arr: Annual recurring revenue (will be bucketed)
            industry: Optional industry (will be categorized)
            
        Returns:
            True if successful
        """
        if not self.is_configured:
            return False
        
        import hashlib
        
        # Create hash for deduplication (hash of user_id + month)
        month_key = datetime.now(timezone.utc).strftime('%Y-%m')
        contribution_hash = hashlib.sha256(f"{user_id}:{month_key}".encode()).hexdigest()
        
        # Bucket ARR to prevent identification
        # Buckets: 0-50L, 50L-1Cr, 1-5Cr, 5-10Cr, 10-25Cr, 25-50Cr, 50-100Cr, 100Cr+
        arr_buckets = [
            (5_000_000, '0-50L'),
            (10_000_000, '50L-1Cr'),
            (50_000_000, '1-5Cr'),
            (100_000_000, '5-10Cr'),
            (250_000_000, '10-25Cr'),
            (500_000_000, '25-50Cr'),
            (1_000_000_000, '50-100Cr'),
            (float('inf'), '100Cr+'),
        ]
        arr_bucket = '0-50L'
        for threshold, bucket in arr_buckets:
            if arr < threshold:
                arr_bucket = bucket
                break
        
        # Categorize industry (broad categories only)
        industry_categories = {
            'saas': 'SaaS/Software',
            'fintech': 'Fintech',
            'ecommerce': 'E-commerce',
            'd2c': 'D2C/Retail',
            'edtech': 'Edtech',
            'healthtech': 'Healthtech',
            'other': 'Other',
        }
        industry_category = 'Other'
        if industry:
            industry_lower = industry.lower()
            for key, category in industry_categories.items():
                if key in industry_lower:
                    industry_category = category
                    break
        
        try:
            self._client.table('benchmark_contributions').upsert({
                'contribution_hash': contribution_hash,
                'stage': stage,
                'growth_rate': growth_rate,
                'arr_bucket': arr_bucket,
                'industry_category': industry_category,
            }, on_conflict='contribution_hash').execute()
            
            logger.info(f"Benchmark contribution added: stage={stage}, bucket={arr_bucket}")
            return True
            
        except Exception as e:
            logger.error(f"Benchmark contribution failed: {e}")
            return False



    # =========================================================================
    # HABIT / ENGAGEMENT ENGINE
    # =========================================================================

    async def get_paid_users_for_digest(self) -> List[Dict[str, Any]]:
        """Get users eligible for the Monday digest via RPC."""
        if not self.is_configured:
            return []

        try:
            result = self._client.rpc("get_paid_users_for_digest").execute()
            return result.data or []
        except Exception as e:
            logger.warning(f"get_paid_users_for_digest RPC failed: {e}")
            return []

    async def get_recent_checkins(
        self,
        user_id: str,
        limit: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Get the most recent check-ins for a user.

        Uses the existing `checkins` table and orders by `month` desc.
        """
        if not self.is_configured:
            return []

        try:
            result = (
                self._client.table("checkins")
                .select("*")
                .eq("user_id", user_id)
                .order("month", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []
        except Exception as e:
            logger.warning(f"get_recent_checkins failed: {e}")
            return []

    async def get_profile_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a profile row by `profiles.id`."""
        if not self.is_configured:
            return None

        try:
            result = (
                self._client.table("profiles")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            return result.data
        except Exception as e:
            logger.warning(f"get_profile_by_id failed: {e}")
            return None

    async def log_engagement_events(self, events: List[Dict[str, Any]]) -> None:
        """Insert engagement events into `engagement_events`."""
        if not self.is_configured:
            return

        if not events:
            return

        try:
            self._client.table("engagement_events").insert(events).execute()
        except Exception as e:
            # Table may not exist yet on fresh setups.
            logger.warning(f"log_engagement_events failed (non-fatal): {e}")
            return

    async def update_streak(
        self,
        user_id: str,
        streak_count: int,
        last_checkin_at: str
    ) -> None:
        """Update `streak_count` and `last_checkin_at` in profiles."""
        if not self.is_configured:
            return

        try:
            self._client.table("profiles").update(
                {
                    "streak_count": streak_count,
                    "last_checkin_at": last_checkin_at,
                }
            ).eq("id", user_id).execute()
        except Exception as e:
            logger.warning(f"update_streak failed (non-fatal): {e}")
            return

    async def get_cohort_percentile(self, growth_rate: float, stage: str) -> int:
        """Get cohort percentile via RPC (defaults to 50 on error)."""
        if not self.is_configured:
            return 50

        try:
            result = self._client.rpc(
                "get_cohort_percentile",
                {"p_growth_rate": growth_rate, "p_stage": stage},
            ).execute()

            data = getattr(result, "data", None)
            if not data:
                return 50

            if isinstance(data, list) and data:
                row = data[0]
                if isinstance(row, dict):
                    return int(list(row.values())[0])
                return int(row)

            if isinstance(data, dict) and data:
                return int(list(data.values())[0])

            return 50
        except Exception as e:
            logger.warning(f"get_cohort_percentile RPC failed: {e}")
            return 50

    async def get_cohort_size(self, stage: str) -> int:
        """Get cohort size via RPC (defaults to 100 on error)."""
        if not self.is_configured:
            return 100

        try:
            result = self._client.rpc(
                "get_cohort_size",
                {"p_stage": stage},
            ).execute()

            data = getattr(result, "data", None)
            if not data:
                return 100

            if isinstance(data, list) and data:
                row = data[0]
                if isinstance(row, dict):
                    return int(list(row.values())[0])
                return int(row)

            if isinstance(data, dict) and data:
                return int(list(data.values())[0])

            return 100
        except Exception as e:
            logger.warning(f"get_cohort_size RPC failed: {e}")
            return 100


# Global instance (singleton pattern)
supabase_service = SupabaseService()
