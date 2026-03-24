'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Navbar } from '@/components/layout/Navbar';
import { formatCurrency, CRORE, LAKH } from '@/lib/utils';

export default function ARRCalculatorPage() {
  const [mrr, setMrr] = useState(500000);
  const [customers, setCustomers] = useState(50);
  const [churnRate, setChurnRate] = useState(3);

  const metrics = useMemo(() => {
    const arr = mrr * 12;
    const arpu = customers > 0 ? mrr / customers : 0;
    const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 100;
    const nrr = 100 - churnRate + 2; // Simplified NRR calculation

    return { arr, arpu, ltv, nrr };
  }, [mrr, customers, churnRate]);

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
              ARR Calculator
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Calculate your Annual Recurring Revenue, ARPU, LTV, and NRR metrics.
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
              </div>

              {/* Customers Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Number of Customers</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {customers}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={customers}
                  onChange={(e) => setCustomers(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Churn Rate Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Churn Rate</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {churnRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={churnRate}
                  onChange={(e) => setChurnRate(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </CenturionCard>

            {/* Results Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your SaaS Metrics</h2>

              <div className="space-y-4">
                <motion.div
                  className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/60">Annual Recurring Revenue</span>
                    </div>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      {formatCurrency(metrics.arr, true)}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-white/60">ARPU (Monthly)</span>
                    </div>
                    <span className="text-xl font-bold text-white tabular-nums">
                      {formatCurrency(metrics.arpu, true)}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-white/60">Customer LTV</span>
                    </div>
                    <span className="text-xl font-bold text-white tabular-nums">
                      {formatCurrency(metrics.ltv, true)}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                      <span className="text-white/60">Net Revenue Retention</span>
                    </div>
                    <span className="text-xl font-bold text-white tabular-nums">
                      {metrics.nrr.toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-white/50 text-sm mb-4">
                  Want AI-powered insights and benchmark comparisons?
                </p>
                <Button className="w-full">
                  Get Full Dashboard Access
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

