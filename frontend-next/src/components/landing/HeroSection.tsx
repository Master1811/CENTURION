'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

const CRORE = 10000000;

const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
};

const chartData = [
  { month: 'Now',    arr: 2400000   },
  { month: '',       arr: 4500000   },
  { month: '',       arr: 8500000   },
  { month: '',       arr: 16000000  },
  { month: '',       arr: 30000000  },
  { month: '',       arr: 58000000  },
  { month: '₹100Cr', arr: 100000000 },
];

const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  duration = 2,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let st: number | null = null;
    const animate = (ts: number) => {
      if (!st) st = ts;
      const p = Math.min((ts - st) / (duration * 1000), 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(e * value));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const FloatingOrb = ({
  style,
  duration = 8,
  delay = 0,
}: {
  style: React.CSSProperties;
  duration?: number;
  delay?: number;
}) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{
      y: [0, -16, 0],
      scale: [1, 1.06, 1],
      opacity: [
        (style.opacity as number) ?? 1,
        ((style.opacity as number) ?? 1) * 0.7,
        (style.opacity as number) ?? 1,
      ],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

const GrainOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none z-[2]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
      opacity: 0.022,
      mixBlendMode: 'overlay',
    }}
  />
);

export function HeroSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const opacity       = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y             = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
  const scale         = useTransform(scrollYProgress, [0, 0.5], [1, 0.96]);
  const bgY3          = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const cardRotateX   = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const cardTranslateY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const cardScale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.75, 0.92] : [1.04, 1]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 18 });

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth  / 2) / (window.innerWidth  / 2));
      mouseY.set((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2));
    };
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, [mouseX, mouseY]);

  const scrollToFeatures = () =>
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });

  const headlineVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
  const wordVariant = {
    hidden:  { opacity: 0, y: 36, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-start items-center text-center pt-24 pb-0 overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* 1. Hard black base */}
      <div className="absolute inset-0" style={{ background: '#000' }} />

      {/* 2. Main vertical gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `linear-gradient(
          to bottom,
          #000000  0%,
          #000000  20%,
          #001215  32%,
          #002535  46%,
          #004860  60%,
          #0088AA  78%,
          #00BFFF  100%
        )`,
      }} />

      {/* 3. Bottom radial bloom — mouse-reactive */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: useTransform(smoothX, v => v * -18),
          y: useTransform(smoothY, v => v * -8),
          backgroundImage: `radial-gradient(ellipse 75% 55% at 50% 108%,
            rgba(0,191,255,0.85) 0%,
            rgba(0,180,220,0.55) 22%,
            rgba(0,140,180,0.28) 45%,
            transparent 65%
          )`,
        }}
      />

      {/* 4. Side vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 38% 100% at 0%   50%, rgba(0,0,0,0.75) 0%, transparent 60%),
          radial-gradient(ellipse 38% 100% at 100% 50%, rgba(0,0,0,0.75) 0%, transparent 60%)
        `,
      }} />

      {/* 5. Top black clamp */}
      <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
        height: '40%',
        background: 'linear-gradient(to bottom, #000 0%, #000 35%, transparent 100%)',
      }} />

      {/* 6. Dot grid */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          y: bgY3,
          backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.30) 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          opacity: 0.14,
          maskImage: 'linear-gradient(to top, black 0%, black 25%, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, black 25%, transparent 65%)',
        }}
      />

      {/* 7. Ambient orbs */}
      <FloatingOrb duration={11} delay={0} style={{
        bottom: '20%', left: '14%', width: 260, height: 260,
        background: `radial-gradient(circle, ${C.midCyan}35 0%, transparent 70%)`,
        filter: 'blur(48px)', opacity: 0.50,
      }} />
      <FloatingOrb duration={14} delay={4} style={{
        bottom: '22%', right: '11%', width: 220, height: 220,
        background: `radial-gradient(circle, ${C.tealEdge}45 0%, transparent 70%)`,
        filter: 'blur(56px)', opacity: 0.42,
      }} />

      <GrainOverlay />

      {/* ─── CONTENT ─────────────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 mt-2"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase"
            style={{
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.12em',
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ background: '#22C55E' }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            Revenue Milestone Prediction
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-[1.08] text-white"
          variants={headlineVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.span variants={wordVariant} className="block">Know exactly when</motion.span>
          <motion.span variants={wordVariant} className="block">you&apos;ll reach</motion.span>
          <motion.span variants={wordVariant} className="block italic" style={{ color: C.brightCyan2 }}>
            ₹100 Crore.
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.58)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.45 }}
        >
          AI-powered founder dashboard to track, predict, and grow your startup.{' '}
          <span style={{ color: 'rgba(255,255,255,0.82)' }}>Built for Indian founders.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <motion.button
            onClick={() => router.push('/tools/100cr-calculator')}
            className="relative flex items-center gap-2 h-12 px-8 rounded-full text-base font-semibold overflow-hidden"
            style={{
              background: '#ffffff',
              color: '#050A10',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.55), 0 8px 32px rgba(0,0,0,0.30)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 0 1px rgba(255,255,255,0.75), 0 12px 40px rgba(0,0,0,0.40)' }}
            whileTap={{ scale: 0.97 }}
          >
            Start Free Projection
            <ArrowRight className="w-5 h-5" strokeWidth={2} />
          </motion.button>

          <motion.button
            onClick={scrollToFeatures}
            className="h-12 px-8 rounded-full text-sm font-medium flex items-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.20)',
              color: 'rgba(255,255,255,0.80)',
              backdropFilter: 'blur(8px)',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.36)', color: '#fff', scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            See how it works
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </motion.button>
        </motion.div>

        {/* Trust metrics */}
        <motion.div
          className="hidden md:flex items-center justify-center gap-8 mb-14 pb-8"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          {[
            { value: 10000, suffix: '+',   label: 'Projections created', prefix: ''  },
            { value: 500,   suffix: 'Cr+', label: 'Revenue tracked',     prefix: '₹' },
            { value: 2500,  suffix: '+',   label: 'Indian founders',     prefix: ''  },
          ].map(({ value, suffix, label, prefix }, i) => (
            <div key={label} className="flex items-center gap-8">
              {i > 0 && <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.12)' }} />}
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-mono">
                  <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>{label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
          style={{ perspective: '1200px' }}
        >
          <motion.div
            style={{
              transformStyle: 'preserve-3d',
              rotateX: cardRotateX,
              scale: cardScale,
              translateY: cardTranslateY,
            }}
            className="relative rounded-2xl overflow-hidden w-full"
          >
            {/* Glass card background */}
            <div className="absolute inset-0 rounded-2xl" style={{
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }} />
            {/* Top specular */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl" style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.50) 35%, rgba(255,255,255,0.65) 50%, rgba(0,191,255,0.50) 65%, transparent)',
            }} />
            {/* Inner top glow */}
            <div className="absolute inset-x-0 top-0 h-20 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -5%, rgba(0,191,255,0.07) 0%, transparent 70%)',
            }} />
            {/* Left caustic */}
            <div className="absolute inset-y-0 left-0 w-px" style={{
              background: 'linear-gradient(180deg, transparent, rgba(0,191,255,0.30) 30%, rgba(255,255,255,0.15) 50%, rgba(0,191,255,0.30) 70%, transparent)',
            }} />
            {/* Outer border */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
              border: '1px solid rgba(0,191,255,0.18)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.65) inset, 0 36px 90px rgba(0,0,0,0.22), 0 8px 32px rgba(0,191,255,0.16)',
            }} />

            {/* Content */}
            <div className="relative z-10">
              {/* macOS chrome */}
              <div
                className="flex items-center h-10 px-4 border-b border-[rgba(0,0,0,0.06)]"
                style={{ background: 'rgba(248,250,252,0.90)' }}
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="flex-1 text-center text-xs font-medium text-[#71717A]">
                  100Cr Engine — Your Projection
                </span>
              </div>

              <div className="p-6 bg-white">
                {/* Stats row */}
                <div className="flex items-baseline justify-between mb-5">
                  <div>
                    <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Current MRR</p>
                    <p className="text-xl font-bold text-[#09090B] font-mono">₹2.4 Lakh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Growth Rate</p>
                    <p className="text-xl font-bold text-emerald-600 font-mono">+12%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Target</p>
                    <p className="text-xl font-bold font-mono" style={{ color: C.midCyan }}>₹100 Cr</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-[240px] md:h-[280px] -mx-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 12 }}>
                      <defs>
                        <linearGradient id="heroGradLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={C.midCyan}    stopOpacity={0.16} />
                          <stop offset="100%" stopColor={C.brightCyan} stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(0,0,0,0.055)"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#A1A1AA' }}
                      />
                      <YAxis
                        tickFormatter={(v) =>
                          v >= CRORE
                            ? `${(v / CRORE).toFixed(0)}Cr`
                            : `${(v / 100000).toFixed(0)}L`
                        }
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#A1A1AA' }}
                        domain={[0, 120000000]}
                        width={32}
                      />
                      <ReferenceLine
                        y={100000000}
                        stroke={C.midCyan}
                        strokeDasharray="5 5"
                        strokeOpacity={0.30}
                      />
                      <Area
                        type="monotone"
                        dataKey="arr"
                        stroke={C.midCyan}
                        strokeWidth={2.5}
                        fill="url(#heroGradLight)"
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                        dot={false}
                        activeDot={{ r: 5, fill: C.brightCyan, stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Milestone pill */}
                  <motion.div
                    className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `rgba(0,153,204,0.10)`,
                      border: `1px solid rgba(0,153,204,0.30)`,
                      color: C.midCyan,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 1.6 }}
                  >
                    ₹100 Crore in 48 months
                  </motion.div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-3 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: C.midCyan }} />
                    <span className="text-xs text-[#71717A]">Your projection</span>
                  </div>
                  <span className="text-xs text-[#A1A1AA]">Growing 4% faster than median</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating badge */}
          <motion.div
            className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,191,255,0.18)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,255,255,0.65) inset',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <p className="text-xs text-[#71717A]">Next milestone</p>
            <p className="font-semibold text-[#09090B]">₹1 Crore in 8 months</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
