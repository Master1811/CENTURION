// ScrollStorySection - Enhanced with hover, 3D motion, parallax, micro-interactions
// (cursor effect removed)
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  TrendingUp, CheckCircle, Sparkles, BarChart3, Zap, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  midTone:     '#007BA0',
  sectionBg:   '#060E18',
};

// ─── Chart data ───────────────────────────────────────────────────────────────
const projectionData = [
  { month: 'Jan', value: 200000,  projected: 200000  },
  { month: 'Mar', value: 320000,  projected: 350000  },
  { month: 'May', value: 510000,  projected: 550000  },
  { month: 'Jul', value: 820000,  projected: 900000  },
  { month: 'Sep', value: 1300000, projected: 1450000 },
  { month: 'Nov', value: 2100000, projected: 2350000 },
  { month: "Jan'26", value: 3400000, projected: 3800000 },
];

const features = [
  {
    id: 'projection-engine',
    eyebrow: 'Projection Engine',
    headline: 'See your future revenue in seconds',
    description: "Enter your current MRR and growth rate. Instantly see when you'll hit ₹1 Crore, ₹10 Crore, and ₹100 Crore. No spreadsheets. No guesswork.",
    accentColor: C.brightCyan,
    icon: TrendingUp,
    col: 0,
  },
  {
    id: 'check-in-system',
    eyebrow: 'Monthly Check-Ins',
    headline: 'Update once. Stay on track forever.',
    description: "Log your actual revenue each month. We'll tell you if you're ahead or behind, and exactly what to focus on next.",
    accentColor: '#22C55E',
    icon: CheckCircle,
    col: 0,
  },
  {
    id: 'ai-insights',
    eyebrow: 'AI Growth Coach',
    headline: "AI tells you what's working and what's not",
    description: 'Get daily insights powered by AI. Understand your growth patterns, spot opportunities, and get actionable recommendations.',
    accentColor: C.brightCyan2,
    icon: Sparkles,
    col: 1,
  },
  {
    id: 'benchmarks',
    eyebrow: 'Benchmark Intelligence',
    headline: 'See how you compare with your stage',
    description: 'Are you growing faster or slower than other founders? Compare your metrics against real Indian startup benchmarks.',
    accentColor: '#F59E0B',
    icon: BarChart3,
    col: 2,
  },
  {
    id: 'connectors',
    eyebrow: 'Revenue Connectors',
    headline: 'Auto-sync your revenue. No manual work.',
    description: 'Connect Razorpay, Stripe, or Cashfree. Your revenue data flows in automatically. We calculate everything for you.',
    accentColor: C.midCyan,
    icon: Zap,
    col: 2,
  },
];

// ─── 3D tilt card wrapper ─────────────────────────────────────────────────────
const TiltCard = ({ children, accentColor, className = '' }) => {
  const ref     = useRef(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const glowX   = useMotionValue(50);
  const glowY   = useMotionValue(50);
  const [hovered, setHovered] = useState(false);

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width  - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    rotateX.set(-cy * 12);
    rotateY.set( cx * 12);
    glowX.set(((e.clientX - rect.left) / rect.width)  * 100);
    glowY.set(((e.clientY - rect.top)  / rect.height) * 100);
  }, [rotateX, rotateY, glowX, glowY]);

  const handleLeave = () => {
    rotateX.set(0); rotateY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.025 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <motion.div
        style={{
          rotateX, rotateY,
          transformStyle: 'preserve-3d',
          borderRadius: '16px',
          overflow: 'hidden',
          background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
          border: hovered ? `1px solid ${accentColor}55` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: hovered
            ? `0 0 0 1px ${accentColor}20, 0 20px 50px rgba(0,0,0,0.50), 0 0 30px ${accentColor}18`
            : '0 4px 24px rgba(0,0,0,0.35)',
          transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        }}
      >
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle 120px at ${glowX.get()}% ${glowY.get()}%, ${accentColor}22, transparent 65%)`,
            }}
          />
        )}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}45, transparent)` }} />
        {children}
      </motion.div>
    </motion.div>
  );
};

// ─── Animated bar ─────────────────────────────────────────────────────────────
const AnimBar = ({ value, max, color, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}66` }}
        initial={{ width: 0 }}
        animate={isInView ? { width: `${(value / max) * 100}%` } : {}}
        transition={{ delay, duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  );
};

// ─── Smooth count-up ──────────────────────────────────────────────────────────
const CountUp = ({ to, prefix = '', suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    const controls = { stop: false };
    let start; const dur = 1400;
    const tick = (ts) => {
      if (!start) start = ts;
      const p    = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(ease * to));
      if (p < 1 && !controls.stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { controls.stop = true; };
  }, [isInView, to]);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
};

// ─── Typing text ──────────────────────────────────────────────────────────────
const TypingText = ({ text, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref} className="inline">
      {text.split('').map((ch, i) => (
        <motion.span key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: delay + i * 0.025, duration: 0.08 }}
        >{ch}</motion.span>
      ))}
    </span>
  );
};

// ─── Mini previews ────────────────────────────────────────────────────────────
const MiniPreview = ({ feature }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  if (feature.id === 'projection-engine') return (
    <div ref={ref} className="mt-4 rounded-xl overflow-hidden"
      style={{ background: 'rgba(0,191,255,0.06)', border: '1px solid rgba(0,191,255,0.14)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>Path to ₹100Cr</span>
        <span className="text-xs font-mono font-bold" style={{ color: C.brightCyan }}>
          <CountUp to={48} suffix=" mo" />
        </span>
      </div>
      <div className="h-[72px] px-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ssGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={C.brightCyan} stopOpacity={0.25} />
                <stop offset="100%" stopColor={C.brightCyan} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis hide /> <YAxis hide />
            <Area type="monotone" dataKey="value" stroke={C.brightCyan} strokeWidth={2}
              fill="url(#ssGrad)" isAnimationActive={isInView} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (feature.id === 'check-in-system') return (
    <motion.div ref={ref} className="mt-4 rounded-xl p-3 flex items-center gap-3"
      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)' }}
      initial={{ opacity: 0, y: 8 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.3 }}>
      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22C55E' }} strokeWidth={1.5} />
      <div>
        <p className="text-xs font-semibold" style={{ color: '#22C55E' }}>You're ahead of projection!</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>+12% above expected</p>
      </div>
    </motion.div>
  );

  if (feature.id === 'ai-insights') return (
    <div ref={ref} className="mt-4 space-y-2">
      {["MRR growth accelerated 3.2%", "CAC dropped by ₹450", "Focus on enterprise tier"].map((txt, i) => (
        <div key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: C.brightCyan2 }} />
          <span><TypingText text={txt} delay={0.4 + i * 0.35} /></span>
        </div>
      ))}
    </div>
  );

  if (feature.id === 'benchmarks') return (
    <div ref={ref} className="mt-4 space-y-2.5">
      {[
        { label: 'You',     value: 12, max: 20, color: C.brightCyan },
        { label: 'Top 25%', value: 15, max: 20, color: 'rgba(255,255,255,0.30)' },
        { label: 'Median',  value: 8,  max: 20, color: 'rgba(255,255,255,0.18)' },
      ].map(({ label, value, max, color }, i) => (
        <div key={label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: i === 0 ? C.brightCyan2 : 'rgba(255,255,255,0.42)' }}>{label}</span>
            <span className="text-xs font-mono" style={{ color: i === 0 ? C.brightCyan2 : 'rgba(255,255,255,0.42)' }}>{value}%</span>
          </div>
          <AnimBar value={value} max={max} color={color} delay={0.3 + i * 0.15} />
        </div>
      ))}
    </div>
  );

  if (feature.id === 'connectors') return (
    <div ref={ref} className="mt-4 space-y-2">
      {[
        { name: 'Razorpay', color: '#0066FF', connected: true  },
        { name: 'Stripe',   color: '#635BFF', connected: true  },
        { name: 'Cashfree', color: '#00C853', connected: false },
      ].map(({ name, color, connected }, i) => (
        <motion.div key={name}
          className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{
            background: connected ? 'rgba(34,197,94,0.07)' : 'rgba(255,255,255,0.04)',
            border: connected ? '1px solid rgba(34,197,94,0.20)' : '1px solid rgba(255,255,255,0.07)',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.25 + i * 0.12 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ background: color }}>{name[0]}</div>
            <span className="text-xs text-white">{name}</span>
          </div>
          {connected
            ? <span className="text-xs" style={{ color: '#22C55E' }}>✓ Synced</span>
            : <span className="text-xs" style={{ color: C.midCyan }}>Connect →</span>
          }
        </motion.div>
      ))}
    </div>
  );

  return null;
};

// ─── Feature card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = feature.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ delay: index * 0.10, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard accentColor={feature.accentColor}>
        <div
          className="px-6 py-6"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${feature.accentColor}18`, border: `1px solid ${feature.accentColor}35` }}
              animate={hovered ? { scale: 1.12, rotate: 6 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              <Icon className="w-5 h-5" style={{ color: feature.accentColor }} strokeWidth={1.5} />
            </motion.div>
            <span className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: `${feature.accentColor}99`, letterSpacing: '0.14em' }}>
              {feature.eyebrow}
            </span>
          </div>

          <h3 className="font-bold text-[15px] leading-snug mb-2 text-white">{feature.headline}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>{feature.description}</p>

          <MiniPreview feature={feature} />

          <motion.div
            className="flex items-center gap-1 mt-4 text-xs font-medium"
            style={{ color: feature.accentColor }}
            initial={{ opacity: 0, x: -6 }}
            animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{ duration: 0.2 }}
          >
            Learn more <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
          </motion.div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ScrollStorySection = () => {
  const headerRef      = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });

  const left   = features.filter(f => f.col === 0);
  const center = features.filter(f => f.col === 1);
  const right  = features.filter(f => f.col === 2);

  return (
    <section
      id="features"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: C.sectionBg }}
      data-testid="scroll-story-section"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(0,191,255,0.12) 0%, transparent 60%)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 40% 35% at 5%  60%, rgba(0,96,128,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 95% 60%, rgba(0,96,128,0.18) 0%, transparent 55%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.10]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.6) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 85% 65% at 50% 30%, black 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 30%, black 20%, transparent 75%)',
      }} />
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.18), transparent)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: `${C.brightCyan2}88`, letterSpacing: '0.16em' }}>
              Features
            </p>
            <motion.h2
              className="text-3xl md:text-4xl font-bold landing-heading-white-fade"
              initial={{ opacity: 0, y: 14, filter: 'blur(7px)' }}
              animate={isHeaderInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="not-italic">Plan.</span>{' '}
              <span className="italic" style={{ color: C.brightCyan2 }}>Build.</span>{' '}
              <span className="not-italic">Launch.</span>
            </motion.h2>
          </div>

          <motion.button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold self-start lg:self-auto relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
              color: C.darkCorner,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.30), 0 8px 24px rgba(0,191,255,0.20)`,
            }}
            whileHover={{ scale: 1.04, boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 12px 32px rgba(0,191,255,0.30)` }}
            whileTap={{ scale: 0.96 }}
          >
            <motion.span className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
            <span className="relative z-10 flex items-center gap-2">
              Try all features free
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </span>
          </motion.button>
        </motion.div>

        {/* 3-column grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="space-y-5">
            {left.map((f, i) => <FeatureCard key={f.id} feature={f} index={i} />)}
          </div>
          <div className="space-y-5 lg:mt-8">
            {center.map((f, i) => <FeatureCard key={f.id} feature={f} index={i + 2} />)}
          </div>
          <div className="space-y-5">
            {right.map((f, i) => <FeatureCard key={f.id} feature={f} index={i + 3} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollStorySection;