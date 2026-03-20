// PricingSection - Enhanced with Hero look & feel
import React, { useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { storeAuthIntent } from '@/lib/auth/intent';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  darkCorner2: '#0A0F14',
  midTone:     '#007BA0',
  sectionBg:   '#060D18',
};

// ─── 3D tilt wrapper ──────────────────────────────────────────────────────────
const TiltCard = ({ children, accentColor, isPrimary = false, className = '' }) => {
  const ref   = useRef(null);
  const rx    = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });
  const ry    = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const [hov, setHov] = useState(false);

  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    rx.set(-((e.clientY - r.top)  / r.height - 0.5) * 12);
    ry.set( ((e.clientX - r.left) / r.width  - 0.5) * 12);
    glowX.set(((e.clientX - r.left) / r.width)  * 100);
    glowY.set(((e.clientY - r.top)  / r.height) * 100);
  }, [rx, ry, glowX, glowY]);

  return (
    <motion.div ref={ref} className={cn('h-full', className)}
      style={{ perspective: 900 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { rx.set(0); ry.set(0); setHov(false); }}
      whileHover={{ scale: 1.025, y: -4 }}
      transition={{ scale: { duration: 0.25 }, y: { duration: 0.25 } }}
    >
      <motion.div className="relative h-full rounded-2xl overflow-hidden"
        style={{
          rotateX: rx, rotateY: ry,
          transformStyle: 'preserve-3d',
          background: isPrimary
            ? `linear-gradient(145deg, rgba(0,96,128,0.45) 0%, rgba(5,15,24,0.88) 100%)`
            : 'rgba(5,15,24,0.72)',
          border: hov
            ? `1px solid ${accentColor}55`
            : isPrimary ? `1px solid ${accentColor}40` : `1px solid rgba(255,255,255,0.10)`,
          backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          boxShadow: hov
            ? `0 0 0 1px ${accentColor}18, 0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${accentColor}18`
            : isPrimary
              ? `0 0 0 1px ${accentColor}10, 0 20px 56px rgba(0,0,0,0.55), 0 0 60px ${accentColor}10`
              : '0 4px 24px rgba(0,0,0,0.40)',
          transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
      >
        {/* Mouse-follow glow */}
        {hov && (
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle 140px at ${glowX.get()}% ${glowY.get()}%, ${accentColor}1a, transparent 65%)` }} />
        )}
        {/* Top sheen */}
        <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}${isPrimary ? '55' : '30'}, transparent)` }} />
        {children}
      </motion.div>
    </motion.div>
  );
};

// ─── Feature list item ────────────────────────────────────────────────────────
const FeatureItem = ({ feature, accentColor, index, isInView }) => (
  <motion.li
    className="flex items-start gap-3"
    initial={{ opacity: 0, x: -12 }}
    animate={isInView ? { opacity: 1, x: 0 } : {}}
    transition={{ delay: 0.3 + index * 0.07, duration: 0.4 }}
  >
    <motion.div
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}35` }}
      whileHover={{ scale: 1.2, background: `${accentColor}30` }}
    >
      <Check className="w-3 h-3" style={{ color: accentColor }} strokeWidth={2.5} />
    </motion.div>
    <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)' }}>{feature}</span>
  </motion.li>
);

// ─── Pricing card ─────────────────────────────────────────────────────────────
const PricingCard = ({ plan, isPrimary, accentColor, onCTA, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [hov, setHov] = useState(false);

  return (
    <motion.div ref={ref} className="h-full"
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ delay: index * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard accentColor={accentColor} isPrimary={isPrimary}>

        {/* Popular badge */}
        {plan.badge && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <motion.span
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${C.brightCyan}cc, ${C.midCyan}88)`,
                color: C.darkCorner,
                boxShadow: `0 0 12px ${C.brightCyan}55`,
              }}
              animate={{ boxShadow: [`0 0 8px ${C.brightCyan}44`, `0 0 18px ${C.brightCyan}77`, `0 0 8px ${C.brightCyan}44`] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Zap className="w-3 h-3" strokeWidth={2.5} />
              {plan.badge}
            </motion.span>
          </div>
        )}

        <div className="p-8 flex flex-col h-full" style={{ paddingTop: plan.badge ? '2.75rem' : '2rem' }}
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>

          {/* Plan name + description */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-white">{plan.name}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <div className="mb-8 flex items-end gap-2">
            <motion.span
              className="font-mono font-bold leading-none"
              style={{
                fontSize: 'clamp(36px, 7vw, 52px)',
                background: isPrimary
                  ? `linear-gradient(135deg, #fff 30%, ${accentColor} 100%)`
                  : 'rgba(255,255,255,0.92)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
              animate={hov ? { scale: 1.04 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {plan.price}
            </motion.span>
            <span className="text-sm pb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>{plan.period}</span>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.map((f, i) => (
              <FeatureItem key={i} feature={f} accentColor={accentColor} index={i} isInView={isInView} />
            ))}
          </ul>

          {/* CTA button */}
          {isPrimary ? (
            <motion.button onClick={onCTA}
              className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                color: C.darkCorner,
                boxShadow: `0 0 0 1px rgba(0,191,255,0.35), 0 8px 28px rgba(0,191,255,0.28)`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 0 1px rgba(0,191,255,0.50), 0 12px 36px rgba(0,191,255,0.36)` }}
              whileTap={{ scale: 0.97 }}
              data-testid="pricing-founder-cta"
            >
              <motion.span className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.26) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }} />
              <span className="relative z-10 flex items-center gap-2">
                {plan.cta} <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </span>
            </motion.button>
          ) : (
            <motion.button onClick={onCTA}
              className="w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid rgba(255,255,255,0.14)`,
                color: 'rgba(255,255,255,0.80)',
              }}
              whileHover={{
                background: 'rgba(255,255,255,0.10)',
                borderColor: `rgba(0,191,255,0.30)`,
                color: '#fff',
                scale: 1.02,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              data-testid="pricing-free-cta"
            >
              {plan.cta} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          )}
        </div>
      </TiltCard>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const PricingSection = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' });

  const plans = [
    {
      plan: copy.pricing.free,
      isPrimary: false,
      accentColor: C.midCyan,
      onCTA: () => navigate('/tools/100cr-calculator'),
    },
    {
      plan: copy.pricing.starter,
      isPrimary: true,
      accentColor: C.brightCyan,
      onCTA: () => {
        storeAuthIntent({ intent: 'upgrade', plan: 'starter', price: '₹499', billing: 'monthly', redirectTo: '/checkout?plan=starter' });
        navigate('/checkout?plan=starter');
      },
    },
    {
      plan: copy.pricing.founder,
      isPrimary: false,
      accentColor: C.midCyan,
      onCTA: () => {
        storeAuthIntent({ intent: 'upgrade', plan: 'founder', price: '₹3,999', billing: 'annual', redirectTo: '/checkout?plan=founder' });
        navigate('/checkout?plan=founder');
      },
    },
  ];

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: C.sectionBg }}
      id="pricing"
      data-testid="pricing-section"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 70% 50% at 50% -5%, rgba(0,191,255,0.18) 0%, transparent 58%)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 40% 40% at 5%  70%, rgba(0,96,128,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 95% 70%, rgba(0,96,128,0.18) 0%, transparent 55%)
        `,
      }} />
      {/* Vignettes */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 50% at 0%   0%,   rgba(5,10,16,0.85) 0%, transparent 55%),
          radial-gradient(ellipse 50% 50% at 100% 0%,   rgba(5,10,16,0.85) 0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 0%   100%, rgba(4,8,14,0.90)  0%, transparent 55%),
          radial-gradient(ellipse 55% 45% at 100% 100%, rgba(4,8,14,0.90)  0%, transparent 55%)
        `,
      }} />
      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.09]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.6) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, black 25%, transparent 78%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 30%, black 25%, transparent 78%)',
      }} />
      {/* Top/bottom separator lines */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.16), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.10), transparent)' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8">

        {/* Header */}
        <motion.div ref={headerRef} className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ background: 'rgba(0,191,255,0.10)', border: '1px solid rgba(0,191,255,0.28)', color: `${C.brightCyan2}cc`, letterSpacing: '0.14em' }}>
            <Sparkles className="w-3.5 h-3.5" />
            Pricing
          </motion.span>
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, #fff 35%, ${C.brightCyan2} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            {copy.pricing.title}
          </h2>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {copy.pricing.subtitle}
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          {plans.map(({ plan, isPrimary, accentColor, onCTA }, i) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPrimary={isPrimary}
              accentColor={accentColor}
              onCTA={onCTA}
              index={i}
            />
          ))}
        </div>

        {/* Trial add-on */}
        <motion.div
          className="mt-10 grid md:grid-cols-[1.2fr_0.8fr] gap-4 items-center rounded-2xl border border-white/10 p-6"
          style={{ background: 'linear-gradient(135deg, rgba(0,191,255,0.12), rgba(5,10,16,0.75))' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-sm uppercase tracking-[0.16em] font-semibold text-white/80">7-day trial</p>
            <p className="text-xl font-bold text-white mt-2">Try everything for ₹99. Auto-converts to Starter.</p>
            <p className="text-sm text-white/60 mt-2">Cancel anytime before day 7 to avoid charges. Keep dashboard + AI access during trial.</p>
          </div>
          <div className="flex md:justify-end">
            <motion.button
              onClick={() => {
                storeAuthIntent({ intent: 'upgrade', plan: 'trial', price: '₹99', billing: 'trial_7d', redirectTo: '/checkout?plan=trial' });
                navigate('/checkout?plan=trial', { state: { from: location.pathname } });
              }}
              className="h-12 px-6 rounded-xl bg-white text-[#09090B] font-semibold text-sm shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              whileHover={{ y: -2, boxShadow: '0 16px 36px rgba(0,0,0,0.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              Start trial for ₹99 →
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom reassurance */}
        <motion.div className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>
            ₹99 trial · Cancel anytime · Secure Razorpay checkout
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;