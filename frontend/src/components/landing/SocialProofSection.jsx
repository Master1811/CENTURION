// SocialProofSection - Enhanced, slightly lighter teal-dark for page contrast
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  midTone:     '#007BA0',
  // Section-specific: slightly lighter to contrast with hero/features
  sectionBg:   '#071520',  // lifted teal-dark, not as black as #050A10
};

const testimonials = [
  {
    quote: "100Cr Engine changed how I think about growth. The projections are scarily accurate.",
    author: "Priya Sharma", role: "Founder, SaaS Startup", avatar: "PS",
  },
  {
    quote: "Finally, a tool that speaks Indian founder language. The benchmarks are gold.",
    author: "Rahul Mehta", role: "CEO, Fintech Company", avatar: "RM",
  },
  {
    quote: "I use the monthly check-ins religiously. It keeps me honest and focused.",
    author: "Ananya Gupta", role: "Co-founder, D2C Brand", avatar: "AG",
  },
  {
    quote: "The dashboards make it feel obvious what to do next. Our board update process is now faster and cleaner.",
    author: "Vikram Nair", role: "Founder, B2B SaaS", avatar: "VN",
  },
];

const metrics = [
  { value: '10,000+', label: 'Projections created', icon: Target,     accent: C.brightCyan  },
  { value: '₹500Cr+', label: 'Revenue tracked',     icon: TrendingUp, accent: '#22C55E'      },
  { value: '2,500+',  label: 'Indian founders',     icon: Users,      accent: C.brightCyan2  },
  { value: '48hrs',   label: 'Avg. saved per month',icon: Zap,        accent: '#F59E0B'      },
];

// ─── Metric card ──────────────────────────────────────────────────────────────
const MetricCard = ({ metric, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const Icon = metric.icon;

  return (
    <motion.div
      ref={ref}
      className="text-center p-6 rounded-2xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(0,191,255,0.18)' }}
    >
      <motion.div
        className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
        style={{ background: `${metric.accent}18`, border: `1px solid ${metric.accent}30` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 300 }}
      >
        <Icon className="w-6 h-6" style={{ color: metric.accent }} strokeWidth={1.5} />
      </motion.div>

      <motion.p
        className="text-3xl md:text-4xl font-bold font-mono mb-2"
        style={{ color: '#fff' }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3 + index * 0.1 }}
      >
        {metric.value}
      </motion.p>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{metric.label}</p>
    </motion.div>
  );
};

// ─── Testimonial card ─────────────────────────────────────────────────────────
const TestimonialCard = ({ testimonial, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      className="relative p-6 md:p-7 rounded-2xl flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(0,191,255,0.12)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.30)',
      }}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.12, duration: 0.55 }}
      whileHover={{
        borderColor: 'rgba(0,191,255,0.28)',
        boxShadow: '0 8px 32px rgba(0,191,255,0.10)',
      }}
    >
      {/* top sheen */}
      <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.25), transparent)' }} />

      {/* Author row */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${C.tealEdge}88, ${C.midTone}55)`,
            border: `1px solid rgba(0,191,255,0.25)`,
            color: C.brightCyan2,
          }}
        >
          {testimonial.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{testimonial.author}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>{testimonial.role}</p>
        </div>
      </div>

      {/* Quote */}
      <div className="flex items-start gap-2.5 flex-1">
        <Quote className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: `${C.brightCyan}66` }} />
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
          {testimonial.quote}
        </p>
      </div>

      {/* Rating dots */}
      <div className="flex gap-1 mt-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: C.brightCyan }} />
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const SocialProofSection = () => {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-50px' });

  return (
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{ background: C.sectionBg }}
      data-testid="social-proof-section"
    >
      {/* ── Background — gentler than hero, clearly distinct ── */}
      {/* Soft cyan wash from center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,123,160,0.12) 0%, transparent 65%)` }} />
      {/* Faint horizontal scan line accent */}
      <div className="absolute left-0 right-0 pointer-events-none"
        style={{ top: '50%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.08), transparent)' }} />
      {/* Corner vignettes - lighter than hero */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 45% 45% at 0%   0%,   rgba(5,10,16,0.75) 0%, transparent 55%),
          radial-gradient(ellipse 45% 45% at 100% 0%,   rgba(5,10,16,0.75) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 0%   100%, rgba(5,10,16,0.80) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 100% 100%, rgba(5,10,16,0.80) 0%, transparent 55%)
        `,
      }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-20">
          {metrics.map((metric, i) => (
            <MetricCard key={metric.label} metric={metric} index={i} />
          ))}
        </div>

        {/* Section header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: `${C.brightCyan2}88`, letterSpacing: '0.16em' }}>
            Testimonials
          </p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 landing-heading-white-fade"
            initial={{ opacity: 0, y: 10, filter: "blur(7px)" }}
            animate={isHeaderInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="not-italic">What Our </span>
            <span className="italic" style={{ color: C.brightCyan2 }}>Clients</span>{" "}
            <span className="not-italic">Say</span>
          </motion.h2>
          <p className="max-w-2xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Real founder experiences with 100Cr Engine — clarity, focus, and faster growth decisions.
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} index={i} />
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.16em' }}>
            Trusted Infrastructure
          </p>
          <div className="flex items-center justify-center gap-8">
            {['Supabase', 'Razorpay', 'Stripe', 'AWS'].map((name) => (
              <span key={name} className="text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.28)' }}>
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProofSection;