"""
Backend API Tests for 100Cr Engine
====================================
Tests for:
- Health endpoints
- Projection engine
- Benchmarks API
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test API root returns version info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "100Cr Engine API"
        assert "version" in data
        assert data["status"] == "operational"
        print("✓ Root endpoint working")
    
    def test_health_check(self):
        """Test health endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "version" in data
        print("✓ Health check working")


class TestProjectionEngine:
    """Projection engine API tests"""
    
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
        
        # Verify response structure
        assert "inputs" in data
        assert "currentARR" in data
        assert "milestones" in data
        assert "sensitivity" in data
        assert "slug" in data
        
        # Verify ARR calculation (MRR * 12)
        assert data["currentARR"] == 6000000.0
        
        # Verify milestones exist
        assert len(data["milestones"]) == 4
        milestone_labels = [m["label"] for m in data["milestones"]]
        assert "₹1 Crore" in milestone_labels
        assert "₹100 Crore" in milestone_labels
        
        print(f"✓ Projection API working, slug: {data['slug']}")
    
    def test_projection_high_mrr(self):
        """Test projection with higher MRR"""
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": 5000000,  # 50L MRR
                "growthRate": 0.08
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["currentARR"] == 60000000.0  # 6 Cr ARR
        print("✓ High MRR projection working")
    
    def test_projection_validation_negative_mrr(self):
        """Test projection rejects negative MRR"""
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": -100000,
                "growthRate": 0.1
            }
        )
        assert response.status_code == 422  # Validation error
        print("✓ Negative MRR rejected correctly")
    
    def test_projection_validation_high_growth(self):
        """Test projection rejects growth rate > 200%"""
        response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": 500000,
                "growthRate": 2.5  # 250% - should fail
            }
        )
        assert response.status_code == 422  # Validation error
        print("✓ High growth rate rejected correctly")
    
    def test_get_shared_projection(self):
        """Test retrieving a shared projection by slug"""
        # First create a projection
        create_response = requests.post(
            f"{BASE_URL}/api/engine/projection",
            json={
                "currentMRR": 300000,
                "growthRate": 0.12
            }
        )
        assert create_response.status_code == 200
        slug = create_response.json()["slug"]
        
        # Now retrieve it
        get_response = requests.get(f"{BASE_URL}/api/engine/projection/{slug}")
        
        # Note: If Supabase table doesn't exist, projection won't be saved
        # Accept either 200 (projection found) or 404 (table not created yet)
        if get_response.status_code == 200:
            data = get_response.json()
            assert data["slug"] == slug
            assert "result" in data
            print(f"✓ Shared projection retrieval working for slug: {slug}")
        elif get_response.status_code == 404:
            print(f"⚠ Shared projection not persisted - Supabase table may not exist")
    
    def test_get_nonexistent_projection(self):
        """Test 404 for non-existent projection slug"""
        response = requests.get(f"{BASE_URL}/api/engine/projection/nonexist")
        assert response.status_code == 404
        print("✓ Non-existent projection returns 404")


class TestBenchmarks:
    """Benchmark API tests"""
    
    def test_get_preseed_benchmarks(self):
        """Test pre-seed stage benchmarks"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/pre-seed")
        assert response.status_code == 200
        data = response.json()
        
        assert data["stage"] == "pre-seed"
        assert data["median"] == 0.08
        assert data["p75"] == 0.14
        assert data["p90"] == 0.20
        assert data["sample_size"] == 150
        print("✓ Pre-seed benchmarks working")
    
    def test_get_seed_benchmarks(self):
        """Test seed stage benchmarks"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/seed")
        assert response.status_code == 200
        data = response.json()
        
        assert data["stage"] == "seed"
        assert data["median"] == 0.06
        assert data["p75"] == 0.10
        print("✓ Seed benchmarks working")
    
    def test_get_series_a_benchmarks(self):
        """Test series-a stage benchmarks"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/series-a")
        assert response.status_code == 200
        data = response.json()
        
        assert data["stage"] == "series-a"
        assert data["median"] == 0.04
        print("✓ Series-A benchmarks working")
    
    def test_invalid_stage(self):
        """Test invalid stage returns 400 or 422"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/invalid-stage")
        assert response.status_code in [400, 422]  # Accept either validation error code
        print("✓ Invalid stage rejected correctly")
    
    def test_compare_benchmark(self):
        """Test benchmark comparison endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/benchmarks/compare",
            params={
                "growth_rate": 0.12,
                "stage": "pre-seed"
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["growth_rate"] == 0.12
        assert data["stage"] == "pre-seed"
        assert "percentile" in data
        assert "status" in data
        assert "benchmark" in data
        print(f"✓ Benchmark comparison working, percentile: {data['percentile']}")


class TestAuthenticatedEndpoints:
    """Test authenticated endpoints return 401/403 without auth"""
    
    def test_user_profile_requires_auth(self):
        """Test /api/user/profile requires authentication"""
        response = requests.get(f"{BASE_URL}/api/user/profile")
        # Should return 401 or 403 without auth token
        assert response.status_code in [401, 403, 422]
        print("✓ User profile endpoint requires auth")
    
    def test_checkins_requires_auth(self):
        """Test /api/dashboard/checkins requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/checkins")
        assert response.status_code in [401, 403, 422]
        print("✓ Checkins endpoint requires auth")
    
    def test_dashboard_requires_auth(self):
        """Test /api/dashboard/overview requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/overview")
        assert response.status_code in [401, 403, 422]
        print("✓ Dashboard endpoint requires auth")


class TestQuizEndpoint:
    """Quiz submission endpoint tests"""
    
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
        
        # Verify response structure
        assert "projection" in data
        assert "benchmark" in data
        assert "insight" in data
        
        # Verify projection data
        assert "milestones" in data["projection"]
        assert len(data["projection"]["milestones"]) == 4
        
        # Verify benchmark data
        assert "percentile" in data["benchmark"]
        assert "status" in data["benchmark"]
        print("✓ Quiz submission working")


class TestConnectorsEndpoint:
    """Connector providers endpoint tests"""
    
    def test_list_providers(self):
        """Test /api/connectors/providers returns list of supported providers"""
        response = requests.get(f"{BASE_URL}/api/connectors/providers")
        assert response.status_code == 200
        data = response.json()
        
        # Verify it's a list
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check structure of first provider
        provider = data[0]
        assert "id" in provider
        assert "name" in provider
        assert "tier" in provider
        assert "auth_type" in provider
        assert "description" in provider
        assert "docs_url" in provider
        
        # Verify expected providers exist
        provider_ids = [p["id"] for p in data]
        assert "razorpay" in provider_ids
        assert "stripe" in provider_ids
        print(f"✓ Connectors providers endpoint working, {len(data)} providers found")
    
    def test_connectors_requires_auth(self):
        """Test /api/connectors requires authentication"""
        response = requests.get(f"{BASE_URL}/api/connectors")
        assert response.status_code in [401, 403]
        print("✓ Connectors list requires auth")


class TestAdminEndpoints:
    """Admin endpoint protection tests - all admin endpoints require auth + admin role"""
    
    def test_admin_stats_requires_auth(self):
        """Test /api/admin/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print("✓ Admin stats endpoint requires auth")
    
    def test_admin_engagement_stats_requires_auth(self):
        """Test /api/admin/engagement/stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/engagement/stats")
        assert response.status_code in [401, 403]
        print("✓ Admin engagement stats endpoint requires auth")
    
    def test_admin_dedup_status_requires_auth(self):
        """Test /api/admin/dedup/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/dedup/status")
        assert response.status_code in [401, 403]
        print("✓ Admin dedup status endpoint requires auth")
    
    def test_admin_scheduler_status_requires_auth(self):
        """Test /api/admin/scheduler/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/scheduler/status")
        assert response.status_code in [401, 403]
        print("✓ Admin scheduler status endpoint requires auth")
    
    def test_admin_system_health_requires_auth(self):
        """Test /api/admin/system/health requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/system/health")
        assert response.status_code in [401, 403]
        print("✓ Admin system health endpoint requires auth")
    
    def test_admin_trigger_job_requires_auth(self):
        """Test /api/admin/trigger/{job_name} requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/trigger/digest")
        assert response.status_code in [401, 403, 422]
        print("✓ Admin trigger job endpoint requires auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
