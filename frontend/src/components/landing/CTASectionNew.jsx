// CTASection - Enhanced with Hero look & feel (dark cyan gradient)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  darkCorner2: '#0A0F14',
  midTone:     '#007BA0',
};

// ─── Inline CTA ───────────────────────────────────────────────────────────────
export const InlineCTA = ({ variant = 'default' }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative overflow-hidden py-12 md:py-16"
      style={{ background: C.darkCorner }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {/* subtle glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 60% 80% at 50% 120%, rgba(0,191,255,0.14) 0%, transparent 65%)` }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        <p className="text-lg md:text-xl font-medium mb-6 text-white">
          Ready to see your path to ₹100 Crore?
        </p>
        <motion.button
          onClick={() => navigate('/tools/100cr-calculator')}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
            color: C.darkCorner,
            boxShadow: `0 0 0 1px rgba(0,191,255,0.3), 0 6px 20px rgba(0,191,255,0.22)`,
          }}
          whileHover={{ scale: 1.03, boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 10px 28px rgba(0,191,255,0.30)` }}
          whileTap={{ scale: 0.97 }}
        >
          {/* shimmer */}
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
            animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Start Free Projection
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── Final CTA Section ────────────────────────────────────────────────────────
export const CTASection = () => {
  const navigate = useNavigate();

  const benefits = [
    'No credit card required',
    '7-day free trial',
    'Cancel anytime',
  ];

  return (
    <section
      className="relative py-24 md:py-36 overflow-hidden"
      style={{ background: C.darkCorner }}
      data-testid="cta-section"
    >
      {/* ── Background layers ── */}
      {/* Main cyan burst from top */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 75% 55% at 50% -8%, rgba(0,191,255,0.26) 0%, rgba(0,153,204,0.14) 35%, transparent 60%)` }} />
      {/* Mid-body teal glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 55% 45% at 50% 55%, rgba(0,123,160,0.16) 0%, transparent 65%)` }} />
      {/* Edge accents */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 38% 35% at 5%  80%, rgba(0,96,128,0.30) 0%, transparent 55%),
          radial-gradient(ellipse 38% 35% at 95% 80%, rgba(0,96,128,0.30) 0%, transparent 55%)
        `,
      }} />
      {/* Corner vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 50% at 0%   0%,   rgba(10,15,20,0.90) 0%, transparent 55%),
          radial-gradient(ellipse 50% 50% at 100% 0%,   rgba(10,15,20,0.90) 0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 0%   100%, rgba(5,10,16,0.94) 0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 100% 100%, rgba(5,10,16,0.94) 0%, transparent 55%)
        `,
      }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.55) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 35%, black 30%, transparent 80%)',
      }} />

      {/* ── Decorative ring behind headline ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{
        width: 560, height: 560,
        borderRadius: '50%',
        border: '1px solid rgba(0,191,255,0.07)',
        boxShadow: `0 0 0 80px rgba(0,191,255,0.02), 0 0 0 160px rgba(0,191,255,0.015)`,
      }} />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(0,191,255,0.10)',
              border: `1px solid rgba(0,191,255,0.28)`,
              color: C.brightCyan2,
              backdropFilter: 'blur(8px)',
              letterSpacing: '0.04em',
            }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.span>
            Join 2,500+ founders
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="text-3xl md:text-5xl font-bold mb-6 leading-tight landing-heading-white-fade"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <span className="not-italic">Your path to ₹100 Crore</span>
          <br />
          <span className="italic" style={{ color: C.brightCyan2 }}>
            starts with one projection
          </span>
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl mb-12 max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Enter your current revenue and growth rate.{' '}
          <span style={{ color: `${C.brightCyan2}99` }}>Get your personalized timeline in 30 seconds.</span>
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <motion.button
            onClick={() => navigate('/tools/100cr-calculator')}
            className="group relative inline-flex items-center gap-3 h-16 px-12 rounded-full text-lg font-semibold overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 55%, ${C.tealEdge} 100%)`,
              color: C.darkCorner,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.35), 0 16px 48px rgba(0,191,255,0.30), 0 4px 16px rgba(0,0,0,0.5)`,
            }}
            whileHover={{
              scale: 1.03,
              y: -4,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.50), 0 22px 60px rgba(0,191,255,0.40), 0 4px 16px rgba(0,0,0,0.5)`,
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            data-testid="cta-button"
          >
            {/* continuous shimmer */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }}
            />
            <span className="relative z-10">Run My Free Projection</span>
            <ArrowRight
              className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </motion.button>
        </motion.div>

        {/* Benefits row */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit}
              className="flex items-center gap-2 text-sm"
              style={{ color: 'rgba(255,255,255,0.50)' }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.08 }}
            >
              <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} strokeWidth={1.5} />
              {benefit}
            </motion.div>
          ))}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.55 }}
        >
          <button
            onClick={() => navigate('/pricing')}
            className="text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            onMouseEnter={e => e.target.style.color = C.brightCyan2}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
          >
            View pricing plans
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;