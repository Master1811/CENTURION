// OnboardingTour - Animated walkthrough for first-time users
// ===========================================================
// Features: Step-by-step tour, animated tooltips, progress tracking

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Check,
  Target,
  TrendingUp,
  Settings,
  Zap,
  BarChart3,
  FileText,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Tour step definitions
const TOUR_STEPS = {
  dashboard: [
    {
      id: 'welcome',
      target: null,
      title: 'Welcome to 100Cr Engine',
      description: 'Let\'s take a quick tour to help you get the most out of your founder dashboard.',
      icon: Sparkles,
      position: 'center',
      highlight: false,
    },
    {
      id: 'health-score',
      target: '[data-tour="health-score"]',
      title: 'Your Health Score',
      description: 'This score (0-100) shows how your startup is performing across growth, retention, runway, and check-ins. Aim for 70+!',
      icon: Target,
      position: 'right',
      highlight: true,
    },
    {
      id: 'metrics',
      target: '[data-tour="metrics"]',
      title: 'Key Metrics at a Glance',
      description: 'Track your MRR, growth rate, and check-in streak. These update automatically when you log your monthly revenue.',
      icon: TrendingUp,
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'action-queue',
      target: '[data-tour="action-queue"]',
      title: 'Action Queue',
      description: 'AI-powered recommendations for what to focus on next. Complete actions to improve your Health Score.',
      icon: Zap,
      position: 'left',
      highlight: true,
    },
    {
      id: 'checkin',
      target: '[data-testid="checkin-button"]',
      title: 'Monthly Check-in',
      description: 'Log your actual revenue each month. This keeps your projections accurate and unlocks AI insights.',
      icon: Check,
      position: 'bottom',
      highlight: true,
    },
  ],
  settings: [
    {
      id: 'settings-intro',
      target: null,
      title: 'Settings Overview',
      description: 'Manage your account, subscription, and get help all in one place.',
      icon: Settings,
      position: 'center',
      highlight: false,
    },
    {
      id: 'profile-tab',
      target: '[value="profile"]',
      title: 'Profile Settings',
      description: 'Update your personal and company information. This helps personalize your insights.',
      icon: Settings,
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'billing-tab',
      target: '[value="billing"]',
      title: 'Billing & Subscription',
      description: 'View your plan, track usage, manage payments, and download invoices.',
      icon: FileText,
      position: 'bottom',
      highlight: true,
    },
    {
      id: 'support-tab',
      target: '[value="support"]',
      title: 'Support & Help',
      description: 'Find answers in FAQs, access documentation, or contact our support team.',
      icon: Bell,
      position: 'bottom',
      highlight: true,
    },
  ],
};

// Tooltip positioning logic
const getTooltipPosition = (targetRect, position, tooltipSize) => {
  if (!targetRect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  const offset = 16;
  const positions = {
    top: {
      top: targetRect.top - tooltipSize.height - offset,
      left: targetRect.left + targetRect.width / 2 - tooltipSize.width / 2,
    },
    bottom: {
      top: targetRect.bottom + offset,
      left: targetRect.left + targetRect.width / 2 - tooltipSize.width / 2,
    },
    left: {
      top: targetRect.top + targetRect.height / 2 - tooltipSize.height / 2,
      left: targetRect.left - tooltipSize.width - offset,
    },
    right: {
      top: targetRect.top + targetRect.height / 2 - tooltipSize.height / 2,
      left: targetRect.right + offset,
    },
    center: {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  return positions[position] || positions.center;
};

// Tooltip arrow component
const TooltipArrow = ({ position }) => {
  const arrowClasses = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-transparent border-r-transparent border-b-transparent border-t-white',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-transparent border-r-transparent border-t-transparent border-b-white',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-transparent border-b-transparent border-r-transparent border-l-white',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-transparent border-b-transparent border-l-transparent border-r-white',
  };

  if (position === 'center') return null;

  return (
    <div 
      className={cn(
        'absolute w-0 h-0 border-8 border-solid',
        arrowClasses[position]
      )}
    />
  );
};

// Tour Tooltip Component
const TourTooltip = ({ 
  step, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onClose, 
  onComplete 
}) => {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: '50%', left: '50%' });
  const [targetRect, setTargetRect] = useState(null);
  const Icon = step.icon;

  useEffect(() => {
    if (!step.target || step.position === 'center') {
      setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }

    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setTargetRect(rect);

      // Add highlight class
      if (step.highlight) {
        targetEl.classList.add('tour-spotlight');
      }

      const tooltipSize = tooltipRef.current 
        ? { width: tooltipRef.current.offsetWidth, height: tooltipRef.current.offsetHeight }
        : { width: 320, height: 200 };

      setPosition(getTooltipPosition(rect, step.position, tooltipSize));
    }

    return () => {
      if (step.target && step.highlight) {
        const el = document.querySelector(step.target);
        if (el) el.classList.remove('tour-spotlight');
      }
    };
  }, [step]);

  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;

  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed z-[100] w-[340px]',
        'rounded-2xl overflow-hidden',
        'bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)]',
        'border border-[rgba(0,0,0,0.08)]'
      )}
      style={{
        top: typeof position.top === 'number' ? `${position.top}px` : position.top,
        left: typeof position.left === 'number' ? `${position.left}px` : position.left,
        transform: position.transform || 'none',
      }}
    >
      {/* Gold accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#D4B896] via-[#E8D4B8] to-[#D4B896]" />
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4F4F5] transition-colors"
      >
        <X className="w-4 h-4 text-[#71717A]" strokeWidth={1.5} />
      </button>

      {/* Content */}
      <div className="p-6">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl mb-4',
          'bg-gradient-to-br from-[#F5E6D3] to-[#E8D4B8]',
          'flex items-center justify-center'
        )}>
          <Icon className="w-6 h-6 text-[#8B6914]" strokeWidth={1.5} />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold text-[#09090B] mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-[#52525B] leading-relaxed mb-6">
          {step.description}
        </p>

        {/* Progress & Navigation */}
        <div className="flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === currentStep 
                    ? 'w-6 bg-gradient-to-r from-[#D4B896] to-[#C9A961]' 
                    : i < currentStep 
                      ? 'bg-[#D4B896]' 
                      : 'bg-[#E4E4E7]'
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="ghost"
                onClick={onPrev}
                className="h-9 px-3 text-sm text-[#71717A]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Back
              </Button>
            )}
            
            <Button
              onClick={isLast ? onComplete : onNext}
              className={cn(
                'h-9 px-4 rounded-lg text-sm font-medium',
                'bg-gradient-to-r from-[#09090B] to-[#18181B] text-white',
                'hover:from-[#18181B] hover:to-[#27272A]',
                'transition-all duration-300'
              )}
            >
              {isLast ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4 ml-1.5" strokeWidth={1.5} />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Arrow */}
      {step.position !== 'center' && <TooltipArrow position={step.position} />}
    </motion.div>
  );
};

// Main Tour Component
export const OnboardingTour = ({ 
  tourKey = 'dashboard', 
  isOpen, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = TOUR_STEPS[tourKey] || TOUR_STEPS.dashboard;

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Mark tour as completed in localStorage
    localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    setCurrentStep(0);
    onComplete?.();
  }, [tourKey, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(`tour_completed_${tourKey}`, 'true');
    setCurrentStep(0);
    onSkip?.();
  }, [tourKey, onSkip]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <TourTooltip
        step={steps[currentStep]}
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={handleSkip}
        onComplete={handleComplete}
      />
    </AnimatePresence>
  );
};

// Hook for managing tour state
export const useTour = (tourKey = 'dashboard') => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if tour has been completed
    const completed = localStorage.getItem(`tour_completed_${tourKey}`);
    if (!completed) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [tourKey]);

  const startTour = useCallback(() => setIsOpen(true), []);
  const endTour = useCallback(() => setIsOpen(false), []);
  const resetTour = useCallback(() => {
    localStorage.removeItem(`tour_completed_${tourKey}`);
    setIsOpen(true);
  }, [tourKey]);

  return {
    isOpen,
    startTour,
    endTour,
    resetTour,
  };
};

export default OnboardingTour;
