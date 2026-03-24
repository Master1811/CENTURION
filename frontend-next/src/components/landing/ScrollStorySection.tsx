'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { TrendingUp, CheckCircle, Sparkles, BarChart3, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const C = {
  brightCyan: '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan: '#0099CC',
  tealEdge: '#006080',
  darkCorner: '#050A10',
};

const features = [
  {
    id: 'projection-engine',
    eyebrow: 'Projection Engine',
    headline: 'See your future revenue in seconds',
    description: "Enter your current MRR and growth rate. Instantly see when you'll hit ₹1 Crore, ₹10 Crore, and ₹100 Crore.",
    accentColor: C.brightCyan,
    icon: TrendingUp,
  },
  {
    id: 'check-in-system',
    eyebrow: 'Monthly Check-Ins',
    headline: 'Update once. Stay on track forever.',
    description: "Log your actual revenue each month. We'll tell you if you're ahead or behind, and exactly what to focus on next.",
    accentColor: '#22C55E',
    icon: CheckCircle,
  },
  {
    id: 'ai-insights',
    eyebrow: 'AI Growth Coach',
    headline: "AI tells you what's working and what's not",
    description: 'Get daily insights powered by AI. Understand your growth patterns, spot opportunities, and get actionable recommendations.',
    accentColor: C.brightCyan2,
    icon: Sparkles,
  },
  {
    id: 'benchmarks',
    eyebrow: 'Benchmark Intelligence',
    headline: 'See how you compare with your stage',
    description: 'Are you growing faster or slower than other founders? Compare your metrics against real Indian startup benchmarks.',
    accentColor: '#F59E0B',
    icon: BarChart3,
  },
  {
    id: 'connectors',
    eyebrow: 'Revenue Connectors',
    headline: 'Auto-sync your revenue. No manual work.',
    description: 'Connect Razorpay, Stripe, or Cashfree. Your revenue data flows in automatically.',
    accentColor: C.midCyan,
    icon: Zap,
  },
];

interface TiltCardProps {
  children: React.ReactNode;
  accentColor: string;
  className?: string;
}

const TiltCard = ({ children, accentColor, className = '' }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 22 });
  const [hovered, setHovered] = useState(false);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-cy * 12);
    rotateY.set(cx * 12);
  }, [rotateX, rotateY]);

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
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
          rotateX,
          rotateY,
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
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}45, transparent)` }}
        />
        {children}
      </motion.div>
    </motion.div>
  );
};

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <TiltCard accentColor={feature.accentColor} className="h-full">
        <div className="p-6 md:p-8">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
            style={{
              background: `${feature.accentColor}18`,
              border: `1px solid ${feature.accentColor}35`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: feature.accentColor }} />
          </div>

          {/* Eyebrow */}
          <span
            className="text-xs font-semibold tracking-wider mb-2 block"
            style={{ color: feature.accentColor }}
          >
            {feature.eyebrow}
          </span>

          {/* Headline */}
          <h3 className="text-xl font-bold text-white mb-3">{feature.headline}</h3>

          {/* Description */}
          <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>

          {/* Learn more */}
          <div className="mt-6 flex items-center gap-2 text-sm font-medium" style={{ color: feature.accentColor }}>
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

export function ScrollStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-24 md:py-32"
      style={{ background: 'linear-gradient(180deg, #050A10 0%, #0A0F14 50%, #050A10 100%)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-lines opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,191,255,0.08)_0%,transparent_60%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="text-cyan-400 text-sm font-semibold tracking-wider">
            FEATURES
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
            Everything you need to scale
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            From revenue projections to AI insights, we've built the complete toolkit for ambitious founders.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

