// 100Cr Calculator - enhanced with liquid glass + cyan atmosphere
// PATCH applied: overflow-hidden rounded-xl isolate on milestone gate wrapper
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  Info,
  Share2,
  Download,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis,
  ResponsiveContainer, ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { useAuth } from '@/context/AuthContext';
import { storeAuthIntent } from '@/lib/auth/intent';
import { ResultGate } from '@/components/calculator/ResultGate';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SliderInput } from '@/components/ui/SliderInput';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { predictTrajectory, generateChartData } from '@/lib/engine/projection';
import {
  compareToBenchmark, getBenchmarkData,
  inferStage, getStageName,
} from '@/lib/engine/benchmarks';
import {
  formatCrore, formatPercent, formatDate,
  CRORE, LAKH, STAGES,
} from '@/lib/engine/constants';

// ─── Color tokens (matches HeroSection) ──────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  darkCorner2: '#0A0F14',
};

// ─── Liquid Glass card primitive ─────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {}, ...props }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={style}
    {...props}
  >
    {/* Frosted base */}
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(
          135deg,
          rgba(0,191,255,0.07) 0%,
          rgba(0,153,204,0.04) 40%,
          rgba(0,96,128,0.05) 100%
        )`,
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      }}
    />
    {/* Top-edge specular */}
    <div
      className="absolute inset-x-0 top-0 h-px"
      style={{
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(0,191,255,0.50) 30%,
          rgba(255,255,255,0.40) 50%,
          rgba(0,191,255,0.50) 70%,
          transparent 100%
        )`,
      }}
    />
    {/* Inner top glow */}
    <div
      className="absolute inset-x-0 top-0 h-28 pointer-events-none"
      style={{
        background: `radial-gradient(
          ellipse 80% 60% at 50% -10%,
          rgba(0,191,255,0.10) 0%,
          transparent 70%
        )`,
      }}
    />
    {/* Left caustic */}
    <div
      className="absolute inset-y-0 left-0 w-px"
      style={{
        background: `linear-gradient(
          180deg,
          transparent 0%,
          rgba(0,191,255,0.38) 25%,
          rgba(255,255,255,0.18) 50%,
          rgba(0,191,255,0.38) 75%,
          transparent 100%
        )`,
      }}
    />
    {/* Outer border */}
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        border: '1px solid rgba(0,191,255,0.16)',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.05) inset,
          0 16px 48px rgba(0,0,0,0.18),
          0 4px 16px rgba(0,191,255,0.08)
        `,
      }}
    />
    {/* Content */}
    <div className="relative z-10">{children}</div>
  </div>
);

// ─── Dark glass card (for result hero + chart) ────────────────────────────────
const DarkGlassCard = ({ children, className = '', ...props }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    {...props}
  >
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(
          150deg,
          rgba(0,15,25,0.92) 0%,
          rgba(0,10,20,0.96) 100%
        )`,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    />
    {/* Cyan rim at top */}
    <div
      className="absolute inset-x-0 top-0 h-px"
      style={{
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(0,191,255,0.60) 25%,
          rgba(255,255,255,0.35) 50%,
          rgba(0,191,255,0.60) 75%,
          transparent 100%
        )`,
      }}
    />
    {/* Glow at top */}
    <div
      className="absolute inset-x-0 top-0 h-32 pointer-events-none"
      style={{
        background: `radial-gradient(
          ellipse 70% 50% at 50% -5%,
          rgba(0,191,255,0.14) 0%,
          transparent 70%
        )`,
      }}
    />
    {/* Left caustic */}
    <div
      className="absolute inset-y-0 left-0 w-px"
      style={{
        background: `linear-gradient(
          180deg,
          transparent 0%,
          rgba(0,191,255,0.45) 30%,
          rgba(0,191,255,0.20) 70%,
          transparent 100%
        )`,
      }}
    />
    {/* Outer border */}
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        border: '1px solid rgba(0,191,255,0.20)',
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.04) inset,
          0 24px 64px rgba(0,0,0,0.40),
          0 6px 24px rgba(0,191,255,0.10)
        `,
      }}
    />
    <div className="relative z-10">{children}</div>
  </div>
);

// ─── Custom Recharts tooltip ───────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(0,10,20,0.90)',
        border: '1px solid rgba(0,191,255,0.25)',
        borderRadius: 10,
        padding: '8px 14px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <p style={{ color: 'rgba(0,191,255,0.65)', fontSize: 11, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          style={{
            color: entry.name === 'Your projection'
              ? C.brightCyan2
              : 'rgba(255,255,255,0.45)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {formatCrore(entry.value)}
        </p>
      ))}
    </div>
  );
};

// ─── Milestone card ────────────────────────────────────────────────────────────
const MilestoneCard = ({ milestone }) => (
  <div
    className="relative rounded-xl overflow-hidden text-center py-5 px-3"
    style={{
      background: milestone.reached
        ? 'rgba(0,191,255,0.06)'
        : 'rgba(255,255,255,0.04)',
      border: milestone.reached
        ? '1px solid rgba(0,191,255,0.22)'
        : '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
    }}
  >
    {/* Top specular on reached milestone */}
    {milestone.reached && (
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(
            90deg,
            transparent,
            rgba(0,191,255,0.50) 50%,
            transparent
          )`,
        }}
      />
    )}
    <p
      className="font-mono text-lg font-semibold tabular-nums mb-1"
      style={{
        color: milestone.reached ? C.brightCyan2 : 'rgba(255,255,255,0.85)',
      }}
    >
      {milestone.label}
    </p>
    {milestone.date ? (
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {formatDate(milestone.date)}
      </p>
    ) : milestone.reached ? (
      <p
        className="text-xs font-medium"
        style={{ color: 'rgba(0,191,255,0.65)' }}
      >
        Reached ✓
      </p>
    ) : (
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        10+ years
      </p>
    )}
  </div>
);

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_MRR    = 200000;
const DEFAULT_GROWTH = 0.08;

// ─── Main component ───────────────────────────────────────────────────────────
export const HundredCrCalculator = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [gateDismissed, setGateDismissed] = useState(
    () => sessionStorage.getItem('centurion_gate_dismissed') === 'true'
  );
  const [shareLoading, setShareLoading]   = useState(false);
  const [shareSuccess, setShareSuccess]   = useState(false);
  const [mrr, setMrr]                     = useState(DEFAULT_MRR);
  const [growthRate, setGrowthRate]       = useState(DEFAULT_GROWTH);
  const [selectedStage, setSelectedStage] = useState(STAGES.PRE_SEED);

  const projection = useMemo(
    () => predictTrajectory({ currentMRR: mrr, growthRate }),
    [mrr, growthRate]
  );

  // Guard: ensure projection has milestones
  if (!projection || !projection.milestones || projection.milestones.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">Unable to generate projection</p>
          <p className="text-white/30 text-xs">Please check your inputs</p>
        </div>
      </div>
    );
  }

  const chartData = useMemo(() => {
    const benchmark = getBenchmarkData(selectedStage);
    return generateChartData({ currentMRR: mrr, growthRate }, benchmark.median);
  }, [mrr, growthRate, selectedStage]);

  const benchmarkResult = useMemo(
    () => compareToBenchmark(growthRate, selectedStage),
    [growthRate, selectedStage]
  );

  const formatMRR = useCallback((v) =>
    v >= CRORE
      ? `₹${(v / CRORE).toFixed(1)} Cr`
      : `₹${(v / LAKH).toFixed(1)} L`,
  []);

  const formatGrowth = useCallback(
    (v) => `${(v * 100).toFixed(0)}%`, []
  );

  const hundredCrMilestone = projection.milestones.find(
    (m) => m.value === 100 * CRORE
  );
  const monthsToTarget = hundredCrMilestone?.monthsToReach;
  const targetDate     = hundredCrMilestone?.date;

  const handleShare = async () => {
    if (!isAuthenticated) {
      storeAuthIntent({ intent: 'save-projection', redirectTo: '/dashboard' });
      window.dispatchEvent(new CustomEvent('centurion:open-auth', {
        detail: {
          headline: 'Sign in to share',
          subtext: 'Free account. No credit card.',
        },
      }));
      return;
    }
    try {
      setShareLoading(true);
      setShareSuccess(false);
      const token = getAccessToken();
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/engine/projection`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currentMRR: mrr, growthRate }),
        }
      );
      if (!res.ok) throw new Error('Share failed');
      const data = await res.json();
      if (data.slug) {
        await navigator.clipboard.writeText(
          `${window.location.origin}/p/${data.slug}`
        );
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden centurion-tool-typography"
      style={{ background: C.darkCorner }}
      data-testid="calculator-page"
    >

      {/* ── Ambient atmosphere (matches hero) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 65% 40% at 50% -8%,
              rgba(0,191,255,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 8%  30%,
              rgba(0,96,128,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 92% 30%,
              rgba(0,96,128,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 50% 100%,
              rgba(0,30,50,0.60)  0%, transparent 60%)
          `,
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.16]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.28) 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
          maskImage:
            'radial-gradient(ellipse 75% 50% at 50% 15%, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 75% 50% at 50% 15%, black 30%, transparent 75%)',
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <main className="pt-28 pb-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8">

            {/* ── Header ── */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mb-4"
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                             text-xs font-semibold tracking-widest uppercase"
                  style={{
                    background: 'rgba(0,191,255,0.10)',
                    border: '1px solid rgba(0,191,255,0.28)',
                    color: `${C.brightCyan2}cc`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#22C55E' }}
                  />
                  Revenue Projection Engine
                </span>
              </motion.div>

              <motion.h1
                className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                data-testid="calculator-title"
              >
                When will you reach{' '}
                <span
                  className="italic"
                  style={{
                    background: `linear-gradient(
                      90deg, #fff 0%, ${C.brightCyan2} 55%, #fff 100%
                    )`,
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ₹100 Crore?
                </span>
              </motion.h1>

              <motion.p
                className="text-lg"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22 }}
              >
                {copy.calculator.subtitle}
              </motion.p>
            </div>

            {/* ── 3-column grid ── */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* ── LEFT: Inputs ── */}
              <div className="lg:col-span-1 space-y-5">

                {/* Input card */}
                <GlassCard>
                  <div className="p-6 space-y-8">

                    {/* MRR */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                          {copy.calculator.revenueLabel}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info
                                className="w-4 h-4"
                                strokeWidth={1.5}
                                style={{ color: 'rgba(0,191,255,0.55)' }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                {copy.tooltips.mrr}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <SliderInput
                        value={mrr}
                        onChange={setMrr}
                        min={10000}
                        max={50000000}
                        step={10000}
                        formatValue={formatMRR}
                        helperText={copy.calculator.revenueHelper}
                        data-testid="mrr-slider"
                      />
                    </div>

                    {/* Growth Rate */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'rgba(255,255,255,0.85)' }}
                        >
                          {copy.calculator.growthLabel}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info
                                className="w-4 h-4"
                                strokeWidth={1.5}
                                style={{ color: 'rgba(0,191,255,0.55)' }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">
                                {copy.tooltips.growthRate}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <SliderInput
                        value={growthRate}
                        onChange={setGrowthRate}
                        min={0.01}
                        max={0.30}
                        step={0.01}
                        formatValue={formatGrowth}
                        helperText={copy.calculator.growthHelper}
                        data-testid="growth-slider"
                      />
                    </div>

                    {/* Stage selector */}
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'rgba(0,191,255,0.60)' }}
                      >
                        YOUR STAGE
                      </p>
                      <div className="flex gap-2">
                        {Object.values(STAGES).map((stage) => (
                          <button
                            key={stage}
                            onClick={() => setSelectedStage(stage)}
                            className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all"
                            style={
                              selectedStage === stage
                                ? {
                                    background: `linear-gradient(
                                      135deg,
                                      ${C.brightCyan} 0%,
                                      ${C.midCyan} 60%,
                                      ${C.tealEdge} 100%
                                    )`,
                                    color: C.darkCorner,
                                    border: 'none',
                                    boxShadow: '0 2px 12px rgba(0,191,255,0.28)',
                                  }
                                : {
                                    background: 'rgba(0,191,255,0.06)',
                                    border: '1px solid rgba(0,191,255,0.20)',
                                    color: 'rgba(255,255,255,0.65)',
                                  }
                            }
                            data-testid={`stage-${stage}`}
                          >
                            {getStageName(stage)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Sensitivity card */}
                {projection.sensitivity.monthsGained && (
                  <GlassCard>
                    <div className="p-5">
                      <p
                        className="text-xs font-semibold uppercase tracking-widest mb-2"
                        style={{ color: 'rgba(0,191,255,0.55)' }}
                      >
                        {copy.calculator.sensitivity}
                      </p>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {copy.calculator.sensitivityResult}{' '}
                        <span
                          className="font-mono font-semibold tabular-nums"
                          style={{ color: C.brightCyan2 }}
                        >
                          {projection.sensitivity.monthsGained}
                        </span>{' '}
                        {copy.calculator.monthsEarlier}
                      </p>
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* ── RIGHT: Results ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Main result card — dark glass */}
                <DarkGlassCard>
                  <div className="p-8">

                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-6"
                      style={{ color: 'rgba(0,191,255,0.55)' }}
                    >
                      YOUR PATH TO{' '}
                      <span style={{ color: C.brightCyan2 }}>₹100 CRORE</span>
                    </p>

                    {/* Target date hero */}
                    {targetDate ? (
                      <div className="mb-8">
                        <motion.div
                          key={targetDate}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-baseline gap-3"
                        >
                          <span
                            className="font-mono text-4xl md:text-5xl font-bold tabular-nums text-white"
                            data-testid="target-date"
                          >
                            {formatDate(targetDate)}
                          </span>
                        </motion.div>
                        <p
                          className="text-sm mt-2"
                          style={{ color: 'rgba(255,255,255,0.50)' }}
                        >
                          Projected to reach ₹100 Crore by this date
                        </p>
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-2">
                            <Clock
                              className="w-4 h-4"
                              strokeWidth={1.5}
                              style={{ color: 'rgba(0,191,255,0.55)' }}
                            />
                            <span
                              className="font-mono text-sm tabular-nums"
                              style={{ color: 'rgba(255,255,255,0.70)' }}
                            >
                              {monthsToTarget} months
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar
                              className="w-4 h-4"
                              strokeWidth={1.5}
                              style={{ color: 'rgba(0,191,255,0.55)' }}
                            />
                            <span
                              className="font-mono text-sm tabular-nums"
                              style={{ color: 'rgba(255,255,255,0.70)' }}
                            >
                              {Math.floor(monthsToTarget / 12)} years
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8">
                        <p className="text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          At your current growth rate, reaching ₹100 Crore
                          would take over 10 years. Try increasing your
                          growth rate.
                        </p>
                      </div>
                    )}

                    {/* Chart */}
                    <div className="h-[300px] -mx-2" data-testid="projection-chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <defs>
                            <filter id="cyanGlow">
                              <feGaussianBlur
                                stdDeviation="3"
                                result="coloredBlur"
                              />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tickFormatter={(v) =>
                              v >= CRORE
                                ? `${(v / CRORE).toFixed(0)}Cr`
                                : `${(v / LAKH).toFixed(0)}L`
                            }
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
                          />
                          <RechartsTooltip content={<GlassTooltip />} />
                          <ReferenceLine
                            y={100 * CRORE}
                            stroke="rgba(0,191,255,0.25)"
                            strokeDasharray="5 5"
                          />
                          {/* Benchmark */}
                          <Line
                            type="monotone"
                            dataKey="benchmarkARR"
                            stroke="rgba(0,191,255,0.20)"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                            dot={false}
                            name="Median growth"
                          />
                          {/* Your projection — cyan glow line */}
                          <Line
                            type="monotone"
                            dataKey="arr"
                            stroke={C.brightCyan}
                            strokeWidth={2.5}
                            dot={false}
                            name="Your projection"
                            style={{ filter: 'url(#cyanGlow)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div
                      className="flex items-center justify-center gap-6 mt-4 pt-4"
                      style={{ borderTop: '1px solid rgba(0,191,255,0.10)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-0.5 rounded"
                          style={{ background: C.brightCyan }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'rgba(255,255,255,0.50)' }}
                        >
                          Your path
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4"
                          style={{
                            borderBottom: '1.5px dashed rgba(0,191,255,0.30)',
                          }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                          Median ({getStageName(selectedStage)})
                        </span>
                      </div>
                    </div>
                  </div>
                </DarkGlassCard>

                {/* Milestone cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {/* Milestone 1 — always visible */}
                  {projection.milestones.slice(0, 1).map((m) => (
                    <MilestoneCard key={m.value} milestone={m} />
                  ))}

                  {/*
                    Milestones 2-4 — gated for anonymous users.

                    PATCH: overflow-hidden clips the ResultGate's absolute
                    children (label, sheen line, glow) to this box so they
                    cannot paint above the chart legend above it.
                    rounded-xl matches the gate's own border-radius so the
                    clip edge looks clean.
                    isolate creates a new stacking context so z-index is
                    scoped here and cannot bleed into sibling layers.
                  */}
                  <div className="relative col-span-1 md:col-span-3 overflow-hidden rounded-xl isolate">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {projection.milestones.slice(1, 4).map((m) => (
                        <MilestoneCard key={m.value} milestone={m} />
                      ))}
                    </div>
                    {!isAuthenticated && !gateDismissed && (
                      <ResultGate
                        onDismiss={() => setGateDismissed(true)}
                      />
                    )}
                  </div>
                </div>

                {/* Benchmark card */}
                <GlassCard id="benchmarks">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-widest mb-1"
                          style={{ color: 'rgba(0,191,255,0.55)' }}
                        >
                          {copy.benchmarks.title}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: 'rgba(255,255,255,0.50)' }}
                        >
                          {getStageName(selectedStage)} founders
                        </p>
                      </div>
                      <TrendingUp
                        className="w-5 h-5"
                        strokeWidth={1.5}
                        style={{ color: 'rgba(0,191,255,0.55)' }}
                      />
                    </div>

                    <div className="space-y-5">
                      {[
                        {
                          label: copy.benchmarks.yourGrowth,
                          value: growthRate,
                          barColor: C.brightCyan,
                          glow: true,
                          textColor: C.brightCyan2,
                        },
                        {
                          label: copy.benchmarks.median,
                          value: benchmarkResult.benchmark.median,
                          barColor: 'rgba(255,255,255,0.25)',
                          textColor: 'rgba(255,255,255,0.45)',
                        },
                        {
                          label: copy.benchmarks.top25,
                          value: benchmarkResult.benchmark.p75,
                          barColor: 'rgba(255,255,255,0.18)',
                          textColor: 'rgba(255,255,255,0.35)',
                        },
                      ].map(({ label, value, barColor, glow, textColor }) => (
                        <div key={label}>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-sm font-medium"
                              style={{ color: textColor }}
                            >
                              {label}
                            </span>
                            <span
                              className="font-mono text-sm tabular-nums"
                              style={{ color: textColor }}
                            >
                              {formatPercent(value)}
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(value / 0.25 * 100, 100)}%`,
                                background: barColor,
                                boxShadow: glow
                                  ? `0 0 8px rgba(0,191,255,0.50)`
                                  : 'none',
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      {/* Percentile result */}
                      <div
                        className="pt-4"
                        style={{ borderTop: '1px solid rgba(0,191,255,0.10)' }}
                        data-testid="percentile-result"
                      >
                        <p className="text-sm">
                          <span
                            className="font-medium"
                            style={{ color: C.brightCyan2 }}
                          >
                            {copy.benchmarks.percentile}{' '}
                            {benchmarkResult.percentile}%
                          </span>{' '}
                          <span style={{ color: 'rgba(255,255,255,0.50)' }}>
                            {copy.benchmarks.ofFounders}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={handleShare}
                    disabled={shareLoading}
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold"
                    style={{
                      background: shareSuccess
                        ? 'rgba(34,197,94,0.15)'
                        : `linear-gradient(
                            135deg,
                            ${C.brightCyan} 0%,
                            ${C.midCyan} 60%,
                            ${C.tealEdge} 100%
                          )`,
                      color: shareSuccess ? '#22C55E' : C.darkCorner,
                      border: shareSuccess
                        ? '1px solid rgba(34,197,94,0.35)'
                        : 'none',
                      boxShadow: shareSuccess
                        ? 'none'
                        : '0 4px 16px rgba(0,191,255,0.25)',
                      opacity: shareLoading ? 0.7 : 1,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="share-button"
                  >
                    <Share2 className="w-4 h-4" strokeWidth={1.5} />
                    {shareLoading
                      ? 'Sharing...'
                      : shareSuccess
                        ? 'Link copied!'
                        : 'Share projection'}
                  </motion.button>

                  <motion.button
                    onClick={() =>
                      alert(
                        'PDF export coming soon. ' +
                        'Use Share to copy a link instead.'
                      )
                    }
                    className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-medium"
                    style={{
                      background: 'rgba(0,191,255,0.07)',
                      border: '1px solid rgba(0,191,255,0.22)',
                      color: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(8px)',
                    }}
                    whileHover={{
                      background: 'rgba(0,191,255,0.12)',
                      borderColor: 'rgba(0,191,255,0.38)',
                      color: '#fff',
                    }}
                    whileTap={{ scale: 0.97 }}
                    data-testid="download-button"
                  >
                    <Download className="w-4 h-4" strokeWidth={1.5} />
                    Download PDF
                  </motion.button>
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

export default HundredCrCalculator;