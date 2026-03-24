import { cn } from '@/lib/utils';
import { forwardRef, type HTMLAttributes } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// CENTURION CARD
// ═══════════════════════════════════════════════════════════════════════════

interface CenturionCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'glass' | 'outline';
  hover?: boolean;
}

export const CenturionCard = forwardRef<HTMLDivElement, CenturionCardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'centurion-card',
      dark: 'centurion-card-dark',
      glass: 'centurion-glass rounded-xl',
      outline: 'rounded-xl border border-white/10 bg-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CenturionCard.displayName = 'CenturionCard';

// ═══════════════════════════════════════════════════════════════════════════
// CARD CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export const CenturionCardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CenturionCardHeader.displayName = 'CenturionCardHeader';

export const CenturionCardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-white leading-none tracking-tight', className)}
    {...props}
  />
));
CenturionCardTitle.displayName = 'CenturionCardTitle';

export const CenturionCardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-white/60', className)}
    {...props}
  />
));
CenturionCardDescription.displayName = 'CenturionCardDescription';

export const CenturionCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CenturionCardContent.displayName = 'CenturionCardContent';

export const CenturionCardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CenturionCardFooter.displayName = 'CenturionCardFooter';

