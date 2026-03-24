'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Info, Loader2 } from 'lucide-react';
import { useBenchmarkStages, useBenchmarksByStage, useCompareToBenchmark } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';

const STAGES = [
  { id: 'pre-seed', label: 'Pre-Seed', description: '< ₹25L ARR' },
  { id: 'seed', label: 'Seed', description: '₹25L - ₹2Cr ARR' },
  { id: 'series-a', label: 'Series A', description: '₹2Cr - ₹10Cr ARR' },
  { id: 'series-b', label: 'Series B', description: '> ₹10Cr ARR' },
];

const MOCK_BENCHMARK = {
  medianGrowth: 8,
  p25: 5,
  p75: 12,
  p90: 18,
  sampleSize: 127,
};

export default function BenchmarksPage() {
  const { profile } = useAuth();
  const [selectedStage, setSelectedStage] = useState<string>(profile?.stage || 'seed');
  const { data: benchmarkData, isLoading } = useBenchmarksByStage(selectedStage);
  const compareMutation = useCompareToBenchmark();

  const userGrowth = (profile?.growth_rate || 0.08) * 100;
  const benchmark = benchmarkData || MOCK_BENCHMARK;

  // Calculate percentile position
  const getPercentilePosition = () => {
    if (userGrowth >= benchmark.p90) return { percentile: 90, label: 'Top 10%', color: '#22C55E' };
    if (userGrowth >= benchmark.p75) return { percentile: 75, label: 'Top 25%', color: '#00BFFF' };
    if (userGrowth >= benchmark.medianGrowth) return { percentile: 50, label: 'Above Median', color: '#F59E0B' };
    return { percentile: 25, label: 'Below Median', color: '#EF4444' };
  };

  const position = getPercentilePosition();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Benchmark Intelligence</h1>
        <p className="text-white/60 mt-1">Compare your growth to peer companies</p>
      </div>

      {/* Stage Selector */}
      <div className="flex flex-wrap gap-3">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(stage.id)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedStage === stage.id
                ? 'bg-cyan-500 text-slate-900 font-semibold'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {stage.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Your Position */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Your Position</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4"
                style={{ backgroundColor: `${position.color}20`, border: `2px solid ${position.color}` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <div>
                  <p className="text-3xl font-bold" style={{ color: position.color }}>{userGrowth.toFixed(1)}%</p>
                  <p className="text-xs text-white/50">monthly</p>
                </div>
              </motion.div>
              <p className="text-xl font-semibold" style={{ color: position.color }}>{position.label}</p>
              <p className="text-white/50 text-sm">of {selectedStage} stage companies</p>
            </div>

            {/* Growth bar visualization */}
            <div className="space-y-4">
              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                {/* Percentile markers */}
                <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/20" />
                <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-[75%] top-0 bottom-0 w-px bg-white/20" />

                {/* User position */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: position.color,
                    left: `${Math.min(95, Math.max(5, (userGrowth / benchmark.p90) * 90))}%`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>P25: {benchmark.p25}%</span>
                <span>Median: {benchmark.medianGrowth}%</span>
                <span>P75: {benchmark.p75}%</span>
                <span>P90: {benchmark.p90}%</span>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Benchmark Stats */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              {selectedStage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Benchmarks
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/50">Median Growth</p>
                    <p className="text-2xl font-bold text-white">{benchmark.medianGrowth}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/50">Top Quartile</p>
                    <p className="text-2xl font-bold text-cyan-400">{benchmark.p75}%+</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/50">Top 10%</p>
                    <p className="text-2xl font-bold text-green-400">{benchmark.p90}%+</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/50">Sample Size</p>
                    <p className="text-2xl font-bold text-white">{benchmark.sampleSize}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
                  <Info className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <p className="text-sm text-white/70">
                    Benchmarks are based on anonymized data from {benchmark.sampleSize} Indian SaaS companies
                    at the {selectedStage.replace('-', ' ')} stage.
                  </p>
                </div>
              </div>
            )}
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Recommendations */}
      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle>Growth Recommendations</CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'Hit Top Quartile',
                target: benchmark.p75,
                current: userGrowth,
                description: 'Increase growth by focus on expansion revenue',
              },
              {
                title: 'Hit Top 10%',
                target: benchmark.p90,
                current: userGrowth,
                description: 'Requires aggressive sales and marketing investment',
              },
              {
                title: 'Maintain Position',
                target: userGrowth,
                current: userGrowth,
                description: 'Focus on retention and incremental improvements',
              },
            ].map((rec, i) => (
              <motion.div
                key={rec.title}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                <p className="text-sm text-white/50 mb-3">{rec.description}</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">{rec.target}% monthly</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}


