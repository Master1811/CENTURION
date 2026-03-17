// Growth Rate Calculator - Calculate month-over-month growth
import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCrore, formatINR, LAKH, CRORE } from '@/lib/engine/constants';

export const GrowthCalculator = () => {
  const [previousRevenue, setPreviousRevenue] = useState(150000);
  const [currentRevenue, setCurrentRevenue] = useState(180000);
  const [months, setMonths] = useState(1);

  const calculations = useMemo(() => {
    const absoluteGrowth = currentRevenue - previousRevenue;
    const percentGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue)
      : 0;
    
    // CAGR for multi-month
    const cagr = previousRevenue > 0 && months > 0
      ? Math.pow(currentRevenue / previousRevenue, 1 / months) - 1
      : 0;
    
    // T2D3 benchmark comparison (triple, triple, double, double, double)
    const annualizedGrowth = Math.pow(1 + cagr, 12) - 1;
    const t2d3Status = annualizedGrowth >= 2 ? 'excellent' : annualizedGrowth >= 1 ? 'good' : 'needs-work';
    
    // Projection
    const sixMonthProjection = currentRevenue * Math.pow(1 + cagr, 6);
    const yearProjection = currentRevenue * Math.pow(1 + cagr, 12);
    
    return {
      absoluteGrowth,
      percentGrowth,
      cagr,
      annualizedGrowth,
      t2d3Status,
      sixMonthProjection,
      yearProjection,
    };
  }, [previousRevenue, currentRevenue, months]);

  const formatMoney = (v) => v >= CRORE ? `₹${(v / CRORE).toFixed(2)}Cr` : v >= LAKH ? `₹${(v / LAKH).toFixed(1)}L` : formatINR(v);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="growth-calculator-page">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="type-title text-[#09090B] mb-3">Growth Rate Calculator</h1>
            <p className="type-body text-[#52525B]">
              Calculate your month-over-month and annualized growth rate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <CenturionCard>
              <CenturionCardContent className="space-y-8">
                <SliderInput
                  label="Previous Revenue"
                  value={previousRevenue}
                  onChange={setPreviousRevenue}
                  min={1000}
                  max={50000000}
                  step={1000}
                  formatValue={formatMoney}
                  helperText="Revenue at the start of the period"
                  data-testid="growth-prev-slider"
                />

                <SliderInput
                  label="Current Revenue"
                  value={currentRevenue}
                  onChange={setCurrentRevenue}
                  min={1000}
                  max={50000000}
                  step={1000}
                  formatValue={formatMoney}
                  helperText="Revenue at the end of the period"
                  data-testid="growth-current-slider"
                />

                <SliderInput
                  label="Number of Months"
                  value={months}
                  onChange={setMonths}
                  min={1}
                  max={24}
                  step={1}
                  formatValue={(v) => `${v} month${v > 1 ? 's' : ''}`}
                  helperText="Time period between the two revenue figures"
                  data-testid="growth-months-slider"
                />
              </CenturionCardContent>
            </CenturionCard>

            {/* Results */}
            <div className="space-y-4">
              <CenturionCard className="bg-[#09090B]">
                <CenturionCardContent className="text-center py-8">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                    Monthly Growth Rate
                  </p>
                  <p className="font-mono text-4xl font-bold text-white tabular-nums" data-testid="growth-result">
                    {(calculations.cagr * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    {calculations.annualizedGrowth > 0 ? '+' : ''}{(calculations.annualizedGrowth * 100).toFixed(0)}% annualized
                  </p>
                </CenturionCardContent>
              </CenturionCard>

              <div className="grid grid-cols-2 gap-4">
                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <Zap className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className="font-mono text-xl font-semibold text-[#09090B] tabular-nums">
                      {formatMoney(calculations.absoluteGrowth)}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">Absolute Growth</p>
                  </CenturionCardContent>
                </CenturionCard>

                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <Target className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className={cn(
                      'font-mono text-xl font-semibold tabular-nums',
                      calculations.t2d3Status === 'excellent' && 'text-emerald-600',
                      calculations.t2d3Status === 'good' && 'text-[#09090B]',
                      calculations.t2d3Status === 'needs-work' && 'text-amber-600'
                    )}>
                      {calculations.t2d3Status === 'excellent' ? 'T2D3 Ready' : 
                       calculations.t2d3Status === 'good' ? 'Good' : 'Improve'}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">T2D3 Status</p>
                  </CenturionCardContent>
                </CenturionCard>
              </div>

              <CenturionCard>
                <CenturionCardContent>
                  <p className="type-label text-[#A1A1AA] mb-4">PROJECTIONS AT CURRENT RATE</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#52525B]">In 6 months</span>
                      <span className="font-mono font-semibold text-[#09090B] tabular-nums">
                        {formatMoney(calculations.sixMonthProjection)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#52525B]">In 12 months</span>
                      <span className="font-mono font-semibold text-[#09090B] tabular-nums">
                        {formatMoney(calculations.yearProjection)}
                      </span>
                    </div>
                  </div>
                </CenturionCardContent>
              </CenturionCard>

              <CenturionCard className="bg-[#F4F4F5]">
                <CenturionCardContent>
                  <p className="text-sm text-[#52525B]">
                    <span className="font-medium text-[#09090B]">What's T2D3?</span>{' '}
                    Triple revenue year 1, triple year 2, then double for 3 years. 
                    This benchmark helps SaaS startups reach $100M ARR in 5 years.
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

export default GrowthCalculator;
