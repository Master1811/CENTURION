// Card component following 100Cr Engine design system
// Uses premium gradient system with luxury aesthetics

import React from 'react';
import { cn } from '@/lib/utils';

export const CenturionCard = React.forwardRef(({ 
  className, 
  hover = false,
  variant = 'default', // default | premium | glass | dark
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: [
      'bg-white',
      'border border-[rgba(0,0,0,0.06)]',
      'shadow-[var(--shadow-card)]',
    ],
    premium: [
      'bg-gradient-to-br from-white via-[#FEFEFE] to-[#F8F9FC]',
      'border border-[rgba(212,184,150,0.2)]',
      'shadow-[var(--shadow-premium)]',
      // Subtle gold shimmer on hover
      'after:content-[\'\'] after:absolute after:inset-0 after:rounded-[inherit]',
      'after:bg-gradient-to-r after:from-transparent after:via-[rgba(212,184,150,0.1)] after:to-transparent',
      'after:opacity-0 after:transition-opacity after:duration-500',
      'hover:after:opacity-100',
    ],
    glass: [
      'bg-gradient-to-br from-white/90 via-white/80 to-white/70',
      'border border-white/60',
      'shadow-[var(--shadow-card)]',
      'backdrop-blur-xl',
    ],
    dark: [
      'bg-gradient-to-br from-[#09090B] via-[#18181B] to-[#27272A]',
      'border border-[rgba(255,255,255,0.1)]',
      'shadow-[var(--shadow-premium)]',
    ],
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        // Base gradient overlay
        'before:content-[\'\'] before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-gradient-to-b before:from-[rgba(255,255,255,0.8)] before:to-transparent',
        'before:opacity-50 before:pointer-events-none before:z-0',
        variants[variant],
        hover && [
          'transition-all duration-300 ease-[var(--ease-luxury)]',
          'hover:border-[rgba(0,0,0,0.12)]',
          'hover:shadow-[var(--shadow-card-hover)]',
          'hover:-translate-y-1',
        ],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CenturionCard.displayName = 'CenturionCard';

export const CenturionCardContent = React.forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative z-10 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CenturionCardContent.displayName = 'CenturionCardContent';

export default CenturionCard;
