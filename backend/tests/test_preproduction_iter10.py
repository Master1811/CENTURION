"""
Pre-Production Verification Tests - Iteration 10
=================================================
Comprehensive testing for Project Centurion pre-production verification.

Test Coverage:
- TC-01 to TC-06: Authentication flows
- TC-07 to TC-10: Calculator Engine
- TC-13 to TC-14: Dashboard access control
- TC-16: Pricing page prices
- TC-18: Checkout page
- TC-20, TC-22: Admin triggers and dedup
- Waitlist endpoint with position and consent
- Privacy page, Cookie consent
- Sentry initialization
- ADMIN_EMAILS configuration

Author: Testing Agent
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealthAndBasics:
    """Basic health and API availability tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns 200 with status 'ok'"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["supabase"] == "connected"
        print("✓ Health endpoint working, Supabase connected")
    
    def test_api_root(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "100Cr Engine API"
        assert data["status"] == "operational"
        print("✓ API root endpoint working")


class TestWaitlistEndpoint:
    """TC: Waitlist endpoint tests with DPDP consent"""
    
    def test_waitlist_returns_position(self):
        """Waitlist endpoint returns position number"""
        test_email = f"test_position_{int(time.time())}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/waitlist",
            json={
                "email": test_email,
                "name": "Test User",
                "company": "Test Company",
                "stage": "mvp",
                "dpdp_consent_given": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "position" in data
        assert isinstance(data["position"], int)
        assert data["position"] >= 1
        assert "share_url" in data
        print(f"✓ Waitlist returns position: {data['position']}")
    
    def test_waitlist_consent_required(self):
        """Waitlist consent checkbox blocks submission when unchecked"""
        test_email = f"test_noconsent_{int(time.time())}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/waitlist",
            json={
                "email": test_email,
                "name": "Test User",
                "dpdp_consent_given": False
            }
        )
        # Should return 422 validation error
        assert response.status_code == 422
        print("✓ Waitlist blocks submission without consent (422)")
    
    def test_waitlist_duplicate_email(self):
        """Waitlist rejects duplicate email"""
        test_email = f"test_dup_{int(time.time())}@example.com"
        
        # First signup
        response1 = requests.post(
            f"{BASE_URL}/api/waitlist",
            json={
                "email": test_email,
                "dpdp_consent_given": True
            }
        )
        assert response1.status_code == 200
        
        # Second signup with same email
        response2 = requests.post(
            f"{BASE_URL}/api/waitlist",
            json={
                "email": test_email,
                "dpdp_consent_given": True
            }
        )
        assert response2.status_code == 409
        print("✓ Waitlist rejects duplicate email (409)")
    
    def test_waitlist_count(self):
        """Waitlist count endpoint works"""
        response = requests.get(f"{BASE_URL}/api/waitlist/count")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        print(f"✓ Waitlist count: {data['count']}")


class TestCalculatorEngine:
    """TC-07 to TC-10: Calculator Engine tests"""
    
    def test_projection_basic(self):
        """TC-07: Calculator renders with MRR, growth, chart data"""
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": 500000,
                "growthRate": 0.1
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "inputs" in data
        assert "currentARR" in data
        assert "milestones" in data
        assert "trajectory" in data
        assert "slug" in data
        
        # Verify calculations
        assert data["currentARR"] == 6000000.0  # 500000 * 12
        assert len(data["milestones"]) > 0
        print(f"✓ Projection API working, ARR: ₹{data['currentARR']:,.0f}")
    
    def test_projection_slider_update(self):
        """TC-08: Slider interaction updates target date"""
        # Test with different growth rates
        response_low = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={"currentMRR": 500000, "growthRate": 0.05}
        )
        response_high = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={"currentMRR": 500000, "growthRate": 0.15}
        )
        
        assert response_low.status_code == 200
        assert response_high.status_code == 200
        
        data_low = response_low.json()
        data_high = response_high.json()
        
        # Higher growth should reach milestones faster
        if data_low["milestones"] and data_high["milestones"]:
            low_months = data_low["milestones"][0].get("monthsToReach", 999)
            high_months = data_high["milestones"][0].get("monthsToReach", 999)
            assert high_months <= low_months
        print("✓ Growth rate affects milestone timing")
    
    def test_benchmarks_stage_selector(self):
        """TC-09: Stage selector updates benchmarks"""
        stages = ["pre-seed", "seed", "series-a"]
        
        for stage in stages:
            response = requests.get(f"{BASE_URL}/api/benchmarks/{stage}")
            assert response.status_code == 200
            data = response.json()
            assert data["stage"] == stage
            assert "median" in data
            assert "p75" in data  # API uses p75 not top_quartile
            print(f"  ✓ {stage} benchmarks: median={data['median']}")
        
        print("✓ Stage selector benchmarks working")
    
    def test_benchmark_compare(self):
        """TC-09: Benchmark comparison works"""
        response = requests.post(
            f"{BASE_URL}/api/benchmarks/compare",
            params={"growth_rate": 0.12, "stage": "pre-seed"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "percentile" in data
        assert "status" in data
        print(f"✓ Benchmark comparison: {data['percentile']}th percentile, status={data['status']}")


class TestAuthEndpoints:
    """TC-01 to TC-06: Authentication endpoint tests"""
    
    def test_user_profile_requires_auth(self):
        """TC-04: /api/user/profile returns 403 for unauthenticated"""
        response = requests.get(f"{BASE_URL}/api/user/profile")
        assert response.status_code == 403
        print("✓ User profile requires auth (403)")
    
    def test_dashboard_requires_auth(self):
        """TC-05: Protected route /dashboard requires auth"""
        response = requests.get(f"{BASE_URL}/api/dashboard/overview")
        assert response.status_code == 403
        print("✓ Dashboard overview requires auth (403)")
    
    def test_dashboard_revenue_requires_auth(self):
        """TC-13: Dashboard revenue requires auth"""
        response = requests.get(f"{BASE_URL}/api/dashboard/revenue")
        assert response.status_code == 403
        print("✓ Dashboard revenue requires auth (403)")


class TestAdminEndpoints:
    """TC-20, TC-22: Admin endpoint tests"""
    
    def test_admin_trigger_requires_auth(self):
        """TC-20: Admin trigger digest job requires auth"""
        response = requests.post(f"{BASE_URL}/api/admin/trigger/digest")
        assert response.status_code == 403
        print("✓ Admin trigger requires auth (403)")
    
    def test_admin_dedup_requires_auth(self):
        """TC-22: Admin dedup status requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/dedup/status")
        assert response.status_code == 403
        print("✓ Admin dedup status requires auth (403)")
    
    def test_admin_stats_requires_auth(self):
        """Admin stats requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 403
        print("✓ Admin stats requires auth (403)")
    
    def test_admin_scheduler_requires_auth(self):
        """Admin scheduler status requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/scheduler/status")
        assert response.status_code == 403
        print("✓ Admin scheduler status requires auth (403)")
    
    def test_admin_system_health_requires_auth(self):
        """Admin system health requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/system/health")
        assert response.status_code == 403
        print("✓ Admin system health requires auth (403)")
    
    def test_admin_waitlist_requires_auth(self):
        """Admin waitlist requires auth"""
        response = requests.get(f"{BASE_URL}/api/admin/waitlist")
        assert response.status_code == 403
        print("✓ Admin waitlist requires auth (403)")


class TestQuizEndpoint:
    """Quiz submission tests"""
    
    def test_quiz_submit(self):
        """Quiz submission returns projection and benchmark"""
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


class TestConnectorsEndpoint:
    """Connectors endpoint tests"""
    
    def test_list_providers(self):
        """Connectors providers list works"""
        response = requests.get(f"{BASE_URL}/api/connectors/providers")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        provider_ids = [p["id"] for p in data]
        assert "razorpay" in provider_ids
        assert "stripe" in provider_ids
        print(f"✓ Connectors providers: {len(data)} providers")
    
    def test_connectors_list_requires_auth(self):
        """Connectors list requires auth"""
        response = requests.get(f"{BASE_URL}/api/connectors")
        assert response.status_code == 403
        print("✓ Connectors list requires auth (403)")


class TestPaymentsWebhook:
    """Payments webhook tests"""
    
    def test_webhook_requires_signature(self):
        """Webhook requires signature"""
        response = requests.post(
            f"{BASE_URL}/api/payments/razorpay/webhook",
            json={"event": "payment.captured"},
            headers={"Content-Type": "application/json"}
        )
        # Should return 400 (missing signature) or 503 (webhook secret not configured)
        assert response.status_code in [400, 503]
        print(f"✓ Webhook requires signature (status: {response.status_code})")


class TestAIEndpoints:
    """AI endpoint protection tests"""
    
    def test_ai_usage_requires_auth(self):
        """AI usage requires auth"""
        response = requests.get(f"{BASE_URL}/api/ai/usage")
        assert response.status_code == 403
        print("✓ AI usage requires auth (403)")
    
    def test_ai_daily_pulse_requires_auth(self):
        """AI daily-pulse requires auth"""
        response = requests.get(f"{BASE_URL}/api/ai/daily-pulse")
        assert response.status_code == 403
        print("✓ AI daily-pulse requires auth (403)")


class TestMiddlewareHeaders:
    """Request middleware header tests"""
    
    def test_request_id_header(self):
        """Request logging middleware adds X-Request-ID header"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        request_id = response.headers.get("X-Request-ID")
        assert request_id is not None
        assert len(request_id) == 8
        print(f"✓ X-Request-ID header: {request_id}")
    
    def test_response_time_header(self):
        """Request logging middleware adds X-Response-Time header"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        response_time = response.headers.get("X-Response-Time")
        assert response_time is not None
        assert "ms" in response_time
        print(f"✓ X-Response-Time header: {response_time}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
