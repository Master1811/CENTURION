// FAQSection - Enhanced with Hero look & feel
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  midTone:     '#007BA0',
  // Slightly lifted — sits between ScrollStory (#060E18) and SocialProof (#071520)
  sectionBg:   '#071A28',
};

const faqs = [
  {
    q: 'What is 100Cr Engine?',
    a: '100Cr Engine is an AI-powered founder dashboard that helps you project revenue milestones, track growth, and make better decisions with clarity.',
  },
  {
    q: 'How do the projections work?',
    a: "You enter your current monthly revenue and growth rate. We generate a time-based forecast for key milestones (for example, ₹1 Crore, ₹10 Crore, ₹100 Crore) and keep the plan actionable.",
  },
  {
    q: 'Is the Free plan really free?',
    a: 'Yes. The Free plan is ₹0 forever — no credit card, no trial, no expiry. You get the calculator, benchmarks, quiz, and share link. Upgrade to Founder (₹3,999/year) when you want full dashboard access.',
  },
  {
    q: 'Do I need to connect payment accounts?',
    a: 'Not necessarily. If you want, you can connect revenue sources for convenience. But the core projections and growth tracking can work without heavy setup.',
  },
];

// ─── Single FAQ item ──────────────────────────────────────────────────────────
const FAQItem = ({ item, idx, isOpen, onToggle }) => (
  <div
    className="relative overflow-hidden"
    style={{
      borderBottom: idx < faqs.length - 1 ? '1px solid rgba(0,191,255,0.08)' : 'none',
    }}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 py-5 px-6 text-left group"
      style={{ background: 'transparent', cursor: 'pointer' }}
    >
      {/* Question */}
      <span
        className="font-semibold text-sm md:text-base leading-snug transition-colors duration-200"
        style={{ color: isOpen ? C.brightCyan2 : 'rgba(255,255,255,0.88)' }}
      >
        {item.q}
      </span>

      {/* Icon */}
      <motion.div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: isOpen ? `${C.brightCyan}18` : 'rgba(255,255,255,0.06)',
          border: isOpen ? `1px solid ${C.brightCyan}45` : '1px solid rgba(255,255,255,0.10)',
        }}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {isOpen
          ? <Minus className="w-3.5 h-3.5" style={{ color: C.brightCyan }} strokeWidth={2} />
          : <Plus  className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.55)' }} strokeWidth={2} />
        }
      </motion.div>
    </button>

    {/* Answer */}
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="answer"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: 'hidden' }}
        >
          {/* Cyan left accent bar */}
          <div className="relative mx-6 mb-5">
            <div
              className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
              style={{ background: `linear-gradient(to bottom, ${C.brightCyan}88, ${C.tealEdge}44)` }}
            />
            <p className="pl-4 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>
              {item.a}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Active row glow */}
    {isOpen && (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${C.brightCyan}07, transparent)` }}
      />
    )}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: C.sectionBg }}
      id="faq"
      data-testid="faq-section"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 65% 40% at 50% 0%, rgba(0,191,255,0.10) 0%, transparent 60%)` }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 40% 50% at 0%   60%, rgba(0,96,128,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 40% 50% at 100% 60%, rgba(0,96,128,0.14) 0%, transparent 55%)
        `,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 45% 45% at 0%   0%,   rgba(5,10,16,0.80) 0%, transparent 55%),
          radial-gradient(ellipse 45% 45% at 100% 0%,   rgba(5,10,16,0.80) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 0%   100%, rgba(5,10,16,0.85) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 100% 100%, rgba(5,10,16,0.85) 0%, transparent 55%)
        `,
      }} />
      {/* Separator lines */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.14), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.10), transparent)' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* Left: copy */}
          <motion.div
            className="max-w-md"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: `${C.brightCyan2}88`, letterSpacing: '0.16em' }}>
              Frequently Asked Questions
            </p>
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-5 leading-tight landing-heading-white-fade"
              initial={{ opacity: 0, y: 10, filter: "blur(7px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="not-italic">Everything you need to </span>
              <span className="italic" style={{ color: C.brightCyan2 }}>
                know
              </span>
            </motion.h2>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              About projections, pricing, onboarding, and getting started.
            </p>

            {/* Decorative stat */}
            <motion.div
              className="mt-10 inline-flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: 'rgba(0,191,255,0.07)',
                border: '1px solid rgba(0,191,255,0.18)',
              }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${C.brightCyan}18`, border: `1px solid ${C.brightCyan}30` }}>
                <span style={{ color: C.brightCyan, fontSize: '14px' }}>?</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Still have questions?</p>
                <a href="mailto:hello@100crengine.com"
                  className="text-xs transition-colors"
                  style={{ color: `${C.brightCyan2}99` }}
                  onMouseEnter={e => e.target.style.color = C.brightCyan2}
                  onMouseLeave={e => e.target.style.color = `${C.brightCyan2}99`}
                >
                  hello@100crengine.com →
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(5,15,24,0.70)',
                border: '1px solid rgba(0,191,255,0.16)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 0 0 1px rgba(0,191,255,0.05), 0 20px 56px rgba(0,0,0,0.50)',
              }}
            >
              {/* Top sheen */}
              <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.30), transparent)' }} />

              {faqs.map((item, idx) => (
                <FAQItem
                  key={item.q}
                  item={item}
                  idx={idx}
                  isOpen={openIdx === idx}
                  onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;