#!/usr/bin/env python3
"""
Backend API Testing for 100Cr Engine
Tests all backend endpoints and core functionality
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })
        
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []
    
    def log_result(self, test_name: str, passed: bool, message: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ PASS: {test_name}")
            if message:
                print(f"   {message}")
        else:
            print(f"❌ FAIL: {test_name}")
            print(f"   {message}")
        
        self.results.append({
            'test': test_name,
            'passed': passed,
            'message': message,
            'response_data': response_data
        })
    
    def test_health_endpoint(self):
        """Test the health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'ok':
                    self.log_result("Health endpoint", True, f"Status: {data}")
                    return True
                else:
                    self.log_result("Health endpoint", False, f"Expected status 'ok', got: {data}")
            else:
                self.log_result("Health endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
        
        except Exception as e:
            self.log_result("Health endpoint", False, f"Exception: {str(e)}")
        
        return False
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'version' in data:
                    self.log_result("Root API endpoint", True, f"Data: {data}")
                    return True
                else:
                    self.log_result("Root API endpoint", False, f"Missing required fields: {data}")
            else:
                self.log_result("Root API endpoint", False, f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Root API endpoint", False, f"Exception: {str(e)}")
        
        return False
    
    def test_projection_endpoint(self):
        """Test the projection calculation endpoint"""
        test_data = {
            "currentMRR": 200000,  # ₹2 Lakh
            "growthRate": 0.08,    # 8% monthly
            "monthsToProject": 120,
            "targetRevenue": 1000000000  # ₹100 Crore
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/engine/projection",
                json=test_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['inputs', 'currentARR', 'milestones', 'sensitivity', 'slug']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Validate milestones
                    milestones = data.get('milestones', [])
                    expected_milestone_values = [10000000, 100000000, 500000000, 1000000000]  # ₹1Cr, ₹10Cr, ₹50Cr, ₹100Cr
                    
                    milestone_values = [m.get('value') for m in milestones]
                    
                    if all(value in milestone_values for value in expected_milestone_values):
                        self.log_result("Projection calculation", True, 
                                      f"Returned {len(milestones)} milestones, slug: {data.get('slug')}")
                        return True
                    else:
                        self.log_result("Projection calculation", False, 
                                      f"Missing expected milestones. Got: {milestone_values}")
                else:
                    self.log_result("Projection calculation", False, 
                                  f"Missing fields: {missing_fields}")
            else:
                self.log_result("Projection calculation", False, 
                              f"Status code: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Projection calculation", False, f"Exception: {str(e)}")
        
        return False
    
    def test_benchmark_endpoints(self):
        """Test benchmark-related endpoints"""
        stages = ['pre-seed', 'seed', 'series-a']
        
        for stage in stages:
            try:
                # Test get benchmarks
                response = self.session.get(f"{self.base_url}/api/benchmarks/{stage}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    required_fields = ['stage', 'median', 'p75', 'sample_size']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_result(f"Benchmark data ({stage})", True, 
                                      f"Median: {data.get('median')}, P75: {data.get('p75')}")
                    else:
                        self.log_result(f"Benchmark data ({stage})", False, 
                                      f"Missing fields: {missing_fields}")
                else:
                    self.log_result(f"Benchmark data ({stage})", False, 
                                  f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result(f"Benchmark data ({stage})", False, f"Exception: {str(e)}")
        
        # Test benchmark comparison
        try:
            response = self.session.post(
                f"{self.base_url}/api/benchmarks/compare?growth_rate=0.08&stage=pre-seed",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['growthRate', 'stage', 'percentile', 'status', 'benchmark']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_result("Benchmark comparison", True, 
                                  f"Percentile: {data.get('percentile')}%, Status: {data.get('status')}")
                    return True
                else:
                    self.log_result("Benchmark comparison", False, 
                                  f"Missing fields: {missing_fields}")
            else:
                self.log_result("Benchmark comparison", False, 
                              f"Status code: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_result("Benchmark comparison", False, f"Exception: {str(e)}")
        
        return False
    
    def test_invalid_inputs(self):
        """Test API validation with invalid inputs"""
        # Test invalid projection inputs
        invalid_data = {
            "currentMRR": -1000,  # Negative revenue
            "growthRate": 5.0,    # 500% growth (invalid)
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/engine/projection",
                json=invalid_data,
                timeout=10
            )
            
            if response.status_code == 422:  # Validation error expected
                self.log_result("Input validation", True, "Correctly rejected invalid inputs")
                return True
            else:
                self.log_result("Input validation", False, 
                              f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_result("Input validation", False, f"Exception: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all tests and print summary"""
        print("🚀 Starting 100Cr Engine Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_health_endpoint()
        self.test_root_endpoint()
        
        # Test core functionality
        self.test_projection_endpoint()
        self.test_benchmark_endpoints()
        
        # Test validation
        self.test_invalid_inputs()
        
        print("=" * 60)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check logs above.")
            return False

def main():
    # Use the public endpoint from frontend .env
    BASE_URL = "https://api.your-domain.com"
    
    tester = APITester(BASE_URL)
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'base_url': BASE_URL,
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0
            },
            'results': tester.results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())