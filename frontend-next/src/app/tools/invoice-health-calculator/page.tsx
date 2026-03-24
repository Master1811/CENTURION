'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';
import { Navbar } from '@/components/layout/Navbar';
import { formatCurrency } from '@/lib/utils';

export default function InvoiceHealthCalculatorPage() {
  const [totalOutstanding, setTotalOutstanding] = useState(500000);
  const [due30, setDue30] = useState(100000);
  const [due60, setDue60] = useState(50000);
  const [due90Plus, setDue90Plus] = useState(20000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(300000);

  const metrics = useMemo(() => {
    const atRisk = due60 + due90Plus;
    const score = totalOutstanding > 0
      ? Math.max(0, Math.round(100 - (atRisk / totalOutstanding * 100)))
      : 100;

    const safeDays = monthlyExpenses > 0
      ? Math.round(((totalOutstanding - atRisk) / monthlyExpenses) * 30)
      : 999;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let riskColor = '#22C55E';
    if (score < 60) {
      riskLevel = 'high';
      riskColor = '#EF4444';
    } else if (score < 80) {
      riskLevel = 'medium';
      riskColor = '#F59E0B';
    }

    return { atRisk, score, safeDays, riskLevel, riskColor };
  }, [totalOutstanding, due30, due60, due90Plus, monthlyExpenses]);

  const recommendations = useMemo(() => {
    if (metrics.score < 60) {
      return [
        'Chase all 60+ day invoices this week — highest risk of default',
        'Consider offering early payment discounts',
        'Review client creditworthiness before new projects',
      ];
    }
    if (metrics.score < 80) {
      return [
        'Send gentle reminders to 31-60 day overdue clients',
        'Set up automated payment reminders',
        'Review payment terms with repeat offenders',
      ];
    }
    return [
      'Your collections are healthy',
      'Maintain automated reminder systems',
      'Consider early payment incentives to improve further',
    ];
  }, [metrics.score]);

  return (
    <div className="min-h-screen bg-centurion-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-cyan-400">Free Tool</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Invoice Health Calculator
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              See your collections risk score and cash flow runway in seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Your AR Data</h2>

              {/* Total Outstanding */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Total Outstanding</label>
                  <span className="text-lg font-semibold text-cyan-400 tabular-nums">
                    {formatCurrency(totalOutstanding, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={totalOutstanding}
                  onChange={(e) => setTotalOutstanding(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* 0-30 Days */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Overdue 0-30 days</label>
                  <span className="text-lg font-semibold text-green-400 tabular-nums">
                    {formatCurrency(due30, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={due30}
                  onChange={(e) => setDue30(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
              </div>

              {/* 31-60 Days */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Overdue 31-60 days</label>
                  <span className="text-lg font-semibold text-yellow-400 tabular-nums">
                    {formatCurrency(due60, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={due60}
                  onChange={(e) => setDue60(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              {/* 60+ Days */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Overdue 60+ days</label>
                  <span className="text-lg font-semibold text-red-400 tabular-nums">
                    {formatCurrency(due90Plus, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={due90Plus}
                  onChange={(e) => setDue90Plus(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Monthly Expenses */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-white/60">Monthly Expenses</label>
                  <span className="text-lg font-semibold text-purple-400 tabular-nums">
                    {formatCurrency(monthlyExpenses, true)}
                  </span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="10000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </CenturionCard>

            {/* Results Card */}
            <CenturionCard className="p-8">
              <h2 className="text-xl font-semibold text-white mb-6">Collections Health</h2>

              {/* Health Score */}
              <motion.div
                className="p-6 rounded-xl mb-6"
                style={{
                  backgroundColor: `${metrics.riskColor}15`,
                  border: `1px solid ${metrics.riskColor}30`
                }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="text-center">
                  <p className="text-5xl font-bold tabular-nums mb-2" style={{ color: metrics.riskColor }}>
                    {metrics.score}
                  </p>
                  <p className="text-white/60 text-lg">Collections Health Score</p>
                </div>
              </motion.div>

              {/* At Risk Amount */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-white/60">At-Risk Amount</span>
                  </div>
                  <span className="text-xl font-bold text-red-400 tabular-nums">
                    {formatCurrency(metrics.atRisk, true)}
                  </span>
                </div>
              </div>

              {/* Safe Days */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span className="text-white/60">Cash Flow Runway</span>
                  </div>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {metrics.safeDays > 99 ? '99+' : metrics.safeDays} days
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-white/70">Recommended Actions</h3>
                {recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/70">{rec}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <Button className="w-full">
                  Get AR Aging Dashboard
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

