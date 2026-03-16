// CTASection - final call to action
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section
      className={cn(
        'py-20 md:py-32',
        'bg-dot-grid',
        'bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)]'
      )}
      data-testid="cta-section"
    >
      <div className="max-w-2xl mx-auto px-4 md:px-8 text-center">
        <ScrollReveal>
          <h2 className="type-title text-[#09090B] mb-4">
            {copy.cta.headline}
          </h2>
          <p className="type-body text-[#52525B] mb-10">
            {copy.cta.subhead}
          </p>

          <button
            onClick={() => navigate('/tools/100cr-calculator')}
            className={cn(
              'inline-flex items-center gap-2',
              'h-12 px-7 rounded-full',
              'bg-[#09090B] text-white text-sm font-medium',
              'shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.12)]',
              'hover:bg-[#18181B] hover:-translate-y-0.5',
              'transition-all duration-150'
            )}
            data-testid="cta-button"
          >
            {copy.cta.button}
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default CTASection;
