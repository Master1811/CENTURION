// ScrollReveal component for scroll-triggered animations
// Enhanced with blur effect for premium entrance reveals
// Never animate above the fold

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const ScrollReveal = ({
  children,
  delay = 0,
  className,
  once = true,
  direction = 'up', // up | down | left | right
  blur = true, // Enable blur effect
  scale = false, // Enable scale effect
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Direction-based initial transforms
  const directionVariants = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 24 },
    right: { y: 0, x: -24 },
  };

  const initial = {
    opacity: 0,
    ...directionVariants[direction],
    filter: blur ? 'blur(6px)' : 'blur(0px)',
    scale: scale ? 0.96 : 1,
  };

  const animate = {
    opacity: 1,
    y: 0,
    x: 0,
    filter: 'blur(0px)',
    scale: 1,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // ease-out-expo
        delay,
        // Stagger filter animation slightly
        filter: { duration: 0.5, delay: delay + 0.05 },
        scale: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
      className={className}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
