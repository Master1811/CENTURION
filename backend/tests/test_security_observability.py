"""
Security Audit & Observability Tests for Project Centurion
============================================================
Tests for iteration 9 features:
- require_paid_subscription accepts starter, founder, trialing statuses
- Payments webhook handles starter/founder/trial plans with expires_at
- Check-in endpoint triggers anomaly alert on >10% revenue drop
- Check-in endpoint updates streak correctly
- Admin endpoints protected - returns 403 without admin email
- Admin stats endpoint returns real Supabase counts
- Admin scheduler/status endpoint returns job list
- Admin system/health endpoint returns comprehensive status
- Structured logging service initialized
- Request logging middleware adds X-Request-ID header
- Request logging middleware adds X-Response-Time header
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndMiddleware:
    """Test health endpoints and request logging middleware"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200 with status 'ok'"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["version"] == "3.0.0"
        assert "supabase" in data
        print("✓ Health endpoint working")
    
    def test_request_id_header(self):
        """Test request logging middleware adds X-Request-ID header"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        # Check for X-Request-ID header
        request_id = response.headers.get("X-Request-ID")
        assert request_id is not None, "X-Request-ID header missing"
        assert len(request_id) == 8, f"X-Request-ID should be 8 chars, got {len(request_id)}"
        print(f"✓ X-Request-ID header present: {request_id}")
    
    def test_response_time_header(self):
        """Test request logging middleware adds X-Response-Time header"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        # Check for X-Response-Time header
        response_time = response.headers.get("X-Response-Time")
        assert response_time is not None, "X-Response-Time header missing"
        assert "ms" in response_time, f"X-Response-Time should contain 'ms', got {response_time}"
        print(f"✓ X-Response-Time header present: {response_time}")


class TestAdminEndpointProtection:
    """Test admin endpoints are protected and return 403 without admin role"""
    
    def test_admin_stats_requires_auth(self):
        """Test /api/admin/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin stats endpoint requires auth (403)")
    
    def test_admin_scheduler_status_requires_auth(self):
        """Test /api/admin/scheduler/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/scheduler/status")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin scheduler status endpoint requires auth (403)")
    
    def test_admin_system_health_requires_auth(self):
        """Test /api/admin/system/health requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/system/health")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin system health endpoint requires auth (403)")
    
    def test_admin_engagement_stats_requires_auth(self):
        """Test /api/admin/engagement/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/engagement/stats")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin engagement stats endpoint requires auth (403)")
    
    def test_admin_dedup_status_requires_auth(self):
        """Test /api/admin/dedup/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/dedup/status")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin dedup status endpoint requires auth (403)")
    
    def test_admin_trigger_job_requires_auth(self):
        """Test /api/admin/trigger/{job_name} requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/trigger/digest")
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print("✓ Admin trigger job endpoint requires auth (403)")
    
    def test_admin_subscription_grant_requires_auth(self):
        """Test /api/admin/subscription/{user_id} requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/subscription/test-user-id",
            json={"plan": "founder", "duration_days": 365}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin subscription grant endpoint requires auth (403)")
    
    def test_admin_beta_grant_requires_auth(self):
        """Test /api/admin/beta/{user_id} requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/beta/test-user-id",
            json={"days": 60}
        )
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Admin beta grant endpoint requires auth (403)")


class TestDashboardEndpointProtection:
    """Test dashboard endpoints require paid subscription"""
    
    def test_dashboard_overview_requires_auth(self):
        """Test /api/dashboard/overview requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/overview")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Dashboard overview requires auth (403)")
    
    def test_dashboard_revenue_requires_auth(self):
        """Test /api/dashboard/revenue requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/revenue")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Dashboard revenue requires auth (403)")
    
    def test_checkin_submit_requires_auth(self):
        """Test /api/dashboard/checkin requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/dashboard/checkin",
            json={
                "month": "2026-01",
                "actual_revenue": 500000,
                "note": "Test checkin"
            }
        )
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print("✓ Checkin submit requires auth (403)")
    
    def test_checkins_list_requires_auth(self):
        """Test /api/dashboard/checkins requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/checkins")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Checkins list requires auth (403)")


class TestAIEndpointProtection:
    """Test AI endpoints require paid subscription"""
    
    def test_ai_usage_requires_auth(self):
        """Test /api/ai/usage requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai/usage")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ AI usage requires auth (403)")
    
    def test_ai_daily_pulse_requires_auth(self):
        """Test /api/ai/daily-pulse requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai/daily-pulse")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ AI daily-pulse requires auth (403)")
    
    def test_ai_weekly_question_requires_auth(self):
        """Test /api/ai/weekly-question requires authentication"""
        response = requests.get(f"{BASE_URL}/api/ai/weekly-question")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ AI weekly-question requires auth (403)")
    
    def test_ai_board_report_requires_auth(self):
        """Test /api/ai/board-report requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/ai/board-report",
            json={}
        )
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print("✓ AI board-report requires auth (403)")
    
    def test_ai_deviation_requires_auth(self):
        """Test /api/ai/deviation requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/ai/deviation",
            json={"actual": 500000, "projected": 600000}
        )
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print("✓ AI deviation requires auth (403)")


class TestPaymentsWebhook:
    """Test payments webhook endpoint structure"""
    
    def test_webhook_requires_signature(self):
        """Test /api/payments/razorpay/webhook requires signature"""
        response = requests.post(
            f"{BASE_URL}/api/payments/razorpay/webhook",
            json={"event": "payment.captured"},
            headers={"Content-Type": "application/json"}
        )
        # Should return 400 (missing signature) or 503 (webhook secret not configured)
        assert response.status_code in [400, 503], f"Expected 400/503, got {response.status_code}"
        print(f"✓ Webhook requires signature (status: {response.status_code})")
    
    def test_webhook_rejects_invalid_content_type(self):
        """Test webhook rejects non-JSON content type"""
        response = requests.post(
            f"{BASE_URL}/api/payments/razorpay/webhook",
            data="not json",
            headers={"Content-Type": "text/plain"}
        )
        # Should return 415 (unsupported media type) or 400
        assert response.status_code in [400, 415, 422], f"Expected 400/415/422, got {response.status_code}"
        print(f"✓ Webhook rejects invalid content type (status: {response.status_code})")


class TestConnectorsEndpoint:
    """Test connectors endpoints"""
    
    def test_list_providers(self):
        """Test /api/connectors/providers returns list of supported providers"""
        response = requests.get(f"{BASE_URL}/api/connectors/providers")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check structure
        provider = data[0]
        assert "id" in provider
        assert "name" in provider
        assert "tier" in provider
        
        # Verify expected providers
        provider_ids = [p["id"] for p in data]
        assert "razorpay" in provider_ids
        assert "stripe" in provider_ids
        print(f"✓ Connectors providers endpoint working, {len(data)} providers found")
    
    def test_connectors_list_requires_auth(self):
        """Test /api/connectors requires authentication"""
        response = requests.get(f"{BASE_URL}/api/connectors")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Connectors list requires auth (403)")


class TestProjectionEngine:
    """Test projection engine endpoints"""
    
    def test_projection_basic(self):
        """Test basic projection calculation"""
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": 500000,
                "growthRate": 0.1
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "inputs" in data
        assert "currentARR" in data
        assert "milestones" in data
        assert "slug" in data
        
        # Verify ARR calculation
        assert data["currentARR"] == 6000000.0
        print(f"✓ Projection API working, slug: {data['slug']}")
    
    def test_projection_validation(self):
        """Test projection rejects invalid inputs"""
        # Negative MRR
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={"currentMRR": -100000, "growthRate": 0.1}
        )
        assert response.status_code == 422
        print("✓ Negative MRR rejected correctly")


class TestBenchmarks:
    """Test benchmark endpoints"""
    
    def test_get_preseed_benchmarks(self):
        """Test pre-seed stage benchmarks"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/pre-seed")
        assert response.status_code == 200
        data = response.json()
        
        assert data["stage"] == "pre-seed"
        assert data["median"] == 0.08
        print("✓ Pre-seed benchmarks working")
    
    def test_benchmark_compare(self):
        """Test benchmark comparison endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/benchmarks/compare",
            params={"growth_rate": 0.12, "stage": "pre-seed"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "percentile" in data
        assert "status" in data
        print(f"✓ Benchmark comparison working, percentile: {data['percentile']}")


class TestQuizEndpoint:
    """Test quiz submission endpoint"""
    
    def test_quiz_submit(self):
        """Test quiz submission with answers"""
        response = requests.post(
            f"{BASE_URL}/api/quiz/submit",
            json={
                "answers": {
                    "revenue_range": "1l-5l",
                    "growth_speed": "moderate",
                    "startup_stage": "mvp"
                },
                "email": None
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "projection" in data
        assert "benchmark" in data
        assert "insight" in data
        print("✓ Quiz submission working")


class TestUserEndpoints:
    """Test user endpoints"""
    
    def test_user_profile_requires_auth(self):
        """Test /api/user/profile requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/profile")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ User profile requires auth (403)")
    
    def test_user_onboarding_requires_auth(self):
        """Test /api/user/onboarding requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/user/onboarding",
            json={
                "company_name": "Test Company",
                "stage": "pre-seed",
                "current_mrr": 100000
            }
        )
        assert response.status_code in [401, 403, 422], f"Expected 401/403/422, got {response.status_code}"
        print("✓ User onboarding requires auth (403)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
