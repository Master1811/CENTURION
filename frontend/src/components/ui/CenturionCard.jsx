// Card component following 100Cr Engine design system
// Uses three-layer depth system from tokens.css

import React from 'react';
import { cn } from '@/lib/utils';

export const CenturionCard = React.forwardRef(({ 
  className, 
  hover = false,
  children, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white',
        'border border-[rgba(0,0,0,0.06)]',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.04)]',
        // Gradient overlay pseudo-element effect via CSS
        'before:content-[\'\'] before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-gradient-to-b before:from-[rgba(0,0,0,0.01)] before:to-transparent',
        'before:pointer-events-none',
        hover && [
          'transition-all duration-200',
          'hover:bg-[#E8E8E9]',
          'hover:border-[rgba(0,0,0,0.12)]',
          'hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)]',
          'hover:-translate-y-0.5',
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
