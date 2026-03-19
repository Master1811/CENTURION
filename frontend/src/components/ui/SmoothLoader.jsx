// SmoothLoader - Smooth fade + scale transitions for loading states
// Replaces abrupt loading state changes with premium animations

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants for smooth loading transitions
const containerVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1], // --ease-luxury
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(2px)',
    transition: {
      duration: 0.15,
      ease: [0.22, 1, 0.36, 1],
    }
  },
};

const spinnerVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.15,
    }
  },
};

// Smooth loading wrapper component
export const SmoothLoader = ({
  isLoading,
  children,
  className,
  spinnerSize = 'default', // small | default | large
  spinnerClassName,
  minHeight = 'h-32',
}) => {
  const sizes = {
    small: 'w-4 h-4',
    default: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className={cn('relative', minHeight, className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            variants={spinnerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2
              className={cn(
                sizes[spinnerSize],
                'animate-spin text-[#71717A]',
                spinnerClassName
              )}
              strokeWidth={1.5}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fade transition wrapper for content updates
export const FadeTransition = ({
  children,
  transitionKey,
  className,
  duration = 0.2,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          }
        }}
        exit={{
          opacity: 0,
          y: -8,
          transition: {
            duration: duration * 0.75,
            ease: [0.22, 1, 0.36, 1],
          }
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Skeleton with smooth appearance
export const SmoothSkeleton = ({
  className,
  animate = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-lg bg-[rgba(0,0,0,0.06)]',
        animate && 'animate-pulse',
        className
      )}
    />
  );
};

export default SmoothLoader;

