// Benchmark Intelligence Dashboard - Light theme with #00BFFF cyan accents
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import {
  compareToBenchmark, getBenchmarkData,
  getStageName, INDIA_SAAS_BENCHMARKS
} from '@/lib/engine/benchmarks';
import { STAGES, formatPercent } from '@/lib/engine/constants';

// ─── Cyan accent tokens (used sparingly on white background) ──────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  cyanBg:      'rgba(0,191,255,0.06)',
  cyanBorder:  'rgba(0,191,255,0.20)',
};

const peerFounders = [
  { id: 'F1', growth: 0.14, months: 4,  stage: 'pre-seed', isUser: false },
  { id: 'F2', growth: 0.11, months: 6,  stage: 'pre-seed', isUser: false },
  { id: 'You',growth: 0.12, months: 5,  stage: 'pre-seed', isUser: true  },
  { id: 'F3', growth: 0.09, months: 8,  stage: 'pre-seed', isUser: false },
  { id: 'F4', growth: 0.07, months: 10, stage: 'pre-seed', isUser: false },
];

// ─── Animated bar ─────────────────────────────────────────────────────────────
const Bar = ({ pct, color, delay = 0, glow = false }) => {
  const ref = React.useRef(null);
  return (
    <div ref={ref} className="h-2.5 rounded-full overflow-hidden bg-[#F4F4F5]">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: color,
          boxShadow: glow ? `0 0 8px ${color}88` : 'none',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.85, delay, ease: 'easeOut' }}
      />
    </div>
  );
};

// ─── Readiness row ────────────────────────────────────────────────────────────
const ReadinessRow = ({ label, ok }) => (
  <div className="flex items-center justify-between py-2"
    style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
    <span className="text-sm text-[#52525B]">{label}</span>
    <span className={cn('text-sm font-semibold', ok ? 'text-emerald-600' : 'text-amber-500')}>
      {ok ? '✓ Met' : '○ Working on it'}
    </span>
  </div>
);

export const BenchmarkIntelligence = () => {
  const [selectedStage, setSelectedStage] = useState(STAGES.PRE_SEED);
  const userGrowth = 0.12;

  const benchmarkResult = useMemo(() => compareToBenchmark(userGrowth, selectedStage), [selectedStage]);
  const benchmark = getBenchmarkData(selectedStage);

  const readinessScore = useMemo(() => {
    const m = {
      growth:    userGrowth >= benchmark.median ? 25 : Math.round(25 * userGrowth / benchmark.median),
      retention: 92 >= 85 ? 25 : Math.round(25 * 92 / 85),
      mrr:       420000 >= 500000 ? 25 : Math.round(25 * 420000 / 500000),
      runway:    18 >= 12 ? 25 : Math.round(25 * 18 / 12),
    };
    return Object.values(m).reduce((a, b) => a + b, 0);
  }, [benchmark, userGrowth]);

  const scoreColor = readinessScore >= 75 ? '#10B981' : readinessScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className="min-h-full"
      style={{ background: '#FAFAFA' }}
      data-testid="benchmark-intelligence"
    >
      <div className="space-y-7 p-6 md:p-8">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: C.cyanBg, border: `1px solid ${C.cyanBorder}` }}>
              <TrendingUp className="w-4 h-4" style={{ color: C.midCyan }} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#09090B]">
              {copy.dashboard.benchmarks.title}
            </h1>
          </div>
          <p className="text-sm text-[#71717A] ml-12">{copy.dashboard.benchmarks.subtitle}</p>
        </motion.div>

        {/* ── Stage selector ── */}
        <motion.div className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          {Object.values(STAGES).map((stage) => {
            const active = selectedStage === stage;
            return (
              <motion.button key={stage}
                onClick={() => setSelectedStage(stage)}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`
                    : '#fff',
                  color:  active ? '#050A10' : '#52525B',
                  border: active ? 'none' : '1px solid rgba(0,0,0,0.10)',
                  boxShadow: active ? `0 0 0 1px ${C.brightCyan}44, 0 4px 14px rgba(0,191,255,0.22)` : 'none',
                }}
                whileHover={!active ? { borderColor: C.cyanBorder, color: C.midCyan } : {}}
                whileTap={{ scale: 0.97 }}
              >
                {getStageName(stage)}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Hero benchmark card — cyan gradient on white ── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f0faff 60%, #e0f5ff 100%)',
            border: `1px solid ${C.cyanBorder}`,
            boxShadow: `0 0 0 1px rgba(0,191,255,0.06), 0 16px 48px rgba(0,191,255,0.10)`,
          }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        >
          {/* Cyan top sheen */}
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${C.brightCyan}88, transparent)` }} />
          {/* Subtle cyan glow at top */}
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 70% 60% at 50% -5%, rgba(0,191,255,0.10) 0%, transparent 70%)` }} />

          <div className="relative z-10 p-8">
            <div className="grid md:grid-cols-3 gap-8">

              {/* Percentile */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: C.midCyan, letterSpacing: '0.14em' }}>Your Percentile</p>
                <motion.p
                  className="font-mono font-bold tabular-nums"
                  style={{ fontSize: 'clamp(44px, 8vw, 64px)', color: C.midCyan }}
                  key={benchmarkResult.percentile}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {benchmarkResult.percentile}%
                </motion.p>
                <p className="text-sm text-[#52525B] mt-2">
                  Top <strong className="text-[#09090B]">{100 - benchmarkResult.percentile}%</strong> of {getStageName(selectedStage)} founders
                </p>
              </div>

              {/* Growth bars */}
              <div className="space-y-5">
                {[
                  { label: 'Your growth', value: userGrowth, color: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})`, glow: true, text: '#09090B' },
                  { label: 'Median',      value: benchmark.median,  color: '#D1D5DB', glow: false, text: '#71717A' },
                  { label: 'Top 25%',     value: benchmark.p75,     color: '#E5E7EB', glow: false, text: '#A1A1AA' },
                ].map(({ label, value, color, glow, text }, i) => (
                  <div key={label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: text }}>{label}</span>
                      <span className="font-mono text-sm font-semibold" style={{ color: text }}>{formatPercent(value)}</span>
                    </div>
                    <Bar pct={Math.min(value / 0.20 * 100, 100)} color={color} delay={0.2 + i * 0.12} glow={glow} />
                  </div>
                ))}
              </div>

              {/* Sample size */}
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(0,0,0,0.38)', letterSpacing: '0.14em' }}>Sample Size</p>
                <p className="font-mono text-4xl font-bold text-[#09090B] tabular-nums">{benchmark.sample_size}</p>
                <p className="text-sm text-[#71717A] mt-2">Indian founders at this stage</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.22)', color: '#10B981' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live data
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Peer comparison ── */}
        <motion.div
          className="rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        >
          <div className="px-6 pt-6 pb-2">
            <h3 className="font-semibold text-[#09090B] mb-1">{copy.dashboard.benchmarks.peerComparison}</h3>
            <p className="text-sm text-[#71717A]">Anonymous founders at your stage, ranked by growth rate</p>
          </div>
          <div className="p-4 space-y-2">
            {peerFounders.map((founder, i) => (
              <motion.div
                key={founder.id}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all"
                style={{
                  background: founder.isUser
                    ? `linear-gradient(135deg, rgba(0,191,255,0.06) 0%, rgba(0,153,204,0.04) 100%)`
                    : '#FAFAFA',
                  border: founder.isUser
                    ? `1px solid ${C.cyanBorder}`
                    : '1px solid rgba(0,0,0,0.05)',
                  boxShadow: founder.isUser ? `0 0 0 1px rgba(0,191,255,0.06), 0 4px 12px rgba(0,191,255,0.08)` : 'none',
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                whileHover={{ scale: founder.isUser ? 1 : 1.01 }}
              >
                {/* Rank badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: founder.isUser
                      ? `linear-gradient(135deg, ${C.brightCyan}, ${C.tealEdge})`
                      : '#F4F4F5',
                    color: founder.isUser ? '#050A10' : '#71717A',
                  }}
                >
                  {i + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: founder.isUser ? C.midCyan : '#52525B' }}>
                      {founder.isUser ? 'You' : `Founder ${founder.id}`}
                    </span>
                    {founder.isUser && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: C.cyanBg, border: `1px solid ${C.cyanBorder}`, color: C.midCyan }}>
                        Your position
                      </span>
                    )}
                  </div>
                </div>

                {/* Growth bar visual */}
                <div className="hidden sm:block w-24">
                  <div className="h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: founder.isUser ? `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})` : '#D1D5DB' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${founder.growth / 0.16 * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.7 }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm font-semibold" style={{ color: founder.isUser ? C.midCyan : '#09090B' }}>
                    {formatPercent(founder.growth)}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">growth</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-[#09090B]">{founder.months}mo</p>
                  <p className="text-xs text-[#A1A1AA]">to ₹1Cr</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Stage transition + fundraising ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Readiness card */}
          <motion.div
            className="rounded-2xl bg-white border border-[rgba(0,0,0,0.06)] p-6"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          >
            <h3 className="font-semibold text-[#09090B] mb-5">{copy.dashboard.benchmarks.transitionReadiness}</h3>
            <div className="flex items-center gap-6 mb-5">
              {/* Score ring */}
              <div className="relative flex-shrink-0">
                <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#F4F4F5" strokeWidth="8" />
                  <motion.circle
                    cx="48" cy="48" r="40" fill="none"
                    stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 * (1 - readinessScore / 100) }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold"
                  style={{ color: scoreColor }}>{readinessScore}</span>
              </div>
              <div className="flex-1 space-y-1">
                <ReadinessRow label="Growth Rate" ok={userGrowth >= benchmark.median} />
                <ReadinessRow label="Retention"   ok={true}  />
                <ReadinessRow label="MRR Target"  ok={false} />
                <ReadinessRow label="Runway"      ok={true}  />
              </div>
            </div>
            <p className="text-sm text-[#52525B] p-3 rounded-xl"
              style={{ background: readinessScore >= 75 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                       border: readinessScore >= 75 ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(245,158,11,0.18)' }}>
              {readinessScore >= 75
                ? "✓ You're ready to start conversations with Seed investors."
                : "○ Focus on hitting your MRR target before approaching Seed investors."}
            </p>
          </motion.div>

          {/* Fundraising brief */}
          <motion.div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0faff 100%)',
              border: `1px solid ${C.cyanBorder}`,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.04), 0 8px 32px rgba(0,191,255,0.08)`,
            }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          >
            {/* Top sheen */}
            <div className="absolute inset-x-0 top-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${C.brightCyan}55, transparent)` }} />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: C.cyanBg, border: `1px solid ${C.cyanBorder}` }}>
                  <Award className="w-4 h-4" style={{ color: C.midCyan }} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-[#09090B]">{copy.dashboard.benchmarks.fundraisingBrief}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Target raise',        value: '₹2–5 Crore' },
                  { label: 'Typical valuation',   value: '₹15–25 Crore (3–5x ARR)' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span className="text-sm text-[#71717A]">{row.label}</span>
                    <span className="text-sm font-semibold text-[#09090B]">{row.value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: C.midCyan, letterSpacing: '0.12em' }}>Key metrics investors want</p>
                  <ul className="space-y-2">
                    {['₹5L+ MRR with 10%+ MoM growth', '90%+ retention rate', 'Clear path to ₹1Cr ARR in 12 months'].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: C.cyanBg, border: `1px solid ${C.cyanBorder}` }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.midCyan }} />
                        </div>
                        <span className="text-sm text-[#52525B]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkIntelligence;