'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Target, ArrowRight, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Navbar } from '@/components/layout/Navbar';
import { formatCurrency, formatCrore, CRORE } from '@/lib/utils';

const MILESTONES = [
  { label: '₹1 Crore', value: 1 * CRORE },
  { label: '₹10 Crore', value: 10 * CRORE },
  { label: '₹50 Crore', value: 50 * CRORE },
  { label: '₹100 Crore', value: 100 * CRORE },
];

export default function HundredCrCalculatorPage() {
  const [mrr, setMrr] = useState(500000); // 5 lakhs default
  const [growthRate, setGrowthRate] = useState(8); // 8% default

  // Calculate milestones
  const calculateMilestones = () => {
    const rate = growthRate / 100;
    const currentARR = mrr * 12;

    return MILESTONES.map((milestone) => {
      if (currentARR >= milestone.value) {
        return { ...milestone, months: 0, achieved: true, date: '' };
      }

      // t = ln(target_mrr / current_mrr) / ln(1 + growth_rate)
      const targetMRR = milestone.value / 12;
      const months = Math.ceil(Math.log(targetMRR / mrr) / Math.log(1 + rate));

      const date = new Date();
      date.setMonth(date.getMonth() + months);

      return {
        ...milestone,
        months,
        achieved: false,
        date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      };
    });
  };

  const milestones = calculateMilestones();
  const currentARR = mrr * 12;

  return (
    <div className="min-h-screen bg-centurion-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Free Tool</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              100Cr Calculator
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Calculate your path to ₹100 Crore ARR based on your current MRR and growth rate.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Metrics</h2>

              {/* MRR Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Recurring Revenue</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {formatCurrency(mrr, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={mrr}
                  onChange={(e) => setMrr(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Growth Rate Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Growth Rate</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {growthRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              {/* Current ARR */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Current ARR</p>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {formatCrore(currentARR)}
                </p>
              </div>
            </CenturionCard>

            {/* Results Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Milestones</h2>

              <div className="space-y-4">
                {milestones.map((milestone, i) => (
                  <motion.div
                    key={milestone.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      milestone.achieved
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className={`w-5 h-5 ${milestone.achieved ? 'text-green-400' : 'text-cyan-400'}`} />
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

              <div className="flex gap-3 mt-8">
                <Button variant="secondary" className="flex-1">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="secondary" className="flex-1">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CenturionCard>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-white/60 mb-4">
              Want AI-powered insights and benchmark comparisons?
            </p>
            <Button size="lg">
              Get Full Dashboard Access
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


