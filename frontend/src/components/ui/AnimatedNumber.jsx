// AnimatedNumber component for count-up animations
// Used in metrics sections

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AnimatedNumber = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-80px' });
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const startValue = 0;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isInView, value, duration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span
      ref={ref}
      className={cn('font-mono tabular-nums', className)}
    >
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

export default AnimatedNumber;
