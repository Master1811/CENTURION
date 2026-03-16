// FastAPI client for 100Cr Engine

import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (placeholder for Supabase)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Rate limited
      return Promise.reject({
        type: 'rate_limited',
        message: error.response.data?.error || 'Rate limit exceeded',
        remaining: error.response.data?.remaining || 0,
        resetAt: error.response.data?.reset_at,
      });
    }
    return Promise.reject(error);
  }
);

// API functions

/**
 * Health check
 */
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/**
 * Run a projection calculation
 */
export const runProjection = async (inputs) => {
  const response = await apiClient.post('/engine/projection', inputs);
  return response.data;
};

/**
 * Save a projection (authenticated)
 */
export const saveProjection = async (projection) => {
  const response = await apiClient.post('/engine/projection/save', projection);
  return response.data;
};

/**
 * Get a shared projection by slug
 */
export const getSharedProjection = async (slug) => {
  const response = await apiClient.get(`/engine/projection/${slug}`);
  return response.data;
};

/**
 * Get benchmarks for a stage
 */
export const getBenchmarks = async (stage) => {
  const response = await apiClient.get(`/benchmarks/${stage}`);
  return response.data;
};

/**
 * Submit a check-in (authenticated)
 */
export const submitCheckIn = async (checkInData) => {
  const response = await apiClient.post('/engine/checkin', checkInData);
  return response.data;
};

/**
 * Get AI insight for check-in (authenticated, Founder Plan)
 */
export const getCheckInInsight = async (checkInId) => {
  const response = await apiClient.post('/ai/checkin-interpret', { checkInId });
  return response.data;
};

/**
 * Generate board report (authenticated, Founder Plan)
 */
export const generateBoardReport = async () => {
  const response = await apiClient.post('/ai/board-report');
  return response.data;
};

export default apiClient;
