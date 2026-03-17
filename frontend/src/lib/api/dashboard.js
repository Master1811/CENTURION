// API Service for Dashboard
// =========================
// Centralized API calls for all dashboard components
// Uses authenticated requests with Supabase JWT

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Make an authenticated API request
 */
async function authFetch(endpoint, options = {}, accessToken = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    const errorMessage = error.detail || `HTTP ${response.status}`;
    const err = new Error(errorMessage);
    err.status = response.status;
    err.data = error;
    throw err;
  }

  return response.json();
}

// ============================================================================
// Dashboard Overview API
// ============================================================================

export async function fetchDashboardOverview(accessToken) {
  return authFetch('/api/dashboard/overview', {}, accessToken);
}

export async function fetchRevenueIntelligence(accessToken) {
  return authFetch('/api/dashboard/revenue', {}, accessToken);
}

// ============================================================================
// User Profile API
// ============================================================================

export async function fetchUserProfile(accessToken) {
  return authFetch('/api/user/profile', {}, accessToken);
}

export async function updateUserProfile(accessToken, profileData) {
  return authFetch('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }, accessToken);
}

export async function completeOnboarding(accessToken, profileData) {
  return authFetch('/api/user/onboarding', {
    method: 'POST',
    body: JSON.stringify(profileData),
  }, accessToken);
}

// ============================================================================
// Check-in API
// ============================================================================

export async function submitCheckIn(accessToken, checkInData) {
  return authFetch('/api/checkin', {
    method: 'POST',
    body: JSON.stringify(checkInData),
  }, accessToken);
}

export async function fetchCheckIns(accessToken, limit = 12) {
  return authFetch(`/api/checkins?limit=${limit}`, {}, accessToken);
}

// ============================================================================
// Projection API (Public)
// ============================================================================

export async function runProjection(inputs, accessToken = null) {
  return authFetch('/api/engine/projection', {
    method: 'POST',
    body: JSON.stringify(inputs),
  }, accessToken);
}

export async function getSharedProjection(slug) {
  return authFetch(`/api/engine/projection/${slug}`);
}

// ============================================================================
// Benchmark API (Public)
// ============================================================================

export async function getBenchmarks(stage) {
  return authFetch(`/api/benchmarks/${stage}`);
}

export async function compareBenchmark(growthRate, stage) {
  return authFetch(`/api/benchmarks/compare?growth_rate=${growthRate}&stage=${stage}`, {
    method: 'POST',
  });
}

// ============================================================================
// Connector API
// ============================================================================

export async function fetchConnectors(accessToken) {
  return authFetch('/api/connectors', {}, accessToken);
}

export async function connectProvider(accessToken, provider, apiKey) {
  return authFetch(`/api/connectors/${provider}/connect?api_key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
  }, accessToken);
}

export async function disconnectProvider(accessToken, provider) {
  return authFetch(`/api/connectors/${provider}`, {
    method: 'DELETE',
  }, accessToken);
}

// ============================================================================
// AI Features API
// ============================================================================

export async function fetchAIUsage(accessToken) {
  return authFetch('/api/ai/usage', {}, accessToken);
}

export async function getDailyPulse(accessToken) {
  return authFetch('/api/ai/daily-pulse', {}, accessToken);
}

export async function getWeeklyQuestion(accessToken) {
  return authFetch('/api/ai/weekly-question', {}, accessToken);
}

export async function generateBoardReport(accessToken, data = {}) {
  return authFetch('/api/ai/board-report', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function generateStrategyBrief(accessToken, data = {}) {
  return authFetch('/api/ai/strategy-brief', {
    method: 'POST',
    body: JSON.stringify(data),
  }, accessToken);
}

export async function analyzeDeviation(accessToken, actual, projected, note = '') {
  return authFetch('/api/ai/deviation', {
    method: 'POST',
    body: JSON.stringify({ actual, projected, note }),
  }, accessToken);
}

// ============================================================================
// Scenario Analysis API
// ============================================================================

export async function runScenarioAnalysis(accessToken, inputs) {
  return authFetch('/api/engine/scenario', {
    method: 'POST',
    body: JSON.stringify(inputs),
  }, accessToken);
}

// ============================================================================
// Quiz API (Public - Lead Generation)
// ============================================================================

export async function submitFounderQuiz(answers, email = null) {
  return authFetch('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ answers, email }),
  });
}

export default {
  fetchDashboardOverview,
  fetchRevenueIntelligence,
  fetchUserProfile,
  updateUserProfile,
  completeOnboarding,
  submitCheckIn,
  fetchCheckIns,
  runProjection,
  getSharedProjection,
  getBenchmarks,
  compareBenchmark,
  fetchConnectors,
  connectProvider,
  disconnectProvider,
  submitFounderQuiz,
  fetchAIUsage,
  getDailyPulse,
  getWeeklyQuestion,
  generateBoardReport,
  generateStrategyBrief,
  analyzeDeviation,
  runScenarioAnalysis,
};
