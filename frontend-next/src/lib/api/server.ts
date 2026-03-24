import { createServerSupabaseClient } from '@/lib/supabase/server';
import type {
  UserProfileResponse,
  DashboardOverview,
  BenchmarkStage,
  PlatformStats,
  SystemHealth,
} from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ═══════════════════════════════════════════════════════════════════════════
// SERVER-SIDE FETCH WITH AUTH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Server-side authenticated fetch wrapper.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number | false } = {}
): Promise<T> {
  const supabase = await createServerSupabaseClient();
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

  const { revalidate, ...fetchOptions } = options;

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    next: {
      revalidate: revalidate ?? 60, // Default 60 second cache
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Server-side fetch without authentication.
 * Use for public endpoints.
 */
export async function publicFetch<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number | false } = {}
): Promise<T> {
  const { revalidate, ...fetchOptions } = options;

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    next: {
      revalidate: revalidate ?? 300, // 5 minute cache for public data
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}`,
    }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVER-SIDE API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch user profile from server-side.
 * No caching - always fresh data.
 */
export async function getUserProfile(): Promise<UserProfileResponse> {
  return serverFetch<UserProfileResponse>('/api/user/profile', {
    revalidate: false,
  });
}

/**
 * Fetch dashboard overview data.
 * Short cache for real-time feel.
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  return serverFetch<DashboardOverview>('/api/dashboard/overview', {
    revalidate: 30,
  });
}

/**
 * Fetch benchmark stages - public, can be cached longer.
 */
export async function getBenchmarkStages(): Promise<{ stages: BenchmarkStage[] }> {
  return publicFetch<{ stages: BenchmarkStage[] }>('/api/benchmarks/stages', {
    revalidate: 3600, // 1 hour
  });
}

/**
 * Fetch waitlist count - public.
 */
export async function getWaitlistCount(): Promise<{ count: number }> {
  return publicFetch<{ count: number }>('/api/waitlist/count', {
    revalidate: 60,
  });
}

/**
 * Check API health.
 */
export async function getAPIHealth(): Promise<{ status: string; version: string }> {
  return publicFetch('/api/health', {
    revalidate: 30,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN API FUNCTIONS (Server-side only)
// ═══════════════════════════════════════════════════════════════════════════

export async function getPlatformStats(): Promise<PlatformStats> {
  return serverFetch<PlatformStats>('/api/admin/stats', {
    revalidate: false,
  });
}

export async function getSystemHealth(): Promise<SystemHealth> {
  return serverFetch<SystemHealth>('/api/admin/system/health', {
    revalidate: false,
  });
}

export async function grantBetaAccess(userId: string, days: number = 60): Promise<{ success: boolean }> {
  return serverFetch(`/api/admin/beta/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ days }),
    revalidate: false,
  });
}


