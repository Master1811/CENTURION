// Card component following 100Cr Engine design system
// Uses premium gradient system with luxury aesthetics
// Enhanced with 3D perspective motion and smooth interactions

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// 3D tilt effect hook for premium cards
const use3DTilt = (enabled = true) => {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max 2deg rotation for subtle effect
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;

    setTilt({ rotateX, rotateY });
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return { ref, tilt, handleMouseMove, handleMouseLeave };
};

export const CenturionCard = React.forwardRef(({
  className,
  hover = false,
  variant = 'default', // default | premium | glass | liquid-glass | dark
  enable3D = false, // Enable 3D tilt effect
  children,
  ...props 
}, forwardedRef) => {
  const { ref: tiltRef, tilt, handleMouseMove, handleMouseLeave } = use3DTilt(enable3D && hover);

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
    // New: Premium liquid glass variant
    'liquid-glass': [
      'bg-gradient-to-br from-[rgba(255,255,255,0.85)] via-[rgba(255,255,255,0.65)] to-[rgba(255,255,255,0.75)]',
      'border border-[rgba(255,255,255,0.35)]',
      'shadow-[var(--shadow-glass-xl)]',
      'backdrop-blur-[32px]',
      // Top shine line
      'after:content-[\'\'] after:absolute after:top-0 after:left-0 after:right-0 after:h-px',
      'after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent',
      'after:pointer-events-none',
    ],
    dark: [
      'bg-gradient-to-br from-[#09090B] via-[#18181B] to-[#27272A]',
      'border border-[rgba(255,255,255,0.1)]',
      'shadow-[var(--shadow-premium)]',
    ],
  };

  // Merge refs
  const setRefs = useCallback((node) => {
    tiltRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [forwardedRef, tiltRef]);

  // Enhanced hover animation variants
  const cardVariants = {
    initial: {
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
    },
    hover: {
      y: -6,
      scale: 1.01,
      transition: {
        type: 'tween',
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1], // --ease-luxury
      }
    },
  };

  if (hover) {
    return (
      <motion.div
        ref={setRefs}
        className={cn(
          'relative overflow-hidden rounded-2xl will-change-transform',
          // Base gradient overlay
          'before:content-[\'\'] before:absolute before:inset-0 before:rounded-[inherit]',
          'before:bg-gradient-to-b before:from-[rgba(255,255,255,0.8)] before:to-transparent',
          'before:opacity-50 before:pointer-events-none before:z-0',
          variants[variant],
          'transition-[border-color,box-shadow] duration-300 ease-[var(--ease-luxury)]',
          'hover:border-[rgba(0,0,0,0.12)]',
          'hover:shadow-[var(--shadow-card-hover)]',
          className
        )}
        style={{
          perspective: enable3D ? 1000 : undefined,
          transformStyle: enable3D ? 'preserve-3d' : undefined,
        }}
        initial="initial"
        whileHover="hover"
        variants={cardVariants}
        animate={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
        }}
        transition={{
          rotateX: { type: 'spring', stiffness: 300, damping: 30 },
          rotateY: { type: 'spring', stiffness: 300, damping: 30 },
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={setRefs}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        // Base gradient overlay
        'before:content-[\'\'] before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-gradient-to-b before:from-[rgba(255,255,255,0.8)] before:to-transparent',
        'before:opacity-50 before:pointer-events-none before:z-0',
        variants[variant],
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
