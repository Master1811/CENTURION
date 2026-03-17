// ScrollStorySection - Scroll-triggered feature showcase
// Each scroll reveals ONE feature with left text, right visual

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle, 
  Sparkles, 
  BarChart3, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Chart data for projection animation
const projectionData = [
  { month: 'Jan', value: 200000, projected: 200000 },
  { month: 'Mar', value: 320000, projected: 350000 },
  { month: 'May', value: 510000, projected: 550000 },
  { month: 'Jul', value: 820000, projected: 900000 },
  { month: 'Sep', value: 1300000, projected: 1450000 },
  { month: 'Nov', value: 2100000, projected: 2350000 },
  { month: 'Jan\'26', value: 3400000, projected: 3800000 },
];

const benchmarkData = [
  { name: 'You', value: 12, fill: '#09090B' },
  { name: 'Median', value: 8, fill: '#A1A1AA' },
  { name: 'Top 25%', value: 15, fill: '#52525B' },
];

// Animated typing text component
const TypingText = ({ text, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <span ref={ref} className="inline">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: delay + i * 0.03, duration: 0.1 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

// Individual scroll story section
const StorySection = ({ 
  id, 
  eyebrow, 
  headline, 
  description, 
  visual, 
  index,
  accentColor = '#09090B'
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div 
      ref={ref}
      id={id}
      className="min-h-[80vh] flex items-center py-20"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
              style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
            >
              {eyebrow}
            </motion.span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#09090B] mb-6 leading-tight">
              {headline}
            </h2>
            
            <p className="text-lg text-[#52525B] leading-relaxed mb-8">
              {description}
            </p>
            
            <motion.button
              className={cn(
                'inline-flex items-center gap-2',
                'px-6 py-3 rounded-full',
                'bg-[#09090B] text-white text-sm font-medium',
                'hover:bg-[#18181B]',
                'transition-all duration-200'
              )}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              Try it free
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
          
          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Visual Components for each section
const ProjectionVisual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-xl overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#71717A] font-medium">Projection Engine</span>
      </div>
      
      <div className="p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-xs text-[#71717A] uppercase tracking-wide mb-1">Path to ₹100 Crore</p>
            <motion.p 
              className="text-2xl font-bold text-[#09090B] font-mono"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <CountingNumber value={48} /> months
            </motion.p>
          </div>
          <motion.span 
            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.8, type: "spring" }}
          >
            4 years ahead
          </motion.span>
        </div>
        
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#09090B" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#09090B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: '#A1A1AA' }}
              />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="projected"
                stroke="#E4E4E7"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#09090B"
                strokeWidth={2.5}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CheckInVisual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-xl overflow-hidden">
      <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#71717A] font-medium">Monthly Check-in</span>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-[#09090B] mb-2 block">March 2026 Revenue</label>
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]">₹</span>
            <input 
              type="text" 
              value="4,85,000"
              readOnly
              className="w-full h-12 pl-8 pr-4 rounded-xl border-2 border-[#09090B] text-lg font-mono font-semibold text-[#09090B] bg-[#F9FAFB]"
            />
          </motion.div>
        </div>
        
        <motion.div
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800">You're ahead of projection!</p>
            <p className="text-xs text-emerald-600">+12% above expected</p>
          </div>
        </motion.div>
        
        <motion.button
          className="w-full h-11 rounded-xl bg-[#09090B] text-white text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          Save Check-in
        </motion.button>
      </div>
    </div>
  );
};

const AIInsightsVisual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const insights = [
    "Your MRR growth accelerated 3.2% this month",
    "Customer acquisition cost dropped by ₹450",
    "Recommend: Focus on enterprise tier to boost ARPU"
  ];
  
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-xl overflow-hidden">
      <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#71717A] font-medium">AI Growth Coach</span>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#09090B]">Daily Pulse</p>
            <p className="text-xs text-[#71717A]">March 17, 2026</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#F9FAFB]"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.2 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
              <p className="text-sm text-[#52525B]">
                {isInView && <TypingText text={insight} delay={0.5 + i * 0.3} />}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BenchmarksVisual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-xl overflow-hidden">
      <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#71717A] font-medium">Benchmark Intelligence</span>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-[#09090B]">Monthly Growth Rate</p>
          <span className="px-2 py-1 rounded-md bg-[#F4F4F5] text-xs text-[#71717A]">Pre-Seed Stage</span>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'You', value: 12, color: '#09090B', highlight: true },
            { label: 'Top 25%', value: 15, color: '#52525B' },
            { label: 'Median', value: 8, color: '#A1A1AA' },
          ].map((item, i) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-sm',
                  item.highlight ? 'font-semibold text-[#09090B]' : 'text-[#71717A]'
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  'font-mono text-sm',
                  item.highlight ? 'font-bold text-[#09090B]' : 'text-[#71717A]'
                )}>
                  {item.value}%
                </span>
              </div>
              <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(item.value / 20) * 100}%` } : {}}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <motion.div
          className="mt-6 p-3 rounded-xl bg-amber-50 border border-amber-200"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-amber-800 font-medium">
            You're in the <span className="font-bold">top 18%</span> of pre-seed founders
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const ConnectorsVisual = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const connectors = [
    { name: 'Razorpay', status: 'connected', color: '#0066FF' },
    { name: 'Stripe', status: 'connected', color: '#635BFF' },
    { name: 'Cashfree', status: 'available', color: '#00C853' },
  ];
  
  return (
    <div ref={ref} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] shadow-xl overflow-hidden">
      <div className="flex items-center h-10 px-4 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="flex-1 text-center text-xs text-[#71717A] font-medium">Revenue Connectors</span>
      </div>
      
      <div className="p-6">
        <div className="space-y-3 mb-6">
          {connectors.map((connector, i) => (
            <motion.div
              key={connector.name}
              className={cn(
                'flex items-center justify-between p-4 rounded-xl border',
                connector.status === 'connected' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-[#F9FAFB] border-[rgba(0,0,0,0.06)]'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: connector.color }}
                >
                  {connector.name[0]}
                </div>
                <div>
                  <p className="font-medium text-[#09090B]">{connector.name}</p>
                  <p className="text-xs text-[#71717A]">Payment gateway</p>
                </div>
              </div>
              {connector.status === 'connected' ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Synced
                </span>
              ) : (
                <button className="text-xs text-[#09090B] font-medium hover:underline">
                  Connect
                </button>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Data flow animation */}
        <motion.div
          className="flex items-center justify-center gap-2 text-xs text-[#71717A]"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-1"
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>₹4.2L synced today</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// Counting number animation
const CountingNumber = ({ value }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {isInView && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {value}
        </motion.span>
      )}
    </motion.span>
  );
};

// Main component
export const ScrollStorySection = () => {
  const features = [
    {
      id: 'projection-engine',
      eyebrow: 'PROJECTION ENGINE',
      headline: 'See your future revenue in seconds',
      description: 'Enter your current MRR and growth rate. Instantly see when you\'ll hit ₹1 Crore, ₹10 Crore, and ₹100 Crore. No spreadsheets. No guesswork.',
      visual: <ProjectionVisual />,
      accentColor: '#09090B',
    },
    {
      id: 'check-in-system',
      eyebrow: 'MONTHLY CHECK-INS',
      headline: 'Update once. Stay on track forever.',
      description: 'Log your actual revenue each month. We\'ll tell you if you\'re ahead or behind, and exactly what to focus on next.',
      visual: <CheckInVisual />,
      accentColor: '#059669',
    },
    {
      id: 'ai-insights',
      eyebrow: 'AI GROWTH COACH',
      headline: 'AI tells you what\'s working and what\'s not',
      description: 'Get daily insights powered by AI. Understand your growth patterns, spot opportunities, and get actionable recommendations.',
      visual: <AIInsightsVisual />,
      accentColor: '#7C3AED',
    },
    {
      id: 'benchmarks',
      eyebrow: 'BENCHMARK INTELLIGENCE',
      headline: 'See how you compare with your stage',
      description: 'Are you growing faster or slower than other founders? Compare your metrics against real Indian startup benchmarks.',
      visual: <BenchmarksVisual />,
      accentColor: '#D97706',
    },
    {
      id: 'connectors',
      eyebrow: 'REVENUE CONNECTORS',
      headline: 'Auto-sync your revenue. No manual work.',
      description: 'Connect Razorpay, Stripe, or Cashfree. Your revenue data flows in automatically. We calculate everything for you.',
      visual: <ConnectorsVisual />,
      accentColor: '#0066FF',
    },
  ];

  return (
    <section 
      id="features" 
      className="bg-[#FAFAFA]"
      data-testid="scroll-story-section"
    >
      {features.map((feature, index) => (
        <StorySection
          key={feature.id}
          {...feature}
          index={index}
        />
      ))}
    </section>
  );
};

export default ScrollStorySection;
