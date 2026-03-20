/**
 * UserGuidance - Helpful tooltips and educational hints for users
 * ================================================================
 * This component provides contextual help and prevents users from getting stuck.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, X, Lightbulb, ArrowRight, 
  BookOpen, MessageCircle, Video, ExternalLink,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

/**
 * Tooltip Component
 * Provides hover-activated helpful hints
 */
export const Tooltip = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 shadow-xl max-w-xs whitespace-normal">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * HelpButton Component
 * Floating help button that opens contextual guidance
 */
export const HelpButton = ({ context = 'general', onOpenHelp }) => {
  return (
    <button
      onClick={onOpenHelp}
      className="fixed bottom-6 right-6 w-12 h-12 bg-[#B8962E] hover:bg-[#9A7B26] text-black rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-40"
      aria-label="Get Help"
      data-testid="help-button"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
};

/**
 * FeatureHint Component
 * Inline hint for explaining features
 */
export const FeatureHint = ({ title, description, icon: Icon = Lightbulb, variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-900/20 border-blue-800/50 text-blue-200',
    success: 'bg-green-900/20 border-green-800/50 text-green-200',
    warning: 'bg-yellow-900/20 border-yellow-800/50 text-yellow-200',
    tip: 'bg-[#B8962E]/10 border-[#B8962E]/30 text-[#B8962E]',
  };
  
  const iconColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    tip: 'text-[#B8962E]',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${variants[variant]}`} data-testid="feature-hint">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[variant]}`} />
        <div>
          {title && <div className="font-medium mb-1">{title}</div>}
          <div className="text-sm opacity-90">{description}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * StepByStepGuide Component
 * Shows a numbered guide for complex workflows
 */
export const StepByStepGuide = ({ steps, currentStep = 0, onStepClick }) => {
  return (
    <div className="space-y-3" data-testid="step-by-step-guide">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <button
            key={index}
            onClick={() => onStepClick?.(index)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              isCompleted 
                ? 'bg-green-900/20 border-green-800/50' 
                : isCurrent 
                  ? 'bg-[#B8962E]/20 border-[#B8962E]/50' 
                  : 'bg-zinc-800/50 border-zinc-700/50 opacity-60'
            }`}
            disabled={!onStepClick}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-[#B8962E] text-black' 
                    : 'bg-zinc-700 text-zinc-400'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
              </div>
              <div>
                <div className={`font-medium ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-sm text-zinc-400 mt-0.5">{step.description}</div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/**
 * EmptyState Component
 * Shows helpful guidance when there's no data
 */
export const EmptyState = ({ 
  icon: Icon = Info, 
  title, 
  description, 
  action,
  actionLabel,
  secondaryAction,
  secondaryLabel
}) => {
  return (
    <div className="text-center py-12 px-4" data-testid="empty-state">
      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-md mx-auto mb-6">{description}</p>
      <div className="flex items-center justify-center gap-3">
        {action && (
          <button
            onClick={action}
            className="px-4 py-2 bg-[#B8962E] hover:bg-[#9A7B26] text-black font-medium rounded-lg transition-colors"
          >
            {actionLabel}
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ErrorRecovery Component
 * Helps users recover from errors with clear guidance
 */
export const ErrorRecovery = ({ 
  error, 
  suggestions = [], 
  onRetry, 
  onDismiss,
  showSupport = true 
}) => {
  return (
    <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6" data-testid="error-recovery">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-200 mb-2">Something went wrong</h3>
          <p className="text-red-300/80 mb-4">{error}</p>
          
          {suggestions.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-red-300/60 mb-2">Try these steps:</div>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-red-200">
                    <ArrowRight className="w-4 h-4 text-red-400" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-800/50 hover:bg-red-800 text-red-200 rounded-lg transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-red-300/60 hover:text-red-200 transition-colors text-sm"
              >
                Dismiss
              </button>
            )}
            {showSupport && (
              <a
                href="mailto:support@100crengine.in"
                className="px-4 py-2 text-red-300/60 hover:text-red-200 transition-colors text-sm flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * QuickStartCard Component
 * Shows quick start options for new users
 */
export const QuickStartCard = ({ items }) => {
  return (
    <div className="bg-gradient-to-br from-[#B8962E]/20 to-transparent border border-[#B8962E]/30 rounded-xl p-6" data-testid="quick-start-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-[#B8962E]" />
        <h3 className="text-lg font-semibold text-white">Quick Start</h3>
      </div>
      <div className="grid gap-3">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={item.onClick}
            className="flex items-center gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-800/50 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 bg-zinc-800 group-hover:bg-[#B8962E]/20 rounded-lg flex items-center justify-center transition-colors">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-white group-hover:text-[#B8962E] transition-colors">
                {item.title}
              </div>
              <div className="text-sm text-zinc-400">{item.description}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-[#B8962E] group-hover:translate-x-1 transition-all" />
          </a>
        ))}
      </div>
    </div>
  );
};

/**
 * HelpPanel Component
 * Slide-out panel with comprehensive help resources
 */
export const HelpPanel = ({ isOpen, onClose, context = 'general' }) => {
  const helpContent = {
    general: {
      title: 'Help Center',
      sections: [
        {
          title: 'Getting Started',
          items: [
            { label: 'How projections work', href: '#' },
            { label: 'Understanding your dashboard', href: '#' },
            { label: 'Setting up connectors', href: '#' },
          ]
        },
        {
          title: 'FAQ',
          items: [
            { label: 'How accurate are the projections?', href: '#' },
            { label: 'What data do I need to enter?', href: '#' },
            { label: 'How do I upgrade my plan?', href: '/pricing' },
          ]
        }
      ]
    },
    dashboard: {
      title: 'Dashboard Help',
      sections: [
        {
          title: 'Modules',
          items: [
            { label: 'Revenue Intelligence', href: '#' },
            { label: 'Forecasting Engine', href: '#' },
            { label: 'AI Growth Coach', href: '#' },
          ]
        }
      ]
    }
  };
  
  const content = helpContent[context] || helpContent.general;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto"
            data-testid="help-panel"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{content.title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              
              <div className="space-y-6">
                {content.sections.map((section, sIndex) => (
                  <div key={sIndex}>
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item, iIndex) => (
                        <a
                          key={iIndex}
                          href={item.href}
                          className="flex items-center gap-2 p-3 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-200 hover:text-white"
                        >
                          <BookOpen className="w-4 h-4 text-zinc-500" />
                          {item.label}
                          <ExternalLink className="w-3 h-3 text-zinc-600 ml-auto" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                    Need More Help?
                  </h3>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@100crengine.in"
                      className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-[#B8962E]" />
                      <div>
                        <div className="font-medium text-white">Email Support</div>
                        <div className="text-sm text-zinc-400">support@100crengine.in</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default {
  Tooltip,
  HelpButton,
  FeatureHint,
  StepByStepGuide,
  EmptyState,
  ErrorRecovery,
  QuickStartCard,
  HelpPanel,
};
