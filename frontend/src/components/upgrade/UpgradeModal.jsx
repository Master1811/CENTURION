// UpgradeModal - Shown when rate limits are hit or premium features accessed
// ==========================================================================

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Zap, 
  Lock, 
  TrendingUp, 
  Sparkles, 
  CheckCircle, 
  ArrowRight,
  Crown,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Different upgrade triggers
const UPGRADE_REASONS = {
  RATE_LIMIT: {
    icon: Zap,
    title: "You've hit your limit",
    subtitle: "Upgrade to continue using this feature",
    description: "Free tier allows limited usage. Upgrade for unlimited access.",
    color: 'amber',
  },
  PREMIUM_FEATURE: {
    icon: Lock,
    title: "Premium Feature",
    subtitle: "Unlock this with a paid plan",
    description: "This feature is available on the Founder plan and above.",
    color: 'violet',
  },
  AI_BUDGET: {
    icon: Sparkles,
    title: "AI Credits Exhausted",
    subtitle: "Your monthly AI budget has been used",
    description: "Upgrade for more AI-powered insights and reports.",
    color: 'blue',
  },
  CONNECTOR_LIMIT: {
    icon: TrendingUp,
    title: "Connector Limit Reached",
    subtitle: "Connect more payment providers",
    description: "Free tier allows 1 connector. Upgrade for unlimited.",
    color: 'emerald',
  },
};

const PLAN_FEATURES = [
  { text: 'Unlimited projections', free: '3/month', pro: true },
  { text: 'AI Growth Coach', free: 'Basic', pro: 'Full access' },
  { text: 'Board report generation', free: false, pro: '2/month' },
  { text: 'Payment connectors', free: '1', pro: 'Unlimited' },
  { text: 'Benchmark comparisons', free: 'Limited', pro: 'Full' },
  { text: 'Priority support', free: false, pro: true },
];

export const UpgradeModal = ({ 
  isOpen, 
  onClose, 
  reason = 'PREMIUM_FEATURE',
  featureName = null,
  currentUsage = null,
  limit = null,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const reasonData = UPGRADE_REASONS[reason] || UPGRADE_REASONS.PREMIUM_FEATURE;
  const ReasonIcon = reasonData.icon;
  
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-600',
    violet: 'bg-violet-100 text-violet-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  const handleUpgrade = () => {
    setLoading(true);
    // Navigate to pricing page
    navigate('/pricing');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#F4F4F5] transition-colors z-10"
          >
            <X className="w-5 h-5 text-[#71717A]" strokeWidth={1.5} />
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
              colorClasses[reasonData.color]
            )}>
              <ReasonIcon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold text-[#09090B] mb-2">
              {reasonData.title}
            </h2>
            
            <p className="text-[#52525B] mb-1">
              {reasonData.subtitle}
            </p>
            
            {/* Usage indicator */}
            {currentUsage !== null && limit !== null && (
              <div className="mt-4 p-3 rounded-xl bg-[#F4F4F5]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#52525B]">
                    {featureName || 'Usage'}
                  </span>
                  <span className="text-sm font-mono font-medium text-[#09090B]">
                    {currentUsage} / {limit}
                  </span>
                </div>
                <div className="h-2 bg-[#E4E4E7] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Plan comparison */}
          <div className="p-6">
            <div className="rounded-xl border border-[rgba(0,0,0,0.06)] overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-3 bg-[#F9FAFB] border-b border-[rgba(0,0,0,0.06)]">
                <div className="p-3 text-sm font-medium text-[#71717A]">Feature</div>
                <div className="p-3 text-sm font-medium text-[#71717A] text-center">Free</div>
                <div className="p-3 text-sm font-medium text-[#09090B] text-center flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
                  Founder
                </div>
              </div>
              
              {/* Feature rows */}
              {PLAN_FEATURES.map((feature, i) => (
                <div 
                  key={i}
                  className={cn(
                    'grid grid-cols-3',
                    i < PLAN_FEATURES.length - 1 && 'border-b border-[rgba(0,0,0,0.06)]'
                  )}
                >
                  <div className="p-3 text-sm text-[#52525B]">{feature.text}</div>
                  <div className="p-3 text-center">
                    {feature.free === false ? (
                      <X className="w-4 h-4 text-[#D4D4D8] mx-auto" strokeWidth={1.5} />
                    ) : feature.free === true ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={1.5} />
                    ) : (
                      <span className="text-sm text-[#71717A]">{feature.free}</span>
                    )}
                  </div>
                  <div className="p-3 text-center bg-emerald-50/50">
                    {feature.pro === true ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" strokeWidth={1.5} />
                    ) : (
                      <span className="text-sm font-medium text-emerald-700">{feature.pro}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 pt-0">
            <motion.button
              onClick={handleUpgrade}
              disabled={loading}
              className={cn(
                'w-full h-14 rounded-xl',
                'bg-gradient-to-r from-[#09090B] to-[#18181B]',
                'text-white font-medium',
                'flex items-center justify-center gap-2',
                'hover:from-[#18181B] hover:to-[#27272A]',
                'transition-all duration-200',
                'shadow-[0_4px_12px_rgba(0,0,0,0.15)]',
                'disabled:opacity-50'
              )}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Rocket className="w-5 h-5" strokeWidth={1.5} />
              Upgrade to Founder Plan — ₹899/year
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </motion.button>
            
            <p className="text-center text-xs text-[#A1A1AA] mt-3">
              7-day free trial • Cancel anytime • No credit card required
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for managing upgrade modal state
export const useUpgradeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});

  const showUpgradeModal = useCallback((props = {}) => {
    setModalProps(props);
    setIsOpen(true);
  }, []);

  const hideUpgradeModal = useCallback(() => {
    setIsOpen(false);
    setModalProps({});
  }, []);

  return {
    isOpen,
    modalProps,
    showUpgradeModal,
    hideUpgradeModal,
  };
};

export default UpgradeModal;
