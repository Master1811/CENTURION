// LogoCarousel - infinite marquee of infrastructure logos
import React from 'react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';

const logos = [
  'Razorpay',
  'Stripe',
  'Supabase',
  'Vercel',
  'Resend',
  'Anthropic',
  'Recharts',
];

export const LogoCarousel = () => {
  return (
    <section
      className="py-12 md:py-16 overflow-hidden"
      data-testid="logo-carousel"
    >
      <p className="type-label text-[#A1A1AA] text-center mb-8">
        {copy.logoCarousel.title}
      </p>

      {/* Marquee container */}
      <div
        className={cn(
          'relative',
          // Edge fade mask
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-32 before:z-10',
          'before:bg-gradient-to-r before:from-white before:to-transparent',
          'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-32 after:z-10',
          'after:bg-gradient-to-l after:from-white after:to-transparent'
        )}
      >
        {/* Row 1 */}
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`row1-${i}`}
              className={cn(
                'flex-shrink-0 px-8 md:px-12',
                'text-lg md:text-xl font-heading font-medium',
                'text-[rgba(0,0,0,0.2)] hover:text-[rgba(0,0,0,0.5)]',
                'transition-colors duration-200'
              )}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
