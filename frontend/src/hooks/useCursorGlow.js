// useCursorGlow - Hook for cursor-following glow effect on buttons
// Creates a subtle highlight that follows the cursor position

import { useState, useCallback, useRef } from 'react';

export const useCursorGlow = (enabled = true) => {
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!enabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGlowPosition({ x, y });
  }, [enabled]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const glowStyle = isHovering ? {
    '--glow-x': `${glowPosition.x}px`,
    '--glow-y': `${glowPosition.y}px`,
  } : {};

  return {
    ref,
    glowStyle,
    isHovering,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};

export default useCursorGlow;

