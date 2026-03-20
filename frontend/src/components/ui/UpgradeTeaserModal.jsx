// Upgrade Teaser Modal Component
// ================================
// Shows premium feature previews when users hit free limits
// or at timed intervals to create upgrade intent

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, TrendingUp, Sparkles, FileText, Target, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const TEASER_FEATURES = [
  {
    icon: TrendingUp,
    title: 'Revenue Intelligence',
    description: 'Track actual vs projected revenue with AI-powered insights',
    image: '/assets/teasers/revenue_intelligence.png',
  },
  {
    icon: Sparkles,
    title: 'AI Growth Coach',
    description: 'Get personalized coaching from Claude, trained on Indian SaaS',
    image: '/assets/teasers/ai_coach.png',
  },
  {
    icon: FileText,
    title: 'Board Reports',
    description: 'Auto-generated monthly reports for your investors',
    image: '/assets/teasers/board_report.png',
  },
  {
    icon: Target,
    title: 'Benchmark Intelligence',
    description: 'See how you rank against 500+ Indian founders',
    image: '/assets/teasers/benchmarks.png',
  },
];

export const UpgradeTeaserModal = ({ 
  isOpen, 
  onClose, 
  trigger = 'limit', // 'limit' | 'timed' | 'feature'
  featureIndex = 0 
}) => {
  if (!isOpen) return null;

  const feature = TEASER_FEATURES[featureIndex % TEASER_FEATURES.length];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', damping: 25 }}
          className="w-full max-w-lg glass-modal overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative h-48 bg-gradient-to-br from-[#09090B] to-[#27272A] p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-xl glass-button-dark transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" strokeWidth={1.5} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
              <span className="text-amber-400 text-sm font-medium">FOUNDER PLAN</span>
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              {trigger === 'limit' 
                ? "You've hit the free limit" 
                : "Unlock Premium Features"}
            </h2>
            <p className="text-white/70 text-sm">
              Upgrade to get unlimited access to all features
            </p>
            
            {/* Floating card preview */}
            <div className="absolute -bottom-12 left-6 right-6 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#F4F4F5]">
                  <feature.icon className="w-6 h-6 text-[#09090B]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-[#09090B] mb-1">{feature.title}</h3>
                  <p className="text-sm text-[#71717A]">{feature.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 px-6 pb-6">
            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {TEASER_FEATURES.map((feat, i) => (
                <div 
                  key={i}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border',
                    i === featureIndex % TEASER_FEATURES.length
                      ? 'border-[#09090B] bg-[#F4F4F5]'
                      : 'border-[rgba(0,0,0,0.08)]'
                  )}
                >
                  <feat.icon className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                  <span className="text-sm text-[#09090B]">{feat.title}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-4xl font-bold text-[#09090B]">₹899</span>
                <span className="text-[#71717A]">/year</span>
              </div>
              <p className="text-sm text-[#A1A1AA]">
                That's just ₹75/month • Cancel anytime
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => window.location.href = '/pricing'}
              className={cn(
                'w-full h-12 rounded-xl',
                'bg-[#09090B] text-white font-medium',
                'flex items-center justify-center gap-2',
                'hover:bg-[#18181B] transition-colors'
              )}
            >
              <Zap className="w-4 h-4" strokeWidth={1.5} />
              Upgrade to Founder Plan
            </button>
            
            <p className="text-center text-xs text-[#A1A1AA] mt-4">
              7-day money-back guarantee • Secure payment via Razorpay
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to show teaser at intervals
export const useUpgradeTeaser = (intervalMinutes = 10) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [featureIndex, setFeatureIndex] = React.useState(0);

  React.useEffect(() => {
    // Don't show for paid users
    const isPaid = localStorage.getItem('subscription_status') === 'active';
    if (isPaid) return;

    // Check last shown time
    const lastShown = localStorage.getItem('teaser_last_shown');
    const now = Date.now();
    
    if (lastShown && now - parseInt(lastShown) < intervalMinutes * 60 * 1000) {
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem('teaser_last_shown', now.toString());
      setFeatureIndex(prev => prev + 1);
    }, intervalMinutes * 60 * 1000);

    return () => clearTimeout(timer);
  }, [intervalMinutes]);

  return {
    isOpen,
    featureIndex,
    openTeaser: () => setIsOpen(true),
    closeTeaser: () => setIsOpen(false),
  };
};

// Quick teaser for hitting limits
export const LimitReachedTeaser = ({ onClose }) => (
  <UpgradeTeaserModal 
    isOpen={true} 
    onClose={onClose} 
    trigger="limit" 
  />
);

export default UpgradeTeaserModal;
