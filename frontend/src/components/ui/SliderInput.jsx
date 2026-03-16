// SliderInput component with tooltip value display
// Optimized for 60fps during drag using refs

import React, { useRef, useCallback, useState, useEffect } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export const SliderInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = (v) => v,
  helperText,
  className,
  'data-testid': testId,
}) => {
  const valueRef = useRef(null);
  const [localValue, setLocalValue] = useState(value);
  
  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Update display without state update (60fps)
  const handleValueChange = useCallback((newValue) => {
    const val = newValue[0];
    setLocalValue(val);
    
    // Update display ref directly for performance
    if (valueRef.current) {
      valueRef.current.textContent = formatValue(val);
    }
  }, [formatValue]);

  // Commit to state on release
  const handleValueCommit = useCallback((newValue) => {
    onChange(newValue[0]);
  }, [onChange]);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#09090B]">
          {label}
        </label>
        <span
          ref={valueRef}
          className="font-mono text-sm font-semibold text-[#09090B] tabular-nums"
          data-testid={testId ? `${testId}-value` : undefined}
        >
          {formatValue(localValue)}
        </span>
      </div>

      {/* Slider */}
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center h-5"
        value={[localValue]}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        min={min}
        max={max}
        step={step}
        data-testid={testId}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[rgba(0,0,0,0.08)]">
          <SliderPrimitive.Range className="absolute h-full bg-[rgba(0,0,0,0.6)]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            'block h-5 w-5 rounded-full',
            'bg-[#09090B]',
            'ring-2 ring-[rgba(0,0,0,0.1)] ring-offset-2 ring-offset-white',
            'transition-transform duration-150',
            'hover:scale-110',
            'focus-visible:outline-none focus-visible:ring-[rgba(0,0,0,0.5)]',
            'disabled:pointer-events-none disabled:opacity-50',
            'cursor-grab active:cursor-grabbing'
          )}
        />
      </SliderPrimitive.Root>

      {/* Helper text */}
      {helperText && (
        <p className="text-xs text-[#A1A1AA]">{helperText}</p>
      )}
    </div>
  );
};

export default SliderInput;
