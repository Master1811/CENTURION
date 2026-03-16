// ScrollReveal component for scroll-triggered animations
// Never animate above the fold

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const ScrollReveal = ({
  children,
  delay = 0,
  className,
  once = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // ease-out-expo
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
