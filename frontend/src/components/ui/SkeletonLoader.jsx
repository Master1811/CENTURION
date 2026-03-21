// SkeletonLoader - Premium skeleton loading states
// Mimics the final UI layout for better perceived performance

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton - Base skeleton element with shimmer animation
 */
export const Skeleton = ({ 
  className, 
  variant = 'default',
  ...props 
}) => (
  <div
    className={cn(
      'ds-skeleton',
      variant === 'rounded' && 'rounded-full',
      variant === 'text' && 'h-4 rounded',
      variant === 'title' && 'h-6 rounded',
      variant === 'avatar' && 'w-10 h-10 rounded-full',
      variant === 'button' && 'h-11 rounded-[var(--ds-radius-lg)]',
      variant === 'card' && 'rounded-[var(--ds-radius-xl)]',
      className
    )}
    {...props}
  />
);

/**
 * SkeletonCard - Card-shaped skeleton for loading states
 */
export const SkeletonCard = ({ className, ...props }) => (
  <div 
    className={cn(
      'bg-[var(--ds-bg-secondary)] border border-[var(--ds-border-light)] rounded-[var(--ds-radius-xl)] p-6',
      className
    )}
    {...props}
  >
    <div className="space-y-4">
      <Skeleton variant="title" className="w-2/3" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-4/5" />
      <div className="pt-2">
        <Skeleton variant="button" className="w-32" />
      </div>
    </div>
  </div>
);

/**
 * SkeletonStatCard - Stat card skeleton
 */
export const SkeletonStatCard = ({ className, ...props }) => (
  <div 
    className={cn(
      'bg-[var(--ds-bg-secondary)] border border-[var(--ds-border-light)] rounded-[var(--ds-radius-xl)] p-5',
      className
    )}
    {...props}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
    </div>
  </div>
);

/**
 * SkeletonTable - Table loading skeleton
 */
export const SkeletonTable = ({ rows = 5, columns = 4, className, ...props }) => (
  <div 
    className={cn(
      'bg-[var(--ds-bg-secondary)] border border-[var(--ds-border-light)] rounded-[var(--ds-radius-xl)] overflow-hidden',
      className
    )}
    {...props}
  >
    {/* Header */}
    <div className="grid gap-4 p-4 border-b border-[var(--ds-border-light)] bg-[var(--ds-bg-tertiary)]" 
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={rowIndex}
        className="grid gap-4 p-4 border-b border-[var(--ds-border-light)] last:border-b-0"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className="h-4" 
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * SkeletonChart - Chart area skeleton
 */
export const SkeletonChart = ({ className, ...props }) => (
  <div 
    className={cn(
      'bg-[var(--ds-bg-secondary)] border border-[var(--ds-border-light)] rounded-[var(--ds-radius-xl)] p-6',
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between mb-6">
      <Skeleton variant="title" className="w-40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
    
    {/* Chart area */}
    <div className="relative h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-10" />
        ))}
      </div>
      
      {/* Chart body */}
      <div className="ml-14 h-full flex items-end gap-2 pb-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton 
              className="w-full rounded-t-sm" 
              style={{ height: `${20 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
      
      {/* X-axis labels */}
      <div className="absolute bottom-0 left-14 right-0 flex justify-between">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-12" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * SkeletonList - List items skeleton
 */
export const SkeletonList = ({ items = 3, className, ...props }) => (
  <div className={cn('space-y-3', className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div 
        key={i}
        className="flex items-center gap-4 p-4 bg-[var(--ds-bg-secondary)] border border-[var(--ds-border-light)] rounded-[var(--ds-radius-lg)]"
      >
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-1/2" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

/**
 * SkeletonPage - Full page loading skeleton
 */
export const SkeletonPage = ({ className, ...props }) => (
  <div className={cn('space-y-8 p-6', className)} {...props}>
    {/* Header */}
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard />
    </div>
    
    {/* Chart */}
    <SkeletonChart />
    
    {/* Table */}
    <SkeletonTable rows={3} columns={4} />
  </div>
);

export default Skeleton;
