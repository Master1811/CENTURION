// Benchmark Intelligence Dashboard
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, ArrowRight, Info, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { 
  compareToBenchmark, 
  getBenchmarkData, 
  getStageName,
  INDIA_SAAS_BENCHMARKS 
} from '@/lib/engine/benchmarks';
import { STAGES, formatPercent } from '@/lib/engine/constants';

// Mock peer comparison data (anonymized)
const peerFounders = [
  { id: 'F1', growth: 0.14, months: 4, stage: 'pre-seed', ahead: true },
  { id: 'F2', growth: 0.11, months: 6, stage: 'pre-seed', ahead: true },
  { id: 'You', growth: 0.12, months: 5, stage: 'pre-seed', ahead: true, isUser: true },
  { id: 'F3', growth: 0.09, months: 8, stage: 'pre-seed', ahead: false },
  { id: 'F4', growth: 0.07, months: 10, stage: 'pre-seed', ahead: false },
];

export const BenchmarkIntelligence = () => {
  const [selectedStage, setSelectedStage] = useState(STAGES.PRE_SEED);
  const userGrowth = 0.12;

  const benchmarkResult = useMemo(() => {
    return compareToBenchmark(userGrowth, selectedStage);
  }, [selectedStage]);

  const benchmark = getBenchmarkData(selectedStage);

  // Stage transition readiness
  const readinessScore = useMemo(() => {
    const metrics = {
      growth: userGrowth >= benchmark.median ? 25 : Math.round(25 * userGrowth / benchmark.median),
      retention: 92 >= 85 ? 25 : Math.round(25 * 92 / 85), // Mock 92% retention
      mrr: 420000 >= 500000 ? 25 : Math.round(25 * 420000 / 500000), // Target 5L for seed
      runway: 18 >= 12 ? 25 : Math.round(25 * 18 / 12), // Mock 18 months runway
    };
    return Object.values(metrics).reduce((a, b) => a + b, 0);
  }, [benchmark, userGrowth]);

  return (
    <div className="space-y-6" data-testid="benchmark-intelligence">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.benchmarks.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.benchmarks.subtitle}
        </p>
      </div>

      {/* Stage Selector */}
      <div className="flex gap-2">
        {Object.values(STAGES).map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium',
              'border transition-all duration-150',
              selectedStage === stage
                ? 'bg-[#09090B] text-white border-[#09090B]'
                : 'bg-white text-[#52525B] border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)]'
            )}
          >
            {getStageName(stage)}
          </button>
        ))}
      </div>

      {/* Main Benchmark Card */}
      <CenturionCard className="bg-[#09090B]">
        <CenturionCardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Your Position */}
            <div className="text-center">
              <p className="text-xs text-white/50 mb-2">Your Percentile</p>
              <p className="font-mono text-5xl font-bold text-white tabular-nums">
                {benchmarkResult.percentile}%
              </p>
              <p className="text-sm text-white/60 mt-2">
                Top {100 - benchmarkResult.percentile}% of {getStageName(selectedStage)} founders
              </p>
            </div>

            {/* Growth Comparison */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Your growth</span>
                  <span className="font-mono text-white">{formatPercent(userGrowth)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(userGrowth / 0.20 * 100, 100)}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Median</span>
                  <span className="font-mono text-white/70">{formatPercent(benchmark.median)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/30 rounded-full"
                    style={{ width: `${benchmark.median / 0.20 * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Top 25%</span>
                  <span className="font-mono text-white/70">{formatPercent(benchmark.p75)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/20 rounded-full"
                    style={{ width: `${benchmark.p75 / 0.20 * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sample Size */}
            <div className="text-center">
              <p className="text-xs text-white/50 mb-2">Sample Size</p>
              <p className="font-mono text-3xl font-bold text-white tabular-nums">
                {benchmark.sample_size}
              </p>
              <p className="text-sm text-white/60 mt-2">
                Indian founders at this stage
              </p>
              <div className="mt-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live data
              </div>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Peer Comparison */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-2">
            {copy.dashboard.benchmarks.peerComparison}
          </h3>
          <p className="text-sm text-[#71717A] mb-6">
            Anonymous founders at your stage (ranked by growth rate)
          </p>

          <div className="space-y-3">
            {peerFounders.map((founder, i) => (
              <div
                key={founder.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border',
                  founder.isUser 
                    ? 'border-[#09090B] bg-[#F4F4F5]'
                    : 'border-[rgba(0,0,0,0.06)]'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  founder.isUser ? 'bg-[#09090B] text-white' : 'bg-[#F4F4F5] text-[#52525B]'
                )}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-medium',
                      founder.isUser ? 'text-[#09090B]' : 'text-[#52525B]'
                    )}>
                      {founder.isUser ? 'You' : `Founder ${founder.id}`}
                    </span>
                    {founder.isUser && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[#09090B] text-white">
                        Your position
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium tabular-nums">
                    {formatPercent(founder.growth)}
                  </p>
                  <p className="text-xs text-[#71717A]">growth</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium tabular-nums">
                    {founder.months}mo
                  </p>
                  <p className="text-xs text-[#71717A]">to ₹1Cr</p>
                </div>
              </div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Stage Transition Readiness */}
      <div className="grid md:grid-cols-2 gap-4">
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-4">
              {copy.dashboard.benchmarks.transitionReadiness}
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#F4F4F5" strokeWidth="8" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none" 
                    stroke={readinessScore >= 75 ? '#10B981' : readinessScore >= 50 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - readinessScore / 100) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold">
                  {readinessScore}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Growth Rate</span>
                  <span className={cn(
                    'font-medium',
                    userGrowth >= benchmark.median ? 'text-emerald-600' : 'text-amber-600'
                  )}>
                    {userGrowth >= benchmark.median ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Retention</span>
                  <span className="font-medium text-emerald-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">MRR Target</span>
                  <span className="font-medium text-amber-600">○</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#52525B]">Runway</span>
                  <span className="font-medium text-emerald-600">✓</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#52525B] mt-4">
              {readinessScore >= 75 
                ? 'You\'re ready to start conversations with Seed investors.'
                : 'Focus on hitting your MRR target before approaching Seed investors.'}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard className="bg-[#F4F4F5]">
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-4">
              {copy.dashboard.benchmarks.fundraisingBrief}
            </h3>
            <div className="space-y-3 text-sm text-[#52525B]">
              <p>
                <strong className="text-[#09090B]">Target raise:</strong> ₹2-5 Crore
              </p>
              <p>
                <strong className="text-[#09090B]">Typical valuation:</strong> ₹15-25 Crore (3-5x ARR)
              </p>
              <p>
                <strong className="text-[#09090B]">Key metrics investors want:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#71717A]">
                <li>₹5L+ MRR with 10%+ MoM growth</li>
                <li>90%+ retention rate</li>
                <li>Clear path to ₹1Cr ARR in 12 months</li>
              </ul>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>
    </div>
  );
};

export default BenchmarkIntelligence;
