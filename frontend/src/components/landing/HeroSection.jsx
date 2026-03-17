// HeroSection - main landing hero with product preview
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCrore, CRORE } from '@/lib/engine/constants';

// Sample data for preview chart
const sampleChartData = [
  { month: 'Jan 25', arr: 2400000, benchmark: 2400000 },
  { month: 'Jul 25', arr: 4200000, benchmark: 3800000 },
  { month: 'Jan 26', arr: 7500000, benchmark: 5800000 },
  { month: 'Jul 26', arr: 13000000, benchmark: 9000000 },
  { month: 'Jan 27', arr: 23000000, benchmark: 13500000 },
  { month: 'Jul 27', arr: 40000000, benchmark: 20000000 },
  { month: 'Jan 28', arr: 72000000, benchmark: 30000000 },
  { month: 'Jul 28', arr: 125000000, benchmark: 45000000 },
];

// Animation variants for staggered text
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Animated word component for headline
const AnimatedWord = ({ children, delay = 0 }) => (
  <motion.span
    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ 
      duration: 0.7, 
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    className="inline-block"
  >
    {children}
  </motion.span>
);

export const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className={cn(
        'relative pt-40 pb-20 md:pb-32',
        'bg-dot-grid',
        'bg-[radial-gradient(ellipse_at_top_center,rgba(0,0,0,0.03)_0%,transparent_70%)]'
      )}
      data-testid="hero-section"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Text Content - with staggered animations */}
        <motion.div 
          className="text-center max-w-[780px] mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.p 
            className="type-label text-[#A1A1AA] mb-6" 
            data-testid="hero-eyebrow"
            variants={itemVariants}
          >
            {copy.hero.eyebrow}
          </motion.p>

          {/* Animated Headline */}
          <h1 className="type-display text-[#09090B] mb-6" data-testid="hero-headline">
            <AnimatedWord delay={0.1}>Know</AnimatedWord>{' '}
            <AnimatedWord delay={0.2}>exactly</AnimatedWord>{' '}
            <AnimatedWord delay={0.3}>when</AnimatedWord>
            <br />
            <AnimatedWord delay={0.4}>you'll</AnimatedWord>{' '}
            <AnimatedWord delay={0.5}>reach</AnimatedWord>{' '}
            <motion.span
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block bg-gradient-to-r from-[#09090B] to-[#52525B] bg-clip-text"
            >
              ₹100 Crore.
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            className="type-small text-[#A1A1AA] max-w-[460px] mx-auto mb-10"
            data-testid="hero-subhead"
            variants={itemVariants}
          >
            {copy.hero.subhead}
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate('/tools/100cr-calculator')}
              className={cn(
                'flex items-center gap-2',
                'h-12 px-7 rounded-full',
                'bg-[#09090B] text-white text-sm font-medium',
                'shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.12)]',
                'hover:bg-[#18181B]',
                'transition-all duration-150'
              )}
              whileHover={{ y: -2, boxShadow: '0 0 0 1px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.18)' }}
              whileTap={{ scale: 0.98 }}
              data-testid="hero-cta-primary"
            >
              {copy.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>

            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#52525B] transition-colors"
              data-testid="hero-cta-secondary"
            >
              {copy.hero.ctaSecondary}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowDown className="w-4 h-4" strokeWidth={1.5} />
              </motion.div>
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p 
            className="text-xs text-[rgba(0,0,0,0.2)]" 
            data-testid="hero-trust"
            variants={itemVariants}
          >
            {copy.hero.trustLine}
          </motion.p>
        </motion.div>

        {/* Product Preview Card - animated on mount */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <CenturionCard className="bg-[#F4F4F5]">
            {/* Window chrome */}
            <div className="flex items-center h-9 px-4 bg-[#EEEEEF] rounded-t-2xl border-b border-[rgba(0,0,0,0.04)]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[rgba(0,0,0,0.15)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[rgba(0,0,0,0.15)]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[rgba(0,0,0,0.15)]" />
              </div>
              <span className="flex-1 text-center text-xs text-[#A1A1AA]">
                100Cr Engine
              </span>
            </div>

            {/* Chart Content */}
            <CenturionCardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="type-label text-[#A1A1AA] mb-1">YOUR PROJECTION</p>
                  <p className="font-mono text-2xl font-semibold text-[#09090B] tabular-nums">
                    ₹2 Lakh <span className="text-sm text-[#A1A1AA] font-normal">→</span> ₹100 Crore
                  </p>
                </div>
                <div className="text-right">
                  <p className="type-label text-[#A1A1AA] mb-1">TARGET DATE</p>
                  <p className="font-mono text-lg font-medium text-[#09090B]">March 2029</p>
                </div>
              </div>

              <div className="h-[280px] -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#A1A1AA' }}
                    />
                    <YAxis
                      tickFormatter={(v) => v >= CRORE ? `${(v / CRORE).toFixed(0)}Cr` : `${(v / 100000).toFixed(0)}L`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#A1A1AA' }}
                    />
                    {/* Milestone line at ₹100 Crore */}
                    <ReferenceLine
                      y={100 * CRORE}
                      stroke="rgba(0,0,0,0.3)"
                      strokeDasharray="5 5"
                      label={{
                        value: '₹100Cr',
                        position: 'right',
                        fontSize: 11,
                        fill: '#A1A1AA',
                      }}
                    />
                    {/* Benchmark line */}
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="rgba(0,0,0,0.2)"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    {/* Main projection line */}
                    <Line
                      type="monotone"
                      dataKey="arr"
                      stroke="rgba(0,0,0,0.7)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-[rgba(0,0,0,0.7)]" />
                  <span className="text-xs text-[#A1A1AA]">Your path</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-[rgba(0,0,0,0.2)] border-dashed" style={{ borderStyle: 'dashed' }} />
                  <span className="text-xs text-[#A1A1AA]">Median founder</span>
                </div>
              </div>
            </CenturionCardContent>
          </CenturionCard>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
