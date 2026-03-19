// CTASection - Multiple strategic call-to-action placements

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Inline CTA - used between sections
export const InlineCTA = ({ variant = 'default' }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      className={cn(
        'py-12 md:py-16',
        variant === 'dark' ? 'bg-[#09090B]' : 'bg-[#F4F4F5]'
      )}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <p className={cn(
          'text-lg md:text-xl font-medium mb-4',
          variant === 'dark' ? 'text-white' : 'text-[#09090B]'
        )}>
          Ready to see your path to ₹100 Crore?
        </p>
        <motion.button
          onClick={() => navigate('/tools/100cr-calculator')}
          className={cn(
            'inline-flex items-center gap-2',
            'px-6 py-3 rounded-full',
            'text-sm font-medium',
            'transition-all duration-200',
            variant === 'dark' 
              ? 'bg-white text-[#09090B] hover:bg-[#F4F4F5]' 
              : 'bg-[#09090B] text-white hover:bg-[#18181B]'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Free Projection
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Final CTA Section - before footer
export const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    'No credit card required',
    '7-day free trial',
    'Cancel anytime',
  ];

  return (
    <section
      className={cn(
        'relative py-24 md:py-32',
        'bg-gradient-to-b from-white to-[#F4F4F5]',
        'overflow-hidden'
      )}
      data-testid="cta-section"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.03)_0%,transparent_70%)]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#09090B] text-white text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Join 2,500+ founders
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-[#09090B] mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Your path to ₹100 Crore<br />starts with one projection
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-[#52525B] mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Enter your current revenue and growth rate. Get your personalized timeline in 30 seconds.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <motion.button
            onClick={() => navigate('/tools/100cr-calculator')}
            className={cn(
              'group relative inline-flex items-center gap-3',
              'h-16 px-10 rounded-full',
              'bg-[#09090B] text-white text-lg font-medium',
              'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
              'overflow-hidden will-change-transform',
              // Shimmer overlay
              'before:absolute before:inset-0',
              'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
              'before:translate-x-[-100%] hover:before:translate-x-[100%]',
              'before:transition-transform before:duration-700 before:ease-out'
            )}
            whileHover={{
              scale: 1.02,
              y: -4,
              boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            data-testid="cta-button"
          >
            <span className="relative z-10">Run My Free Projection</span>
            <ArrowRight className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
          </motion.button>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-[#71717A]">
              <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              {benefit}
            </div>
          ))}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/pricing')}
            className="text-sm text-[#52525B] hover:text-[#09090B] transition-colors underline underline-offset-4"
          >
            View pricing plans
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
