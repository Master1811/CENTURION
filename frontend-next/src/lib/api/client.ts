'use client';

import type {
  UserProfileResponse,
  DashboardOverview,
  RevenueIntelligence,
  CheckIn,
  CheckInSubmission,
  ProjectionInputs,
  ProjectionResult,
  ScenarioInput,
  ScenarioResult,
  BenchmarkStage,
  BenchmarkData,
  BenchmarkComparison,
  DailyPulse,
  WeeklyQuestion,
  AIUsageStats,
  ConnectorProvider,
  Connector,
  RazorpayOrder,
  WaitlistEntry,
  WaitlistResponse,
  OnboardingData,
  Profile,
  APIError,
} from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ═══════════════════════════════════════════════════════════════════════════
// BASE FETCH WITH AUTH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Client-side authenticated fetch wrapper.
 * Automatically includes Supabase auth token and handles errors.
 */
export async function clientFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const data = await response.json();
    const error: APIError = {
      type: 'rate_limited',
      message: data.detail || 'Rate limit exceeded',
      resetAt: data.reset_at,
    };
    throw error;
  }

  // Handle auth errors
  if (response.status === 401) {
    const error: APIError = {
      type: 'unauthorized',
      message: 'Please sign in again',
    };
    throw error;
  }

  // Handle forbidden
  if (response.status === 403) {
    const error: APIError = {
      type: 'forbidden',
      message: 'Access denied',
    };
    throw error;
  }

  // Handle not found
  if (response.status === 404) {
    const error: APIError = {
      type: 'not_found',
      message: 'Resource not found',
    };
    throw error;
  }

  // Handle other errors
  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    const error: APIError = {
      type: 'server_error',
      message: data.detail || `Request failed: ${response.status}`,
      detail: data.detail,
    };
    throw error;
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE API
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  return clientFetch<UserProfileResponse>('/api/user/profile');
}

export async function updateProfile(data: Partial<Profile>): Promise<{ success: boolean; user: Profile }> {
  return clientFetch('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function completeOnboarding(data: OnboardingData): Promise<{ success: boolean }> {
  return clientFetch('/api/user/onboarding', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(): Promise<{ success: boolean }> {
  return clientFetch('/api/user/delete', {
    method: 'DELETE',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD API
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return clientFetch<DashboardOverview>('/api/dashboard/overview');
}

export async function fetchRevenueIntelligence(): Promise<RevenueIntelligence> {
  return clientFetch<RevenueIntelligence>('/api/dashboard/revenue');
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK-IN API
// ═══════════════════════════════════════════════════════════════════════════

export async function submitCheckIn(data: CheckInSubmission): Promise<{ success: boolean; streak_count: number }> {
  return clientFetch('/api/checkin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchCheckIns(): Promise<{ checkins: CheckIn[] }> {
  return clientFetch<{ checkins: CheckIn[] }>('/api/checkins');
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE API (Projections)
// ═══════════════════════════════════════════════════════════════════════════

export async function runProjection(data: ProjectionInputs): Promise<ProjectionResult> {
  return clientFetch<ProjectionResult>('/api/engine/projection', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getSharedProjection(slug: string): Promise<{ inputs: ProjectionInputs; result: ProjectionResult }> {
  return clientFetch(`/api/engine/projection/${slug}`);
}

export async function runScenarioAnalysis(scenarios: ScenarioInput[]): Promise<{ scenarios: ScenarioResult[] }> {
  return clientFetch('/api/engine/scenario', {
    method: 'POST',
    body: JSON.stringify({ scenarios }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BENCHMARK API
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchBenchmarkStages(): Promise<{ stages: BenchmarkStage[] }> {
  return clientFetch<{ stages: BenchmarkStage[] }>('/api/benchmarks/stages');
}

export async function fetchBenchmarksByStage(stage: string): Promise<BenchmarkData> {
  return clientFetch<BenchmarkData>(`/api/benchmarks/${stage}`);
}

export async function compareToBenchmark(data: { growth_rate: number; stage: string }): Promise<BenchmarkComparison> {
  return clientFetch<BenchmarkComparison>('/api/benchmarks/compare', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AI API
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchDailyPulse(): Promise<DailyPulse> {
  return clientFetch<DailyPulse>('/api/ai/daily-pulse');
}

export async function fetchWeeklyQuestion(): Promise<WeeklyQuestion> {
  return clientFetch<WeeklyQuestion>('/api/ai/weekly-question');
}

export async function generateBoardReport(month: string): Promise<{ report: string }> {
  return clientFetch('/api/ai/board-report', {
    method: 'POST',
    body: JSON.stringify({ month }),
  });
}

export async function generateStrategyBrief(): Promise<{ brief: string }> {
  return clientFetch('/api/ai/strategy-brief', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function analyzeDeviation(data: {
  planned_revenue: number;
  actual_revenue: number;
  period: string;
}): Promise<{ analysis: string; recommendations: string[] }> {
  return clientFetch('/api/ai/deviation', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAIUsage(): Promise<AIUsageStats> {
  return clientFetch<AIUsageStats>('/api/ai/usage');
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTOR API
// ═══════════════════════════════════════════════════════════════════════════

export async function fetchConnectorProviders(): Promise<{ providers: ConnectorProvider[] }> {
  return clientFetch<{ providers: ConnectorProvider[] }>('/api/connectors/providers');
}

export async function fetchConnectors(): Promise<{ connectors: Connector[] }> {
  return clientFetch<{ connectors: Connector[] }>('/api/connectors');
}

export async function connectProvider(provider: string, apiKey: string): Promise<{ success: boolean }> {
  return clientFetch(`/api/connectors/${provider}/connect`, {
    method: 'POST',
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export async function disconnectProvider(provider: string): Promise<{ success: boolean }> {
  return clientFetch(`/api/connectors/${provider}`, {
    method: 'DELETE',
  });
}

export async function syncProvider(provider: string): Promise<{ message: string }> {
  return clientFetch(`/api/connectors/${provider}/sync`, {
    method: 'POST',
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT API
// ═══════════════════════════════════════════════════════════════════════════

export async function createRazorpayOrder(plan: 'founder' = 'founder'): Promise<RazorpayOrder> {
  return clientFetch<RazorpayOrder>('/api/payments/razorpay/create-order', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST API
// ═══════════════════════════════════════════════════════════════════════════

export async function joinWaitlist(data: WaitlistEntry): Promise<WaitlistResponse> {
  return clientFetch<WaitlistResponse>('/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWaitlistCount(): Promise<{ count: number }> {
  return clientFetch<{ count: number }>('/api/waitlist/count');
}

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ API
// ═══════════════════════════════════════════════════════════════════════════

export async function submitQuiz(data: { answers: Record<string, string>; email?: string }): Promise<{
  archetype: string;
  percentile: number;
  description: string;
}> {
  return clientFetch('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


