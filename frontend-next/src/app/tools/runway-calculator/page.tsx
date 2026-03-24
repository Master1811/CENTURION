'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wallet, AlertTriangle, TrendingDown, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Navbar } from '@/components/layout/Navbar';
import { formatCurrency, CRORE, LAKH } from '@/lib/utils';

const STATUS = {
  critical: { label: 'Critical — raise funding immediately', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  warning: { label: 'Start fundraising conversations', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  healthy: { label: 'Healthy runway', color: '#22C55E', bg: 'rgba(34,197,94,0.10)' },
};

export default function RunwayCalculatorPage() {
  const [cashBalance, setCashBalance] = useState(5000000); // 50 lakhs
  const [monthlyBurn, setMonthlyBurn] = useState(500000); // 5 lakhs
  const [monthlyRevenue, setMonthlyRevenue] = useState(200000); // 2 lakhs

  const metrics = useMemo(() => {
    const netBurn = Math.max(0, monthlyBurn - monthlyRevenue);
    const runwayMonths = netBurn > 0 ? Math.floor(cashBalance / netBurn) : 999;

    let status: keyof typeof STATUS = 'healthy';
    if (runwayMonths <= 6) status = 'critical';
    else if (runwayMonths <= 12) status = 'warning';

    const zeroDate = new Date();
    zeroDate.setMonth(zeroDate.getMonth() + runwayMonths);

    return { netBurn, runwayMonths, status, zeroDate };
  }, [cashBalance, monthlyBurn, monthlyRevenue]);

  return (
    <div className="min-h-screen bg-centurion-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Free Tool</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Runway Calculator
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Calculate your startup runway and know when to start fundraising.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Financials</h2>

              {/* Cash Balance */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Cash Balance</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {formatCurrency(cashBalance, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="100000000"
                  step="100000"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>₹1L</span>
                  <span>₹10Cr</span>
                </div>
              </div>

              {/* Monthly Burn */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Burn Rate</label>
                  <span className="text-lg font-semibold text-red-400 tabular-nums">
                    {formatCurrency(monthlyBurn, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="50000"
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Monthly Revenue */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Revenue</label>
                  <span className="text-lg font-semibold text-green-400 tabular-nums">
                    {formatCurrency(monthlyRevenue, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* Net Burn Summary */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Net Monthly Burn</span>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {formatCurrency(metrics.netBurn, true)}
                  </span>
                </div>
              </div>
            </CenturionCard>

            {/* Results Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your Runway</h2>

              {/* Main Runway Display */}
              <motion.div
                className="p-6 rounded-xl mb-6"
                style={{
                  backgroundColor: STATUS[metrics.status].bg,
                  border: `1px solid ${STATUS[metrics.status].color}30`
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="text-center">
                  <p className="text-5xl font-bold tabular-nums mb-2" style={{ color: STATUS[metrics.status].color }}>
                    {metrics.runwayMonths > 99 ? '99+' : metrics.runwayMonths}
                  </p>
                  <p className="text-white/60 text-lg">months of runway</p>
                </div>
              </motion.div>

              {/* Status Badge */}
              <div
                className="p-4 rounded-lg mb-6 flex items-center gap-3"
                style={{
                  backgroundColor: STATUS[metrics.status].bg,
                  border: `1px solid ${STATUS[metrics.status].color}30`
                }}
              >
                {metrics.status === 'healthy' ? (
                  <CheckCircle className="w-5 h-5" style={{ color: STATUS[metrics.status].color }} />
                ) : (
                  <AlertTriangle className="w-5 h-5" style={{ color: STATUS[metrics.status].color }} />
                )}
                <span style={{ color: STATUS[metrics.status].color }}>
                  {STATUS[metrics.status].label}
                </span>
              </div>

              {/* Zero Date */}
              {metrics.runwayMonths < 100 && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Projected Zero Date</span>
                    <span className="text-white font-semibold">
                      {metrics.zeroDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/70">Recommendations</h3>
                {metrics.status === 'critical' && (
                  <p className="text-sm text-white/60">
                    Start fundraising immediately. With less than 6 months runway, you need to secure funding or achieve profitability fast.
                  </p>
                )}
                {metrics.status === 'warning' && (
                  <p className="text-sm text-white/60">
                    Begin fundraising conversations now. It typically takes 3-6 months to close a round.
                  </p>
                )}
                {metrics.status === 'healthy' && (
                  <p className="text-sm text-white/60">
                    Your runway is healthy. Focus on growth and keep an eye on your burn rate.
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button className="w-full">
                  Get Cash Flow Insights
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

