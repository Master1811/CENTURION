// FeatureStorySection - Enhanced with Hero look & feel (dark cyan gradient)
import React from 'react';
import { CheckCircle, BarChart3, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion } from 'framer-motion';

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

// ─── Glassmorphic card ────────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', style = {} }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: 'rgba(5,15,24,0.70)',
      border: '1px solid rgba(0,191,255,0.16)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '0 0 0 1px rgba(0,191,255,0.05), 0 20px 56px rgba(0,0,0,0.50)',
      ...style,
    }}
  >
    <div
      className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.30), transparent)' }}
    />
    {children}
  </div>
);

// ─── Data row inside card ─────────────────────────────────────────────────────
const DataRow = ({ label, value, accent = false }) => (
  <div
    className="flex items-center justify-between p-4 rounded-xl"
    style={{
      background: accent ? 'rgba(0,191,255,0.10)' : 'rgba(255,255,255,0.04)',
      border: accent ? '1px solid rgba(0,191,255,0.28)' : '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.52)' }}>{label}</span>
    <span
      className="font-mono text-sm font-semibold tabular-nums"
      style={{ color: accent ? C.brightCyan2 : 'rgba(255,255,255,0.85)' }}
    >
      {value}
    </span>
  </div>
);

// ─── Section label / eyebrow ──────────────────────────────────────────────────
const Eyebrow = ({ children }) => (
  <p
    className="mb-4 text-xs font-semibold uppercase tracking-widest"
    style={{ color: `${C.brightCyan2}99`, letterSpacing: '0.16em' }}
  >
    {children}
  </p>
);

// ─── Feature list item ────────────────────────────────────────────────────────
const FeatureItem = ({ children }) => (
  <li
    className="flex items-start gap-3 pl-4 text-sm leading-relaxed"
    style={{
      borderLeft: `2px solid rgba(0,191,255,0.30)`,
      color: 'rgba(255,255,255,0.60)',
    }}
  >
    {children}
  </li>
);

// ─── Main Section ─────────────────────────────────────────────────────────────
export const FeatureStorySection = () => {
  return (
    <section
      id="features"
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: C.darkCorner }}
      data-testid="features-section"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 65% 40% at 50% 0%, rgba(0,191,255,0.14) 0%, transparent 55%)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 40% 35% at 5%  50%, rgba(0,96,128,0.20) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 95% 50%, rgba(0,96,128,0.20) 0%, transparent 55%)
        `,
      }} />
      {/* dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.11]" style={{
        backgroundImage: `radial-gradient(circle, rgba(0,191,255,0.55) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%)',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 space-y-28 md:space-y-36">

        {/* ── Row 1: Check-In ── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal>
            <div>
              <Eyebrow>{copy.features.checkIn.eyebrow}</Eyebrow>
              <h3
                className="text-2xl md:text-3xl font-bold mb-6 leading-snug"
                style={{
                  background: `linear-gradient(135deg, #fff 40%, ${C.brightCyan2} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                {copy.features.checkIn.headline}
              </h3>
              <p className="mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>
                {copy.features.checkIn.description}
              </p>
              <ul className="space-y-4">
                {copy.features.checkIn.features.map((feature, i) => (
                  <FeatureItem key={i}>{feature}</FeatureItem>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em' }}>
                    Check-In Result
                  </p>
                  <CheckCircle className="w-5 h-5" style={{ color: C.brightCyan }} strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <DataRow label="Status" value="2 months ahead" accent />
                  <DataRow label="This month" value="₹4.2 Lakh" />
                  <DataRow label="Predicted" value="₹3.8 Lakh" />
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* ── Row 2: Benchmarks ── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal className="order-2 md:order-1">
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.14em' }}>
                    Benchmark
                  </p>
                  <BarChart3 className="w-5 h-5" style={{ color: C.brightCyan }} strokeWidth={1.5} />
                </div>
                <div className="space-y-6">
                  {/* Your growth bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>Your growth</span>
                      <span className="font-mono text-sm font-semibold" style={{ color: C.brightCyan2 }}>12%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${C.tealEdge}, ${C.brightCyan})`, boxShadow: `0 0 8px ${C.brightCyan}66` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: '75%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>
                  {/* Median bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Median (Pre-Seed)</span>
                      <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>8%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'rgba(255,255,255,0.18)' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: '50%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.0, ease: 'easeOut', delay: 0.35 }}
                      />
                    </div>
                  </div>
                  {/* Verdict */}
                  <div
                    className="pt-4 flex items-center gap-2"
                    style={{ borderTop: '1px solid rgba(0,191,255,0.12)' }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: C.brightCyan2 }}
                    >
                      <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                      Top 18% of pre-seed founders
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="order-1 md:order-2">
            <div>
              <Eyebrow>{copy.features.benchmarks.eyebrow}</Eyebrow>
              <h3
                className="text-2xl md:text-3xl font-bold mb-6 leading-snug"
                style={{
                  background: `linear-gradient(135deg, #fff 40%, ${C.brightCyan2} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                {copy.features.benchmarks.headline}
              </h3>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>
                {copy.features.benchmarks.description}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Row 3: Sharing ── */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal>
            <div>
              <Eyebrow>{copy.features.share.eyebrow}</Eyebrow>
              <h3
                className="text-2xl md:text-3xl font-bold mb-6 leading-snug"
                style={{
                  background: `linear-gradient(135deg, #fff 40%, ${C.brightCyan2} 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}
              >
                {copy.features.share.headline}
              </h3>
              <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>
                {copy.features.share.description}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="relative h-64">
              {[
                { rotation: '-4deg', top: 0, left: 0, url: '100crengine.in/p/abc123', label: '₹100Cr by March 2029', delay: 0   },
                { rotation: '1deg',  top: 8, left: 12, url: '100crengine.in/p/def456', label: '₹50Cr by June 2027',  delay: 0.1 },
                { rotation: '-1.5deg', top: 16, left: 24, url: '100crengine.in/p/ghi789', label: '₹10Cr by Dec 2025', delay: 0.2 },
              ].map(({ rotation, top, left, url, label, delay }, i) => (
                <motion.div
                  key={i}
                  className="absolute w-64 transform-gpu"
                  style={{ top: `${top * 4}px`, left: `${left * 4}px`, rotate: rotation }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                >
                  <GlassCard>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 className="w-4 h-4 flex-shrink-0" style={{ color: `${C.midCyan}99` }} strokeWidth={1.5} />
                        <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{url}</span>
                      </div>
                      <p className="font-mono text-sm font-semibold" style={{ color: C.brightCyan2 }}>{label}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
};

export default FeatureStorySection;