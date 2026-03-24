'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Navbar } from '@/components/layout/Navbar';
import { formatCurrency, CRORE } from '@/lib/utils';

const T2D3_STATUS = {
  excellent: { label: 'T2D3 Ready', color: '#22C55E', description: 'You\'re on track for hypergrowth' },
  good: { label: 'Good Growth', color: '#00BFFF', description: 'Solid foundation for scaling' },
  'needs-work': { label: 'Needs Work', color: '#F59E0B', description: 'Focus on improving growth engines' },
};

export default function GrowthCalculatorPage() {
  const [currentMRR, setCurrentMRR] = useState(500000);
  const [targetMRR, setTargetMRR] = useState(2000000);
  const [months, setMonths] = useState(12);

  const metrics = useMemo(() => {
    // Required monthly growth rate to hit target
    const requiredGrowth = Math.pow(targetMRR / currentMRR, 1 / months) - 1;
    const requiredGrowthPercent = requiredGrowth * 100;

    // T2D3 analysis (Triple, Triple, Double, Double, Double)
    const annualGrowth = Math.pow(1 + requiredGrowth, 12) - 1;
    let t2d3Status: keyof typeof T2D3_STATUS = 'needs-work';
    if (annualGrowth >= 2) t2d3Status = 'excellent'; // 3x annual
    else if (annualGrowth >= 1) t2d3Status = 'good'; // 2x annual

    // Project forward
    const projections = [];
    let mrr = currentMRR;
    for (let i = 0; i <= months; i++) {
      projections.push({
        month: i,
        mrr,
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000),
      });
      mrr = mrr * (1 + requiredGrowth);
    }

    return { requiredGrowthPercent, annualGrowth, t2d3Status, projections };
  }, [currentMRR, targetMRR, months]);

  return (
    <div className="min-h-screen bg-centurion-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Free Tool</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Growth Rate Calculator
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Calculate the growth rate needed to hit your revenue targets.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Growth Plan</h2>

              {/* Current MRR */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Current MRR</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {formatCurrency(currentMRR, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={currentMRR}
                  onChange={(e) => setCurrentMRR(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Target MRR */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Target MRR</label>
                  <span className="text-lg font-semibold text-green-400 tabular-nums">
                    {formatCurrency(targetMRR, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="50000000"
                  step="100000"
                  value={targetMRR}
                  onChange={(e) => setTargetMRR(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* Timeframe */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Timeframe</label>
                  <span className="text-lg font-semibold text-purple-400 tabular-nums">
                    {months} months
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="36"
                  step="1"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>3 months</span>
                  <span>3 years</span>
                </div>
              </div>

              {/* Growth Multiplier */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Growth Multiplier</span>
                  <span className="text-2xl font-bold text-white tabular-nums">
                    {(targetMRR / currentMRR).toFixed(1)}x
                  </span>
                </div>
              </div>
            </CenturionCard>

            {/* Results Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Required Growth</h2>

              {/* Main Growth Rate */}
              <motion.div
                className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="text-center">
                  <p className="text-5xl font-bold text-cyan-400 tabular-nums mb-2">
                    {metrics.requiredGrowthPercent.toFixed(1)}%
                  </p>
                  <p className="text-white/60">monthly growth rate required</p>
                </div>
              </motion.div>

              {/* T2D3 Status */}
              <div
                className="p-4 rounded-lg mb-6 flex items-center gap-3"
                style={{
                  backgroundColor: `${T2D3_STATUS[metrics.t2d3Status].color}15`,
                  border: `1px solid ${T2D3_STATUS[metrics.t2d3Status].color}30`
                }}
              >
                <Zap className="w-5 h-5" style={{ color: T2D3_STATUS[metrics.t2d3Status].color }} />
                <div>
                  <p className="font-semibold" style={{ color: T2D3_STATUS[metrics.t2d3Status].color }}>
                    {T2D3_STATUS[metrics.t2d3Status].label}
                  </p>
                  <p className="text-sm text-white/50">
                    {T2D3_STATUS[metrics.t2d3Status].description}
                  </p>
                </div>
              </div>

              {/* Key Milestones */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white/70">Key Milestones</h3>
                {[
                  { month: Math.floor(months / 4), label: 'Q1' },
                  { month: Math.floor(months / 2), label: 'Mid' },
                  { month: months, label: 'Target' },
                ].map((milestone, i) => {
                  const proj = metrics.projections[milestone.month] || metrics.projections[metrics.projections.length - 1];
                  return (
                    <motion.div
                      key={milestone.label}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <span className="text-white/60">{milestone.label}</span>
                      <span className="font-semibold text-white tabular-nums">
                        {formatCurrency(proj?.mrr || 0, true)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Annual Growth */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Implied Annual Growth</span>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {((metrics.annualGrowth + 1) * 100).toFixed(0)}% ({(metrics.annualGrowth + 1).toFixed(1)}x)
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button className="w-full">
                  Get Detailed Forecasting
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CenturionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

