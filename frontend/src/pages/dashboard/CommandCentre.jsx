// Command Centre - Dashboard Overview
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Plus,
  Loader2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCrore, formatDate, CRORE } from '@/lib/engine/constants';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardOverview } from '@/lib/api/dashboard';
import { CheckInModal } from '@/components/dashboard/CheckInModal';
import { SyncStatus, RefreshButton } from '@/components/ui/SyncIndicator';
import { UpgradeModal, useUpgradeModal } from '@/components/upgrade/UpgradeModal';
import { OnboardingTour, useTour } from '@/components/tour/OnboardingTour';
import { FreeTierBanner } from '@/components/dashboard/FreeTierBanner';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

// Fallback mock data
const fallbackData = {
  companyName: 'Your Startup',
  currentMRR: 420000,
  growthRate: 0.12,
  nextMilestone: { label: '₹1 Crore', value: CRORE, date: '2025-08-01', monthsAway: 5 },
  healthScore: 78,
  healthSignals: {
    growth: 'good',
    retention: 'good', 
    runway: 'warning',
    engagement: 'good',
  },
  aiPriority: 'Focus on reducing churn this month. Your 12% growth is strong, but improving retention by 2% could accelerate your ₹1Cr milestone by 2 months.',
  actionQueue: [
    { id: 1, label: 'Complete monthly check-in', type: 'checkin', urgent: true },
    { id: 2, label: 'Review benchmark report', type: 'report', urgent: false },
    { id: 3, label: 'Connect Razorpay for auto-sync', type: 'connector', urgent: false },
  ],
  streak: 3,
};

const HealthSignal = ({ status }) => (
  <div className={cn(
    'w-2.5 h-2.5 rounded-full',
    status === 'good' && 'bg-emerald-500',
    status === 'warning' && 'bg-amber-500',
    status === 'critical' && 'bg-red-500'
  )} />
);

export const CommandCentre = () => {
  const { getAccessToken, profile, refreshProfile, isSaaS, isAgency } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyPulse, setDailyPulse] = useState(null);
  const { isOpen: showUpgrade, modalProps, showUpgradeModal, hideUpgradeModal } = useUpgradeModal();

  const loadData = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const result = await fetchDashboardOverview(token);
        setData(result);
        setLastSynced(new Date().toISOString());
        setError(null);
      } else {
        setData(fallbackData);
        setLastSynced(new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message);
      
      // Check if it's a rate limit error
      if (err.status === 429) {
        showUpgradeModal({
          reason: 'RATE_LIMIT',
          featureName: 'Dashboard Views',
          currentUsage: 50,
          limit: 50,
        });
      }
      
      setData(fallbackData); // Use fallback on error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [getAccessToken, showUpgradeModal]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hoisted — used in both the effect and JSX
  const needsOnboarding = Boolean(
    !profile?.company ||
    !profile?.onboarding_completed
  );
  const needsPersonaSelection = Boolean(
    profile && !profile.business_model
  );
  const shouldShowOnboarding = needsOnboarding || needsPersonaSelection;

  // Check if user needs onboarding
  useEffect(() => {
    if (!profile) return;
    if (shouldShowOnboarding) {
      setShowOnboarding(true);
    }
  }, [profile, shouldShowOnboarding]);

  // Fetch daily pulse
  useEffect(() => {
    const fetchDailyPulse = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/ai/daily-pulse`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (res.status === 503) {
          // AI not configured — use fallback question
          const data = await res.json();
          setDailyPulse({
            greeting: "Good morning! Here's your startup pulse for today.",
            content: data.detail?.question ??
              "What is the single biggest action you can take today?",
            mock: true,
            generated_at: new Date().toISOString()
          });
          return;
        }
        
        if (!res.ok) {
          // Don't crash — just show nothing
          console.warn('[PULSE] Daily pulse unavailable:', res.status);
          return;
        }
        
        const data = await res.json();
        setDailyPulse(data);
      } catch (err) {
        // Network error or CORS — don't crash the page
        console.warn('[PULSE] Daily pulse fetch failed:', err.message);
        // setDailyPulse(null) — component renders without it
      }
    };

    fetchDailyPulse();
  }, [getAccessToken]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const handleCheckInSuccess = (result) => {
    // Refresh dashboard data after check-in
    setData(prev => ({
      ...prev,
      currentMRR: result.actual_revenue || prev.currentMRR,
      streak: (prev.streak || 0) + 1,
    }));
  };

  const handleActionClick = (action) => {
    if (action.type === 'checkin') {
      setShowCheckIn(true);
    }
  };

  // Tour state
  const { isOpen: tourOpen, endTour, resetTour } = useTour('dashboard');

  // ── ONBOARDING MODAL ─────────────────────────────────────
  // MUST be before any early returns or modal never shows.
  // if (!profile) returns early and modal JSX is never reached.
  if (showOnboarding) {
    return (
      <OnboardingModal
        onComplete={() => {
          setShowOnboarding(false)
          refreshProfile()
        }}
        personaOnly={
          Boolean(profile?.onboarding_completed) &&
          !profile?.business_model
        }
      />
    )
  }
  // ─────────────────────────────────────────────────────────

  // ── NULL GUARD ──────────────────────────────────────
  // Add this AFTER all hooks, BEFORE any other logic
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/40 text-sm">
          Loading...
        </p>
      </div>
    );
  }

  if (!profile.current_mrr && !profile.onboarding_completed) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-white/50 text-sm">
          Complete your onboarding to see your revenue dashboard.
        </p>
        <button
          onClick={() => setShowOnboarding(true)}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20"
        >
          Complete setup →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#71717A]" strokeWidth={1.5} />
      </div>
    );
  }

  // Use fallback data, but ensure all nested properties are valid
  const displayData = data ? {
    ...fallbackData,
    ...data,
    nextMilestone: data.nextMilestone || fallbackData.nextMilestone,
    healthSignals: data.healthSignals || fallbackData.healthSignals,
    actionQueue: Array.isArray(data.actionQueue)
      ? data.actionQueue
      : fallbackData.actionQueue,
    currentMRR: data.currentMRR || fallbackData.currentMRR,
    growthRate: data.growthRate || fallbackData.growthRate,
    healthScore: data.healthScore || fallbackData.healthScore,
    streak: data.streak ?? fallbackData.streak,
    aiPriority: data.aiPriority || fallbackData.aiPriority,
    companyName: data.companyName
      || profile?.company_name
      || fallbackData.companyName,
  } : fallbackData;

  // Do not block render for missing milestone.
  // The fallbackData already has a valid nextMilestone.
  // If both API and fallback fail, use a safe default.
  const safeMilestone = displayData.nextMilestone
    || fallbackData.nextMilestone
    || {
        label: '₹1 Crore',
        value: 10000000,
        monthsAway: 24,
        date: null,
      };

  return (
    <div className="space-y-6" data-testid="command-centre">
      {/* Onboarding Modal */}
      {/* MOVED TO EARLY RETURN ABOVE - MODAL NOW SHOWS BEFORE ANY EARLY RETURNS */}

      {/* Header with Sync Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="type-title text-[#09090B] mb-1">
            {isSaaS ? 'Command Centre' : 'Business Overview'}
          </h1>
          <p className="type-body text-[#52525B]">
            {copy.dashboard.commandCentre.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tour restart button */}
          <button
            onClick={resetTour}
            className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
            title="Start tour"
          >
            <HelpCircle className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
          </button>
          {/* Sync Status */}
          <SyncStatus 
            lastSynced={lastSynced} 
            isLoading={isRefreshing} 
            isError={!!error}
          />
          <RefreshButton 
            onClick={handleRefresh} 
            isLoading={isRefreshing}
          />
          <motion.button
            onClick={() => setShowCheckIn(true)}
            className={cn(
              'flex items-center gap-2',
              'h-10 px-4 rounded-xl',
              'bg-gradient-to-r from-[#09090B] to-[#18181B] text-white text-sm font-medium',
              'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
              'will-change-transform'
            )}
            whileHover={{
              y: -2,
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              background: 'linear-gradient(to right, #18181B, #27272A)',
            }}
            whileTap={{ scale: 0.97 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            data-testid="checkin-button"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            {isSaaS ? 'Monthly Check-in' : 'Update Cash Position'}
          </motion.button>
        </div>
      </div>

      {/* Beta/Free Tier Banner */}
      <FreeTierBanner />
      
      {/* Onboarding Checklist for new users */}
      <OnboardingChecklist />

      {/* Top Row - Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Milestone Countdown */}
        <CenturionCard className="md:col-span-2 bg-[#09090B]">
          <CenturionCardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                  {isSaaS ? 'Next Milestone' : 'Cash Runway'}
                </p>
                <p className="text-3xl font-bold text-white font-mono tabular-nums">
                  {safeMilestone?.label ?? '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-semibold text-white tabular-nums">
                  {safeMilestone?.monthsAway ?? '—'}
                </p>
                <p className="text-xs text-white/50">months away</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((displayData.currentMRR * 12) / (safeMilestone?.value || CRORE) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <span className="text-sm text-white/70 font-mono tabular-nums">
                {Math.round((displayData.currentMRR * 12) / (safeMilestone?.value || CRORE) * 100)}%
              </span>
            </div>
            <p className="text-sm text-white/60 mt-4">
              Currently at {formatCrore(displayData.currentMRR * 12)} ARR → Target {formatCrore(safeMilestone?.value || CRORE)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        {/* Health Score */}
        <CenturionCard variant="premium" data-tour="health-score">
          <CenturionCardContent className="p-6">
            <p className="text-xs uppercase tracking-wider text-[#A1A1AA] mb-3">
              {copy.dashboard.commandCentre.healthScore}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <svg className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#F4F4F5" strokeWidth="6" />
                  <motion.circle
                    cx="32" cy="32" r="28" fill="none" stroke="#09090B" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={175.9}
                    initial={{ strokeDashoffset: 175.9 }}
                    animate={{ strokeDashoffset: 175.9 * (1 - displayData.healthScore / 100) }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold">
                  {displayData.healthScore}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals?.growth ?? 'good'} />
                  <span className="text-[#52525B]">Growth</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals?.retention ?? 'good'} />
                  <span className="text-[#52525B]">Retention</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals?.runway ?? 'good'} />
                  <span className="text-[#52525B]">Runway</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals?.engagement ?? 'good'} />
                  <span className="text-[#52525B]">Check-ins</span>
                </div>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* AI Priority */}
      <CenturionCard className="border-l-4 border-l-amber-400">
        <CenturionCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-50">
              <Sparkles className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#A1A1AA] mb-2">
                {isSaaS ? 'AI Growth Priority' : 'AI Collections Priority'}
              </p>
              <p className="text-sm text-[#09090B] leading-relaxed">
                {displayData.aiPriority}
              </p>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Daily Pulse */}
      {dailyPulse && (
        <CenturionCard className="border-l-4 border-l-blue-400">
          <CenturionCardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50">
                <Target className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#A1A1AA] mb-2">
                  Daily Pulse
                </p>
                <p className="text-sm text-[#09090B] leading-relaxed">
                  {dailyPulse?.question ?? 'Daily insight unavailable'}
                </p>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-4" data-tour="metrics">
        {/* Action Queue */}
        <CenturionCard variant="glass" data-tour="action-queue">
          <CenturionCardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-[#A1A1AA]">
                {copy.dashboard.commandCentre.actionQueue}
              </p>
              <span className="text-xs text-[#52525B]">{displayData.actionQueue.length} items</span>
            </div>
            <div className="space-y-3">
              {displayData.actionQueue.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-lg',
                    'border border-[rgba(0,0,0,0.06)]',
                    'hover:bg-[rgba(0,0,0,0.02)] hover:border-[rgba(0,0,0,0.1)]',
                    'hover:translate-x-1 hover:shadow-sm',
                    'transition-all duration-200 ease-[var(--ease-luxury)] cursor-pointer'
                  )}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {action.urgent ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#A1A1AA] transition-transform duration-200 group-hover:text-[#52525B]" strokeWidth={1.5} />
                  )}
                  <span className="flex-1 text-sm text-[#09090B]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#A1A1AA] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#09090B]" strokeWidth={1.5} />
                </motion.div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <CenturionCard>
            <CenturionCardContent className="p-5 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-emerald-500" strokeWidth={1.5} />
              <p className="font-mono text-2xl font-bold text-[#09090B] tabular-nums">
                {(displayData.growthRate * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-[#71717A] mt-1">Growth Rate</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="p-5 text-center">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
              <p className="font-mono text-2xl font-bold text-[#09090B] tabular-nums">
                {displayData.streak}
              </p>
              <p className="text-xs text-[#71717A] mt-1">Month Streak</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard className="col-span-2">
            <CenturionCardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#71717A] mb-1">{isSaaS ? 'Current MRR' : 'Monthly Revenue'}</p>
                  <p className="font-mono text-xl font-bold text-[#09090B] tabular-nums">
                    {formatCrore(displayData.currentMRR)}
                  </p>
                </div>
                <Link
                  to="/dashboard/revenue"
                  className="flex items-center gap-1 text-xs text-[#52525B] hover:text-[#09090B]"
                >
                  View details
                  <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                </Link>
              </div>
            </CenturionCardContent>
          </CenturionCard>
        </div>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onSuccess={handleCheckInSuccess}
      />
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={hideUpgradeModal}
        {...modalProps}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        tourKey="dashboard"
        isOpen={tourOpen}
        onComplete={endTour}
        onSkip={endTour}
      />
    </div>
  );
};

export default CommandCentre;
