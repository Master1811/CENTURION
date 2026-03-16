// MetricsSection - four stat cards with animated counters
import React from 'react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const metrics = [
  { value: 120, label: copy.metrics.projectionWindow.label, suffix: '' },
  { value: 4, label: copy.metrics.scenarios.label, suffix: '' },
  { value: 899, label: copy.metrics.yearlyPrice.label, prefix: '₹' },
  { value: 3, label: copy.metrics.stages.label, suffix: '' },
];

export const MetricsSection = () => {
  return (
    <section
      className="py-20 md:py-32 bg-[#F4F4F5]"
      data-testid="metrics-section"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {metrics.map((metric, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <CenturionCard hover>
                <CenturionCardContent className="text-center py-8">
                  <div className="mb-2">
                    <AnimatedNumber
                      value={metric.value}
                      prefix={metric.prefix || ''}
                      suffix={metric.suffix || ''}
                      className="type-hero text-[#09090B]"
                    />
                  </div>
                  <p className="text-sm text-[#52525B]">{metric.label}</p>
                </CenturionCardContent>
                {/* Top border accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[rgba(0,0,0,0.06)] group-hover:bg-[rgba(0,0,0,0.12)] transition-colors" />
              </CenturionCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;
