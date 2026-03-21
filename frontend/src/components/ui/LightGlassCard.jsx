// LightGlassCard - Premium card component for light mode pages
// Carries brand DNA (cyan accents, subtle gradients, glass effects) into light theme

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const C = {
  cyan500: '#00BFFF',
  cyan600: '#0099CC',
  cyan700: '#007399',
};

/**
 * LightGlassCard - Premium glass card for light mode
 * 
 * @param {string} variant - 'default' | 'accent' | 'elevated' | 'subtle'
 * @param {boolean} hover - Enable hover effects
 * @param {string} accentColor - Custom accent color (defaults to cyan)
 */
export const LightGlassCard = ({
  children,
  variant = 'default',
  hover = false,
  accentColor = C.cyan500,
  className,
  style,
  ...props
}) => {
  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      boxShadow: `
        0 1px 2px rgba(0, 0, 0, 0.03),
        0 4px 12px rgba(0, 0, 0, 0.04),
        0 12px 32px rgba(0, 0, 0, 0.04)
      `,
    },
    accent: {
      background: 'rgba(255, 255, 255, 0.90)',
      border: `1px solid ${accentColor}20`,
      boxShadow: `
        0 1px 2px rgba(0, 0, 0, 0.03),
        0 4px 12px rgba(0, 0, 0, 0.04),
        0 12px 32px rgba(0, 0, 0, 0.04),
        0 0 0 1px ${accentColor}08,
        0 0 24px ${accentColor}08
      `,
    },
    elevated: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(0, 0, 0, 0.04)',
      boxShadow: `
        0 2px 4px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.06),
        0 24px 48px rgba(0, 0, 0, 0.06)
      `,
    },
    subtle: {
      background: 'rgba(255, 255, 255, 0.60)',
      border: '1px solid rgba(0, 0, 0, 0.04)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
    },
  };

  const hoverStyles = hover ? {
    whileHover: {
      y: -3,
      boxShadow: variant === 'accent' 
        ? `0 4px 8px rgba(0, 0, 0, 0.05), 0 16px 40px rgba(0, 0, 0, 0.08), 0 0 32px ${accentColor}15`
        : '0 4px 8px rgba(0, 0, 0, 0.05), 0 16px 40px rgba(0, 0, 0, 0.08)',
    },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  } : {};

  const Component = hover ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'backdrop-blur-xl',
        className
      )}
      style={{
        ...variants[variant],
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        ...style,
      }}
      {...hoverStyles}
      {...props}
    >
      {/* Top highlight line for accent variant */}
      {variant === 'accent' && (
        <div 
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${accentColor}50 30%, ${accentColor}70 50%, ${accentColor}50 70%, transparent 100%)`,
          }}
        />
      )}
      
      {/* Inner content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

/**
 * LightStatCard - Stat display card for light mode
 */
export const LightStatCard = ({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  accentColor = C.cyan500,
  className,
  ...props
}) => (
  <LightGlassCard 
    variant="default"
    hover
    className={cn('p-5', className)}
    {...props}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p 
          className="text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: '#71717A', letterSpacing: '0.08em' }}
        >
          {label}
        </p>
        <p 
          className="text-2xl font-bold tabular-nums tracking-tight truncate"
          style={{ 
            color: '#09090B',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>
            {subtitle}
          </p>
        )}
        {trend && (
          <p className={cn(
            'text-xs font-medium mt-1.5',
            trendDirection === 'up' && 'text-[#22C55E]',
            trendDirection === 'down' && 'text-[#EF4444]',
            trendDirection === 'neutral' && 'text-[#71717A]'
          )}>
            {trendDirection === 'up' && '↑ '}
            {trendDirection === 'down' && '↓ '}
            {trend}
          </p>
        )}
      </div>
      {Icon && (
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}20`,
          }}
        >
          <Icon 
            className="w-5 h-5" 
            style={{ color: accentColor }}
            strokeWidth={1.5}
          />
        </div>
      )}
    </div>
  </LightGlassCard>
);

/**
 * LightResultCard - Large result display card (e.g., projection date)
 */
export const LightResultCard = ({
  eyebrow,
  value,
  subtitle,
  stats,
  accentColor = C.cyan500,
  className,
  children,
  ...props
}) => (
  <LightGlassCard 
    variant="accent"
    accentColor={accentColor}
    className={cn('p-6 md:p-8', className)}
    {...props}
  >
    {eyebrow && (
      <p 
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: accentColor, letterSpacing: '0.14em' }}
      >
        {eyebrow}
      </p>
    )}
    
    {value && (
      <h2 
        className="text-4xl md:text-5xl font-bold tracking-tight mb-2"
        style={{ 
          color: '#09090B',
          fontFamily: "'Georgia', 'Times New Roman', serif",
        }}
      >
        {value}
      </h2>
    )}
    
    {subtitle && (
      <p className="text-sm mb-6" style={{ color: '#71717A' }}>
        {subtitle}
      </p>
    )}
    
    {stats && stats.length > 0 && (
      <div className="flex items-center gap-6 flex-wrap">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {stat.icon && (
              <stat.icon 
                className="w-4 h-4" 
                style={{ color: '#A1A1AA' }}
                strokeWidth={1.5}
              />
            )}
            <span 
              className="text-sm font-mono tabular-nums"
              style={{ color: '#52525B' }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    )}
    
    {children}
  </LightGlassCard>
);

/**
 * LightSectionCard - Section container with subtle background
 */
export const LightSectionCard = ({
  title,
  subtitle,
  icon: Icon,
  accentColor = C.cyan500,
  children,
  className,
  ...props
}) => (
  <LightGlassCard 
    variant="subtle"
    className={cn('p-5 md:p-6', className)}
    {...props}
  >
    {(title || Icon) && (
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}18`,
            }}
          >
            <Icon 
              className="w-4 h-4" 
              style={{ color: accentColor }}
              strokeWidth={1.5}
            />
          </div>
        )}
        <div>
          {title && (
            <h3 
              className="text-sm font-semibold"
              style={{ color: '#09090B' }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs" style={{ color: '#A1A1AA' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )}
    {children}
  </LightSectionCard>
);

export default LightGlassCard;
