'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CRORE = 10000000;

const chartData = [
  { month: 'Now', arr: 2400000 },
  { month: '', arr: 4500000 },
  { month: '', arr: 8500000 },
  { month: '', arr: 16000000 },
  { month: '', arr: 30000000 },
  { month: '', arr: 58000000 },
  { month: '₹100Cr', arr: 100000000 },
];

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2 }: {
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
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
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

export function HeroSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center pt-32 pb-16 md:pt-36 md:pb-24 overflow-hidden"
    >
      {/* Premium background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FEFEFE] to-[#F8F9FC]" />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(0,191,255,0.08)_0%,transparent_50%)]"
        style={{ y: bgY1 }}
      />
      <div className="absolute inset-0 bg-dot-grid opacity-30" />

      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="block">Know exactly when</span>
              <span className="block">you'll hit</span>
              <span className="block gradient-text-cyan">₹100 Crore</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-[#52525B] mb-8 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              The revenue milestone prediction engine for Indian SaaS founders.
              Track your journey from MRR to ₹100 Crore with AI-powered insights.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button size="lg" onClick={() => router.push('/?login=true')}>
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => router.push('/tools/100cr-calculator')}>
                Try Free Calculator
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-10 pt-8 border-t border-[#E4E4E7]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <p className="text-2xl font-bold text-[#09090B] tabular-nums">
                  <AnimatedCounter value={500} suffix="+" />
                </p>
                <p className="text-sm text-[#71717A]">Founders</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#09090B] tabular-nums">
                  <AnimatedCounter value={95} suffix="%" />
                </p>
                <p className="text-sm text-[#71717A]">Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#09090B] tabular-nums">
                  ₹<AnimatedCounter value={100} />Cr
                </p>
                <p className="text-sm text-[#71717A]">Target</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Chart */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative bg-white rounded-2xl shadow-xl border border-[#E4E4E7] p-6 overflow-hidden">
              {/* Chart visualization */}
              <div className="h-[280px] flex items-end gap-2">
                {chartData.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg relative group"
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.arr / 100000000) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
                  >
                    {i === chartData.length - 1 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="px-2 py-1 bg-[#09090B] text-white text-xs rounded-full">
                          {item.month}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-[#71717A]">Your projected growth to ₹100 Crore</p>
              </div>

              {/* Milestone badge */}
              <motion.div
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-[#09090B] text-white text-xs font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 }}
              >
                48 months to ₹100Cr
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#71717A] hover:text-[#09090B] transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="text-xs font-medium">See how it works</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}

