// PremiumCard - Consistent card component following the design system
// Use for all content cards across the application

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * PremiumCard - Design system compliant card component
 * 
 * @param {string} variant - 'default' | 'accent' | 'flat' | 'glass' - card style
 * @param {boolean} interactive - Enable hover animations
 * @param {boolean} padding - Include default padding
 * @param {string} size - 'sm' | 'md' | 'lg' - padding size
 */
export const PremiumCard = ({
  children,
  variant = 'default',
  interactive = false,
  padding = true,
  size = 'md',
  className,
  style,
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-5 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const baseClasses = cn(
    'relative rounded-[var(--ds-radius-xl)] overflow-hidden',
    padding && paddingClasses[size],
    className
  );

  const variantStyles = {
    default: {
      background: 'var(--ds-bg-secondary)',
      border: '1px solid var(--ds-border-light)',
      boxShadow: 'var(--ds-shadow-card)',
    },
    accent: {
      background: 'var(--ds-bg-secondary)',
      border: '1px solid rgba(0, 191, 255, 0.15)',
      boxShadow: 'var(--ds-shadow-card), var(--ds-shadow-cyan-sm)',
    },
    flat: {
      background: 'var(--ds-bg-secondary)',
      border: '1px solid var(--ds-border-light)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.80)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.60)',
      boxShadow: 'var(--ds-shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
    },
  };

  const hoverStyles = {
    default: {
      boxShadow: 'var(--ds-shadow-card-hover)',
      borderColor: 'var(--ds-border-medium)',
      y: -2,
    },
    accent: {
      boxShadow: 'var(--ds-shadow-card-hover), var(--ds-shadow-cyan-md)',
      borderColor: 'rgba(0, 191, 255, 0.25)',
      y: -3,
    },
    flat: {
      borderColor: 'var(--ds-border-medium)',
    },
    glass: {
      boxShadow: 'var(--ds-shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      y: -2,
    },
  };

  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: hoverStyles[variant],
    transition: { 
      duration: 0.3, 
      ease: [0.22, 1, 0.36, 1],
    },
  } : {};

  return (
    <Component
      className={baseClasses}
      style={{ ...variantStyles[variant], ...style }}
      {...motionProps}
      {...props}
    >
      {/* Accent top shine for accent variant */}
      {variant === 'accent' && (
        <div 
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,191,255,0.40) 30%, rgba(0,191,255,0.60) 50%, rgba(0,191,255,0.40) 70%, transparent 100%)',
          }}
        />
      )}
      {children}
    </Component>
  );
};

/**
 * CardHeader - Standard card header section
 */
export const CardHeader = ({ children, className, ...props }) => (
  <div 
    className={cn('mb-4', className)} 
    {...props}
  >
    {children}
  </div>
);

/**
 * CardTitle - Card title with consistent styling
 */
export const CardTitle = ({ children, className, ...props }) => (
  <h3 
    className={cn(
      'text-lg font-semibold text-[var(--ds-text-primary)]',
      'font-[var(--ds-font-sans)]',
      className
    )} 
    {...props}
  >
    {children}
  </h3>
);

/**
 * CardDescription - Card description text
 */
export const CardDescription = ({ children, className, ...props }) => (
  <p 
    className={cn(
      'text-sm text-[var(--ds-text-tertiary)] mt-1',
      className
    )} 
    {...props}
  >
    {children}
  </p>
);

/**
 * CardContent - Main card content area
 */
export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

/**
 * CardFooter - Card footer with actions
 */
export const CardFooter = ({ children, className, ...props }) => (
  <div 
    className={cn(
      'mt-4 pt-4 border-t border-[var(--ds-border-light)] flex items-center gap-3',
      className
    )} 
    {...props}
  >
    {children}
  </div>
);

/**
 * StatCard - Compact stat display card
 */
export const StatCard = ({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  accentColor,
  className,
  ...props
}) => (
  <PremiumCard 
    variant="flat" 
    size="md" 
    className={className}
    {...props}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--ds-text-tertiary)] uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-[var(--ds-text-primary)] font-[var(--ds-font-mono)] tabular-nums truncate">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--ds-text-muted)] mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <p className={cn(
            'text-xs font-medium mt-1',
            trendDirection === 'up' && 'text-[var(--ds-success)]',
            trendDirection === 'down' && 'text-[var(--ds-error)]',
            trendDirection === 'neutral' && 'text-[var(--ds-text-tertiary)]'
          )}>
            {trendDirection === 'up' && '↑ '}
            {trendDirection === 'down' && '↓ '}
            {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: accentColor ? `${accentColor}12` : 'var(--ds-info-light)',
            border: `1px solid ${accentColor ? `${accentColor}25` : 'rgba(0,191,255,0.20)'}`,
          }}
        >
          <Icon 
            className="w-5 h-5" 
            style={{ color: accentColor || 'var(--ds-cyan-500)' }}
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  </PremiumCard>
);

export default PremiumCard;
