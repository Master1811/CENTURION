// ARR Calculator - Calculate Annual Recurring Revenue
import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { Info, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCrore, formatINR, LAKH, CRORE } from '@/lib/engine/constants';

export const ARRCalculator = () => {
  const [mrr, setMrr] = useState(200000);
  const [customers, setCustomers] = useState(50);
  const [arpu, setArpu] = useState(4000);

  const calculations = useMemo(() => {
    const arr = mrr * 12;
    const calculatedArpu = customers > 0 ? mrr / customers : 0;
    const calculatedMrr = customers * arpu;
    
    return {
      arr,
      calculatedArpu,
      calculatedMrr,
      ltv: calculatedArpu * 24, // Assuming 24 month average lifetime
    };
  }, [mrr, customers, arpu]);

  const formatMRR = (v) => v >= LAKH ? `₹${(v / LAKH).toFixed(1)}L` : formatINR(v);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="arr-calculator-page">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="type-title text-[#09090B] mb-3">ARR Calculator</h1>
            <p className="type-body text-[#52525B]">
              Calculate your Annual Recurring Revenue and key SaaS metrics
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <CenturionCard>
              <CenturionCardContent className="space-y-8">
                <SliderInput
                  label="Monthly Recurring Revenue (MRR)"
                  value={mrr}
                  onChange={setMrr}
                  min={10000}
                  max={10000000}
                  step={10000}
                  formatValue={formatMRR}
                  helperText="Total revenue from subscriptions each month"
                  data-testid="arr-mrr-slider"
                />

                <SliderInput
                  label="Number of Paying Customers"
                  value={customers}
                  onChange={setCustomers}
                  min={1}
                  max={10000}
                  step={1}
                  formatValue={(v) => v.toLocaleString('en-IN')}
                  helperText="Active paying subscribers"
                  data-testid="arr-customers-slider"
                />

                <SliderInput
                  label="Average Revenue Per User (ARPU)"
                  value={arpu}
                  onChange={setArpu}
                  min={100}
                  max={100000}
                  step={100}
                  formatValue={(v) => formatINR(v)}
                  helperText="Average monthly payment per customer"
                  data-testid="arr-arpu-slider"
                />
              </CenturionCardContent>
            </CenturionCard>

            {/* Results */}
            <div className="space-y-4">
              <CenturionCard className="bg-[#09090B]">
                <CenturionCardContent className="text-center py-8">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                    Annual Recurring Revenue
                  </p>
                  <p className="font-mono text-4xl font-bold text-white tabular-nums" data-testid="arr-result">
                    {formatCrore(calculations.arr)}
                  </p>
                  <p className="text-sm text-white/60 mt-2">per year</p>
                </CenturionCardContent>
              </CenturionCard>

              <div className="grid grid-cols-2 gap-4">
                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <Users className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className="font-mono text-xl font-semibold text-[#09090B] tabular-nums">
                      {formatINR(calculations.calculatedArpu)}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">ARPU (calculated)</p>
                  </CenturionCardContent>
                </CenturionCard>

                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <DollarSign className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className="font-mono text-xl font-semibold text-[#09090B] tabular-nums">
                      {formatINR(calculations.ltv)}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">Est. LTV (24 mo)</p>
                  </CenturionCardContent>
                </CenturionCard>
              </div>

              <CenturionCard className="bg-[#F4F4F5]">
                <CenturionCardContent>
                  <p className="text-sm text-[#52525B]">
                    <span className="font-medium text-[#09090B]">Quick insight:</span>{' '}
                    With {customers} customers paying an average of {formatINR(calculations.calculatedArpu)}/month, 
                    you're generating {formatCrore(calculations.arr)} in yearly revenue.
                  </p>
                </CenturionCardContent>
              </CenturionCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ARRCalculator;
