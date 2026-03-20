// GlassCard Component
// ====================
// Reusable glassmorphism card component with multiple variants
// Part of the premium liquid glass design system

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * GlassCard - Premium glassmorphism card component
 *
 * @param {Object} props
 * @param {string} props.variant - Card style variant: 'default' | 'elevated' | 'liquid' | 'subtle'
 * @param {boolean} props.hover - Enable hover effects
 * @param {boolean} props.animate - Enable entrance animation
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
export const GlassCard = ({
  variant = 'default',
  hover = true,
  animate = false,
  className,
  children,
  ...props
}) => {
  const variants = {
    default: cn(
      'bg-[rgba(255,255,255,0.7)]',
      'backdrop-blur-[12px]',
      'border border-[rgba(255,255,255,0.3)]',
      'rounded-2xl',
      'shadow-[0_4px_12px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.1)]',
      hover && 'transition-all duration-300 ease-[var(--ease-glass)] hover:bg-[rgba(255,255,255,0.8)] hover:border-[rgba(255,255,255,0.45)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.15)] hover:-translate-y-0.5'
    ),
    elevated: cn(
      'bg-[rgba(255,255,255,0.82)]',
      'backdrop-blur-[20px]',
      'border border-[rgba(255,255,255,0.4)]',
      'rounded-2xl',
      'shadow-[0_8px_24px_rgba(0,0,0,0.06),0_16px_48px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.15)]',
      'relative overflow-hidden',
      hover && 'transition-all duration-300 ease-[var(--ease-glass)] hover:bg-[rgba(255,255,255,0.88)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08),0_24px_64px_rgba(0,0,0,0.06),inset_0_2px_0_rgba(255,255,255,0.2)] hover:-translate-y-1'
    ),
    liquid: cn(
      'bg-gradient-to-br from-[rgba(255,255,255,0.85)] via-[rgba(255,255,255,0.65)] to-[rgba(255,255,255,0.75)]',
      'backdrop-blur-[32px]',
      'border border-[rgba(255,255,255,0.35)]',
      'rounded-3xl',
      'shadow-[0_12px_40px_rgba(0,0,0,0.08),0_24px_64px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.4)]',
      'relative overflow-hidden',
      hover && 'transition-all duration-300 ease-[var(--ease-glass)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1),0_32px_80px_rgba(0,0,0,0.08)]'
    ),
    subtle: cn(
      'bg-[rgba(255,255,255,0.5)]',
      'backdrop-blur-[8px]',
      'border border-[rgba(255,255,255,0.2)]',
      'rounded-xl',
      'shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]',
      hover && 'transition-all duration-200 ease-[var(--ease-glass)] hover:bg-[rgba(255,255,255,0.65)] hover:border-[rgba(255,255,255,0.3)]'
    ),
    dark: cn(
      'bg-[rgba(9,9,11,0.8)]',
      'backdrop-blur-[20px]',
      'border border-[rgba(255,255,255,0.08)]',
      'rounded-2xl',
      'shadow-[0_8px_24px_rgba(0,0,0,0.2),0_16px_48px_rgba(0,0,0,0.15)]',
      hover && 'transition-all duration-300 ease-[var(--ease-glass)] hover:bg-[rgba(9,9,11,0.85)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-0.5'
    ),
  };

  const Component = animate ? motion.div : 'div';
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      }
    : {};

  return (
    <Component
      className={cn(variants[variant], className)}
      {...animationProps}
      {...props}
    >
      {/* Top shine effect for elevated and liquid variants */}
      {(variant === 'elevated' || variant === 'liquid') && (
        <div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Liquid refraction overlay */}
      {variant === 'liquid' && (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/4 to-black/2 pointer-events-none rounded-inherit"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-inherit"
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </Component>
  );
};

/**
 * GlassPanel - Full-width glass panel for sections
 */
export const GlassPanel = ({ className, children, ...props }) => (
  <div
    className={cn(
      'bg-[rgba(255,255,255,0.85)]',
      'backdrop-blur-[20px] saturate-[180%]',
      'border-b border-[rgba(255,255,255,0.3)]',
      'shadow-[0_1px_0_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.04)]',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * GlassOverlay - Modal/overlay glass background
 */
export const GlassOverlay = ({ className, onClick, children, ...props }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className={cn(
      'fixed inset-0 z-50',
      'bg-[rgba(9,9,11,0.4)]',
      'backdrop-blur-[4px]',
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </motion.div>
);

export default GlassCard;

