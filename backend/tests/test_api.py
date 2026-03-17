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
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["slug"] == slug
        assert "result" in data
        print(f"✓ Shared projection retrieval working for slug: {slug}")
    
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
        """Test invalid stage returns 400"""
        response = requests.get(f"{BASE_URL}/api/benchmarks/invalid-stage")
        assert response.status_code == 400
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
        """Test /api/checkins requires authentication"""
        response = requests.get(f"{BASE_URL}/api/checkins")
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
        
        assert "projection" in data
        assert "benchmark" in data
        assert "insight" in data
        assert "next_steps" in data
        print("✓ Quiz submission working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
