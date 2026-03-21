// ContextualHelp - Inline help triggers and smart nudges
// Provides contextual assistance based on user state and page

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ChevronRight, Sparkles, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan: '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan: '#0099CC',
};

// ─── Smart Nudge Component ─────────────────────────────────────────────────────
// Shows contextual tips based on user behavior
export const SmartNudge = ({ 
  id,
  title, 
  message, 
  action,
  actionLabel = 'Learn more',
  variant = 'tip', // 'tip' | 'suggestion' | 'achievement'
  dismissable = true,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`centurion_nudge_${id}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`centurion_nudge_${id}`, 'true');
    onDismiss?.();
  };

  if (isDismissed) return null;

  const variants = {
    tip: {
      bg: 'rgba(0,191,255,0.08)',
      border: 'rgba(0,191,255,0.20)',
      icon: Lightbulb,
      iconColor: C.brightCyan,
      iconBg: 'rgba(0,191,255,0.12)',
    },
    suggestion: {
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.20)',
      icon: Sparkles,
      iconColor: '#8B5CF6',
      iconBg: 'rgba(139,92,246,0.12)',
    },
    achievement: {
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.20)',
      icon: Sparkles,
      iconColor: '#22C55E',
      iconBg: 'rgba(34,197,94,0.12)',
    },
  };

  const v = variants[variant];
  const Icon = v.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: v.iconBg, border: `1px solid ${v.border}` }}
        >
          <Icon className="w-4 h-4" style={{ color: v.iconColor }} strokeWidth={1.5} />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-medium text-white mb-0.5">{title}</p>
          )}
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
            {message}
          </p>
          {action && (
            <motion.button
              onClick={action}
              className="mt-2 flex items-center gap-1 text-xs font-medium"
              style={{ color: v.iconColor }}
              whileHover={{ x: 2 }}
            >
              {actionLabel}
              <ChevronRight className="w-3 h-3" strokeWidth={2} />
            </motion.button>
          )}
        </div>
        
        {dismissable && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Inline Tooltip Component ─────────────────────────────────────────────────
// Small info icon with hover tooltip
export const InlineHelp = ({ content, size = 'sm' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
      >
        <HelpCircle 
          className={cn(sizes[size])} 
          style={{ color: 'rgba(255,255,255,0.40)' }} 
          strokeWidth={1.5} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 rounded-lg text-xs"
            style={{
              background: 'rgba(10,15,25,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              color: 'rgba(255,255,255,0.70)',
            }}
          >
            {content}
            {/* Arrow */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 rotate-45"
              style={{
                background: 'rgba(10,15,25,0.95)',
                borderRight: '1px solid rgba(255,255,255,0.12)',
                borderBottom: '1px solid rgba(255,255,255,0.12)',
                marginTop: '-4px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Feature Highlight Banner ─────────────────────────────────────────────────
// Highlights new features or important notices
export const FeatureHighlight = ({
  id,
  title,
  description,
  badge = 'New',
  action,
  actionLabel = 'Try it now',
  variant = 'cyan', // 'cyan' | 'purple' | 'amber'
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`centurion_highlight_${id}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`centurion_highlight_${id}`, 'true');
  };

  if (isDismissed) return null;

  const colors = {
    cyan: { primary: C.brightCyan, bg: 'rgba(0,191,255,0.08)', border: 'rgba(0,191,255,0.20)' },
    purple: { primary: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.20)' },
    amber: { primary: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.20)' },
  };

  const c = colors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl overflow-hidden mb-4"
      style={{
        background: `linear-gradient(135deg, ${c.bg} 0%, rgba(5,10,16,0.95) 100%)`,
        border: `1px solid ${c.border}`,
      }}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span 
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            style={{ 
              background: `${c.primary}20`,
              color: c.primary,
              border: `1px solid ${c.primary}40`,
            }}
          >
            {badge}
          </span>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {action && (
            <motion.button
              onClick={action}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: `${c.primary}15`,
                border: `1px solid ${c.primary}30`,
                color: c.primary,
              }}
              whileHover={{ scale: 1.02, background: `${c.primary}25` }}
              whileTap={{ scale: 0.98 }}
            >
              {actionLabel}
            </motion.button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Empty State Helper ─────────────────────────────────────────────────────
// Shows helpful guidance when no data exists
export const EmptyStateHelper = ({
  icon: Icon = Info,
  title,
  description,
  action,
  actionLabel,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div 
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ 
        background: 'rgba(0,191,255,0.10)',
        border: '1px solid rgba(0,191,255,0.20)',
      }}
    >
      <Icon className="w-7 h-7" style={{ color: C.brightCyan }} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm max-w-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
      {description}
    </p>
    {action && (
      <motion.button
        onClick={action}
        className="px-4 py-2 rounded-xl text-sm font-medium"
        style={{
          background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 100%)`,
          color: '#050A10',
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {actionLabel}
      </motion.button>
    )}
  </div>
);

export default { SmartNudge, InlineHelp, FeatureHighlight, EmptyStateHelper };
