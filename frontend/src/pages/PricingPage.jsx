// PricingPage — Free + Founder, premium light-mode design
// Two plans only. No trial. No starter. Simple and obvious to upgrade.

import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Check, Crown, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { storeAuthIntent } from '@/lib/auth/intent';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpWidget } from '@/components/help/HelpWidget';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#FAFAFA',
  white: '#FFFFFF',
  gold: '#B8962E',
  goldLight: '#D4A853',
  text: '#09090B',
  textSub: '#52525B',
  textMuted: '#71717A',
  border: 'rgba(0,0,0,0.07)',
  borderGold: '#B8962E55',
};

// ─── Plan data ────────────────────────────────────────────────────────────────
const FREE_PLAN = {
  key: 'free',
  name: 'Free',
  price: '₹0',
  period: 'forever',
  description: 'Explore and understand your growth trajectory',
  features: [
    'Revenue milestone calculator',
    'Growth quiz',
    'Stage benchmarks',
    'Share link',
    'Basic milestones',
  ],
  cta: 'Start free',
  hint: 'Explore',
};

const FOUNDER_PLAN = {
  key: 'founder',
  name: 'Founder',
  price: '₹3,999',
  period: '/year',
  effectiveLine: '₹333/month',
  badge: 'Founding member price',
  urgency: 'Early founder pricing — will increase soon',
  description: 'Execute your path to ₹100 Crore with clarity',
  features: [
    'Everything in Free',
    'Full dashboard access',
    'AI Growth Coach',
    'Habit engine',
    'Board reports',
    'Monthly check-ins',
    'Priority support',
    'Early access to new features',
  ],
  cta: 'Become a Founder — ₹3,999/yr',
  hint: 'Execute',
};

// ─── Feature item ─────────────────────────────────────────────────────────────
function FeatureItem({ feature, isGold, index }) {
  return (
    <motion.li
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.05, duration: 0.3 }}
    >
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isGold ? '#B8962E18' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${isGold ? '#B8962E35' : 'rgba(0,0,0,0.09)'}`,
        }}
      >
        <Check
          className="w-2.5 h-2.5"
          strokeWidth={2.5}
          style={{ color: isGold ? C.gold : C.textMuted }}
        />
      </span>
      <span className="text-sm" style={{ color: C.textSub }}>
        {feature}
      </span>
    </motion.li>
  );
}

// ─── Free card ────────────────────────────────────────────────────────────────
function FreeCard({ onCTA }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 h-full flex flex-col"
      style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      {/* Hint */}
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
        {FREE_PLAN.hint}
      </p>

      <h3 className="text-xl font-bold mb-1" style={{ color: C.text }}>
        {FREE_PLAN.name}
      </h3>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>
        {FREE_PLAN.description}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-bold" style={{ color: C.text, fontVariantNumeric: 'tabular-nums' }}>
          {FREE_PLAN.price}
        </span>
        <span className="text-sm ml-1" style={{ color: C.textMuted }}>
          {FREE_PLAN.period}
        </span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {FREE_PLAN.features.map((f, i) => (
          <FeatureItem key={f} feature={f} isGold={false} index={i} />
        ))}
      </ul>

      <button
        onClick={onCTA}
        className="w-full h-11 rounded-xl text-sm font-medium transition-colors"
        style={{
          background: 'rgba(0,0,0,0.05)',
          color: C.text,
          border: `1px solid ${C.border}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
      >
        {FREE_PLAN.cta}
      </button>
    </motion.div>
  );
}

// ─── Founder card (hero) ──────────────────────────────────────────────────────
function FounderCard({ onCTA }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl p-8 h-full flex flex-col relative overflow-hidden"
      style={{
        background: '#09090B',
        border: `1px solid ${C.borderGold}`,
        boxShadow: `0 0 0 1px #B8962E18, 0 20px 56px rgba(0,0,0,0.18), 0 0 60px #B8962E08`,
      }}
    >
      {/* Gold top sheen */}
      <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #B8962E88, transparent)' }} />

      {/* Hint + badge row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.gold }}>
          {FOUNDER_PLAN.hint}
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: C.gold, color: '#09090B' }}
        >
          <Crown className="w-3 h-3" strokeWidth={2} />
          {FOUNDER_PLAN.badge}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-1 text-white">{FOUNDER_PLAN.name}</h3>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
        {FOUNDER_PLAN.description}
      </p>

      {/* Price */}
      <div className="mb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {FOUNDER_PLAN.price}
          </span>
          <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {FOUNDER_PLAN.period}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {FOUNDER_PLAN.effectiveLine} · Cancel anytime
        </p>
      </div>

      {/* Urgency */}
      <p className="text-xs font-medium mb-7 mt-1" style={{ color: C.gold }}>
        {FOUNDER_PLAN.urgency}
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {FOUNDER_PLAN.features.map((f, i) => (
          <motion.li
            key={f}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#B8962E18', border: '1px solid #B8962E35' }}
            >
              <Check className="w-2.5 h-2.5" strokeWidth={2.5} style={{ color: C.gold }} />
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>{f}</span>
          </motion.li>
        ))}
      </ul>

      <motion.button
        onClick={onCTA}
        className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
        style={{ background: C.gold, color: '#09090B' }}
        whileHover={{ background: C.goldLight }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        data-testid="pricing-founder-cta"
      >
        {FOUNDER_PLAN.cta}
        <ArrowRight className="w-4 h-4" strokeWidth={2} />
      </motion.button>
    </motion.div>
  );
}

// ─── ROI framing section ──────────────────────────────────────────────────────
function ROISection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const points = [
    { icon: Zap, label: 'Plan your path to ₹1Cr revenue with clarity' },
    { icon: Crown, label: 'Make better decisions, faster' },
    { icon: Sparkles, label: 'AI coaching that adapts to your stage' },
  ];

  return (
    <motion.div
      ref={ref}
      className="mt-16 rounded-2xl p-8 md:p-10"
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="grid md:grid-cols-3 gap-6">
        {points.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
          >
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#B8962E12', border: '1px solid #B8962E25' }}
            >
              <Icon className="w-4 h-4" style={{ color: C.gold }} strokeWidth={1.8} />
            </span>
            <p className="text-sm font-medium leading-snug pt-1.5" style={{ color: C.textSub }}>
              {label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Comparison hint ──────────────────────────────────────────────────────────
function ComparisonHint() {
  return (
    <div className="mt-10 flex items-center justify-center gap-3 text-sm" style={{ color: C.textMuted }}>
      <span className="font-medium text-zinc-400">Free</span>
      <span style={{ color: C.border }}>→</span>
      <span className="text-xs uppercase tracking-widest text-zinc-400">Explore</span>
      <span className="mx-4 text-zinc-300">|</span>
      <span className="font-medium" style={{ color: C.gold }}>Founder</span>
      <span style={{ color: C.border }}>→</span>
      <span className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>Execute</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const handleFreeCTA = () => {
    storeAuthIntent({ intent: 'signup', plan: 'free', redirectTo: '/dashboard' });
    navigate('/auth', { state: { from: location.pathname } });
  };

  const handleFounderCTA = () => {
    storeAuthIntent({ intent: 'upgrade', plan: 'founder', price: '₹3,999', billing: 'annual', redirectTo: '/checkout?plan=founder' });
    navigate('/checkout?plan=founder', { state: { from: location.pathname } });
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">

        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: '#B8962E0F', border: '1px solid #B8962E28', color: C.gold, letterSpacing: '0.14em' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simple pricing
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: C.text }}
          >
            Start free. Upgrade when you're ready.
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: C.textMuted }}>
            Two plans. No complexity. Your path to ₹100 Crore starts here.
          </p>
        </motion.div>

        {/* Cards — 2 column */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <FreeCard onCTA={handleFreeCTA} />
          <FounderCard onCTA={handleFounderCTA} />
        </div>

        {/* Free → Founder comparison hint */}
        <ComparisonHint />

        {/* ROI framing */}
        <ROISection />

        {/* Bottom trust line */}
        <motion.p
          className="text-center text-sm mt-10"
          style={{ color: C.textMuted }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          Secure Razorpay payment · Cancel anytime · No hidden charges
        </motion.p>
      </main>
      <Footer />
      <HelpWidget />
    </div>
  );
}

export default PricingPage;
