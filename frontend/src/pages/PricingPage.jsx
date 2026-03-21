// PricingPage - Standalone light-themed pricing page
// Carries brand DNA while using light mode design system

import React, { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { storeAuthIntent } from '@/lib/auth/intent';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpWidget } from '@/components/help/HelpWidget';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  cyan500: '#00BFFF',
  cyan600: '#0099CC',
  cyan700: '#007399',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textTertiary: '#71717A',
  textMuted: '#A1A1AA',
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
};

// ─── Pricing Data ─────────────────────────────────────────────────────────────
const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for exploring the platform',
    features: [
      '3 projections/month',
      'Basic growth insights',
      '1 payment connector',
      'Community support',
    ],
    cta: 'Get Started',
    variant: 'default',
  },
  {
    name: 'Founder',
    price: '₹899',
    period: '/year',
    description: 'Everything you need to scale',
    badge: 'Most Popular',
    features: [
      'Unlimited projections',
      'Full AI Growth Coach',
      '2 board reports/month',
      'Unlimited connectors',
      'Data room export',
      'Priority support',
    ],
    cta: 'Start Founder Plan',
    variant: 'accent',
    isPrimary: true,
  },
  {
    name: 'Scale',
    price: '₹4,999',
    period: '/year',
    description: 'For fast-growing startups',
    features: [
      'Everything in Founder',
      'Custom benchmarks',
      'API access',
      'Team collaboration',
      'White-label reports',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    variant: 'default',
  },
];

// ─── Feature Item ─────────────────────────────────────────────────────────────
const FeatureItem = ({ feature, accentColor, index }) => (
  <motion.li
    className="flex items-start gap-3"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
  >
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ 
        background: `${accentColor}12`,
        border: `1px solid ${accentColor}25`,
      }}
    >
      <Check className="w-3 h-3" style={{ color: accentColor }} strokeWidth={2.5} />
    </div>
    <span className="text-sm" style={{ color: C.textSecondary }}>
      {feature}
    </span>
  </motion.li>
);

// ─── Pricing Card (Light Mode) ────────────────────────────────────────────────
const PricingCard = ({ plan, isPrimary = false, index }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  const accentColor = isPrimary ? C.cyan500 : C.cyan600;

  const handleCTA = () => {
    if (plan.name === 'Scale') {
      window.location.href = 'mailto:team@100crengine.in?subject=Scale Plan Inquiry';
      return;
    }
    
    storeAuthIntent({
      intent: plan.name === 'Free' ? 'signup' : 'upgrade',
      plan: plan.name.toLowerCase(),
      price: plan.price,
      billing: plan.period === '/year' ? 'yearly' : 'free',
      redirectTo: plan.name === 'Free' ? '/dashboard' : `/checkout?plan=${plan.name.toLowerCase()}`,
    });
    
    navigate(
      plan.name === 'Free' ? '/auth' : `/checkout?plan=${plan.name.toLowerCase()}`,
      { state: { from: location.pathname } }
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'relative rounded-2xl overflow-hidden h-full',
        isPrimary && 'ring-2 ring-offset-4 ring-offset-[#FAFAFA]'
      )}
      style={{
        background: C.bgSecondary,
        border: isPrimary 
          ? `1px solid ${C.cyan500}40`
          : `1px solid rgba(0,0,0,0.06)`,
        boxShadow: isPrimary
          ? `0 4px 16px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.06), 0 0 0 1px ${C.cyan500}15`
          : '0 1px 3px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.04)',
        ringColor: isPrimary ? `${C.cyan500}35` : 'transparent',
      }}
    >
      {/* Top accent line for primary */}
      {isPrimary && (
        <div 
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${C.cyan500} 0%, ${C.cyan600} 100%)`,
          }}
        />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4">
          <span 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: `${C.cyan500}12`,
              color: C.cyan600,
              border: `1px solid ${C.cyan500}25`,
            }}
          >
            <Star className="w-3 h-3" fill="currentColor" />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Plan name */}
        <h3 
          className="text-lg font-semibold mb-1"
          style={{ color: C.textPrimary }}
        >
          {plan.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span 
            className="text-4xl font-bold tracking-tight"
            style={{ 
              color: isPrimary ? C.cyan600 : C.textPrimary,
              fontFamily: "'Georgia', serif",
            }}
          >
            {plan.price}
          </span>
          <span className="text-sm" style={{ color: C.textMuted }}>
            {plan.period}
          </span>
        </div>
        
        {/* Description */}
        <p 
          className="text-sm mb-6"
          style={{ color: C.textTertiary }}
        >
          {plan.description}
        </p>

        {/* CTA Button */}
        <motion.button
          onClick={handleCTA}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-sm',
            'transition-all duration-200',
            'flex items-center justify-center gap-2'
          )}
          style={isPrimary ? {
            background: `linear-gradient(135deg, ${C.cyan500} 0%, ${C.cyan600} 100%)`,
            color: '#FFFFFF',
            boxShadow: `0 4px 16px ${C.cyan500}25`,
          } : {
            background: C.textPrimary,
            color: '#FFFFFF',
          }}
          whileHover={{ 
            y: -2, 
            boxShadow: isPrimary 
              ? `0 8px 24px ${C.cyan500}35`
              : '0 6px 20px rgba(0,0,0,0.15)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {plan.cta}
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </motion.button>

        {/* Features */}
        <ul className="mt-6 space-y-3">
          {plan.features.map((feature, idx) => (
            <FeatureItem 
              key={idx} 
              feature={feature} 
              accentColor={accentColor}
              index={idx}
            />
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ─── Main Pricing Page ────────────────────────────────────────────────────────
export const PricingPage = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  return (
    <div 
      className="min-h-screen"
      style={{ background: C.bgPrimary }}
      data-testid="pricing-page"
    >
      <Navbar />
      
      <main className="pt-28 pb-20">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center max-w-2xl mx-auto px-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5"
            style={{
              background: `${C.cyan500}08`,
              border: `1px solid ${C.cyan500}20`,
              color: C.cyan600,
              letterSpacing: '0.12em',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simple Pricing
          </motion.span>
          
          {/* Title */}
          <h1 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              color: C.textPrimary,
              fontFamily: "'Georgia', 'Times New Roman', serif",
            }}
          >
            {copy.pricing.title}
          </h1>
          
          {/* Subtitle */}
          <p 
            className="text-lg"
            style={{ color: C.textTertiary }}
          >
            {copy.pricing.subtitle}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                isPrimary={plan.isPrimary}
                index={index}
              />
            ))}
          </div>

          {/* Trial Banner */}
          <motion.div
            className="mt-12 rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${C.cyan500}08 0%, ${C.bgSecondary} 100%)`,
              border: `1px solid ${C.cyan500}15`,
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-6 items-center p-6 md:p-8">
              <div>
                <p 
                  className="text-xs uppercase tracking-widest font-semibold mb-2"
                  style={{ color: C.cyan600, letterSpacing: '0.14em' }}
                >
                  7-Day Trial
                </p>
                <p 
                  className="text-xl font-bold mb-2"
                  style={{ color: C.textPrimary }}
                >
                  Try everything for ₹99
                </p>
                <p style={{ color: C.textTertiary }} className="text-sm">
                  Auto-converts to Founder plan. Cancel anytime before day 7 to avoid charges.
                </p>
              </div>
              <div className="flex md:justify-end">
                <motion.button
                  className="h-12 px-6 rounded-xl font-semibold text-sm"
                  style={{
                    background: C.textPrimary,
                    color: '#FFFFFF',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start trial for ₹99 →
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Trust */}
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm" style={{ color: C.textMuted }}>
              ₹99 trial · Cancel anytime · Secure Razorpay checkout
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
      <HelpWidget />
    </div>
  );
};

export default PricingPage;
