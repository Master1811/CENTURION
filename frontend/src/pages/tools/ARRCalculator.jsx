// ARR Calculator - Enhanced with Hero look & feel
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpWidget } from '@/components/help/HelpWidget';
import { motion, useSpring, useMotionValue, AnimatePresence, useInView } from 'framer-motion';
import { Info, TrendingUp, Users, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCrore, formatINR, LAKH, CRORE } from '@/lib/engine/constants';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  darkCorner2: '#0A0F14',
  midTone:     '#007BA0',
};

// ─── Animated number display ──────────────────────────────────────────────────
const AnimatedNumber = ({ value, format }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to   = value;
    prevRef.current = value;
    if (from === to) return;

    let start;
    const dur = 500;
    const tick = (ts) => {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span className="tabular-nums">{format(display)}</span>;
};

// ─── Custom slider ────────────────────────────────────────────────────────────
const GlassSlider = ({ label, value, onChange, min, max, step, formatValue, helperText, accentColor = C.brightCyan }) => {
  const pct     = ((value - min) / (max - min)) * 100;
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered]   = useState(false);

  const compute = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw   = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawV  = min + raw * (max - min);
    const snapped = Math.round(rawV / step) * step;
    onChange(Math.max(min, Math.min(max, snapped)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const up   = () => setDragging(false);
    const move = (e) => compute(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup',   up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend',  up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup',   up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend',  up);
    };
  }, [dragging, compute]);

  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</span>
          {helperText && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold cursor-help"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.40)', fontSize: '9px' }}
              title={helperText}>?</span>
          )}
        </div>
        {/* Value badge */}
        <motion.span
          className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}40`,
            color: accentColor,
          }}
          key={formatValue(value)}
          initial={{ scale: 0.88, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          {formatValue(value)}
        </motion.span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative h-6 flex items-center cursor-pointer"
        onMouseDown={(e) => { setDragging(true); compute(e.clientX); }}
        onTouchStart={(e) => { setDragging(true); compute(e.touches[0].clientX); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Track bg */}
        <div className="absolute inset-x-0 h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }} />
        {/* Filled portion */}
        <motion.div
          className="absolute left-0 h-1.5 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${C.tealEdge}, ${accentColor})`,
            boxShadow: `0 0 8px ${accentColor}66`,
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.08 }}
        />
        {/* Thumb */}
        <motion.div
          className="absolute w-5 h-5 rounded-full"
          style={{
            left: `calc(${pct}% - 10px)`,
            background: `linear-gradient(135deg, ${accentColor}, ${C.midCyan})`,
            boxShadow: `0 0 0 3px ${accentColor}30, 0 0 16px ${accentColor}55`,
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

      {/* Min / Max labels */}
      <div className="flex justify-between">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatValue(min)}</span>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatValue(max)}</span>
      </div>
    </div>
  );
};

// ─── Glassmorphic card ────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {}, accentColor }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'rgba(5,15,24,0.72)',
      border: `1px solid ${accentColor ? accentColor + '28' : 'rgba(0,191,255,0.16)'}`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxShadow: `0 0 0 1px rgba(0,191,255,0.05), 0 20px 56px rgba(0,0,0,0.55)`,
      ...style,
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${accentColor || C.brightCyan}35, transparent)` }} />
    {children}
  </div>
);

// ─── Metric tile ──────────────────────────────────────────────────────────────
const MetricTile = ({ icon: Icon, label, value, format, accentColor, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard accentColor={accentColor}>
        <div className="p-5 text-center">
          <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} strokeWidth={1.5} />
          </div>
          <p className="font-mono text-xl font-bold mb-1" style={{ color: '#fff' }}>
            <AnimatedNumber value={value} format={format} />
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{label}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ─── Progress arc (decorative) ────────────────────────────────────────────────
const ProgressRing = ({ pct, color }) => {
  const r = 48; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="112" height="112" viewBox="0 0 112 112" className="absolute inset-0 pointer-events-none">
      <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <motion.circle
        cx="56" cy="56" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '56px 56px', transform: 'rotate(-90deg)' }}
      />
    </svg>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ARRCalculator = () => {
  const [mrr,       setMrr]       = useState(200000);
  const [customers, setCustomers] = useState(50);
  const [arpu,      setArpu]      = useState(4000);

  const calc = useMemo(() => {
    const arr           = mrr * 12;
    const calculatedArpu = customers > 0 ? mrr / customers : 0;
    const ltv           = calculatedArpu * 24;
    const pctTo100Cr    = Math.min((arr / CRORE) * 100, 100);
    return { arr, calculatedArpu, ltv, pctTo100Cr };
  }, [mrr, customers, arpu]);

  const formatMRR  = (v) => v >= LAKH ? `₹${(v / LAKH).toFixed(1)}L` : `₹${(v / 1000).toFixed(0)}K`;
  const formatCust = (v) => v.toLocaleString('en-IN');
  const formatArpu = (v) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${v}`;

  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <div
      className="min-h-screen centurion-tool-typography"
      style={{ background: C.darkCorner }}
      data-testid="arr-calculator-page"
    >
      <Navbar />

      <main className="pt-28 pb-20 relative overflow-hidden">

        {/* ── Page background ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,191,255,0.20) 0%, rgba(0,153,204,0.10) 35%, transparent 58%)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse 40% 40% at 5%  70%, rgba(0,96,128,0.22) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 95% 70%, rgba(0,96,128,0.22) 0%, transparent 55%)
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
              style={{
                background: 'rgba(0,191,255,0.10)',
                border: '1px solid rgba(0,191,255,0.28)',
                color: `${C.brightCyan2}cc`,
                letterSpacing: '0.14em',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Metrics
            </motion.span>

            <h1
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{
                background: `linear-gradient(135deg, #fff 30%, ${C.brightCyan2} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              ARR Calculator
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Calculate your Annual Recurring Revenue and key SaaS metrics
            </p>
          </motion.div>

          {/* ── Main grid ── */}
          <div className="grid md:grid-cols-2 gap-7">

            {/* ── LEFT: Inputs ── */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard>
                <div className="p-7 space-y-8">
                  <GlassSlider
                    label="Monthly Recurring Revenue"
                    value={mrr}
                    onChange={setMrr}
                    min={10000}
                    max={10000000}
                    step={10000}
                    formatValue={formatMRR}
                    helperText="Total revenue from subscriptions each month"
                    accentColor={C.brightCyan}
                  />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider
                    label="Paying Customers"
                    value={customers}
                    onChange={setCustomers}
                    min={1}
                    max={10000}
                    step={1}
                    formatValue={formatCust}
                    helperText="Active paying subscribers"
                    accentColor='#22C55E'
                  />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider
                    label="ARPU (per customer / month)"
                    value={arpu}
                    onChange={setArpu}
                    min={100}
                    max={100000}
                    step={100}
                    formatValue={formatArpu}
                    helperText="Average monthly payment per customer"
                    accentColor='#F59E0B'
                  />
                </div>
              </GlassCard>
            </motion.div>

            {/* ── RIGHT: Results ── */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ARR hero tile */}
              <GlassCard accentColor={C.brightCyan} style={{
                background: `linear-gradient(145deg, rgba(0,96,128,0.45) 0%, rgba(5,15,24,0.80) 100%)`,
                border: `1px solid rgba(0,191,255,0.35)`,
                boxShadow: `0 0 0 1px rgba(0,191,255,0.08), 0 24px 64px rgba(0,0,0,0.55), 0 0 60px rgba(0,191,255,0.08)`,
              }}>
                <div className="relative p-8 text-center">
                  {/* Ring progress */}
                  <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
                    <ProgressRing pct={calc.pctTo100Cr} color={C.brightCyan} />
                    <div className="relative z-10 text-center">
                      <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em' }}>ARR</p>
                    </div>
                  </div>

                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.16em' }}>
                    Annual Recurring Revenue
                  </p>
                  <p className="font-mono font-bold text-white mb-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}
                    data-testid="arr-result">
                    <AnimatedNumber value={calc.arr} format={formatCrore} />
                  </p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>per year</p>

                  {/* Progress to 100Cr */}
                  <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(0,191,255,0.15)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Progress to ₹100 Crore</span>
                      <span className="text-xs font-mono font-bold" style={{ color: C.brightCyan2 }}>
                        <AnimatedNumber value={Math.min(calc.pctTo100Cr, 100)} format={v => `${v.toFixed(1)}%`} />
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})`, boxShadow: `0 0 8px ${C.brightCyan}88` }}
                        animate={{ width: `${Math.min(calc.pctTo100Cr, 100)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Secondary metric tiles */}
              <div className="grid grid-cols-2 gap-4">
                <MetricTile
                  icon={Users}
                  label="ARPU (calculated)"
                  value={calc.calculatedArpu}
                  format={formatINR}
                  accentColor={C.brightCyan2}
                  index={0}
                />
                <MetricTile
                  icon={DollarSign}
                  label="Est. LTV (24 mo)"
                  value={calc.ltv}
                  format={formatINR}
                  accentColor='#F59E0B'
                  index={1}
                />
              </div>

              {/* Insight card */}
              <GlassCard accentColor='rgba(0,191,255,0.6)'>
                <div className="p-5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(0,191,255,0.12)', border: '1px solid rgba(0,191,255,0.25)' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: C.brightCyan }} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                    <span className="font-semibold text-white">Quick insight: </span>
                    With {formatCust(customers)} customers paying an average of{' '}
                    <span style={{ color: C.brightCyan2 }}>{formatINR(Math.round(calc.calculatedArpu))}/mo</span>, you're generating{' '}
                    <span style={{ color: C.brightCyan2 }}>{formatCrore(calc.arr)}</span> in yearly revenue.
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
      
      {/* Help Widget */}
      <HelpWidget variant="dark" />
    </div>
  );
};

export default ARRCalculator;