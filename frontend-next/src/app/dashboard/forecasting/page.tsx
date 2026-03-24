'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, TrendingUp, Target, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRunProjection, useScenarioAnalysis } from '@/hooks/useApi';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, CRORE } from '@/lib/utils';

const MILESTONES = [
  { label: '₹1Cr', value: 1 * CRORE },
  { label: '₹10Cr', value: 10 * CRORE },
  { label: '₹50Cr', value: 50 * CRORE },
  { label: '₹100Cr', value: 100 * CRORE },
];

export default function ForecastingEnginePage() {
  const { profile } = useAuth();
  const runProjection = useRunProjection();
  const runScenarios = useScenarioAnalysis();

  const [mrr, setMrr] = useState(profile?.current_mrr || 500000);
  const [growthRate, setGrowthRate] = useState((profile?.growth_rate || 0.08) * 100);
  const [months, setMonths] = useState(24);
  const [projectionResult, setProjectionResult] = useState<any>(null);
  const [scenarios, setScenarios] = useState([
    { name: 'Conservative', growth_rate: 5 },
    { name: 'Base Case', growth_rate: 8 },
    { name: 'Aggressive', growth_rate: 15 },
  ]);
  const [scenarioResults, setScenarioResults] = useState<any>(null);

  const handleRunProjection = async () => {
    try {
      const result = await runProjection.mutateAsync({
        current_mrr: mrr,
        growth_rate: growthRate / 100,
        months,
      });
      setProjectionResult(result);
    } catch (error) {
      console.error('Projection failed:', error);
    }
  };

  const handleRunScenarios = async () => {
    try {
      const result = await runScenarios.mutateAsync(
        scenarios.map(s => ({ ...s, growth_rate: s.growth_rate / 100, current_mrr: mrr }))
      );
      setScenarioResults(result);
    } catch (error) {
      console.error('Scenario analysis failed:', error);
    }
  };

  // Calculate local projections for display
  const projectedMilestones = MILESTONES.map(milestone => {
    const rate = growthRate / 100;
    const currentARR = mrr * 12;
    if (currentARR >= milestone.value) {
      return { ...milestone, months: 0, achieved: true, date: '' };
    }
    const targetMRR = milestone.value / 12;
    const monthsToMilestone = Math.ceil(Math.log(targetMRR / mrr) / Math.log(1 + rate));
    const date = new Date();
    date.setMonth(date.getMonth() + monthsToMilestone);
    return {
      ...milestone,
      months: monthsToMilestone,
      achieved: false,
      date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Forecasting Engine</h1>
        <p className="text-white/60 mt-1">Model your growth and run scenario analyses</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projection Inputs */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              Revenue Projection
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-6">
              {/* MRR */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-white/60">Current MRR</label>
                  <span className="text-cyan-400 font-semibold">{formatCurrency(mrr, true)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={mrr}
                  onChange={(e) => setMrr(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Growth Rate */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-white/60">Monthly Growth Rate</label>
                  <span className="text-cyan-400 font-semibold">{growthRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Months */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-white/60">Projection Period</label>
                  <span className="text-cyan-400 font-semibold">{months} months</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="60"
                  step="6"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <Button onClick={handleRunProjection} loading={runProjection.isPending} className="w-full">
                <Play className="w-4 h-4" />
                Run Projection
              </Button>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Milestones */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Milestone Timeline
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-4">
              {projectedMilestones.map((milestone, i) => (
                <motion.div
                  key={milestone.label}
                  className={`p-4 rounded-lg border ${
                    milestone.achieved
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${milestone.achieved ? 'bg-green-400' : 'bg-cyan-400'}`} />
                      <span className="font-semibold text-white">{milestone.label}</span>
                    </div>
                    <div className="text-right">
                      {milestone.achieved ? (
                        <span className="text-green-400 font-semibold">Achieved! 🎉</span>
                      ) : (
                        <>
                          <p className="text-white font-semibold">{milestone.months} months</p>
                          <p className="text-sm text-white/50">{milestone.date}</p>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Scenario Analysis */}
      <CenturionCard>
        <CenturionCardHeader>
          <div className="flex items-center justify-between">
            <CenturionCardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Scenario Analysis
            </CenturionCardTitle>
            <Button variant="secondary" size="sm" onClick={handleRunScenarios} loading={runScenarios.isPending}>
              Run Scenarios
            </Button>
          </div>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((scenario, i) => {
              const colors = ['text-amber-400', 'text-cyan-400', 'text-green-400'];
              const bgColors = ['bg-amber-500/10', 'bg-cyan-500/10', 'bg-green-500/10'];

              // Calculate projected ARR for this scenario
              const projectedARR = mrr * 12 * Math.pow(1 + scenario.growth_rate / 100, 12);

              return (
                <div key={scenario.name} className={`p-4 rounded-lg ${bgColors[i]} border border-white/10`}>
                  <h4 className={`font-semibold ${colors[i]} mb-2`}>{scenario.name}</h4>
                  <p className="text-sm text-white/60 mb-1">Growth: {scenario.growth_rate}% / month</p>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {formatCurrency(projectedARR, true)} ARR
                  </p>
                  <p className="text-xs text-white/40">in 12 months</p>
                </div>
              );
            })}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

