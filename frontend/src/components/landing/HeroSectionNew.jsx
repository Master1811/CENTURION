// HeroSection - High-conversion hero with animated visuals
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, ArrowDown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { CRORE } from '@/lib/engine/constants';

// Sample data for preview chart
const chartData = [
  { month: 'Now', arr: 2400000 },
  { month: '', arr: 4500000 },
  { month: '', arr: 8500000 },
  { month: '', arr: 16000000 },
  { month: '', arr: 30000000 },
  { month: '', arr: 58000000 },
  { month: '₹100Cr', arr: 100000000 },
];

// Counting animation component
const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);
  
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Animated line that draws itself
const AnimatedChart = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setAnimationComplete(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);
  
  return (
    <div ref={ref} className="relative h-[280px] md:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#09090B" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#09090B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#A1A1AA' }}
          />
          <YAxis
            tickFormatter={(v) => v >= CRORE ? `${(v / CRORE).toFixed(0)}Cr` : `${(v / 100000).toFixed(0)}L`}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#A1A1AA' }}
            domain={[0, 120000000]}
          />
          <ReferenceLine
            y={100000000}
            stroke="#09090B"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="arr"
            stroke="#09090B"
            strokeWidth={3}
            fill="url(#heroGradient)"
            isAnimationActive={isInView}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Milestone marker */}
      {animationComplete && (
        <motion.div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#09090B] text-white text-xs font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          ₹100 Crore in 48 months
        </motion.div>
      )}
    </div>
  );
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // Enhanced parallax transforms
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Parallax for background layers (slower movement)
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 50]); // Slowest
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, 80]); // Medium
  const bgY3 = useTransform(scrollYProgress, [0, 1], [0, 30]); // Subtle

  // Foreground moves slightly faster
  const chartY = useTransform(scrollYProgress, [0, 0.5], [0, 120]);
  const chartScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className={cn(
        'relative min-h-screen flex flex-col justify-center',
        'pt-32 pb-16 md:pt-36 md:pb-24',
        'overflow-hidden'
      )}
      data-testid="hero-section"
    >
      {/* Premium background with parallax gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FEFEFE] to-[#F8F9FC]" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(212,184,150,0.08)_0%,transparent_50%)]"
        style={{ y: bgY1 }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(110,231,183,0.05)_0%,transparent_40%)]"
        style={{ y: bgY2 }}
      />
      <motion.div
        className="absolute inset-0 bg-dot-grid opacity-30"
        style={{ y: bgY3 }}
      />

      <motion.div 
        style={{ opacity, y, scale }}
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F4F5] text-xs font-semibold text-[#52525B] tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                REVENUE MILESTONE PREDICTION
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#09090B] mb-6 leading-[1.1]"
              data-testid="hero-headline"
            >
              <motion.span
                initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                Know exactly when
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="block"
              >
                you'll reach
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="block bg-gradient-to-r from-[#09090B] via-[#52525B] to-[#09090B] bg-clip-text"
              >
                ₹100 Crore.
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-[#52525B] mb-8 max-w-lg leading-relaxed"
              data-testid="hero-subhead"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              AI-powered founder dashboard to track, predict, and grow your startup. Built for Indian founders.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.button
                onClick={() => navigate('/tools/100cr-calculator')}
                className={cn(
                  'relative flex items-center gap-2',
                  'h-14 px-8 rounded-full',
                  'bg-gradient-to-r from-[#09090B] via-[#18181B] to-[#09090B] text-white text-base font-medium',
                  'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
                  'hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
                  'hover:-translate-y-1',
                  'transition-all duration-300',
                  'overflow-hidden',
                  // Shimmer effect
                  'after:content-[\'\'] after:absolute after:inset-0',
                  'after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent',
                  'after:translate-x-[-100%] hover:after:translate-x-[100%]',
                  'after:transition-transform after:duration-700 after:ease-out'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid="hero-cta-primary"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Projection
                  <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                </span>
              </motion.button>

              <button
                onClick={scrollToFeatures}
                className="flex items-center gap-2 text-[#52525B] hover:text-[#09090B] transition-colors group"
                data-testid="hero-cta-secondary"
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  'border border-[rgba(0,0,0,0.1)]',
                  'bg-gradient-to-br from-white to-[#F8F9FC]',
                  'group-hover:border-[rgba(0,0,0,0.2)] group-hover:shadow-md',
                  'transition-all duration-300'
                )}>
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </div>
                <span className="text-sm font-medium">See how it works</span>
              </button>
            </motion.div>

            {/* Trust metrics */}
            <motion.div 
              className="mt-10 pt-8 border-t border-[rgba(0,0,0,0.06)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-[#09090B] font-mono">
                    <AnimatedCounter value={10000} suffix="+" />
                  </p>
                  <p className="text-xs text-[#71717A]">Projections created</p>
                </div>
                <div className="w-px h-10 bg-[rgba(0,0,0,0.06)]" />
                <div>
                  <p className="text-2xl font-bold text-[#09090B] font-mono">
                    ₹<AnimatedCounter value={500} suffix="Cr+" />
                  </p>
                  <p className="text-xs text-[#71717A]">Revenue tracked</p>
                </div>
                <div className="w-px h-10 bg-[rgba(0,0,0,0.06)] hidden sm:block" />
                <div className="hidden sm:block">
                  <p className="text-2xl font-bold text-[#09090B] font-mono">
                    <AnimatedCounter value={2500} suffix="+" />
                  </p>
                  <p className="text-xs text-[#71717A]">Indian founders</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Animated Chart Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className={cn(
              'relative rounded-2xl overflow-hidden',
              'bg-white border border-[rgba(0,0,0,0.08)]',
              'shadow-[0_24px_80px_rgba(0,0,0,0.12)]'
            )}>
              {/* Window chrome */}
              <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <span className="flex-1 text-center text-xs text-[#71717A] font-medium">
                  100Cr Engine — Your Projection
                </span>
              </div>

              {/* Chart Content */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Current MRR</p>
                    <p className="text-xl font-bold text-[#09090B] font-mono">₹2.4 Lakh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Growth Rate</p>
                    <p className="text-xl font-bold text-emerald-600 font-mono">+12%</p>
                  </div>
                </div>
                
                <AnimatedChart />

                {/* Legend */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#09090B]" />
                    <span className="text-xs text-[#71717A]">Your projection</span>
                  </div>
                  <span className="text-xs text-[#A1A1AA]">
                    Growing 4% faster than median
                  </span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <motion.div
              className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-white border border-[rgba(0,0,0,0.06)] shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <p className="text-xs text-[#71717A]">Next milestone</p>
              <p className="font-semibold text-[#09090B]">₹1 Crore in 8 months</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.button
            onClick={scrollToFeatures}
            className="flex flex-col items-center gap-2 text-[#A1A1AA] hover:text-[#52525B] transition-colors"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-xs">Scroll to explore</span>
            <ArrowDown className="w-5 h-5" strokeWidth={1.5} />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
