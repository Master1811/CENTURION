'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api/client';
import type { CheckInSubmission, OnboardingData, Profile, ScenarioInput } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: api.fetchDashboardOverview,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

export function useRevenueIntelligence() {
  return useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: api.fetchRevenueIntelligence,
    staleTime: 60 * 1000,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK-IN HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useCheckIns() {
  return useQuery({
    queryKey: ['checkins'],
    queryFn: api.fetchCheckIns,
  });
}

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInSubmission) => api.submitCheckIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTION HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useRunProjection() {
  return useMutation({
    mutationFn: api.runProjection,
  });
}

export function useScenarioAnalysis() {
  return useMutation({
    mutationFn: (scenarios: ScenarioInput[]) => api.runScenarioAnalysis(scenarios),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// BENCHMARK HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useBenchmarkStages() {
  return useQuery({
    queryKey: ['benchmarks', 'stages'],
    queryFn: api.fetchBenchmarkStages,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useBenchmarksByStage(stage: string) {
  return useQuery({
    queryKey: ['benchmarks', stage],
    queryFn: () => api.fetchBenchmarksByStage(stage),
    enabled: Boolean(stage),
    staleTime: 60 * 60 * 1000,
  });
}

export function useCompareToBenchmark() {
  return useMutation({
    mutationFn: api.compareToBenchmark,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// AI HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDailyPulse() {
  return useQuery({
    queryKey: ['ai', 'daily-pulse'],
    queryFn: api.fetchDailyPulse,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: false,
  });
}

export function useWeeklyQuestion() {
  return useQuery({
    queryKey: ['ai', 'weekly-question'],
    queryFn: api.fetchWeeklyQuestion,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false,
  });
}

export function useGenerateBoardReport() {
  return useMutation({
    mutationFn: (month: string) => api.generateBoardReport(month),
  });
}

export function useGenerateStrategyBrief() {
  return useMutation({
    mutationFn: api.generateStrategyBrief,
  });
}

export function useAnalyzeDeviation() {
  return useMutation({
    mutationFn: api.analyzeDeviation,
  });
}

export function useAIUsage() {
  return useQuery({
    queryKey: ['ai', 'usage'],
    queryFn: api.fetchAIUsage,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTOR HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useConnectorProviders() {
  return useQuery({
    queryKey: ['connectors', 'providers'],
    queryFn: api.fetchConnectorProviders,
    staleTime: 60 * 60 * 1000,
  });
}

export function useConnectors() {
  return useQuery({
    queryKey: ['connectors'],
    queryFn: api.fetchConnectors,
  });
}

export function useConnectProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ provider, apiKey }: { provider: string; apiKey: string }) =>
      api.connectProvider(provider, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}

export function useDisconnectProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.disconnectProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectors'] });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useUserProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: api.fetchUserProfile,
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingData) => api.completeOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: api.deleteAccount,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useWaitlistCount() {
  return useQuery({
    queryKey: ['waitlist', 'count'],
    queryFn: api.getWaitlistCount,
    staleTime: 60 * 1000,
  });
}

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: api.joinWaitlist,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PAYMENT HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: api.createRazorpayOrder,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: api.submitQuiz,
  });
}

