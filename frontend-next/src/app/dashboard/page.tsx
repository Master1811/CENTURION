'use client';

import { useAuth } from '@/context/AuthContext';
import { useDashboardOverview, useDailyPulse } from '@/hooks/useApi';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  TrendingUp,
  Target,
  Activity,
  Sparkles,
  Calendar,
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function CommandCentrePage() {
  const { profile, isSaaS, isAgency } = useAuth();
  const { data: dashboard, isLoading, error } = useDashboardOverview();
  const { data: dailyPulse } = useDailyPulse();

  // Dynamic labels based on persona
  const title = isSaaS ? 'Command Centre' : isAgency ? 'Agency Overview' : 'Command Centre';
  const mrrLabel = isSaaS ? 'Monthly Recurring Revenue' : 'Monthly Revenue';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/60">Failed to load dashboard data</p>
          <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const data = dashboard || {
    companyName: profile?.company_name || 'Your Company',
    currentMRR: profile?.current_mrr || 0,
    growthRate: profile?.growth_rate || 0.08,
    healthScore: 75,
    streak: profile?.streak_count || 0,
    nextMilestone: {
      label: '₹1 Crore',
      value: 10000000,
      monthsAway: 12,
      date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    actionQueue: [],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white/60 mt-1">
            Welcome back, {profile?.name || data.companyName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">{data.streak} day streak</span>
            </div>
          )}
          <Link href="/dashboard/revenue">
            <Button size="sm">
              <Calendar className="w-4 h-4" />
              Log Check-in
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">{mrrLabel}</p>
                <p className="text-3xl font-bold text-white mt-1 tabular-nums">
                  {formatCurrency(data.currentMRR, true)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-green-400">
                +{formatPercent(data.growthRate)}
              </span>
              <span className="text-xs text-white/40">monthly</span>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Next Milestone */}
        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Next Milestone</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {data.nextMilestone?.label || '₹1 Crore'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-white/60">
                {data.nextMilestone?.monthsAway || 12} months away
              </span>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Health Score */}
        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Health Score</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {data.healthScore}/100
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${data.healthScore}%` }}
                />
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* AI Insight */}
        <CenturionCard className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
          <CenturionCardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">AI Insight</p>
                <p className="text-sm text-white mt-2 line-clamp-2">
                  {dailyPulse?.question || 'What is the single biggest action you can take today?'}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <Link href="/dashboard/coach" className="mt-4 inline-flex items-center gap-1 text-sm text-cyan-400 hover:underline">
              Get AI Guidance
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Queue */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Action Queue</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            {data.actionQueue && data.actionQueue.length > 0 ? (
              <ul className="space-y-3">
                {data.actionQueue.map((action: any, i: number) => (
                  <li key={action.id || i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm text-white font-medium">{action.title}</p>
                      <p className="text-xs text-white/50">{action.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      action.priority === 'high'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {action.priority}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/40">No pending actions</p>
                <Link href="/dashboard/goals">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Set up goals
                  </Button>
                </Link>
              </div>
            )}
          </CenturionCardContent>
        </CenturionCard>

        {/* Quick Links */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Quick Actions</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/reports">
                <Button variant="secondary" className="w-full justify-start">
                  Generate Report
                </Button>
              </Link>
              <Link href="/dashboard/forecasting">
                <Button variant="secondary" className="w-full justify-start">
                  Run Scenarios
                </Button>
              </Link>
              <Link href="/dashboard/benchmarks">
                <Button variant="secondary" className="w-full justify-start">
                  View Benchmarks
                </Button>
              </Link>
              <Link href="/dashboard/connectors">
                <Button variant="secondary" className="w-full justify-start">
                  Connect Data
                </Button>
              </Link>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>
    </div>
  );
}

