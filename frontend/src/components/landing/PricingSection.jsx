// PricingSection - Free vs Founder Plan cards
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="py-20 md:py-32"
      id="pricing"
      data-testid="pricing-section"
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="type-title text-[#09090B] mb-4">
              {copy.pricing.title}
            </h2>
            <p className="type-body text-[#52525B]">
              {copy.pricing.subtitle}
            </p>
          </div>
        </ScrollReveal>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Free Plan */}
          <ScrollReveal delay={0.06}>
            <CenturionCard className="bg-[#FAFAFA] h-full">
              <CenturionCardContent className="p-8">
                <h3 className="type-heading text-[#09090B] mb-2">
                  {copy.pricing.free.name}
                </h3>
                <p className="text-sm text-[#52525B] mb-6">
                  {copy.pricing.free.description}
                </p>

                <div className="mb-8">
                  <span className="type-hero text-[#09090B] font-mono tabular-nums">
                    {copy.pricing.free.price}
                  </span>
                  <span className="text-sm text-[#A1A1AA] ml-2">
                    {copy.pricing.free.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {copy.pricing.free.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#52525B] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <span className="text-sm text-[#52525B]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/tools/100cr-calculator')}
                  className={cn(
                    'w-full h-11 rounded-lg',
                    'bg-white border border-[rgba(0,0,0,0.12)]',
                    'text-sm font-medium text-[#09090B]',
                    'hover:bg-[#F4F4F5]',
                    'transition-colors'
                  )}
                  data-testid="pricing-free-cta"
                >
                  {copy.pricing.free.cta}
                </button>
              </CenturionCardContent>
            </CenturionCard>
          </ScrollReveal>

          {/* Founder Plan */}
          <ScrollReveal delay={0.12}>
            <CenturionCard className="border-[rgba(0,0,0,0.12)] h-full relative">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={cn(
                  'inline-block px-3 py-1 rounded-full',
                  'bg-[rgba(0,0,0,0.06)] text-[#09090B]',
                  'text-xs font-medium'
                )}>
                  {copy.pricing.founder.badge}
                </span>
              </div>

              <CenturionCardContent className="p-8 pt-10">
                <h3 className="type-heading text-[#09090B] mb-2">
                  {copy.pricing.founder.name}
                </h3>
                <p className="text-sm text-[#52525B] mb-6">
                  {copy.pricing.founder.description}
                </p>

                <div className="mb-8">
                  <span className="type-hero text-[#09090B] font-mono tabular-nums">
                    {copy.pricing.founder.price}
                  </span>
                  <span className="text-sm text-[#A1A1AA] ml-2">
                    {copy.pricing.founder.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {copy.pricing.founder.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#09090B] mt-0.5 shrink-0" strokeWidth={1.5} />
                      <span className="text-sm text-[#52525B]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {/* Razorpay payment link will go here */}}
                  className={cn(
                    'w-full h-11 rounded-lg',
                    'bg-[#09090B] text-white',
                    'text-sm font-medium',
                    'hover:bg-[#18181B]',
                    'transition-colors'
                  )}
                  data-testid="pricing-founder-cta"
                >
                  {copy.pricing.founder.cta}
                </button>
              </CenturionCardContent>
            </CenturionCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
