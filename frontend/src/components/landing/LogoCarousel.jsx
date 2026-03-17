// LogoCarousel - infinite marquee of infrastructure logos
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const logos = [
  { name: 'Razorpay', color: '#0066FF' },
  { name: 'Stripe', color: '#635BFF' },
  { name: 'Supabase', color: '#3ECF8E' },
  { name: 'Vercel', color: '#000000' },
  { name: 'Cashfree', color: '#00C853' },
  { name: 'AWS', color: '#FF9900' },
  { name: 'Anthropic', color: '#CC785C' },
];

export const LogoCarousel = () => {
  return (
    <section
      className="py-10 md:py-14 bg-[#FAFAFA] border-y border-[rgba(0,0,0,0.04)] overflow-hidden"
      data-testid="logo-carousel"
    >
      <motion.p 
        className="text-xs font-semibold tracking-widest text-[#A1A1AA] text-center mb-6 uppercase"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Trusted Infrastructure
      </motion.p>

      {/* Marquee container */}
      <div
        className={cn(
          'relative',
          // Edge fade mask
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-24 md:before:w-48 before:z-10',
          'before:bg-gradient-to-r before:from-[#FAFAFA] before:to-transparent',
          'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-24 md:after:w-48 after:z-10',
          'after:bg-gradient-to-l after:from-[#FAFAFA] after:to-transparent'
        )}
      >
        <div className="flex animate-marquee">
          {[...logos, ...logos, ...logos].map((logo, i) => (
            <div
              key={`logo-${i}`}
              className={cn(
                'flex-shrink-0 px-6 md:px-10',
                'flex items-center gap-2'
              )}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: logo.color }}
              />
              <span className={cn(
                'text-sm md:text-base font-medium',
                'text-[#71717A] hover:text-[#09090B]',
                'transition-colors duration-200 whitespace-nowrap'
              )}>
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
