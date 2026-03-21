// PageLayout - Unified page wrapper for consistent layout and styling
// Use this for all content pages (Tools, Pricing, etc.) to ensure design cohesion

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpWidget } from '@/components/help/HelpWidget';

// ─── Animation Variants ─────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1,
    } 
  },
};

/**
 * PageLayout - Consistent wrapper for all content pages
 * 
 * @param {string} variant - 'light' | 'dark' | 'hero' - determines background style
 * @param {boolean} hero - If true, adds a compact hero header section
 * @param {string} heroTitle - Title for the hero section
 * @param {string} heroSubtitle - Subtitle for the hero section
 * @param {string} heroBadge - Optional badge text above the title
 * @param {boolean} showNavbar - Show the navigation bar
 * @param {boolean} showFooter - Show the footer
 * @param {boolean} showHelpWidget - Show the floating help widget
 * @param {string} className - Additional classes for the main content area
 */
export const PageLayout = ({
  children,
  variant = 'light',
  hero = false,
  heroTitle,
  heroSubtitle,
  heroBadge,
  showNavbar = true,
  showFooter = true,
  showHelpWidget = true,
  className,
  contentClassName,
  ...props
}) => {
  const isDark = variant === 'dark' || variant === 'hero';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={cn(
        'min-h-screen flex flex-col',
        variant === 'light' && 'bg-[var(--ds-bg-primary)]',
        variant === 'dark' && 'bg-[var(--ds-bg-dark)]',
        variant === 'hero' && 'bg-[var(--ds-bg-dark)]',
        className
      )}
      data-theme={isDark ? 'dark' : 'light'}
      {...props}
    >
      {/* Navigation */}
      {showNavbar && <Navbar />}

      {/* Compact Hero Header (optional) */}
      {hero && (
        <header 
          className={cn(
            'relative pt-24 pb-12 md:pt-28 md:pb-16',
            isDark ? 'text-white' : 'text-[var(--ds-text-primary)]'
          )}
          style={isDark ? {
            background: `linear-gradient(
              to bottom,
              #000000 0%,
              #001520 50%,
              #002535 100%
            )`,
          } : {
            background: 'linear-gradient(to bottom, var(--ds-bg-secondary) 0%, var(--ds-bg-primary) 100%)',
            borderBottom: '1px solid var(--ds-border-light)',
          }}
        >
          {/* Subtle background gradient glow for dark variant */}
          {isDark && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(
                  ellipse 60% 80% at 50% 100%,
                  rgba(0, 191, 255, 0.12) 0%,
                  transparent 60%
                )`,
              }}
            />
          )}

          <div className="ds-container relative z-10 text-center">
            {/* Badge */}
            {heroBadge && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <span 
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider',
                    isDark 
                      ? 'bg-[rgba(0,191,255,0.12)] text-[#00BFFF] border border-[rgba(0,191,255,0.25)]'
                      : 'bg-[rgba(0,191,255,0.08)] text-[var(--ds-cyan-600)] border border-[rgba(0,191,255,0.20)]'
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {heroBadge}
                </span>
              </motion.div>
            )}

            {/* Title */}
            {heroTitle && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className={cn(
                  'ds-h1 mb-4',
                  isDark && 'text-white'
                )}
              >
                {heroTitle}
              </motion.h1>
            )}

            {/* Subtitle */}
            {heroSubtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  'ds-body max-w-2xl mx-auto',
                  isDark ? 'text-white/60' : 'text-[var(--ds-text-tertiary)]'
                )}
              >
                {heroSubtitle}
              </motion.p>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      <motion.main
        variants={contentVariants}
        initial="initial"
        animate="enter"
        className={cn(
          'flex-1',
          !hero && 'pt-20 md:pt-24', // Add top padding when no hero
          contentClassName
        )}
      >
        {children}
      </motion.main>

      {/* Footer */}
      {showFooter && <Footer />}

      {/* Help Widget */}
      {showHelpWidget && <HelpWidget variant={isDark ? 'dark' : 'default'} />}
    </motion.div>
  );
};

// ─── Section Components ─────────────────────────────────────────────────────────

/**
 * PageSection - Consistent section wrapper with proper spacing
 */
export const PageSection = ({ 
  children, 
  className, 
  size = 'default',
  ...props 
}) => (
  <section 
    className={cn(
      'ds-section',
      size === 'sm' && 'py-10 md:py-12',
      size === 'lg' && 'py-20 md:py-28',
      className
    )}
    {...props}
  >
    <div className="ds-container">
      {children}
    </div>
  </section>
);

/**
 * SectionHeader - Consistent section title treatment
 */
export const SectionHeader = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className,
}) => (
  <div 
    className={cn(
      'mb-10 md:mb-12',
      align === 'center' && 'text-center',
      align === 'left' && 'text-left',
      className
    )}
  >
    {badge && (
      <span className="ds-badge ds-badge-cyan mb-4 inline-block">
        {badge}
      </span>
    )}
    {title && (
      <h2 className="ds-h2 mb-3 text-[var(--ds-text-primary)]">
        {title}
      </h2>
    )}
    {subtitle && (
      <p className={cn(
        'ds-body max-w-2xl',
        align === 'center' && 'mx-auto'
      )}>
        {subtitle}
      </p>
    )}
  </div>
);

export default PageLayout;
