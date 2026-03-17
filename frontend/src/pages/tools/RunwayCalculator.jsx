// Runway Calculator - How long until you run out of money?
import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { Clock, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCrore, formatINR, LAKH, CRORE } from '@/lib/engine/constants';

export const RunwayCalculator = () => {
  const [cashInBank, setCashInBank] = useState(10000000); // ₹1 Cr
  const [monthlyBurn, setMonthlyBurn] = useState(500000); // ₹5L
  const [monthlyRevenue, setMonthlyRevenue] = useState(200000); // ₹2L
  const [growthRate, setGrowthRate] = useState(0.08);

  const calculations = useMemo(() => {
    const netBurn = monthlyBurn - monthlyRevenue;
    const simpleRunway = netBurn > 0 ? cashInBank / netBurn : Infinity;
    
    // Calculate runway with growth
    let runwayWithGrowth = 0;
    let remainingCash = cashInBank;
    let currentRevenue = monthlyRevenue;
    
    while (remainingCash > 0 && runwayWithGrowth < 120) {
      const currentNetBurn = monthlyBurn - currentRevenue;
      if (currentNetBurn <= 0) {
        runwayWithGrowth = Infinity;
        break;
      }
      remainingCash -= currentNetBurn;
      currentRevenue *= (1 + growthRate);
      runwayWithGrowth++;
    }
    
    const profitabilityMonth = growthRate > 0 
      ? Math.ceil(Math.log(monthlyBurn / monthlyRevenue) / Math.log(1 + growthRate))
      : Infinity;
    
    const status = simpleRunway < 6 ? 'critical' : simpleRunway < 12 ? 'warning' : 'healthy';
    
    return {
      netBurn,
      simpleRunway: Math.min(simpleRunway, 120),
      runwayWithGrowth: Math.min(runwayWithGrowth, 120),
      profitabilityMonth: profitabilityMonth > 120 ? null : profitabilityMonth,
      status,
    };
  }, [cashInBank, monthlyBurn, monthlyRevenue, growthRate]);

  const formatMoney = (v) => v >= CRORE ? `₹${(v / CRORE).toFixed(1)}Cr` : v >= LAKH ? `₹${(v / LAKH).toFixed(1)}L` : formatINR(v);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="runway-calculator-page">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h1 className="type-title text-[#09090B] mb-3">Runway Calculator</h1>
            <p className="type-body text-[#52525B]">
              Calculate how long your cash will last at current burn rate
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <CenturionCard>
              <CenturionCardContent className="space-y-8">
                <SliderInput
                  label="Cash in Bank"
                  value={cashInBank}
                  onChange={setCashInBank}
                  min={100000}
                  max={500000000}
                  step={100000}
                  formatValue={formatMoney}
                  helperText="Total available cash reserves"
                  data-testid="runway-cash-slider"
                />

                <SliderInput
                  label="Monthly Burn Rate"
                  value={monthlyBurn}
                  onChange={setMonthlyBurn}
                  min={50000}
                  max={50000000}
                  step={50000}
                  formatValue={formatMoney}
                  helperText="Total monthly expenses (salaries, rent, tools, etc.)"
                  data-testid="runway-burn-slider"
                />

                <SliderInput
                  label="Monthly Revenue"
                  value={monthlyRevenue}
                  onChange={setMonthlyRevenue}
                  min={0}
                  max={50000000}
                  step={10000}
                  formatValue={formatMoney}
                  helperText="Current monthly revenue"
                  data-testid="runway-revenue-slider"
                />

                <SliderInput
                  label="Monthly Growth Rate"
                  value={growthRate}
                  onChange={setGrowthRate}
                  min={0}
                  max={0.30}
                  step={0.01}
                  formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                  helperText="Expected revenue growth rate"
                  data-testid="runway-growth-slider"
                />
              </CenturionCardContent>
            </CenturionCard>

            {/* Results */}
            <div className="space-y-4">
              <CenturionCard className={cn(
                calculations.status === 'critical' && 'bg-red-50 border-red-200',
                calculations.status === 'warning' && 'bg-amber-50 border-amber-200',
                calculations.status === 'healthy' && 'bg-[#09090B]'
              )}>
                <CenturionCardContent className="text-center py-8">
                  {calculations.status !== 'healthy' && (
                    <AlertTriangle className={cn(
                      'w-6 h-6 mx-auto mb-3',
                      calculations.status === 'critical' ? 'text-red-500' : 'text-amber-500'
                    )} strokeWidth={1.5} />
                  )}
                  <p className={cn(
                    'text-xs uppercase tracking-wider mb-2',
                    calculations.status === 'healthy' ? 'text-white/50' : 'text-[#71717A]'
                  )}>
                    Runway (with growth)
                  </p>
                  <p className={cn(
                    'font-mono text-4xl font-bold tabular-nums',
                    calculations.status === 'healthy' ? 'text-white' : 'text-[#09090B]'
                  )} data-testid="runway-result">
                    {calculations.runwayWithGrowth === Infinity 
                      ? 'Forever' 
                      : `${Math.round(calculations.runwayWithGrowth)} months`}
                  </p>
                  <p className={cn(
                    'text-sm mt-2',
                    calculations.status === 'healthy' ? 'text-white/60' : 'text-[#71717A]'
                  )}>
                    {calculations.status === 'critical' && 'Critical - raise funding immediately'}
                    {calculations.status === 'warning' && 'Start fundraising conversations'}
                    {calculations.status === 'healthy' && 'Healthy runway'}
                  </p>
                </CenturionCardContent>
              </CenturionCard>

              <div className="grid grid-cols-2 gap-4">
                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <TrendingDown className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className="font-mono text-xl font-semibold text-[#09090B] tabular-nums">
                      {formatMoney(calculations.netBurn)}
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">Net Monthly Burn</p>
                  </CenturionCardContent>
                </CenturionCard>

                <CenturionCard>
                  <CenturionCardContent className="text-center py-6">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-[#71717A]" strokeWidth={1.5} />
                    <p className="font-mono text-xl font-semibold text-[#09090B] tabular-nums">
                      {Math.round(calculations.simpleRunway)} mo
                    </p>
                    <p className="text-xs text-[#71717A] mt-1">Simple Runway</p>
                  </CenturionCardContent>
                </CenturionCard>
              </div>

              {calculations.profitabilityMonth && (
                <CenturionCard className="bg-[#F4F4F5]">
                  <CenturionCardContent>
                    <p className="text-sm text-[#52525B]">
                      <span className="font-medium text-[#09090B]">Path to profitability:</span>{' '}
                      At {(growthRate * 100).toFixed(0)}% growth, your revenue will cover expenses 
                      in approximately {calculations.profitabilityMonth} months.
                    </p>
                  </CenturionCardContent>
                </CenturionCard>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RunwayCalculator;
