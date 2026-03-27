// ═══════════════════════════════════════════════════════════════════════════
// CENTURION 100CR ENGINE — TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ── User & Profile ─────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  company?: string;
  company_name?: string;
  website?: string;
  stage?: 'pre-seed' | 'seed' | 'series-a' | 'series-b';
  sector?: string;
  current_mrr?: number;
  growth_rate?: number;
  business_model?: 'saas' | 'agency' | null;
  onboarding_completed?: boolean;
  beta_status?: 'active' | 'expired' | null;
  beta_expires_at?: string;
  streak_count?: number;
  last_checkin_at?: string;
  dpdp_consent_given?: boolean;
  dpdp_consent_at?: string;
  plan_tier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'founder' | 'studio' | 'vc_portfolio' | null;
  plan_tier?: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trialing';
  payment_provider?: string;
  payment_ref?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileResponse {
  user: Profile;
  subscription: Subscription | null;
}

// ── Onboarding ─────────────────────────────────────────────────────────────

export interface OnboardingData {
  company_name: string;
  website?: string;
  stage: string;
  sector: string;
  current_mrr: number;
  growth_rate?: number;
  business_model?: 'saas' | 'agency';
}

// ── Check-ins ──────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  actual_revenue: number;
  note?: string;
  source?: string;
  created_at: string;
}

export interface CheckInSubmission {
  month: string;
  actual_revenue: number;
  note?: string;
  source?: string;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardOverview {
  companyName: string;
  currentMRR: number;
  growthRate: number;
  nextMilestone: {
    label: string;
    value: number;
    date: string;
    monthsAway: number;
  };
  healthScore: number;
  healthSignals: {
    growth: number;
    retention: number;
    runway: number;
    engagement: number;
  };
  aiPriority?: string;
  actionQueue: ActionItem[];
  streak: number;
}

export interface ActionItem {
  id: string;
  type: 'checkin' | 'report' | 'connector' | 'goal';
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface RevenueIntelligence {
  revenueHistory: RevenueDataPoint[];
  growth: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  trends: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
  };
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  projected?: number;
}

// ── Engine (Projections) ───────────────────────────────────────────────────

export interface ProjectionInputs {
  current_mrr: number;
  growth_rate: number;
  months?: number;
}

export interface Milestone {
  label: string;
  value: number;
  month: number;
  date: string;
  probability: number;
}

export interface ProjectionResult {
  milestones: Milestone[];
  sensitivity: {
    optimistic: Milestone[];
    pessimistic: Milestone[];
  };
  shareUrl?: string;
  slug?: string;
}

export interface ScenarioInput {
  name: string;
  growth_rate: number;
  current_mrr?: number;
}

export interface ScenarioResult {
  name: string;
  milestones: Milestone[];
}

// ── Benchmarks ─────────────────────────────────────────────────────────────

export interface BenchmarkStage {
  id: string;
  name: string;
  description: string;
  mrrRange?: {
    min: number;
    max: number;
  };
}

export interface BenchmarkData {
  stage: string;
  medianGrowth: number;
  p25: number;
  p75: number;
  p90: number;
  sampleSize: number;
}

export interface BenchmarkComparison {
  userGrowth: number;
  percentile: number;
  comparison: 'above' | 'below' | 'at';
  message: string;
}

// ── AI Features ────────────────────────────────────────────────────────────

export interface DailyPulse {
  greeting: string;
  content: string;
  highlights?: string[];
  action?: string;
  generated_at: string;
  // Legacy field for backward compatibility
  question?: string;
}

export interface WeeklyQuestion {
  question: string;
  hint: string;
  generated_at: string;
}

export interface BoardReport {
  report: string;
  generatedAt: string;
}

export interface StrategyBrief {
  brief: string;
  generatedAt: string;
}

export interface DeviationAnalysis {
  analysis: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AIUsageStats {
  board_reports_used: number;
  board_reports_limit: number;
  strategy_briefs_used: number;
  strategy_briefs_limit: number;
  daily_pulses_used: number;
  daily_pulses_limit: number;
  period: string;
  reset_at: string;
  // Optional cost tracking fields
  budget_inr?: number;
  spent_inr?: number;
  remaining_inr?: number;
}

// ── Connectors ─────────────────────────────────────────────────────────────

export interface ConnectorProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'payment' | 'accounting' | 'crm' | 'analytics';
  status: 'available' | 'coming_soon';
}

export interface Connector {
  id: string;
  user_id: string;
  provider: string;
  connected_at: string;
  last_sync?: string;
  status: 'connected' | 'error' | 'syncing';
}

// ── Payments ───────────────────────────────────────────────────────────────

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentPlan {
  id: 'founder';
  name: string;
  price: number;
  billing: 'annual';
  features: string[];
}

// ── Waitlist ───────────────────────────────────────────────────────────────

export interface WaitlistEntry {
  email: string;
  name?: string;
  company?: string;
  stage?: string;
  startup_stage?: string;
  revenue_range?: string;
  key_problem?: string;
  referral_source?: string;
  dpdp_consent?: boolean;
}

export interface WaitlistResponse {
  position: number;
  referral_url: string;
}

// ── Admin ──────────────────────────────────────────────────────────────────

export interface PlatformStats {
  userCount: number;
  activeUsers: number;
  totalMRR: number;
  betaUsers: number;
  paidUsers: number;
  waitlistCount: number;
}

export interface SystemHealth {
  supabase: 'healthy' | 'degraded' | 'down';
  redis?: 'healthy' | 'degraded' | 'down';
  scheduler: 'running' | 'stopped';
  lastCheck: string;
}

export interface SchedulerJob {
  id: string;
  name: string;
  nextRun: string;
  lastRun?: string;
  status: 'scheduled' | 'running' | 'paused';
}

// ── API Error ──────────────────────────────────────────────────────────────

export interface APIError {
  type: 'rate_limited' | 'unauthorized' | 'forbidden' | 'not_found' | 'server_error';
  message: string;
  detail?: string;
  resetAt?: string;
}

// ── Utility Types ──────────────────────────────────────────────────────────

export type BusinessModel = 'saas' | 'agency';

export type Stage = 'pre-seed' | 'seed' | 'series-a' | 'series-b';

export type Sector =
  | 'B2B SaaS'
  | 'D2C'
  | 'EdTech'
  | 'FinTech'
  | 'HealthTech'
  | 'Other';

