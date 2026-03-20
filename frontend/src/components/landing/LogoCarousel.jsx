// LogoCarousel - Enhanced with real SVGs, hover 3D tilt, parallax, entrance reveal
import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
  sectionBg:   '#04111C', // between hero and other darks
};

// ─── Real inline SVG logos ────────────────────────────────────────────────────
const LogoSVGs = {
  Razorpay: ({ size = 28 }) => (
    <svg width={size * 2.2} height={size * 0.7} viewBox="0 0 96 30" fill="none">
      <path d="M10.5 22.5L18 7.5h4.5L15 22.5H10.5z" fill="#2D9CDB"/>
      <path d="M18 7.5h4.5l-3 7.5H15L18 7.5z" fill="#528FF0"/>
      <text x="24" y="21" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">razorpay</text>
    </svg>
  ),
  Stripe: ({ size = 28 }) => (
    <svg width={size * 1.8} height={size * 0.7} viewBox="0 0 80 28" fill="none">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M7.5 10.2c0-1 .8-1.4 2.1-1.4 1.9 0 4.3.6 6.2 1.6V4.8C13.8 4 11.7 3.6 9.6 3.6 4.7 3.6 1.5 6.2 1.5 10.5c0 6.6 9 5.6 9 8.4 0 1.2-.9 1.6-2.3 1.6-2 0-4.5-.8-6.5-1.9v5.7c2.2 1 4.4 1.4 6.5 1.4 5 0 8.4-2.5 8.4-6.8-.1-7.1-9.1-5.9-9.1-8.7z"
        fill="#635BFF"/>
      <text x="20" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">stripe</text>
    </svg>
  ),
  Supabase: ({ size = 28 }) => (
    <svg width={size * 2} height={size * 0.75} viewBox="0 0 88 28" fill="none">
      <path d="M9 3l-6 13h8l-2 9 12-15h-8l3-7H9z" fill="#3ECF8E"/>
      <text x="22" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">supabase</text>
    </svg>
  ),
  Vercel: ({ size = 28 }) => (
    <svg width={size * 1.8} height={size * 0.7} viewBox="0 0 78 26" fill="none">
      <path d="M13 4L24 22H2L13 4z" fill="white"/>
      <text x="28" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">vercel</text>
    </svg>
  ),
  Cashfree: ({ size = 28 }) => (
    <svg width={size * 2.2} height={size * 0.75} viewBox="0 0 96 28" fill="none">
      <rect x="2" y="6" width="16" height="16" rx="4" fill="#00C853"/>
      <path d="M7 14c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" fill="white"/>
      <text x="22" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">cashfree</text>
    </svg>
  ),
  AWS: ({ size = 28 }) => (
    <svg width={size * 1.4} height={size * 0.75} viewBox="0 0 60 28" fill="none">
      <path d="M8 18c-3.3-1.2-5.5-4-5.5-7.3C2.5 7 5.5 4 9.5 4c1 0 2 .2 2.9.5" stroke="#FF9900" strokeWidth="1.5" fill="none"/>
      <path d="M20 12h2l2 6 2-6h2l2 6 2-6h2" stroke="#FF9900" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M5 22h14" stroke="#FF9900" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="26" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">AWS</text>
    </svg>
  ),
  Anthropic: ({ size = 28 }) => (
    <svg width={size * 2.2} height={size * 0.75} viewBox="0 0 96 28" fill="none">
      <path d="M8 22L14 6h3l6 16h-3.5l-1.2-3.5h-5.6L11.5 22H8zm5.5-6h3.8L15.4 10l-1.9 6z" fill="#CC785C"/>
      <text x="26" y="19" fontFamily="system-ui,sans-serif" fontWeight="700" fontSize="13" fill="white">anthropic</text>
    </svg>
  ),
};

const logos = [
  { name: 'Razorpay',  accent: '#2D9CDB', glow: '#528FF055' },
  { name: 'Stripe',    accent: '#635BFF', glow: '#635BFF55' },
  { name: 'Supabase',  accent: '#3ECF8E', glow: '#3ECF8E55' },
  { name: 'Vercel',    accent: '#ffffff', glow: '#ffffff33' },
  { name: 'Cashfree',  accent: '#00C853', glow: '#00C85355' },
  { name: 'AWS',       accent: '#FF9900', glow: '#FF990055' },
  { name: 'Anthropic', accent: '#CC785C', glow: '#CC785C55' },
];

// ─── 3D tilt logo pill ────────────────────────────────────────────────────────
const LogoPill = ({ logo }) => {
  const ref     = useRef(null);
  const [hov, setHov] = useState(false);
  const rx = useSpring(useMotionValue(0), { stiffness: 240, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 240, damping: 20 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    rx.set(-((e.clientY - r.top)  / r.height - 0.5) * 14);
    ry.set( ((e.clientX - r.left) / r.width  - 0.5) * 14);
  };
  const onLeave = () => { rx.set(0); ry.set(0); setHov(false); };

  const Logo = LogoSVGs[logo.name];

  return (
    <motion.div
      ref={ref}
      className="flex-shrink-0 mx-4 md:mx-7"
      style={{ perspective: 600 }}
      onMouseMove={onMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      transition={{ scale: { duration: 0.2 } }}
    >
      <motion.div
        className="relative flex items-center justify-center px-5 py-3 rounded-xl select-none"
        style={{
          rotateX: rx, rotateY: ry,
          transformStyle: 'preserve-3d',
          background: hov
            ? `rgba(255,255,255,0.08)`
            : 'rgba(255,255,255,0.04)',
          border: hov
            ? `1px solid ${logo.accent}55`
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: hov
            ? `0 0 24px ${logo.glow}, 0 8px 32px rgba(0,0,0,0.4)`
            : '0 2px 12px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(8px)',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          cursor: 'default',
          minWidth: 120,
        }}
      >
        {/* top sheen */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl"
          style={{ background: `linear-gradient(90deg, transparent, ${logo.accent}40, transparent)` }} />

        <motion.div
          animate={hov ? { scale: 1.06 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Logo size={22} />
        </motion.div>

        {/* Hover glow underline */}
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px rounded-full"
          animate={hov ? { width: '60%', opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: logo.accent }}
        />
      </motion.div>
    </motion.div>
  );
};

// ─── Infinite marquee row ─────────────────────────────────────────────────────
const MarqueeRow = ({ items, direction = 1, speed = 35 }) => {
  const [paused, setPaused] = useState(false);
  const tripled = [...items, ...items, ...items];

  return (
    <div
      className="flex overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div
        className="flex"
        animate={{ x: direction > 0 ? ['0%', '-33.33%'] : ['-33.33%', '0%'] }}
        transition={{
          x: { duration: speed, repeat: Infinity, ease: 'linear', repeatType: 'loop' },
        }}
        style={{ animationPlayState: paused ? 'paused' : 'running' }}
      >
        {tripled.map((logo, i) => (
          <LogoPill key={`${logo.name}-${i}`} logo={logo} />
        ))}
      </motion.div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const LogoCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <section
      ref={ref}
      className="relative py-12 md:py-16 overflow-hidden"
      style={{ background: C.sectionBg }}
      data-testid="logo-carousel"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(ellipse 70% 100% at 50% 50%, rgba(0,123,160,0.08) 0%, transparent 65%)` }} />
      {/* separator lines */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.14), transparent)' }} />
      <div className="absolute bottom-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.10), transparent)' }} />

      {/* ── Label ── */}
      <motion.p
        className="text-xs font-semibold tracking-widest text-center mb-8 uppercase"
        style={{ color: 'rgba(255,255,255,0.28)', letterSpacing: '0.18em' }}
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Trusted Infrastructure
      </motion.p>

      {/* ── Marquee with edge fades ── */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to right, ${C.sectionBg}, transparent)` }} />
        {/* right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 z-10 pointer-events-none"
          style={{ background: `linear-gradient(to left, ${C.sectionBg}, transparent)` }} />

        <MarqueeRow items={logos} direction={1} speed={38} />
      </motion.div>
    </section>
  );
};

export default LogoCarousel;