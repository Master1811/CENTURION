// TeaserLockedSection - Blurred premium features with upgrade CTA

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, ArrowRight, FileText, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const premiumFeatures = [
  {
    title: 'AI Board Report',
    description: 'Generate investor-ready reports in one click',
    icon: FileText,
    preview: {
      header: 'March 2026 Board Report',
      items: [
        { label: 'MRR Growth', value: '+14.2%' },
        { label: 'Customer Acquisition', value: '32 new' },
        { label: 'Churn Rate', value: '2.1%' },
        { label: 'Runway', value: '18 months' },
      ]
    }
  },
  {
    title: 'Revenue Intelligence',
    description: 'Deep insights into your revenue quality',
    icon: TrendingUp,
    preview: {
      header: 'Revenue Quality Score',
      score: 87,
      factors: ['Recurring: 92%', 'Retention: 85%', 'Growth: 84%']
    }
  },
  {
    title: 'Scenario Modelling',
    description: 'Model unlimited what-if scenarios',
    icon: BarChart3,
    preview: {
      header: 'Scenario Analysis',
      scenarios: ['Conservative', 'Base Case', 'Aggressive']
    }
  },
];

const FeaturePreview = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = feature.icon;
  const navigate = useNavigate();
  
  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6 }}
    >
      {/* Card */}
      <div className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white border border-[rgba(0,0,0,0.06)]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
      )}>
        {/* Header */}
        <div className="p-6 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#09090B]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-[#09090B]">{feature.title}</h3>
              <p className="text-sm text-[#71717A]">{feature.description}</p>
            </div>
          </div>
        </div>
        
        {/* Preview Content - Blurred */}
        <div className="relative p-6 min-h-[200px]">
          {/* Content (will be blurred) */}
          <div className="filter blur-[6px] select-none pointer-events-none">
            <p className="text-sm font-medium text-[#09090B] mb-4">{feature.preview.header}</p>
            
            {feature.preview.items && (
              <div className="space-y-3">
                {feature.preview.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-[#F9FAFB] rounded-lg">
                    <span className="text-sm text-[#52525B]">{item.label}</span>
                    <span className="font-mono font-semibold text-[#09090B]">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {feature.preview.score && (
              <div className="text-center py-8">
                <div className="text-5xl font-bold text-[#09090B] font-mono mb-2">
                  {feature.preview.score}
                </div>
                <p className="text-sm text-[#71717A]">out of 100</p>
                <div className="flex justify-center gap-4 mt-4">
                  {feature.preview.factors.map((f, i) => (
                    <span key={i} className="text-xs text-[#71717A] px-2 py-1 bg-[#F4F4F5] rounded">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {feature.preview.scenarios && (
              <div className="space-y-3">
                {feature.preview.scenarios.map((s, i) => (
                  <div key={i} className="p-4 bg-[#F9FAFB] rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-[#09090B]">{s}</span>
                      <span className="text-sm text-[#71717A]">→ ₹100Cr by 20XX</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#09090B] flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-[#09090B] mb-3">
                Unlock full insights
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className={cn(
                  'inline-flex items-center gap-2',
                  'px-5 py-2.5 rounded-full',
                  'bg-[#09090B] text-white text-sm font-medium',
                  'hover:bg-[#18181B]',
                  'transition-all duration-200',
                  'group-hover:scale-105'
                )}
              >
                Upgrade
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TeaserLockedSection = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-50px" });
  
  return (
    <section 
      className="py-20 md:py-32 bg-white"
      data-testid="teaser-locked-section"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-sm font-medium mb-6"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 8px rgba(139, 92, 246, 0.1)', '0 0 0 0 rgba(139, 92, 246, 0)']
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-4 h-4" />
            PRO FEATURES
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-[#09090B] mb-4">
            Unlock the full power
          </h2>
          <p className="text-lg text-[#52525B] max-w-2xl mx-auto">
            Premium features designed for founders who are serious about reaching ₹100 Crore.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, i) => (
            <FeaturePreview key={feature.title} feature={feature} index={i} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[#71717A] mb-4">
            Start with a 7-day free trial. No credit card required.
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className={cn(
              'inline-flex items-center gap-2',
              'px-8 py-4 rounded-full',
              'bg-gradient-to-r from-[#09090B] to-[#18181B] text-white',
              'text-base font-medium',
              'shadow-[0_4px_24px_rgba(0,0,0,0.15)]',
              'hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
              'hover:-translate-y-0.5',
              'transition-all duration-200'
            )}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default TeaserLockedSection;
