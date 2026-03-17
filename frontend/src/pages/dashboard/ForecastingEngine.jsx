// Forecasting Engine Dashboard
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { Sparkles, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { formatCrore, CRORE, LAKH } from '@/lib/engine/constants';
import { predictTrajectory } from '@/lib/engine/projection';

export const ForecastingEngine = () => {
  const [baseGrowth, setBaseGrowth] = useState(0.12);
  const [churnRate, setChurnRate] = useState(0.05);
  const [expansionRate, setExpansionRate] = useState(0.02);
  const baseMRR = 420000;

  const scenarios = useMemo(() => {
    const base = predictTrajectory({ currentMRR: baseMRR, growthRate: baseGrowth });
    const optimistic = predictTrajectory({ currentMRR: baseMRR, growthRate: baseGrowth + 0.03 });
    const pessimistic = predictTrajectory({ currentMRR: baseMRR, growthRate: baseGrowth - 0.03 });
    
    return { base, optimistic, pessimistic };
  }, [baseGrowth]);

  // Sensitivity matrix
  const sensitivityMatrix = useMemo(() => {
    const growthRates = [0.06, 0.08, 0.10, 0.12, 0.14];
    const churnRates = [0.03, 0.05, 0.07, 0.09];
    
    return churnRates.map(churn => ({
      churn,
      results: growthRates.map(growth => {
        const effectiveGrowth = growth - churn + expansionRate;
        const result = predictTrajectory({ currentMRR: baseMRR, growthRate: effectiveGrowth });
        const milestone = result.milestones.find(m => m.value === CRORE);
        return milestone?.monthsToReach || null;
      })
    }));
  }, [expansionRate]);

  // Generate chart data
  const chartData = useMemo(() => {
    const months = 24;
    const data = [];
    
    for (let i = 0; i <= months; i++) {
      const baseRevenue = baseMRR * Math.pow(1 + baseGrowth, i) * 12;
      const optRevenue = baseMRR * Math.pow(1 + baseGrowth + 0.03, i) * 12;
      const pessRevenue = baseMRR * Math.pow(1 + baseGrowth - 0.03, i) * 12;
      
      data.push({
        month: i,
        label: `M${i}`,
        base: baseRevenue,
        optimistic: optRevenue,
        pessimistic: pessRevenue,
      });
    }
    return data;
  }, [baseGrowth]);

  return (
    <div className="space-y-6" data-testid="forecasting-engine">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.forecasting.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.forecasting.subtitle}
        </p>
      </div>

      {/* Scenario Controls */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-6">
            {copy.dashboard.forecasting.scenarioBranching}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <SliderInput
              label="Base Growth Rate"
              value={baseGrowth}
              onChange={setBaseGrowth}
              min={0.02}
              max={0.25}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              data-testid="forecast-growth-slider"
            />
            <SliderInput
              label="Monthly Churn Rate"
              value={churnRate}
              onChange={setChurnRate}
              min={0.01}
              max={0.15}
              step={0.01}
              formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              data-testid="forecast-churn-slider"
            />
            <SliderInput
              label="Expansion Revenue"
              value={expansionRate}
              onChange={setExpansionRate}
              min={0}
              max={0.10}
              step={0.005}
              formatValue={(v) => `${(v * 100).toFixed(1)}%`}
              data-testid="forecast-expansion-slider"
            />
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Scenario Chart */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-[#09090B]">24-Month Projection Scenarios</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-[#71717A]">Optimistic (+3%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-[#09090B]" />
                <span className="text-[#71717A]">Base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-amber-500" />
                <span className="text-[#71717A]">Pessimistic (-3%)</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#A1A1AA' }}
                  interval={5}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#A1A1AA' }}
                  tickFormatter={(v) => v >= CRORE ? `${(v / CRORE).toFixed(0)}Cr` : `${(v / LAKH).toFixed(0)}L`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090B', border: 'none', borderRadius: 8 }}
                  labelStyle={{ color: '#A1A1AA' }}
                  formatter={(value) => [formatCrore(value), '']}
                />
                <ReferenceLine y={CRORE} stroke="#E4E4E7" strokeDasharray="4 4" />
                <ReferenceLine y={10 * CRORE} stroke="#E4E4E7" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="base" stroke="#09090B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pessimistic" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Sensitivity Matrix */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-2">
            {copy.dashboard.forecasting.sensitivityMatrix}
          </h3>
          <p className="text-sm text-[#71717A] mb-6">
            Months to ₹1 Crore ARR based on growth × churn combinations
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 text-[#A1A1AA] font-medium">Churn ↓ Growth →</th>
                  {[6, 8, 10, 12, 14].map(g => (
                    <th key={g} className="text-center py-3 text-[#71717A] font-mono">{g}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityMatrix.map((row) => (
                  <tr key={row.churn} className="border-t border-[rgba(0,0,0,0.06)]">
                    <td className="py-3 font-mono text-[#52525B]">{(row.churn * 100).toFixed(0)}%</td>
                    {row.results.map((months, i) => (
                      <td key={i} className="text-center py-3">
                        {months ? (
                          <span className={cn(
                            'font-mono font-medium',
                            months <= 6 && 'text-emerald-600',
                            months > 6 && months <= 12 && 'text-[#09090B]',
                            months > 12 && 'text-amber-600'
                          )}>
                            {months}mo
                          </span>
                        ) : (
                          <span className="text-[#E4E4E7]">10y+</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* AI What-If Narrator */}
      <CenturionCard className="border-l-4 border-l-blue-400">
        <CenturionCardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Sparkles className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[#A1A1AA] mb-2">
                {copy.dashboard.forecasting.whatIf}
              </p>
              <p className="text-sm text-[#09090B] leading-relaxed">
                At your current {(baseGrowth * 100).toFixed(0)}% growth with {(churnRate * 100).toFixed(0)}% churn, 
                you'll reach ₹1 Crore ARR in approximately {scenarios.base.milestones[0]?.monthsToReach || '12+'} months. 
                Reducing churn by just 2% would save you {Math.round((churnRate * baseMRR * 12 * 0.02) / 10000) / 10}L in annual 
                revenue and accelerate your milestone by ~2 months.
              </p>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default ForecastingEngine;
