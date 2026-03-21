// OnboardingChecklist - Sticky onboarding progress component
// Shows new users what steps to complete to get the most from the platform

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Circle, ChevronDown, ChevronUp, X, 
  User, TrendingUp, Plug, Sparkles, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan: '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan: '#0099CC',
  tealEdge: '#006080',
};

// ─── Onboarding Steps ─────────────────────────────────────────────────────────
const onboardingSteps = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your company details',
    icon: User,
    href: '/dashboard/settings',
    checkFn: (profile) => profile?.company_name && profile?.full_name,
  },
  {
    id: 'first-projection',
    title: 'Run your first projection',
    description: 'See when you\'ll hit ₹100Cr',
    icon: TrendingUp,
    href: '/tools/100cr-calculator',
    checkFn: () => localStorage.getItem('centurion_first_projection') === 'true',
  },
  {
    id: 'connect-provider',
    title: 'Connect a payment provider',
    description: 'Auto-sync your MRR data',
    icon: Plug,
    href: '/dashboard/connectors',
    checkFn: () => false, // Would check via API
  },
  {
    id: 'first-checkin',
    title: 'Complete your first check-in',
    description: 'Log your monthly revenue',
    icon: Target,
    href: '/dashboard',
    checkFn: () => false, // Would check via API
  },
  {
    id: 'explore-coach',
    title: 'Ask the AI Coach a question',
    description: 'Get personalized insights',
    icon: Sparkles,
    href: '/dashboard/coach',
    checkFn: () => localStorage.getItem('centurion_asked_coach') === 'true',
  },
];

export const OnboardingChecklist = () => {
  const { profile, isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Check localStorage for dismissal
  useEffect(() => {
    const dismissed = localStorage.getItem('centurion_onboarding_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Check which steps are completed
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const completed = onboardingSteps
      .filter(step => step.checkFn(profile))
      .map(step => step.id);
    
    setCompletedSteps(completed);
    
    // Auto-dismiss if all steps completed
    if (completed.length === onboardingSteps.length) {
      setTimeout(() => {
        handleDismiss();
      }, 2000);
    }
  }, [profile, isAuthenticated]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('centurion_onboarding_dismissed', 'true');
  };

  const completedCount = completedSteps.length;
  const totalSteps = onboardingSteps.length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const isAllComplete = completedCount === totalSteps;

  if (isDismissed || !isAuthenticated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(0,191,255,0.08) 0%, rgba(5,10,16,0.95) 100%)',
          border: '1px solid rgba(0,191,255,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: isAllComplete ? 'rgba(34,197,94,0.15)' : `rgba(0,191,255,0.12)`,
                border: `1px solid ${isAllComplete ? 'rgba(34,197,94,0.30)' : 'rgba(0,191,255,0.25)'}`,
              }}
            >
              {isAllComplete ? (
                <CheckCircle className="w-5 h-5 text-green-400" strokeWidth={1.5} />
              ) : (
                <Sparkles className="w-5 h-5" style={{ color: C.brightCyan }} strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isAllComplete ? 'Setup Complete!' : 'Getting Started'}
              </h3>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
                {isAllComplete 
                  ? 'You\'re all set to use 100Cr Engine' 
                  : `${completedCount} of ${totalSteps} steps completed`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div 
                className="w-24 h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    background: isAllComplete 
                      ? 'linear-gradient(90deg, #22C55E, #16A34A)' 
                      : `linear-gradient(90deg, ${C.brightCyan}, ${C.midCyan})`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-mono text-white">{Math.round(progressPercent)}%</span>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
            </button>
            
            <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.40)' }} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div 
                className="px-4 pb-4 space-y-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="pt-3" />
                {onboardingSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isComplete = completedSteps.includes(step.id);
                  
                  return (
                    <motion.a
                      key={step.id}
                      href={step.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl transition-all group',
                        isComplete ? 'opacity-60' : 'hover:bg-white/5'
                      )}
                      style={{
                        background: isComplete ? 'transparent' : 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isComplete ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                          border: isComplete ? '1px solid rgba(34,197,94,0.30)' : '1px solid rgba(255,255,255,0.10)',
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4 text-green-400" strokeWidth={2} />
                        ) : (
                          <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.50)' }} strokeWidth={1.5} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium',
                          isComplete ? 'line-through text-white/50' : 'text-white'
                        )}>
                          {step.title}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.40)' }}>
                          {step.description}
                        </p>
                      </div>
                      {!isComplete && (
                        <span 
                          className="text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ 
                            background: `${C.brightCyan}15`,
                            color: C.brightCyan,
                          }}
                        >
                          Start →
                        </span>
                      )}
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OnboardingChecklist;
