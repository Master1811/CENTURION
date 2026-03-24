// PricingPage — Centurion
// SEO-optimized · Free + Founder · Premium refined dark/light split
// Drop-in replacement. Same props/exports/router API as original.

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Check, Crown, Sparkles, ArrowRight, Zap,
  Shield, RefreshCw, TrendingUp, FileText,
  BarChart2, Clock,
} from 'lucide-react';
import { storeAuthIntent } from '@/lib/auth/intent';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpWidget } from '@/components/help/HelpWidget';

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
const SEO = {
  title: 'Centurion Pricing — AI CFO for Indian Founders | ₹3,999/year',
  description:
    'Simple pricing for Indian SaaS founders and agencies. ' +
    'Free revenue calculator forever. Full AI dashboard, board reports, ' +
    'and invoice collection for ₹3,999/year — less than ₹333/month.',
  canonical: 'https://centurion.app/pricing',
  og: {
    title: 'Centurion — AI Revenue Intelligence. ₹3,999/year.',
    description:
      'Track MRR, chase invoices, get board reports. ' +
      'The AI CFO built for Indian founders.',
    image: 'https://centurion.app/og/pricing.png',
  },
};

const PRICING_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Centurion — AI Revenue Intelligence for Indian Founders',
  description:
    'AI-powered revenue tracking, cash flow forecasting, and invoice collection ' +
    'for Indian SaaS founders and agencies. Track your path to ₹100 Crore.',
  brand: { '@type': 'Brand', name: 'Centurion' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'INR',
      description: 'Free SaaS revenue calculator and benchmark tool for Indian founders.',
      eligibleRegion: { '@type': 'Country', name: 'IN' },
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2099-12-31',
    },
    {
      '@type': 'Offer',
      name: 'Founder Plan',
      price: '3999',
      priceCurrency: 'INR',
      description:
        'Full AI CFO dashboard with board reports, cash flow radar, invoice collections, and Tally integration.',
      eligibleRegion: { '@type': 'Country', name: 'IN' },
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31',
    },
  ],
};

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does Centurion cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Centurion has two plans. Free forever (₹0) includes the revenue milestone calculator, growth benchmarks, and shareable projections. The Founder plan is ₹3,999 per year (₹333/month effective) and includes the full AI dashboard, board reports, cash flow radar, and invoice collection tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a monthly billing option?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Centurion is annual billing only at ₹3,999/year. There is no monthly subscription. Annual billing keeps the price low and aligns incentives — we win when you grow.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Centurion work with Tally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Centurion accepts Tally PDF and CSV exports via drag-and-drop. No integration or plugin needed. Our AI parses the export and generates your AR aging dashboard and cash flow forecast in seconds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Centurion work with Razorpay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Centurion connects to Razorpay via OAuth to sync your payment data automatically. Your MRR, ARR, and transaction history update in real time with a Verified badge on all API-sourced data.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Full refund within 7 days of purchase, no questions asked. Email support@centurion.app with your order ID.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Centurion suitable for agencies and non-SaaS businesses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Centurion has two modes: SaaS mode for subscription businesses tracking MRR and ARR, and Agency mode for service businesses tracking invoices, cash flow, and accounts receivable.',
      },
    },
  ],
};

// ─── Zero-dep SEO helpers (replaces react-helmet) ─────────────────────────────
function PageHead({ title, description, canonical }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', description);
    let can = document.querySelector('link[rel="canonical"]');
    if (!can) { can = document.createElement('link'); can.rel = 'canonical'; document.head.appendChild(can); }
    can.href = canonical;
    return () => { document.title = 'Centurion'; };
  }, [title, description, canonical]);
  return null;
}

function JsonLd({ data, id }) {
  useEffect(() => {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
    return () => el?.remove();
  }, [data, id]);
  return null;
}

// ─── Plan data (SEO-enriched) ──────────────────────────────────────────────────
const FREE_PLAN = {
  key: 'free',
  name: 'Free',
  price: '₹0',
  period: 'forever',
  description: 'Calculate your revenue milestones and benchmark your startup growth — free, forever.',
  features: [
    '100Cr revenue milestone calculator',
    'SaaS growth benchmarks (500+ startups)',
    'Startup stage quiz',
    'Shareable projection link',
    'ARR and MRR milestone tracker',
  ],
  cta: 'Start free — no card needed',
  hint: 'Explore',
};

const FOUNDER_PLAN = {
  key: 'founder',
  name: 'Founder',
  price: '₹3,999',
  period: '/year',
  effectiveLine: '₹333/month · less than one CA call',
  badge: 'Founding member price',
  urgency: 'Early founder pricing — will increase as we grow',
  description: 'Your AI CFO for the journey to ₹100 Crore. Track revenue, chase invoices, and get board-ready insights.',
  features: [
    'Everything in Free',
    'Full SaaS and Agency dashboard',
    'AI Growth Coach (powered by Claude)',
    'Daily revenue pulse and weekly board questions',
    'Cash flow radar and AR aging dashboard',
    'Automated invoice collection drafts',
    'Tally PDF parser — no integration needed',
    'Monthly check-ins with streak tracking',
    'Board-ready PDF reports',
    'Razorpay and Stripe revenue sync',
    'Priority support',
    'Early access to every new feature',
  ],
  cta: 'Become a Founding Member — ₹3,999/yr',
  hint: 'Execute',
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#F7F6F3',
  white: '#FFFFFF',
  dark: '#0C0C0D',
  gold: '#B8962E',
  goldLight: '#D4A853',
  goldDim: '#B8962E18',
  goldBorder: '#B8962E30',
  text: '#0C0C0D',
  textSub: '#4A4A52',
  textMuted: '#8A8A96',
  border: 'rgba(0,0,0,0.08)',
  borderDark: 'rgba(255,255,255,0.08)',
};

// ─── Magnetic CTA button ──────────────────────────────────────────────────────
function MagneticButton({ children, onClick, className, style, testId }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy, ...style }}
      whileTap={{ scale: 0.97 }}
      className={className}
      data-testid={testId}
    >
      {children}
    </motion.button>
  );
}

// ─── Subtle grain overlay ─────────────────────────────────────────────────────
function Grain() {
  return (
    <svg className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.025] z-0" aria-hidden>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ feature, isGold, index, dark }) {
  return (
    <motion.li
      className="flex items-start gap-3"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.04, duration: 0.35, ease: 'easeOut' }}
    >
      <span
        className="mt-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isGold ? '#B8962E15' : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${isGold ? '#B8962E40' : dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)'}`,
        }}
      >
        <Check
          className="w-2.5 h-2.5"
          strokeWidth={3}
          style={{ color: isGold ? C.gold : dark ? 'rgba(255,255,255,0.45)' : C.textMuted }}
        />
      </span>
      <span
        className="text-[13px] leading-relaxed"
        style={{ color: dark ? 'rgba(255,255,255,0.65)' : C.textSub }}
      >
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
    <motion.article
      ref={ref}
      aria-label="Free plan"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[20px] p-8 flex flex-col h-full relative overflow-hidden"
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Subtle top rule */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)' }} />

      <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5"
        style={{ color: C.textMuted }}>
        {FREE_PLAN.hint}
      </p>

      <h2 className="text-2xl font-bold mb-1.5" style={{ color: C.text, fontFamily: 'Georgia, serif' }}>
        {FREE_PLAN.name}
      </h2>
      <p className="text-sm leading-relaxed mb-7" style={{ color: C.textMuted, maxWidth: '26ch' }}>
        {FREE_PLAN.description}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-8">
        <span
          className="text-[42px] font-bold leading-none tracking-tight"
          style={{ color: C.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif' }}
        >
          {FREE_PLAN.price}
        </span>
        <span className="text-sm pb-1" style={{ color: C.textMuted }}>{FREE_PLAN.period}</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-8">
        {FREE_PLAN.features.map((f, i) => (
          <FeatureRow key={f} feature={f} isGold={false} dark={false} index={i} />
        ))}
      </ul>

      <MagneticButton
        onClick={onCTA}
        className="w-full h-11 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        style={{
          background: 'rgba(0,0,0,0.05)',
          color: C.text,
          border: `1px solid ${C.border}`,
        }}
      >
        {FREE_PLAN.cta}
      </MagneticButton>
    </motion.article>
  );
}

// ─── Founder card ─────────────────────────────────────────────────────────────
function FounderCard({ onCTA }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      ref={ref}
      aria-label="Founder plan — ₹3,999 per year"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="rounded-[20px] p-8 flex flex-col h-full relative overflow-hidden"
      style={{
        background: C.dark,
        border: `1px solid ${C.goldBorder}`,
        boxShadow: hovered
          ? `0 0 0 1px #B8962E45, 0 24px 64px rgba(0,0,0,0.32), 0 0 80px #B8962E12`
          : `0 0 0 1px #B8962E20, 0 20px 56px rgba(0,0,0,0.24), 0 0 60px #B8962E08`,
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Gold shimmer top */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, #B8962EBB, transparent)' }}
        animate={{ opacity: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
      />

      {/* Ambient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #B8962E08 0%, transparent 70%)' }} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: C.gold }}>
          {FOUNDER_PLAN.hint}
        </p>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
          style={{ background: C.gold, color: '#0C0C0D' }}
          aria-label="Founding member pricing"
        >
          <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
          {FOUNDER_PLAN.badge}
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-1.5 text-white" style={{ fontFamily: 'Georgia, serif' }}>
        {FOUNDER_PLAN.name}
      </h2>
      <p className="text-[13px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '30ch' }}>
        {FOUNDER_PLAN.description}
      </p>

      {/* Price */}
      <div className="mb-1">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-[42px] font-bold leading-none tracking-tight text-white"
            style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'Georgia, serif' }}
            aria-label="₹3,999 per year"
          >
            {FOUNDER_PLAN.price}
          </span>
          <span className="text-sm pb-1" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {FOUNDER_PLAN.period}
          </span>
        </div>
        <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {FOUNDER_PLAN.effectiveLine}
        </p>
      </div>

      {/* Urgency */}
      <p className="text-[11px] font-semibold mt-2 mb-6" style={{ color: C.gold }}>
        {FOUNDER_PLAN.urgency}
      </p>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-8">
        {FOUNDER_PLAN.features.map((f, i) => (
          <FeatureRow key={f} feature={f} isGold={true} dark={true} index={i} />
        ))}
      </ul>

      <MagneticButton
        onClick={onCTA}
        testId="pricing-founder-cta"
        className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
        style={{ background: C.gold, color: '#0C0C0D' }}
      >
        <motion.span
          className="absolute inset-0 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #D4A85340 0%, transparent 60%)' }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {FOUNDER_PLAN.cta}
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </MagneticButton>
    </motion.article>
  );
}

// ─── Value props strip ────────────────────────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: TrendingUp,
    headline: 'Revenue intelligence',
    sub: 'MRR, ARR, growth rate, and milestone tracking — all automated.',
    keywords: 'mrr dashboard india saas analytics',
  },
  {
    icon: FileText,
    headline: 'Board-ready reports',
    sub: 'AI-generated PDF board reports in one click. Impress investors.',
    keywords: 'board report generator india startup',
  },
  {
    icon: Clock,
    headline: 'Cash flow radar',
    sub: 'Know your runway. Chase overdue invoices before you run dry.',
    keywords: 'cash flow forecasting india invoice tracking',
  },
  {
    icon: BarChart2,
    headline: 'Tally + Razorpay sync',
    sub: 'Drop your Tally PDF. Connect Razorpay. Zero manual entry.',
    keywords: 'tally integration razorpay dashboard india',
  },
];

function ValueStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.section
      ref={ref}
      aria-label="Product features"
      className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      {VALUE_PROPS.map(({ icon: Icon, headline, sub, keywords }, i) => (
        <motion.div
          key={headline}
          className="rounded-[16px] p-5"
          style={{
            background: C.white,
            border: `1px solid ${C.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: 'easeOut' }}
          whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
        >
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
            style={{ background: C.goldDim, border: `1px solid ${C.goldBorder}` }}
            aria-hidden
          >
            <Icon className="w-4 h-4" style={{ color: C.gold }} strokeWidth={1.8} />
          </span>
          <h3 className="text-sm font-bold mb-1" style={{ color: C.text }}>
            {headline}
          </h3>
          <p className="text-[12px] leading-relaxed" style={{ color: C.textMuted }}>
            {sub}
          </p>
          {/* Hidden SEO text */}
          <span className="sr-only">{keywords}</span>
        </motion.div>
      ))}
    </motion.section>
  );
}

// ─── Comparison bar ───────────────────────────────────────────────────────────
function ComparisonBar() {
  return (
    <div
      className="mt-10 flex items-center justify-center gap-2 text-[12px] select-none"
      style={{ color: C.textMuted }}
      aria-label="Plan comparison"
    >
      <span className="font-semibold text-zinc-400 tracking-wide">Free</span>
      <span className="text-zinc-300 mx-1">·</span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-400">Explore</span>
      <span className="mx-4 h-4 w-px bg-zinc-200" />
      <span className="font-semibold" style={{ color: C.gold }}>Founder</span>
      <span className="mx-1" style={{ color: C.goldBorder }}>·</span>
      <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.gold }}>Execute</span>
    </div>
  );
}

// ─── FAQ section (SEO rich results) ──────────────────────────────────────────
function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [open, setOpen] = useState(null);

  const faqs = FAQ_JSON_LD.mainEntity.map(q => ({
    q: q.name,
    a: q.acceptedAnswer.text,
  }));

  return (
    <motion.section
      ref={ref}
      aria-labelledby="faq-heading"
      className="mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <h2
        id="faq-heading"
        className="text-xl font-bold mb-8 text-center"
        style={{ color: C.text, fontFamily: 'Georgia, serif' }}
      >
        Common questions
      </h2>

      <div className="space-y-2 max-w-2xl mx-auto">
        {faqs.map(({ q, a }, i) => (
          <motion.div
            key={q}
            className="rounded-[14px] overflow-hidden"
            style={{
              background: C.white,
              border: `1px solid ${open === i ? C.goldBorder : C.border}`,
              boxShadow: open === i ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              aria-expanded={open === i}
              style={{ color: C.text }}
            >
              <span className="text-sm font-semibold pr-4">{q}</span>
              <motion.span
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: open === i ? C.gold : 'rgba(0,0,0,0.05)',
                  color: open === i ? '#0C0C0D' : C.textMuted,
                }}
                aria-hidden
              >
                <span className="text-base leading-none font-bold">+</span>
              </motion.span>
            </button>

            <motion.div
              initial={false}
              animate={{ height: open === i ? 'auto' : 0, opacity: open === i ? 1 : 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: C.textSub }}>
                {a}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Trust bar ────────────────────────────────────────────────────────────────
const TRUST = [
  { icon: Shield, label: 'Secure Razorpay payment' },
  { icon: RefreshCw, label: '7-day refund, no questions' },
  { icon: Zap, label: 'Instant access after payment' },
];

function TrustBar() {
  return (
    <motion.div
      className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      aria-label="Trust signals"
    >
      {TRUST.map(({ icon: Icon, label }) => (
        <span key={label} className="flex items-center gap-2 text-[12px]" style={{ color: C.textMuted }}>
          <Icon className="w-3.5 h-3.5" style={{ color: C.gold }} strokeWidth={2} aria-hidden />
          {label}
        </span>
      ))}
    </motion.div>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────
function PageHeader() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.header
      ref={ref}
      className="text-center mb-14"
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Eyebrow */}
      <span
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] mb-5"
        style={{
          background: C.goldDim,
          border: `1px solid ${C.goldBorder}`,
          color: C.gold,
        }}
        aria-hidden
      >
        <Sparkles className="w-3 h-3" strokeWidth={2} />
        Simple pricing
      </span>

      {/* H1 — primary SEO target */}
      <h1
        className="text-3xl md:text-[40px] font-bold leading-tight mb-4"
        style={{ color: C.text, fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}
      >
        Start free.<br className="md:hidden" /> Upgrade when you&apos;re ready.
      </h1>

      {/* Meta description match */}
      <p className="text-base md:text-lg max-w-lg mx-auto leading-relaxed" style={{ color: C.textMuted }}>
        AI CFO for Indian founders and agencies.
        Two plans. No complexity.
        Your path to{' '}
        <span style={{ color: C.text, fontWeight: 600 }}>₹100 Crore</span> starts here.
      </p>
    </motion.header>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFreeCTA = () => {
    storeAuthIntent({ intent: 'signup', plan: 'free', redirectTo: '/dashboard' });
    navigate('/auth', { state: { from: location.pathname } });
  };

  const handleFounderCTA = () => {
    storeAuthIntent({
      intent: 'upgrade',
      plan: 'founder',
      price: '₹3,999',
      billing: 'annual',
      redirectTo: '/checkout?plan=founder',
    });
    navigate('/checkout?plan=founder', { state: { from: location.pathname } });
  };

  return (
    <>
      <PageHead
        title={SEO.title}
        description={SEO.description}
        canonical={SEO.canonical}
      />
      <JsonLd data={PRICING_JSON_LD} id="pricing-schema" />
      <JsonLd data={FAQ_JSON_LD} id="faq-schema" />

      <div className="min-h-screen relative" style={{ background: C.bg }}>
        <Grain />
        <Navbar />

        <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">

          <PageHeader />

          {/* ── Pricing cards ── */}
          <section
            aria-label="Pricing plans"
            className="grid md:grid-cols-2 gap-5 items-stretch"
          >
            <FreeCard onCTA={handleFreeCTA} />
            <FounderCard onCTA={handleFounderCTA} />
          </section>

          <ComparisonBar />

          {/* ── Value strip ── */}
          <ValueStrip />

          {/* ── Trust bar ── */}
          <TrustBar />

          {/* ── FAQ ── */}
          <FAQ />

          {/* ── Bottom CTA ── */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm mb-4" style={{ color: C.textMuted }}>
              Ready to build your path to ₹100 Crore?
            </p>
            <MagneticButton
              onClick={handleFounderCTA}
              testId="pricing-bottom-cta"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl font-bold text-sm cursor-pointer"
              style={{ background: C.dark, color: '#FFFFFF' }}
            >
              Get started — ₹3,999/year
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </MagneticButton>
            <p className="text-[11px] mt-3" style={{ color: C.textMuted }}>
              7-day refund guaranteed · No hidden charges
            </p>
          </motion.div>

        </main>

        <Footer />
        <HelpWidget />
      </div>
    </>
  );
}

export default PricingPage;
