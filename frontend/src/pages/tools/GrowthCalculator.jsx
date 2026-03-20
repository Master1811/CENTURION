// Growth Rate Calculator - Enhanced with Hero look & feel
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Target, Zap, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCrore, formatINR, LAKH, CRORE } from '@/lib/engine/constants';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  midTone:     '#007BA0',
};

const T2D3_STATUS = {
  excellent: { label: 'T2D3 Ready',    color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.28)'  },
  good:      { label: 'Good Growth',   color: C.brightCyan2, bg: 'rgba(0,200,232,0.10)', border: 'rgba(0,200,232,0.25)' },
  'needs-work': { label: 'Needs Work', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
};

// ─── Animated number ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, format }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = prevRef.current; const to = value;
    prevRef.current = value;
    if (from === to) return;
    let start; const dur = 500;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span className="tabular-nums">{format(display)}</span>;
};

// ─── Glass card ───────────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {}, accentColor }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'rgba(5,15,24,0.72)',
      border: `1px solid ${accentColor ? accentColor + '28' : 'rgba(0,191,255,0.16)'}`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: '0 0 0 1px rgba(0,191,255,0.05), 0 20px 56px rgba(0,0,0,0.55)',
      ...style,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor || C.brightCyan}35, transparent)` }} />
    {children}
  </div>
);

// ─── Custom slider (reused from ARR calculator) ───────────────────────────────
const GlassSlider = ({ label, value, onChange, min, max, step, formatValue, helperText, accentColor = C.brightCyan }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const compute = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawV    = min + raw * (max - min);
    const snapped = Math.round(rawV / step) * step;
    onChange(Math.max(min, Math.min(max, snapped)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const up   = () => setDragging(false);
    const move = (e) => compute(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move); window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
    };
  }, [dragging, compute]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
          {helperText && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center cursor-help"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)', fontSize: '9px', fontWeight: 700 }}
              title={helperText}>?</span>
          )}
        </div>
        <motion.span
          className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor }}
          key={formatValue(value)}
          initial={{ scale: 0.88, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          {formatValue(value)}
        </motion.span>
      </div>

      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer"
        onMouseDown={(e) => { setDragging(true); compute(e.clientX); }}
        onTouchStart={(e) => { setDragging(true); compute(e.touches[0].clientX); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <motion.div className="absolute left-0 h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.tealEdge}, ${accentColor})`, boxShadow: `0 0 8px ${accentColor}66` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.08 }} />
        <motion.div className="absolute w-5 h-5 rounded-full"
          style={{
            left: `calc(${pct}% - 10px)`,
            background: `linear-gradient(135deg, ${accentColor}, ${C.midCyan})`,
            border: '2px solid rgba(255,255,255,0.25)',
          }}
          animate={{
            scale: dragging ? 1.3 : hovered ? 1.15 : 1,
            boxShadow: dragging
              ? `0 0 0 5px ${accentColor}40, 0 0 24px ${accentColor}66`
              : `0 0 0 3px ${accentColor}30, 0 0 16px ${accentColor}55`,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatValue(min)}</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// ─── Growth gauge (visual arc) ────────────────────────────────────────────────
const GrowthGauge = ({ pct, color }) => {
  // Half-circle arc: 180°
  const r = 52; const circ = Math.PI * r; // half circumference
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width="130" height="72" viewBox="0 0 130 72">
      {/* Track */}
      <path d="M 12 65 A 52 52 0 0 1 118 65" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" strokeLinecap="round" />
      {/* Fill */}
      <motion.path
        d="M 12 65 A 52 52 0 0 1 118 65"
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Center dot */}
      <motion.circle cx="65" cy="65" r="5" fill={color}
        animate={{ r: [4, 6, 4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// ─── Projection row ───────────────────────────────────────────────────────────
const ProjectionRow = ({ label, value, format, highlight = false, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="flex items-center justify-between py-3 px-4 rounded-xl"
      style={{
        background: highlight ? 'rgba(0,191,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: highlight ? '1px solid rgba(0,191,255,0.22)' : '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: highlight ? C.brightCyan : 'rgba(255,255,255,0.25)' }} />
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
      </div>
      <span className="font-mono font-semibold text-sm" style={{ color: highlight ? C.brightCyan2 : 'rgba(255,255,255,0.85)' }}>
        <AnimatedNumber value={value} format={format} />
      </span>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const GrowthCalculator = () => {
  const [previousRevenue, setPreviousRevenue] = useState(150000);
  const [currentRevenue,  setCurrentRevenue]  = useState(180000);
  const [months,          setMonths]           = useState(1);

  const calc = useMemo(() => {
    const absoluteGrowth    = currentRevenue - previousRevenue;
    const percentGrowth     = previousRevenue > 0 ? (currentRevenue - previousRevenue) / previousRevenue : 0;
    const cagr              = previousRevenue > 0 && months > 0
      ? Math.pow(currentRevenue / previousRevenue, 1 / months) - 1 : 0;
    const annualizedGrowth  = Math.pow(1 + cagr, 12) - 1;
    const t2d3Status        = annualizedGrowth >= 2 ? 'excellent' : annualizedGrowth >= 1 ? 'good' : 'needs-work';
    const sixMonthProjection = currentRevenue * Math.pow(1 + cagr, 6);
    const yearProjection     = currentRevenue * Math.pow(1 + cagr, 12);
    const gaugeVal           = Math.min(Math.max(annualizedGrowth * 50, 0), 100); // map 0–200% → 0–100%
    return { absoluteGrowth, percentGrowth, cagr, annualizedGrowth, t2d3Status, sixMonthProjection, yearProjection, gaugeVal };
  }, [previousRevenue, currentRevenue, months]);

  const formatMoney = (v) =>
    v >= CRORE ? `₹${(v / CRORE).toFixed(2)}Cr` : v >= LAKH ? `₹${(v / LAKH).toFixed(1)}L` : formatINR(Math.round(v));
  const formatPct   = (v) => `${(v * 100).toFixed(1)}%`;

  const status   = T2D3_STATUS[calc.t2d3Status];
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <div
      className="min-h-screen centurion-tool-typography"
      style={{ background: C.darkCorner }}
      data-testid="growth-calculator-page"
    >
      <Navbar />

      <main className="pt-28 pb-20 relative overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,191,255,0.18) 0%, rgba(0,153,204,0.08) 35%, transparent 58%)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse 40% 40% at 5%  70%, rgba(0,96,128,0.20) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 95% 70%, rgba(0,96,128,0.20) 0%, transparent 55%)
          `,
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{
          backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 75%)',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">

          {/* ── Page header ── */}
          <motion.div
            ref={headerRef}
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(0,191,255,0.10)', border: '1px solid rgba(0,191,255,0.28)', color: `${C.brightCyan2}cc`, letterSpacing: '0.14em' }}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Growth Analytics
            </motion.span>
            <h1
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                background: `linear-gradient(135deg, #fff 30%, ${C.brightCyan2} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              Growth Rate Calculator
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Calculate your month-over-month and annualized growth rate
            </p>
          </motion.div>

          {/* ── Main grid ── */}
          <div className="grid md:grid-cols-2 gap-7">

            {/* LEFT: Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard>
                <div className="p-7 space-y-8">
                  <GlassSlider
                    label="Previous Revenue"
                    value={previousRevenue}
                    onChange={setPreviousRevenue}
                    min={1000} max={50000000} step={1000}
                    formatValue={formatMoney}
                    helperText="Revenue at the start of the period"
                    accentColor={C.midCyan}
                  />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider
                    label="Current Revenue"
                    value={currentRevenue}
                    onChange={setCurrentRevenue}
                    min={1000} max={50000000} step={1000}
                    formatValue={formatMoney}
                    helperText="Revenue at the end of the period"
                    accentColor={C.brightCyan}
                  />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider
                    label="Time Period"
                    value={months}
                    onChange={setMonths}
                    min={1} max={24} step={1}
                    formatValue={(v) => `${v} mo${v > 1 ? 's' : ''}`}
                    helperText="Months between the two revenue figures"
                    accentColor='#F59E0B'
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* RIGHT: Results */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Hero tile — Monthly Growth Rate */}
              <GlassCard style={{
                background: `linear-gradient(145deg, rgba(0,96,128,0.40) 0%, rgba(5,15,24,0.80) 100%)`,
                border: `1px solid rgba(0,191,255,0.30)`,
                boxShadow: `0 0 0 1px rgba(0,191,255,0.06), 0 24px 64px rgba(0,0,0,0.55), 0 0 50px rgba(0,191,255,0.07)`,
              }}>
                <div className="p-7 text-center">
                  {/* Half-circle gauge */}
                  <div className="flex justify-center mb-2">
                    <GrowthGauge pct={calc.gaugeVal} color={status.color} />
                  </div>

                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.16em' }}>
                    Monthly Growth Rate
                  </p>
                  <p className="font-mono font-bold text-white mb-1" style={{ fontSize: 'clamp(32px, 7vw, 52px)' }}
                    data-testid="growth-result">
                    <AnimatedNumber value={calc.cagr * 100} format={v => `${v.toFixed(1)}%`} />
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    <AnimatedNumber value={calc.annualizedGrowth * 100} format={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`} /> annualized
                  </p>

                  {/* T2D3 status badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.color }}
                    key={calc.t2d3Status}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  >
                    {calc.t2d3Status === 'excellent' && <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />}
                    {calc.t2d3Status === 'good'      && <TrendingUp  className="w-3.5 h-3.5" strokeWidth={2} />}
                    {calc.t2d3Status === 'needs-work' && <Zap        className="w-3.5 h-3.5" strokeWidth={2} />}
                    {status.label}
                  </motion.div>
                </div>
              </GlassCard>

              {/* Absolute growth + T2D3 mini tiles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Absolute growth */}
                <GlassCard accentColor={calc.absoluteGrowth >= 0 ? '#22C55E' : '#EF4444'}>
                  <div className="p-5 text-center">
                    <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${calc.absoluteGrowth >= 0 ? '#22C55E' : '#EF4444'}18`,
                        border: `1px solid ${calc.absoluteGrowth >= 0 ? '#22C55E' : '#EF4444'}35`,
                      }}>
                      <Zap className="w-4 h-4" style={{ color: calc.absoluteGrowth >= 0 ? '#22C55E' : '#EF4444' }} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-lg font-bold mb-1"
                      style={{ color: calc.absoluteGrowth >= 0 ? '#22C55E' : '#EF4444' }}>
                      <AnimatedNumber value={calc.absoluteGrowth} format={v => `${v >= 0 ? '+' : ''}${formatMoney(Math.abs(v))}`} />
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>Absolute Growth</p>
                  </div>
                </GlassCard>

                {/* % growth */}
                <GlassCard accentColor={C.brightCyan2}>
                  <div className="p-5 text-center">
                    <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{ background: `${C.brightCyan2}18`, border: `1px solid ${C.brightCyan2}35` }}>
                      <Target className="w-4 h-4" style={{ color: C.brightCyan2 }} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-lg font-bold mb-1" style={{ color: C.brightCyan2 }}>
                      <AnimatedNumber value={calc.percentGrowth * 100} format={v => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>Total Change</p>
                  </div>
                </GlassCard>
              </div>

              {/* Projections */}
              <GlassCard>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4"
                    style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em' }}>
                    Projections at current rate
                  </p>
                  <div className="space-y-2.5">
                    <ProjectionRow label="In 6 months"  value={calc.sixMonthProjection} format={formatMoney} index={0} />
                    <ProjectionRow label="In 12 months" value={calc.yearProjection}     format={formatMoney} index={1} highlight />
                  </div>
                </div>
              </GlassCard>

              {/* T2D3 explainer */}
              <GlassCard accentColor='rgba(0,191,255,0.6)'>
                <div className="p-5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,191,255,0.12)', border: '1px solid rgba(0,191,255,0.25)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: C.brightCyan }} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    <span className="font-semibold text-white">What's T2D3? </span>
                    Triple revenue year 1, triple year 2, then double for 3 years. This benchmark helps SaaS startups reach{' '}
                    <span style={{ color: C.brightCyan2 }}>$100M ARR in 5 years</span>.
                  </p>
                </div>
              </GlassCard>

              {/* CTA */}
              <motion.button
                className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                  color: C.darkCorner,
                  boxShadow: `0 0 0 1px rgba(0,191,255,0.30), 0 8px 24px rgba(0,191,255,0.22)`,
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 12px 32px rgba(0,191,255,0.30)` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/tools/100cr-calculator'}
              >
                <motion.span className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
                  animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
                <span className="relative z-10 flex items-center gap-2">
                  See full ₹100Cr projection
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GrowthCalculator;