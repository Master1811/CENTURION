'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { useRevenueIntelligence, useCheckIns, useSubmitCheckIn } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { toast } from 'sonner';

const MOCK_REVENUE_DATA = [
  { month: 'Sep', actual: 195000, baseline: 194400 },
  { month: 'Oct', actual: 220000, baseline: 209952 },
  { month: 'Nov', actual: 250000, baseline: 226748 },
  { month: 'Dec', actual: 290000, baseline: 244888 },
  { month: 'Jan', actual: 350000, baseline: 264479 },
  { month: 'Feb', actual: 420000, baseline: 285637 },
];

export default function RevenueIntelligencePage() {
  const { profile } = useAuth();
  const { data: revenueData, isLoading, refetch, isRefetching } = useRevenueIntelligence();
  const { data: checkinsData } = useCheckIns();
  const submitCheckIn = useSubmitCheckIn();

  const [checkInMonth, setCheckInMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [checkInRevenue, setCheckInRevenue] = useState(profile?.current_mrr || 0);
  const [checkInNotes, setCheckInNotes] = useState('');

  // Use API data or fallback
  const chartData = (revenueData?.revenueHistory || MOCK_REVENUE_DATA) as Array<{ month: string; actual: number; baseline: number; projected?: number }>;

  const metrics = useMemo(() => {
    if (chartData.length < 2) {
      return { currentMRR: 0, growth: 0, vsBaseline: 0 };
    }
    const current = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const growth = previous.actual ? (current.actual - previous.actual) / previous.actual : 0;
    const vsBaseline = current.baseline ? ((current.actual - current.baseline) / current.baseline) : 0;

    return { currentMRR: current.actual, growth, vsBaseline };
  }, [chartData]);

  const handleSubmitCheckIn = async () => {
    try {
      await submitCheckIn.mutateAsync({
        month: checkInMonth,
        actual_revenue: checkInRevenue,
        notes: checkInNotes,
      });
      toast.success('Check-in submitted successfully!');
      setCheckInNotes('');
      refetch();
    } catch (error) {
      toast.error('Failed to submit check-in');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Intelligence</h1>
          <p className="text-white/60 mt-1">Track and analyze your revenue performance</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <p className="text-sm text-white/60">Current MRR</p>
            <p className="text-3xl font-bold text-white mt-1 tabular-nums">
              {formatCurrency(metrics.currentMRR, true)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <p className="text-sm text-white/60">MoM Growth</p>
            <div className="flex items-center gap-2 mt-1">
              {metrics.growth >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <p className={`text-3xl font-bold tabular-nums ${metrics.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.growth >= 0 ? '+' : ''}{formatPercent(metrics.growth)}
              </p>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <p className="text-sm text-white/60">vs Baseline</p>
            <p className={`text-3xl font-bold tabular-nums mt-1 ${metrics.vsBaseline >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.vsBaseline >= 0 ? '+' : ''}{formatPercent(metrics.vsBaseline)}
            </p>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Revenue Chart & Check-in */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <CenturionCard className="lg:col-span-2">
          <CenturionCardHeader>
            <CenturionCardTitle>Revenue Trend</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="h-64 flex items-end gap-2">
              {chartData.map((item, i) => {
                const maxVal = Math.max(...chartData.map(d => d.actual));
                const height = (item.actual / maxVal) * 100;
                const baselineHeight = (item.baseline / maxVal) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end gap-1 h-48">
                      <motion.div
                        className="flex-1 bg-cyan-500/30 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${baselineHeight}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                      <motion.div
                        className="flex-1 bg-cyan-500 rounded-t"
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-xs text-white/50">{item.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded" />
                <span className="text-xs text-white/60">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500/30 rounded" />
                <span className="text-xs text-white/60">Baseline</span>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Check-in Form */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Monthly Check-in
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Month</label>
                <input
                  type="month"
                  value={checkInMonth}
                  onChange={(e) => setCheckInMonth(e.target.value)}
                  className="centurion-input"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Actual Revenue</label>
                <input
                  type="number"
                  value={checkInRevenue}
                  onChange={(e) => setCheckInRevenue(Number(e.target.value))}
                  className="centurion-input"
                  placeholder="Enter revenue"
                />
              </div>

              <div>
                <label className="text-sm text-white/60 mb-2 block">Notes (optional)</label>
                <textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  className="centurion-input min-h-[80px] resize-none"
                  placeholder="Any observations..."
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmitCheckIn}
                loading={submitCheckIn.isPending}
              >
                Submit Check-in
              </Button>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Recent Check-ins */}
      {checkinsData?.checkins && checkinsData.checkins.length > 0 && (
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Recent Check-ins</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-3">
              {checkinsData.checkins.slice(0, 5).map((checkin: any) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="text-white font-medium">{checkin.month}</p>
                    {checkin.notes && <p className="text-sm text-white/50">{checkin.notes}</p>}
                  </div>
                  <p className="text-cyan-400 font-semibold tabular-nums">
                    {formatCurrency(checkin.actual_revenue, true)}
                  </p>
                </div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}
    </div>
  );
}



