// Revenue Intelligence Dashboard
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCrore, CRORE, LAKH } from '@/lib/engine/constants';
import { useAuth } from '@/context/AuthContext';
import { fetchRevenueIntelligence } from '@/lib/api/dashboard';
import { SyncStatus, RefreshButton } from '@/components/ui/SyncIndicator';

// Fallback mock data
const fallbackRevenueData = [
  { month: 'Aug', actual: 180000, baseline: 180000, benchmark: 180000 },
  { month: 'Sep', actual: 195000, baseline: 194400, benchmark: 190800 },
  { month: 'Oct', actual: 220000, baseline: 209952, benchmark: 202248 },
  { month: 'Nov', actual: 250000, baseline: 226748, benchmark: 214383 },
  { month: 'Dec', actual: 290000, baseline: 244888, benchmark: 227246 },
  { month: 'Jan', actual: 350000, baseline: 264479, benchmark: 240881 },
  { month: 'Feb', actual: 420000, baseline: 285637, benchmark: 255334 },
];

const cohortData = [
  { cohort: 'Aug 24', month1: 100, month2: 92, month3: 85, month4: 80, month5: 76, month6: 73 },
  { cohort: 'Sep 24', month1: 100, month2: 94, month3: 88, month4: 84, month5: 81, month6: null },
  { cohort: 'Oct 24', month1: 100, month2: 95, month3: 90, month4: 87, month5: null, month6: null },
  { cohort: 'Nov 24', month1: 100, month2: 93, month3: 88, month4: null, month5: null, month6: null },
  { cohort: 'Dec 24', month1: 100, month2: 91, month3: null, month4: null, month5: null, month6: null },
  { cohort: 'Jan 25', month1: 100, month2: null, month3: null, month4: null, month5: null, month6: null },
];

export const RevenueIntelligence = () => {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (token) {
        const result = await fetchRevenueIntelligence(token);
        setData(result);
        setLastSynced(new Date().toISOString());
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  // Use API data or fallback
  const revenueData = data?.revenue_data?.length > 0 ? data.revenue_data : fallbackRevenueData;

  const metrics = useMemo(() => {
    if (revenueData.length === 0) {
      return { mrr: 0, growth: 0, vsBaseline: 0, vsBenchmark: 0, qualityScore: 0 };
    }

    const current = revenueData[revenueData.length - 1];
    const previous = revenueData[revenueData.length - 2];
    const growth = previous ? (current.actual - previous.actual) / previous.actual : 0;
    const vsBaseline = current.baseline ? ((current.actual - current.baseline) / current.baseline) * 100 : 0;
    const vsBenchmark = current.benchmark ? ((current.actual - current.benchmark) / current.benchmark) * 100 : 0;
    
    return {
      mrr: current.actual,
      growth: data?.calculated_growth ?? growth,
      vsBaseline,
      vsBenchmark,
      qualityScore: 82,
    };
  }, [revenueData, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#71717A]" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="revenue-intelligence">
      {/* Header with Sync */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="type-title text-[#09090B] mb-1">
            {copy.dashboard.revenueIntelligence.title}
          </h1>
          <p className="type-body text-[#52525B]">
            {copy.dashboard.revenueIntelligence.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SyncStatus 
            lastSynced={lastSynced} 
            isLoading={isRefreshing} 
            isError={!!error}
          />
          <RefreshButton 
            onClick={handleRefresh} 
            isLoading={isRefreshing}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CenturionCard className="bg-[#09090B]">
          <CenturionCardContent className="p-5 text-center">
            <p className="text-xs text-white/50 mb-1">Current MRR</p>
            <p className="font-mono text-2xl font-bold text-white tabular-nums">
              {formatCrore(metrics.mrr)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="p-5 text-center">
            <p className="text-xs text-[#71717A] mb-1">MoM Growth</p>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              <p className="font-mono text-2xl font-bold text-emerald-600 tabular-nums">
                +{(metrics.growth * 100).toFixed(0)}%
              </p>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="p-5 text-center">
            <p className="text-xs text-[#71717A] mb-1">{copy.dashboard.revenueIntelligence.vsBaseline}</p>
            <p className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              metrics.vsBaseline >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {metrics.vsBaseline >= 0 ? '+' : ''}{metrics.vsBaseline.toFixed(0)}%
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="p-5 text-center">
            <p className="text-xs text-[#71717A] mb-1">{copy.dashboard.revenueIntelligence.vsBenchmark}</p>
            <p className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              metrics.vsBenchmark >= 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {metrics.vsBenchmark >= 0 ? '+' : ''}{metrics.vsBenchmark.toFixed(0)}%
            </p>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Revenue Chart */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-medium text-[#09090B]">Revenue vs Baseline vs Benchmark</h3>
              <p className="text-sm text-[#71717A]">Last 7 months performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#09090B]" />
                <span className="text-[#71717A]">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#71717A]" />
                <span className="text-[#71717A]">Baseline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-emerald-400" />
                <span className="text-[#71717A]">Benchmark</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#09090B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#A1A1AA' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#A1A1AA' }}
                  tickFormatter={(v) => `₹${(v / LAKH).toFixed(0)}L`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: 8 }}
                  labelStyle={{ color: '#A1A1AA' }}
                  formatter={(value) => [`₹${(value / LAKH).toFixed(1)}L`, '']}
                />
                <Area type="monotone" dataKey="actual" stroke="#09090B" strokeWidth={2} fill="url(#actualGradient)" />
                <Line type="monotone" dataKey="baseline" stroke="#71717A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="benchmark" stroke="#10B981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Bottom Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue Quality Score */}
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-4">
              {copy.dashboard.revenueIntelligence.qualityScore}
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#F4F4F5" strokeWidth="8" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none" stroke="#09090B" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - metrics.qualityScore / 100) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold">
                  {metrics.qualityScore}
                </span>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Recurring %</span>
                  <span className="font-mono font-medium">95%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Top 10 concentration</span>
                  <span className="font-mono font-medium">32%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Annual contracts</span>
                  <span className="font-mono font-medium">28%</span>
                </div>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Cohort Retention */}
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-4">
              {copy.dashboard.revenueIntelligence.cohortTracking}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#A1A1AA]">
                    <th className="text-left py-2">Cohort</th>
                    <th className="text-center py-2">M1</th>
                    <th className="text-center py-2">M2</th>
                    <th className="text-center py-2">M3</th>
                    <th className="text-center py-2">M4</th>
                    <th className="text-center py-2">M5</th>
                    <th className="text-center py-2">M6</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.slice(0, 4).map((row) => (
                    <tr key={row.cohort}>
                      <td className="py-2 font-medium text-[#09090B]">{row.cohort}</td>
                      {['month1', 'month2', 'month3', 'month4', 'month5', 'month6'].map((key) => (
                        <td key={key} className="text-center py-2">
                          {row[key] !== null ? (
                            <span className={cn(
                              'font-mono',
                              row[key] >= 90 ? 'text-emerald-600' :
                              row[key] >= 80 ? 'text-[#09090B]' :
                              'text-amber-600'
                            )}>
                              {row[key]}%
                            </span>
                          ) : (
                            <span className="text-[#E4E4E7]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>
    </div>
  );
};

export default RevenueIntelligence;
