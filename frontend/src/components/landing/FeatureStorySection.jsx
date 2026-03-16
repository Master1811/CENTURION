// FeatureStorySection - three alternating feature rows
import React from 'react';
import { CheckCircle, BarChart3, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export const FeatureStorySection = () => {
  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-[#FAFAFA]"
      data-testid="features-section"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-24 md:space-y-32">
        {/* Row 1 - Check-In (text left, visual right) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal>
            <div>
              <p className="type-label text-[#A1A1AA] mb-4">
                {copy.features.checkIn.eyebrow}
              </p>
              <h3 className="type-title text-[#09090B] mb-6">
                {copy.features.checkIn.headline}
              </h3>
              <p className="type-body text-[#52525B] mb-8">
                {copy.features.checkIn.description}
              </p>
              <ul className="space-y-4">
                {copy.features.checkIn.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 pl-4 border-l-2 border-[rgba(0,0,0,0.15)]"
                  >
                    <span className="text-sm text-[#52525B]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <CenturionCard>
              <CenturionCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="type-label text-[#A1A1AA]">CHECK-IN RESULT</p>
                  <CheckCircle className="w-5 h-5 text-[#09090B]" strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-lg">
                    <span className="text-sm text-[#52525B]">Status</span>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      'bg-[rgba(0,0,0,0.06)] text-[#09090B]',
                      'border border-[rgba(0,0,0,0.1)]'
                    )}>
                      2 months ahead
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-lg">
                    <span className="text-sm text-[#52525B]">This month</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">₹4.2 Lakh</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#F4F4F5] rounded-lg">
                    <span className="text-sm text-[#52525B]">Predicted</span>
                    <span className="font-mono text-sm tabular-nums text-[#52525B]">₹3.8 Lakh</span>
                  </div>
                </div>
              </CenturionCardContent>
            </CenturionCard>
          </ScrollReveal>
        </div>

        {/* Row 2 - Benchmarks (visual left, text right) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal className="order-2 md:order-1">
            <CenturionCard>
              <CenturionCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="type-label text-[#A1A1AA]">BENCHMARK</p>
                  <BarChart3 className="w-5 h-5 text-[#09090B]" strokeWidth={1.5} />
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#52525B]">Your growth</span>
                      <span className="font-mono text-sm font-semibold tabular-nums">12%</span>
                    </div>
                    <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#09090B] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#A1A1AA]">Median (Pre-Seed)</span>
                      <span className="font-mono text-sm text-[#A1A1AA] tabular-nums">8%</span>
                    </div>
                    <div className="h-2 bg-[#F4F4F5] rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-[rgba(0,0,0,0.2)] rounded-full" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
                    <p className="text-sm text-[#09090B] font-medium">
                      You're in the top 18% of pre-seed founders
                    </p>
                  </div>
                </div>
              </CenturionCardContent>
            </CenturionCard>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="order-1 md:order-2">
            <div>
              <p className="type-label text-[#A1A1AA] mb-4">
                {copy.features.benchmarks.eyebrow}
              </p>
              <h3 className="type-title text-[#09090B] mb-6">
                {copy.features.benchmarks.headline}
              </h3>
              <p className="type-body text-[#52525B]">
                {copy.features.benchmarks.description}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Row 3 - Sharing (text left, visual right) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <ScrollReveal>
            <div>
              <p className="type-label text-[#A1A1AA] mb-4">
                {copy.features.share.eyebrow}
              </p>
              <h3 className="type-title text-[#09090B] mb-6">
                {copy.features.share.headline}
              </h3>
              <p className="type-body text-[#52525B]">
                {copy.features.share.description}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="relative h-64">
              {/* Stacked OG cards */}
              <CenturionCard className="absolute top-0 left-0 w-64 rotate-[-4deg] transform-gpu">
                <CenturionCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                    <span className="text-xs text-[#A1A1AA]">100crengine.in/p/abc123</span>
                  </div>
                  <p className="font-mono text-sm font-semibold">₹100Cr by March 2029</p>
                </CenturionCardContent>
              </CenturionCard>
              <CenturionCard className="absolute top-8 left-12 w-64 rotate-[1deg] transform-gpu">
                <CenturionCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                    <span className="text-xs text-[#A1A1AA]">100crengine.in/p/def456</span>
                  </div>
                  <p className="font-mono text-sm font-semibold">₹50Cr by June 2027</p>
                </CenturionCardContent>
              </CenturionCard>
              <CenturionCard className="absolute top-16 left-24 w-64 rotate-[-1.5deg] transform-gpu">
                <CenturionCardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                    <span className="text-xs text-[#A1A1AA]">100crengine.in/p/ghi789</span>
                  </div>
                  <p className="font-mono text-sm font-semibold">₹10Cr by Dec 2025</p>
                </CenturionCardContent>
              </CenturionCard>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default FeatureStorySection;
