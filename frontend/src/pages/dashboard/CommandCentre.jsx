// Command Centre - Dashboard Overview
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCrore, formatDate, CRORE } from '@/lib/engine/constants';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardOverview } from '@/lib/api/dashboard';
import { CheckInModal } from '@/components/dashboard/CheckInModal';

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
  const { getAccessToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const result = await fetchDashboardOverview(token);
          setData(result);
        } else {
          setData(fallbackData);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setData(fallbackData); // Use fallback on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAccessToken]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#71717A]" strokeWidth={1.5} />
      </div>
    );
  }

  const displayData = data || fallbackData;

  return (
    <div className="space-y-6" data-testid="command-centre">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="type-title text-[#09090B] mb-1">
            {copy.dashboard.commandCentre.title}
          </h1>
          <p className="type-body text-[#52525B]">
            {copy.dashboard.commandCentre.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowCheckIn(true)}
          className={cn(
            'flex items-center gap-2',
            'h-10 px-4 rounded-lg',
            'bg-[#09090B] text-white text-sm font-medium',
            'hover:bg-[#18181B] transition-colors'
          )}
          data-testid="checkin-button"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Monthly Check-in
        </button>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Milestone Countdown */}
        <CenturionCard className="md:col-span-2 bg-[#09090B]">
          <CenturionCardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50 mb-1">
                  {copy.dashboard.commandCentre.milestoneCountdown}
                </p>
                <p className="text-3xl font-bold text-white font-mono tabular-nums">
                  {displayData.nextMilestone.label}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-semibold text-white tabular-nums">
                  {displayData.nextMilestone.monthsAway}
                </p>
                <p className="text-xs text-white/50">months away</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((displayData.currentMRR * 12) / displayData.nextMilestone.value * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <span className="text-sm text-white/70 font-mono tabular-nums">
                {Math.round((displayData.currentMRR * 12) / displayData.nextMilestone.value * 100)}%
              </span>
            </div>
            <p className="text-sm text-white/60 mt-4">
              Currently at {formatCrore(displayData.currentMRR * 12)} ARR → Target {formatCrore(displayData.nextMilestone.value)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        {/* Health Score */}
        <CenturionCard>
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
                  <HealthSignal status={displayData.healthSignals.growth} />
                  <span className="text-[#52525B]">Growth</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals.retention} />
                  <span className="text-[#52525B]">Retention</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals.runway} />
                  <span className="text-[#52525B]">Runway</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <HealthSignal status={displayData.healthSignals.engagement} />
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
                {copy.dashboard.commandCentre.aiPriority}
              </p>
              <p className="text-sm text-[#09090B] leading-relaxed">
                {displayData.aiPriority}
              </p>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Action Queue */}
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-wider text-[#A1A1AA]">
                {copy.dashboard.commandCentre.actionQueue}
              </p>
              <span className="text-xs text-[#52525B]">{displayData.actionQueue.length} items</span>
            </div>
            <div className="space-y-3">
              {displayData.actionQueue.map((action) => (
                <div
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    'border border-[rgba(0,0,0,0.06)]',
                    'hover:bg-[rgba(0,0,0,0.02)] transition-colors cursor-pointer'
                  )}
                >
                  {action.urgent ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                  )}
                  <span className="flex-1 text-sm text-[#09090B]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                </div>
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
                  <p className="text-xs text-[#71717A] mb-1">Current MRR</p>
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
    </div>
  );
};

export default CommandCentre;
