// Runway Calculator - Enhanced with Hero look & feel
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Clock, TrendingDown, Wallet, AlertTriangle, Zap, ArrowRight, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
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

const STATUS = {
  critical: { label: 'Critical — raise funding immediately', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.30)',  glow: 'rgba(239,68,68,0.15)'  },
  warning:  { label: 'Start fundraising conversations',     color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)', glow: 'rgba(245,158,11,0.12)' },
  healthy:  { label: 'Healthy runway',                      color: '#22C55E', bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.28)',  glow: 'rgba(34,197,94,0.12)'  },
};

// ─── Animated number ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, format }) => {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = prevRef.current; const to = value;
    prevRef.current = value;
    if (from === to) return;
    let start; const dur = 550;
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

// ─── 3D tilt wrapper ──────────────────────────────────────────────────────────
const TiltCard = ({ children, accentColor = C.brightCyan, className = '', style = {} }) => {
  const ref     = useRef(null);
  const rx      = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const ry      = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const glowX   = useMotionValue(50);
  const glowY   = useMotionValue(50);
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    rx.set(-((e.clientY - r.top)  / r.height - 0.5) * 10);
    ry.set( ((e.clientX - r.left) / r.width  - 0.5) * 10);
    glowX.set(((e.clientX - r.left) / r.width)  * 100);
    glowY.set(((e.clientY - r.top)  / r.height) * 100);
  }, [rx, ry, glowX, glowY]);

  return (
    <motion.div ref={ref} className={className}
      style={{ perspective: 800, ...style }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { rx.set(0); ry.set(0); setHov(false); }}
      whileHover={{ scale: 1.018 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <motion.div style={{
        rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d',
        borderRadius: '16px', overflow: 'hidden',
        background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(5,15,24,0.72)',
        border: hov ? `1px solid ${accentColor}50` : `1px solid ${accentColor}22`,
        boxShadow: hov
          ? `0 0 0 1px ${accentColor}18, 0 20px 50px rgba(0,0,0,0.50), 0 0 28px ${accentColor}18`
          : '0 4px 24px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
      }}>
        {hov && (
          <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{ background: `radial-gradient(circle 130px at ${glowX.get()}% ${glowY.get()}%, ${accentColor}1a, transparent 65%)` }} />
        )}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />
        {children}
      </motion.div>
    </motion.div>
  );
};

// ─── Custom slider ────────────────────────────────────────────────────────────
const GlassSlider = ({ label, value, onChange, min, max, step, formatValue, helperText, accentColor = C.brightCyan }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const trackRef  = useRef(null);
  const [drag, setDrag] = useState(false);
  const [hov,  setHov]  = useState(false);

  const compute = useCallback((clientX) => {
    const r = trackRef.current?.getBoundingClientRect(); if (!r) return;
    const raw = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    onChange(Math.max(min, Math.min(max, Math.round((min + raw * (max - min)) / step) * step)));
  }, [min, max, step, onChange]);

  useEffect(() => {
    if (!drag) return;
    const up   = () => setDrag(false);
    const move = (e) => compute(e.touches ? e.touches[0].clientX : e.clientX);
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move); window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up);
    };
  }, [drag, compute]);

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
        <motion.span className="px-3 py-1 rounded-lg font-mono text-sm font-bold"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor }}
          key={formatValue(value)}
          initial={{ scale: 0.88, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >{formatValue(value)}</motion.span>
      </div>
      <div ref={trackRef} className="relative h-6 flex items-center cursor-pointer"
        onMouseDown={(e) => { setDrag(true); compute(e.clientX); }}
        onTouchStart={(e) => { setDrag(true); compute(e.touches[0].clientX); }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <motion.div className="absolute left-0 h-1.5 rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.tealEdge}, ${accentColor})`, boxShadow: `0 0 8px ${accentColor}66` }}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.08 }} />
        <motion.div className="absolute w-5 h-5 rounded-full"
          style={{ left: `calc(${pct}% - 10px)`, background: `linear-gradient(135deg, ${accentColor}, ${C.midCyan})`, border: '2px solid rgba(255,255,255,0.25)' }}
          animate={{
            scale: drag ? 1.3 : hov ? 1.15 : 1,
            boxShadow: drag ? `0 0 0 5px ${accentColor}40, 0 0 24px ${accentColor}66` : `0 0 0 3px ${accentColor}30, 0 0 16px ${accentColor}55`,
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

// ─── Runway timeline bar ──────────────────────────────────────────────────────
const RunwayBar = ({ months, maxMonths = 36, color, label, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const pct = Math.min((months / maxMonths) * 100, 100);
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.52)' }}>{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {months >= 120 ? '∞' : `${Math.round(months)} mo`}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${C.tealEdge}, ${color})`, boxShadow: `0 0 8px ${color}66` }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const RunwayCalculator = () => {
  const [cashInBank,      setCashInBank]      = useState(10000000);
  const [monthlyBurn,     setMonthlyBurn]     = useState(500000);
  const [monthlyRevenue,  setMonthlyRevenue]  = useState(200000);
  const [growthRate,      setGrowthRate]      = useState(0.08);

  const calc = useMemo(() => {
    const netBurn       = monthlyBurn - monthlyRevenue;
    const simpleRunway  = netBurn > 0 ? Math.min(cashInBank / netBurn, 120) : 120;
    let runwayWithGrowth = 0;
    let rem = cashInBank; let rev = monthlyRevenue;
    while (rem > 0 && runwayWithGrowth < 120) {
      const nb = monthlyBurn - rev;
      if (nb <= 0) { runwayWithGrowth = 120; break; }
      rem -= nb; rev *= (1 + growthRate); runwayWithGrowth++;
    }
    const profMonth = growthRate > 0 && monthlyRevenue < monthlyBurn
      ? Math.ceil(Math.log(monthlyBurn / monthlyRevenue) / Math.log(1 + growthRate)) : null;
    const status = simpleRunway < 6 ? 'critical' : simpleRunway < 12 ? 'warning' : 'healthy';
    return { netBurn, simpleRunway, runwayWithGrowth, profMonth: profMonth > 120 ? null : profMonth, status };
  }, [cashInBank, monthlyBurn, monthlyRevenue, growthRate]);

  const formatMoney = (v) => {
    const n = Math.abs(v);
    return (v < 0 ? '-' : '') + (n >= CRORE ? `₹${(n/CRORE).toFixed(1)}Cr` : n >= LAKH ? `₹${(n/LAKH).toFixed(1)}L` : formatINR(n));
  };

  const st = STATUS[calc.status];
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <div
      className="min-h-screen centurion-tool-typography"
      style={{ background: C.darkCorner }}
      data-testid="runway-calculator-page"
    >
      <Navbar />
      <main className="pt-28 pb-20 relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,191,255,0.18) 0%, transparent 58%)` }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(ellipse 40% 40% at 5% 70%,  rgba(0,96,128,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 95% 70%, rgba(0,96,128,0.18) 0%, transparent 55%)
          `,
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{
          backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.6) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 75%)',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8">

          {/* Header */}
          <motion.div ref={headerRef} className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ background: 'rgba(0,191,255,0.10)', border: '1px solid rgba(0,191,255,0.28)', color: `${C.brightCyan2}cc`, letterSpacing: '0.14em' }}>
              <Clock className="w-3.5 h-3.5" />
              Runway Analysis
            </motion.span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4"
              style={{ background: `linear-gradient(135deg, #fff 30%, ${C.brightCyan2} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Runway Calculator
            </h1>
            <p className="text-base md:text-lg" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Calculate how long your cash will last at current burn rate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-7">

            {/* LEFT: Inputs */}
            <motion.div initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              <GlassCard>
                <div className="p-7 space-y-8">
                  <GlassSlider label="Cash in Bank" value={cashInBank} onChange={setCashInBank}
                    min={100000} max={500000000} step={100000}
                    formatValue={formatMoney} helperText="Total available cash reserves"
                    accentColor={C.brightCyan} />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider label="Monthly Burn Rate" value={monthlyBurn} onChange={setMonthlyBurn}
                    min={50000} max={50000000} step={50000}
                    formatValue={formatMoney} helperText="Total monthly expenses"
                    accentColor='#EF4444' />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider label="Monthly Revenue" value={monthlyRevenue} onChange={setMonthlyRevenue}
                    min={0} max={50000000} step={10000}
                    formatValue={formatMoney} helperText="Current monthly revenue"
                    accentColor='#22C55E' />
                  <div className="h-px" style={{ background: 'rgba(0,191,255,0.10)' }} />
                  <GlassSlider label="Monthly Growth Rate" value={growthRate} onChange={setGrowthRate}
                    min={0} max={0.30} step={0.01}
                    formatValue={(v) => `${(v * 100).toFixed(0)}%`} helperText="Expected revenue growth rate"
                    accentColor='#F59E0B' />
                </div>
              </GlassCard>
            </motion.div>

            {/* RIGHT: Results */}
            <motion.div className="space-y-5"
              initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>

              {/* Hero tile */}
              <TiltCard accentColor={st.color} style={{ perspective: 800 }}>
                <div className="p-8 text-center">
                  {/* Status icon */}
                  <motion.div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: st.bg, border: `1px solid ${st.border}` }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div key={calc.status}
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 350, damping: 20 }}>
                        {calc.status === 'critical' && <AlertTriangle className="w-7 h-7" style={{ color: st.color }} strokeWidth={1.5} />}
                        {calc.status === 'warning'  && <Clock className="w-7 h-7" style={{ color: st.color }} strokeWidth={1.5} />}
                        {calc.status === 'healthy'  && <CheckCircle className="w-7 h-7" style={{ color: st.color }} strokeWidth={1.5} />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.42)', letterSpacing: '0.16em' }}>
                    Runway (with growth)
                  </p>
                  <p className="font-mono font-bold text-white mb-1" style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}
                    data-testid="runway-result">
                    {calc.runwayWithGrowth >= 120
                      ? <span style={{ color: '#22C55E' }}>Profitable ✓</span>
                      : <AnimatedNumber value={calc.runwayWithGrowth} format={v => `${Math.round(v)} months`} />
                    }
                  </p>

                  {/* Status badge */}
                  <motion.span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1"
                    style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}
                    key={calc.status}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >{st.label}</motion.span>

                  {/* Runway bars */}
                  <div className="mt-6 pt-5 space-y-3" style={{ borderTop: '1px solid rgba(0,191,255,0.12)' }}>
                    <RunwayBar months={calc.simpleRunway}       color={C.brightCyan} label="Simple runway (no growth)" index={0} />
                    <RunwayBar months={calc.runwayWithGrowth}   color={st.color}    label="With growth runway"         index={1} />
                  </div>
                </div>
              </TiltCard>

              {/* Secondary metric tiles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Net burn */}
                <TiltCard accentColor={calc.netBurn > 0 ? '#EF4444' : '#22C55E'}>
                  <div className="p-5 text-center">
                    <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${calc.netBurn > 0 ? '#EF4444' : '#22C55E'}18`,
                        border:     `1px solid ${calc.netBurn > 0 ? '#EF4444' : '#22C55E'}35`,
                      }}>
                      <TrendingDown className="w-4 h-4" style={{ color: calc.netBurn > 0 ? '#EF4444' : '#22C55E' }} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-lg font-bold mb-1" style={{ color: calc.netBurn > 0 ? '#EF4444' : '#22C55E' }}>
                      <AnimatedNumber value={calc.netBurn} format={v => formatMoney(v)} />
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>Net Monthly Burn</p>
                  </div>
                </TiltCard>

                {/* Simple runway */}
                <TiltCard accentColor={C.midCyan}>
                  <div className="p-5 text-center">
                    <div className="w-9 h-9 mx-auto mb-3 rounded-xl flex items-center justify-center"
                      style={{ background: `${C.midCyan}18`, border: `1px solid ${C.midCyan}35` }}>
                      <Clock className="w-4 h-4" style={{ color: C.midCyan }} strokeWidth={1.5} />
                    </div>
                    <p className="font-mono text-lg font-bold mb-1" style={{ color: C.brightCyan2 }}>
                      <AnimatedNumber value={calc.simpleRunway} format={v => `${Math.round(v)} mo`} />
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>Simple Runway</p>
                  </div>
                </TiltCard>
              </div>

              {/* Profitability insight */}
              <AnimatePresence>
                {calc.profMonth && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <GlassCard accentColor='rgba(34,197,94,0.8)' style={{ border: '1px solid rgba(34,197,94,0.25)' }}>
                      <div className="p-5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)' }}>
                          <TrendingUp className="w-4 h-4" style={{ color: '#22C55E' }} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>
                          <span className="font-semibold text-white">Path to profitability: </span>
                          At {(growthRate * 100).toFixed(0)}% growth, revenue will cover expenses in approximately{' '}
                          <span style={{ color: '#22C55E' }}>{calc.profMonth} months</span>.
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  See full ₹100Cr projection <ArrowRight className="w-4 h-4" strokeWidth={2} />
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

export default RunwayCalculator;