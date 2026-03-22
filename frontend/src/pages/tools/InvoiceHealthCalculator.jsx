// Invoice Health Calculator
// Calculates collections risk score and cash flow runway from AR aging data

import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { storeAuthIntent } from '@/lib/auth/intent';
import { ResultGate } from '@/components/calculator/ResultGate';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SliderInput } from '@/components/ui/SliderInput';

const fmt_inr = (v) => {
  const n = Math.round(v);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

// ─── Local glass card to match 100Cr Calculator visual style ─────────────────
const GlassCard = ({ children, className = '' }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'linear-gradient(135deg, rgba(0,191,255,0.07) 0%, rgba(0,153,204,0.04) 40%, rgba(0,96,128,0.05) 100%)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(0,191,255,0.16)',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset, 0 16px 48px rgba(0,0,0,0.18)',
    }}
  >
    {/* Top specular */}
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(0,191,255,0.50) 30%, rgba(255,255,255,0.40) 50%, rgba(0,191,255,0.50) 70%, transparent 100%)',
      }}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

export const InvoiceHealthCalculator = () => {
  const { isAuthenticated } = useAuth();

  const [total,    setTotal]    = useState(500000);
  const [due30,    setDue30]    = useState(100000);
  const [due60,    setDue60]    = useState(50000);
  const [due60p,   setDue60p]   = useState(0);
  const [expenses, setExpenses] = useState(300000);

  // Store auth intent when unauthenticated user lands on gated content
  useEffect(() => {
    if (!isAuthenticated) {
      storeAuthIntent({
        intent: 'invoice-calculator',
        redirectTo: '/dashboard/cashflow',
      });
    }
  }, [isAuthenticated]);

  const { atRisk, score, safeDays, riskLevel, riskColor } = useMemo(() => {
    const atRisk = due60 + due60p;

    const score = total > 0
      ? Math.max(0, Math.round(100 - (atRisk / total * 100)))
      : 100;

    const safeDays = expenses > 0
      ? Math.round(((total - atRisk) / expenses) * 30)
      : 999;

    const riskLevel =
      score >= 80 ? 'Low Risk'
      : score >= 60 ? 'Medium Risk'
      : 'High Risk';

    const riskColor =
      score >= 80 ? '#10B981'
      : score >= 60 ? '#F59E0B'
      : '#EF4444';

    return { atRisk, score, safeDays, riskLevel, riskColor };
  }, [total, due60, due60p, expenses]);

  const safeDaysColor =
    safeDays < 30  ? '#EF4444'
    : safeDays < 60 ? '#F59E0B'
    : '#10B981';

  const safeDaysLabel =
    safeDays < 30  ? 'Critical'
    : safeDays < 60 ? 'Monitor closely'
    : 'Healthy';

  const actions = useMemo(() => {
    if (score < 60) {
      return ['Chase all 60+ day invoices this week — these are at highest risk of default'];
    }
    if (score < 80) {
      return ['Send a gentle reminder to 31-60 day overdue clients today'];
    }
    return ['Your collections are healthy. Set up automated reminders to maintain this score.'];
  }, [score]);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: '#FAFAFA' }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.25]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-28 pb-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8">

            {/* Header */}
            <div className="text-center mb-12">
              <h1
                className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold text-[#09090B]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Invoice Health Calculator
              </h1>
              <p className="text-lg text-[#71717A] max-w-xl mx-auto">
                See your collections risk score and cash flow runway in seconds
              </p>
            </div>

            {/* Two-column layout */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">

              {/* Left — Inputs */}
              <GlassCard>
                <div className="p-8 space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-[#09090B] mb-1">
                      Your AR Data
                    </h2>
                    <p className="text-sm text-[#71717A]">
                      Adjust sliders to match your current invoices
                    </p>
                  </div>

                  <SliderInput
                    label="Total Outstanding"
                    value={total}
                    onChange={setTotal}
                    min={10000}
                    max={10000000}
                    step={10000}
                    formatValue={fmt_inr}
                    data-testid="slider-total"
                  />

                  <SliderInput
                    label="Overdue 0–30 days"
                    value={due30}
                    onChange={setDue30}
                    min={0}
                    max={5000000}
                    step={10000}
                    formatValue={fmt_inr}
                    data-testid="slider-due30"
                  />

                  <SliderInput
                    label="Overdue 31–60 days"
                    value={due60}
                    onChange={setDue60}
                    min={0}
                    max={5000000}
                    step={10000}
                    formatValue={fmt_inr}
                    data-testid="slider-due60"
                  />

                  <SliderInput
                    label="Overdue 60+ days"
                    value={due60p}
                    onChange={setDue60p}
                    min={0}
                    max={5000000}
                    step={10000}
                    formatValue={fmt_inr}
                    data-testid="slider-due60p"
                  />

                  <SliderInput
                    label="Monthly Operating Expenses"
                    value={expenses}
                    onChange={setExpenses}
                    min={10000}
                    max={5000000}
                    step={10000}
                    formatValue={fmt_inr}
                    data-testid="slider-expenses"
                  />
                </div>
              </GlassCard>

              {/* Right — Results */}
              <div className="space-y-4">

                {/* Card 1 — Risk Score (always visible) */}
                <GlassCard>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-[#71717A] mb-3">
                      Collections Risk Score
                    </p>
                    <div className="flex items-end gap-3">
                      <span
                        className="font-mono text-5xl font-bold tabular-nums"
                        style={{ color: riskColor }}
                        data-testid="risk-score"
                      >
                        {score}
                      </span>
                      <span className="text-[#71717A] text-sm mb-2">/100</span>
                      <span
                        className="mb-2 text-xs font-semibold px-2.5 py-1 rounded-full ml-1"
                        style={{
                          background: `${riskColor}18`,
                          color: riskColor,
                          border: `1px solid ${riskColor}30`,
                        }}
                      >
                        {riskLevel}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Card 2 — Safe Cash Days (always visible) */}
                <GlassCard>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-[#71717A] mb-3">
                      Cash Runway
                    </p>
                    <div className="flex items-end gap-3">
                      <span
                        className="font-mono text-5xl font-bold tabular-nums"
                        style={{ color: safeDaysColor }}
                        data-testid="safe-days"
                      >
                        {safeDays > 999 ? '999+' : safeDays}
                      </span>
                      <span className="text-[#71717A] text-sm mb-2">days of safe cash</span>
                      <span
                        className="mb-2 text-xs font-semibold px-2.5 py-1 rounded-full ml-1"
                        style={{
                          background: `${safeDaysColor}18`,
                          color: safeDaysColor,
                          border: `1px solid ${safeDaysColor}30`,
                        }}
                      >
                        {safeDaysLabel}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                {/* Card 3 — At Risk Amount (gated) */}
                <div className="relative overflow-hidden rounded-2xl isolate">
                  <GlassCard>
                    <div
                      className={cn('p-6', !isAuthenticated && 'blur-sm select-none pointer-events-none')}
                    >
                      <p className="text-xs uppercase tracking-wider text-[#71717A] mb-3">
                        Amount at Risk
                      </p>
                      <p
                        className="font-mono text-4xl font-bold tabular-nums text-[#EF4444]"
                        data-testid="at-risk-amount"
                      >
                        {fmt_inr(atRisk)}
                      </p>
                      <p className="text-sm text-[#71717A] mt-2">
                        invoices overdue 30+ days
                      </p>
                    </div>
                  </GlassCard>
                  <ResultGate />
                </div>

                {/* Card 4 — Recommended Actions (gated) */}
                <div className="relative overflow-hidden rounded-2xl isolate">
                  <GlassCard>
                    <div
                      className={cn('p-6', !isAuthenticated && 'blur-sm select-none pointer-events-none')}
                    >
                      <p className="text-xs uppercase tracking-wider text-[#71717A] mb-3">
                        Recommended Actions
                      </p>
                      <ul className="space-y-2">
                        {(isAuthenticated ? actions : [
                          'Sign up to see your personalised action plan',
                          'Track which clients to chase first',
                        ]).map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#09090B]">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#09090B] shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                  <ResultGate />
                </div>

              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default InvoiceHealthCalculator;
