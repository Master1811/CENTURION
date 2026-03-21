// FastAPI client for 100Cr Engine
// ================================
// Axios instance with:
//  - Auth token injection
//  - Structured request/response logging (dev only, no tokens logged)
//  - X-Request-ID capture for end-to-end tracing
//  - User-friendly error normalisation

import axios from 'axios';
import logger from '@/lib/logger';

const log = logger.scope('api');

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Track the last request-id returned by the backend (useful for support/debugging)
let _lastRequestId = null;
export const getLastRequestId = () => _lastRequestId;

// ─── Axios instance ────────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Inject auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tag request with a client-side trace ID so we can correlate
    // even before the backend responds with X-Request-ID
    config._clientRequestId = Math.random().toString(36).slice(2, 10);
    config._startTime = performance.now();

    // Log request start (dev only — logger suppresses in prod)
    log.debug('→ Request', {
      method: config.method?.toUpperCase(),
      path: config.url,
      client_request_id: config._clientRequestId,
      // Never log config.data — may contain credentials
    });

    return config;
  },
  (error) => {
    log.error('Request setup failed', {}, error);
    return Promise.reject(error);
  }
);

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    const durationMs = response.config._startTime
      ? (performance.now() - response.config._startTime).toFixed(1)
      : null;

    // Capture backend request-id for traceability
    const requestId = response.headers['x-request-id'];
    if (requestId) _lastRequestId = requestId;

    log.debug('← Response', {
      method: response.config.method?.toUpperCase(),
      path: response.config.url,
      status: response.status,
      duration_ms: durationMs ? Number(durationMs) : undefined,
      request_id: requestId,          // backend correlation id
      client_id: response.config._clientRequestId,
    });

    return response;
  },

  (error) => {
    const durationMs = error.config?._startTime
      ? (performance.now() - error.config._startTime).toFixed(1)
      : null;

    const requestId = error.response?.headers?.['x-request-id'];
    if (requestId) _lastRequestId = requestId;

    const status = error.response?.status;
    const path   = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // ── Rate-limit handling ──────────────────────────────────────────────────
    if (status === 429) {
      log.warn('Rate limit hit', {
        path, method, request_id: requestId,
        retry_after: error.response?.data?.reset_at,
      });
      return Promise.reject({
        type: 'rate_limited',
        message: error.response?.data?.error || 'Rate limit exceeded. Try again shortly.',
        remaining: error.response?.data?.remaining ?? 0,
        resetAt: error.response?.data?.reset_at,
        requestId,
      });
    }

    // ── Auth errors ──────────────────────────────────────────────────────────
    if (status === 401) {
      log.warn('Unauthorised — token may be expired', {
        path, method, request_id: requestId,
      });
    }

    // ── Server errors → Sentry ───────────────────────────────────────────────
    if (!status || status >= 500) {
      log.error(
        `Server error ${status ?? 'network'}`,
        { path, method, status, duration_ms: durationMs ? Number(durationMs) : undefined, request_id: requestId },
        error,
      );
    } else {
      // 4xx — log as warning (expected failures, not bugs)
      log.warn(`Client error ${status}`, {
        path, method, status,
        // Safe subset of backend detail — never log full response body
        detail: typeof error.response?.data?.detail === 'string'
          ? error.response.data.detail
          : undefined,
        request_id: requestId,
        duration_ms: durationMs ? Number(durationMs) : undefined,
      });
    }

    return Promise.reject(error);
  }
);

// ─── API functions ─────────────────────────────────────────────────────────────

/** Health check */
export const healthCheck = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/** Run a projection calculation */
export const runProjection = async (inputs) => {
  const response = await apiClient.post('/engine/projection', inputs);
  return response.data;
};

/** Save a projection (authenticated) */
export const saveProjection = async (projection) => {
  const response = await apiClient.post('/engine/projection/save', projection);
  return response.data;
};

/** Get a shared projection by slug */
export const getSharedProjection = async (slug) => {
  const response = await apiClient.get(`/engine/projection/${slug}`);
  return response.data;
};

/** Get benchmarks for a stage */
export const getBenchmarks = async (stage) => {
  const response = await apiClient.get(`/benchmarks/${stage}`);
  return response.data;
};

/** Submit a check-in (authenticated) */
export const submitCheckIn = async (checkInData) => {
  const response = await apiClient.post('/engine/checkin', checkInData);
  return response.data;
};

/** Get AI insight for check-in (authenticated, Founder Plan) */
export const getCheckInInsight = async (checkInId) => {
  const response = await apiClient.post('/ai/checkin-interpret', { checkInId });
  return response.data;
};

/** Generate board report (authenticated, Founder Plan) */
export const generateBoardReport = async () => {
  const response = await apiClient.post('/ai/board-report');
  return response.data;
};

export default apiClient;
