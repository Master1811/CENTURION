// TeaserLockedSection - Enhanced, near-black contrast section (darkest on page)
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lock, ArrowRight, FileText, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  midTone:     '#007BA0',
  // Intentionally the darkest section — near-black with just a hint of teal
  // creates maximum contrast after the lighter SocialProof section
  sectionBg:   '#030810',
};

const premiumFeatures = [
  {
    title: 'AI Board Report',
    description: 'Generate investor-ready reports in one click',
    icon: FileText,
    accentColor: C.brightCyan,
    preview: {
      header: 'March 2026 Board Report',
      items: [
        { label: 'MRR Growth',           value: '+14.2%' },
        { label: 'Customer Acquisition', value: '32 new' },
        { label: 'Churn Rate',           value: '2.1%'   },
        { label: 'Runway',               value: '18 months' },
      ],
    },
  },
  {
    title: 'Revenue Intelligence',
    description: 'Deep insights into your revenue quality',
    icon: TrendingUp,
    accentColor: '#22C55E',
    preview: {
      header: 'Revenue Quality Score',
      score: 87,
      factors: ['Recurring: 92%', 'Retention: 85%', 'Growth: 84%'],
    },
  },
  {
    title: 'Scenario Modelling',
    description: 'Model unlimited what-if scenarios',
    icon: BarChart3,
    accentColor: '#F59E0B',
    preview: {
      header: 'Scenario Analysis',
      scenarios: ['Conservative', 'Base Case', 'Aggressive'],
    },
  },
];

// ─── Blurred preview content (unchanged logic) ───────────────────────────────
const PreviewContent = ({ feature }) => (
  <div className="filter blur-[6px] select-none pointer-events-none">
    <p className="text-sm font-medium mb-4 text-white">{feature.preview.header}</p>

    {feature.preview.items && (
      <div className="space-y-2.5">
        {feature.preview.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center p-3 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{item.label}</span>
            <span className="font-mono font-semibold text-sm text-white">{item.value}</span>
          </div>
        ))}
      </div>
    )}

    {feature.preview.score && (
      <div className="text-center py-6">
        <div className="text-5xl font-bold font-mono mb-2 text-white">{feature.preview.score}</div>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>out of 100</p>
        <div className="flex flex-wrap justify-center gap-2">
          {feature.preview.factors.map((f, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    )}

    {feature.preview.scenarios && (
      <div className="space-y-2.5">
        {feature.preview.scenarios.map((s, i) => (
          <div key={i} className="p-3.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm text-white">{s}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>→ ₹100Cr by 20XX</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Feature preview card ─────────────────────────────────────────────────────
const FeaturePreview = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const navigate = useNavigate();
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.14, duration: 0.6 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid rgba(255,255,255,0.08)`,
          boxShadow: '0 4px 32px rgba(0,0,0,0.40)',
          transition: 'border-color 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = `${feature.accentColor}40`}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
      >
        {/* top sheen */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${feature.accentColor}40, transparent)` }} />

        {/* Card header */}
        <div className="p-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${feature.accentColor}18`, border: `1px solid ${feature.accentColor}35` }}
          >
            <Icon className="w-5 h-5" style={{ color: feature.accentColor }} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{feature.description}</p>
          </div>
        </div>

        {/* Blurred preview */}
        <div className="relative p-5 min-h-[200px]">
          <PreviewContent feature={feature} />

          {/* Lock overlay — gradient uses the feature's own accent tint */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(to top, ${C.sectionBg}f5 0%, ${C.sectionBg}cc 40%, transparent 100%)`,
            }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.28 + index * 0.1 }}
            >
              <div
                className="w-11 h-11 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${feature.accentColor}22, ${feature.accentColor}10)`,
                  border: `1px solid ${feature.accentColor}45`,
                }}
              >
                <Lock className="w-4 h-4" style={{ color: feature.accentColor }} strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Unlock full insights
              </p>
              <motion.button
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${feature.accentColor}33, ${feature.accentColor}18)`,
                  border: `1px solid ${feature.accentColor}55`,
                  color: feature.accentColor,
                }}
                whileHover={{
                  scale: 1.06,
                  background: `linear-gradient(135deg, ${feature.accentColor}55, ${feature.accentColor}30)`,
                }}
                whileTap={{ scale: 0.95 }}
              >
                Upgrade
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const TeaserLockedSection = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });
  const navigate = useNavigate();

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: C.sectionBg }}
      data-testid="teaser-locked-section"
    >
      {/* ── Very subtle radial — darkest section, barely any glow ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,96,128,0.10) 0%, transparent 65%)` }} />
      {/* Faint grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(0,191,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,191,255,0.5) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">

        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* PRO badge — uses cyan (consistent with brand, replaces violet) */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            style={{
              background: 'rgba(0,191,255,0.10)',
              border: '1px solid rgba(0,191,255,0.28)',
              color: C.brightCyan2,
              backdropFilter: 'blur(8px)',
            }}
            animate={{
              boxShadow: [
                '0 0 0 0px rgba(0,191,255,0)',
                '0 0 0 7px rgba(0,191,255,0.07)',
                '0 0 0 0px rgba(0,191,255,0)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.2 }}
          >
            <Sparkles className="w-4 h-4" />
            Pro Features
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 landing-heading-white-fade"
            initial={{ opacity: 0, y: 12, filter: "blur(7px)" }}
            animate={isHeaderInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="not-italic">Unlock the </span>
            <span className="italic" style={{ color: C.brightCyan2 }}>
              full power
            </span>
          </motion.h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Premium features designed for founders who are serious about reaching ₹100 Crore.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {premiumFeatures.map((feature, i) => (
            <FeaturePreview key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Start free. Upgrade to Founder for full access.
          </p>
          <motion.button
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-base font-semibold relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 55%, ${C.tealEdge} 100%)`,
              color: C.darkCorner,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.30), 0 12px 36px rgba(0,191,255,0.24)`,
            }}
            whileHover={{
              scale: 1.03,
              y: -3,
              boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 18px 48px rgba(0,191,255,0.34)`,
            }}
            whileTap={{ scale: 0.97 }}
          >
            {/* shimmer */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.26) 50%, transparent 65%)', backgroundSize: '200% 100%' }}
              animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            />
            <span className="relative z-10">Start Free Trial</span>
            <ArrowRight className="relative z-10 w-5 h-5" strokeWidth={2} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TeaserLockedSection;