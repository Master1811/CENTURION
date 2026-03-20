// ResultGate - Enhanced to match dark cyan theme + fixed overflow bleed
// Root cause of the bug: the parent wrapper in HundredCrCalculator lacked
// `overflow-hidden`, so the gate's absolute children (especially the gold label
// near the top) bled upward into the chart area.
// Fix: add `overflow-hidden` + `isolate` to the parent wrapper (see comment in
// HundredCrCalculator), AND keep all gate content well inside the bounds.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { storeAuthIntent } from '@/lib/auth/intent';

const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
};

export function ResultGate({ onDismiss }) {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const alreadyDismissed =
    sessionStorage.getItem('centurion_gate_dismissed') === 'true';

  if (isAuthenticated || dismissed || alreadyDismissed) return null;

  const handleSave = () => {
    storeAuthIntent({ intent: 'save-projection', redirectTo: '/dashboard' });
    window.dispatchEvent(new CustomEvent('centurion:open-auth', {
      detail: {
        headline: 'Save your projection',
        subtext: 'Free account. No credit card.',
      },
    }));
  };

  const handleDismiss = () => {
    sessionStorage.setItem('centurion_gate_dismissed', 'true');
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <motion.div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
      style={{
        // Dark glass — matches the calculator's dark theme
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
        background: 'rgba(5,12,22,0.82)',
        border: '1px solid rgba(0,191,255,0.18)',
        // IMPORTANT: clip all children to this box — prevents label bleed
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Top sheen line — safe inside overflow:hidden */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(0,191,255,0.50), transparent)',
        }}
      />

      {/* Soft glow behind content */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(0,191,255,0.10) 0%, transparent 75%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-xs mx-auto px-6 py-6">

        {/* Status label — cyan, not gold, never floats above the container */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#22C55E' }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: `${C.brightCyan2}cc`, letterSpacing: '0.16em' }}
          >
            Your trajectory is ready
          </p>
        </div>

        <h3
          className="text-base font-bold mb-2"
          style={{ color: '#fff' }}
        >
          Save this projection
        </h3>

        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          Free account. Track your progress every month.{' '}
          <span style={{ color: `${C.brightCyan2}88` }}>No credit card.</span>
        </p>

        {/* Primary CTA */}
        <motion.button
          onClick={handleSave}
          className="w-full h-11 rounded-xl font-semibold text-sm
                     flex items-center justify-center gap-2
                     relative overflow-hidden mb-3"
          style={{
            background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
            color: C.darkCorner,
            boxShadow: `0 0 0 1px rgba(0,191,255,0.30), 0 6px 20px rgba(0,191,255,0.22)`,
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 0 0 1px rgba(0,191,255,0.45), 0 10px 28px rgba(0,191,255,0.30)`,
          }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Shimmer sweep */}
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.24) 50%, transparent 65%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          />
          <span className="relative z-10 flex items-center gap-2">
            Save my projection
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </span>
        </motion.button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="text-sm transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={(e) => (e.target.style.color = 'rgba(255,255,255,0.65)')}
          onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.35)')}
        >
          Maybe later
        </button>
      </div>
    </motion.div>
  );
}

export default ResultGate;