// 100Cr Calculator - main calculator tool page
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  Info,
  Share2,
  Download,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip as RechartsTooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  predictTrajectory,
  generateChartData,
} from '@/lib/engine/projection';
import {
  compareToBenchmark,
  getBenchmarkData,
  inferStage,
  getStageName,
} from '@/lib/engine/benchmarks';
import {
  formatCrore,
  formatPercent,
  formatDate,
  CRORE,
  LAKH,
  STAGES,
} from '@/lib/engine/constants';

// Default values
const DEFAULT_MRR = 200000; // ₹2 Lakh
const DEFAULT_GROWTH = 0.08; // 8%

export const HundredCrCalculator = () => {
  const navigate = useNavigate();
  
  // State
  const [mrr, setMrr] = useState(DEFAULT_MRR);
  const [growthRate, setGrowthRate] = useState(DEFAULT_GROWTH);
  const [selectedStage, setSelectedStage] = useState(STAGES.PRE_SEED);

  // Memoized calculations
  const projection = useMemo(() => {
    return predictTrajectory({ currentMRR: mrr, growthRate });
  }, [mrr, growthRate]);

  const chartData = useMemo(() => {
    const benchmark = getBenchmarkData(selectedStage);
    return generateChartData({ currentMRR: mrr, growthRate }, benchmark.median);
  }, [mrr, growthRate, selectedStage]);

  const benchmarkResult = useMemo(() => {
    return compareToBenchmark(growthRate, selectedStage);
  }, [growthRate, selectedStage]);

  // Format helpers
  const formatMRR = useCallback((value) => {
    if (value >= CRORE) {
      return `₹${(value / CRORE).toFixed(1)} Cr`;
    }
    return `₹${(value / LAKH).toFixed(1)} L`;
  }, []);

  const formatGrowth = useCallback((value) => {
    return `${(value * 100).toFixed(0)}%`;
  }, []);

  // Get milestone info
  const hundredCrMilestone = projection.milestones.find(m => m.value === 100 * CRORE);
  const monthsToTarget = hundredCrMilestone?.monthsToReach;
  const targetDate = hundredCrMilestone?.date;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="calculator-page">
      <Navbar />
      
      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="type-title text-[#09090B] mb-3" data-testid="calculator-title">
              {copy.calculator.title}
            </h1>
            <p className="type-body text-[#52525B]">
              {copy.calculator.subtitle}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Inputs */}
            <div className="lg:col-span-1 space-y-6">
              <CenturionCard>
                <CenturionCardContent className="space-y-8">
                  {/* MRR Slider */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-[#09090B]">
                        {copy.calculator.revenueLabel}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">{copy.tooltips.mrr}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SliderInput
                      value={mrr}
                      onChange={setMrr}
                      min={10000}
                      max={50000000}
                      step={10000}
                      formatValue={formatMRR}
                      helperText={copy.calculator.revenueHelper}
                      data-testid="mrr-slider"
                    />
                  </div>

                  {/* Growth Rate Slider */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm font-medium text-[#09090B]">
                        {copy.calculator.growthLabel}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs text-sm">{copy.tooltips.growthRate}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <SliderInput
                      value={growthRate}
                      onChange={setGrowthRate}
                      min={0.01}
                      max={0.30}
                      step={0.01}
                      formatValue={formatGrowth}
                      helperText={copy.calculator.growthHelper}
                      data-testid="growth-slider"
                    />
                  </div>

                  {/* Stage Selector */}
                  <div>
                    <p className="type-label text-[#A1A1AA] mb-3">YOUR STAGE</p>
                    <div className="flex gap-2">
                      {Object.values(STAGES).map((stage) => (
                        <button
                          key={stage}
                          onClick={() => setSelectedStage(stage)}
                          className={cn(
                            'flex-1 py-2 px-3 rounded-lg text-xs font-medium',
                            'border transition-all',
                            selectedStage === stage
                              ? 'bg-[#09090B] text-white border-[#09090B]'
                              : 'bg-white text-[#52525B] border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)]'
                          )}
                          data-testid={`stage-${stage}`}
                        >
                          {getStageName(stage)}
                        </button>
                      ))}
                    </div>
                  </div>
                </CenturionCardContent>
              </CenturionCard>

              {/* Sensitivity Card */}
              {projection.sensitivity.monthsGained && (
                <CenturionCard className="bg-[#F4F4F5]">
                  <CenturionCardContent>
                    <p className="type-label text-[#A1A1AA] mb-2">
                      {copy.calculator.sensitivity}
                    </p>
                    <p className="text-sm text-[#52525B]">
                      {copy.calculator.sensitivityResult}{' '}
                      <span className="font-mono font-semibold text-[#09090B] tabular-nums">
                        {projection.sensitivity.monthsGained}
                      </span>{' '}
                      {copy.calculator.monthsEarlier}
                    </p>
                  </CenturionCardContent>
                </CenturionCard>
              )}
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Result Card */}
              <CenturionCard>
                <CenturionCardContent className="p-8">
                  <p className="type-label text-[#A1A1AA] mb-6">
                    {copy.calculator.resultTitle}
                  </p>

                  {/* Target Date Hero */}
                  {targetDate ? (
                    <div className="mb-8">
                      <motion.div
                        key={targetDate}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-baseline gap-3"
                      >
                        <span className="font-mono text-4xl md:text-5xl font-bold text-[#09090B] tabular-nums" data-testid="target-date">
                          {formatDate(targetDate)}
                        </span>
                      </motion.div>
                      <p className="text-sm text-[#52525B] mt-2">
                        {copy.calculator.milestoneReached} ₹100 Crore {copy.calculator.byDate} this date
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                          <span className="font-mono text-sm tabular-nums">
                            {monthsToTarget} {copy.calculator.monthsAway}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#A1A1AA]" strokeWidth={1.5} />
                          <span className="font-mono text-sm tabular-nums">
                            {Math.floor(monthsToTarget / 12)} {copy.calculator.yearsAway}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-8">
                      <p className="text-lg text-[#52525B]">
                        At your current growth rate, reaching ₹100 Crore would take over 10 years.
                        Try increasing your growth rate.
                      </p>
                    </div>
                  )}

                  {/* Chart */}
                  <div className="h-[300px] -mx-2" data-testid="projection-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#A1A1AA' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tickFormatter={(v) => v >= CRORE ? `${(v / CRORE).toFixed(0)}Cr` : `${(v / LAKH).toFixed(0)}L`}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#A1A1AA' }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: '#09090B',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                          labelStyle={{ color: '#A1A1AA', fontSize: 11 }}
                          itemStyle={{ color: '#FFFFFF', fontSize: 12 }}
                          formatter={(value) => [formatCrore(value), '']}
                        />
                        {/* 100Cr line */}
                        <ReferenceLine
                          y={100 * CRORE}
                          stroke="rgba(0,0,0,0.2)"
                          strokeDasharray="5 5"
                        />
                        {/* Benchmark line */}
                        <Line
                          type="monotone"
                          dataKey="benchmarkARR"
                          stroke="rgba(0,0,0,0.15)"
                          strokeDasharray="3 3"
                          strokeWidth={1.5}
                          dot={false}
                          name="Median growth"
                        />
                        {/* Main projection line */}
                        <Line
                          type="monotone"
                          dataKey="arr"
                          stroke="#09090B"
                          strokeWidth={2}
                          dot={false}
                          name="Your projection"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#09090B]" />
                      <span className="text-xs text-[#A1A1AA]">Your path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[rgba(0,0,0,0.15)]" style={{ borderBottom: '1px dashed' }} />
                      <span className="text-xs text-[#A1A1AA]">Median ({getStageName(selectedStage)})</span>
                    </div>
                  </div>
                </CenturionCardContent>
              </CenturionCard>

              {/* Milestone Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {projection.milestones.map((milestone, i) => (
                  <CenturionCard
                    key={milestone.value}
                    hover
                    className={cn(
                      milestone.reached && 'bg-[#F4F4F5]'
                    )}
                  >
                    <CenturionCardContent className="text-center py-5">
                      <p className="font-mono text-lg font-semibold text-[#09090B] tabular-nums mb-1">
                        {milestone.label}
                      </p>
                      {milestone.date ? (
                        <p className="text-xs text-[#52525B]">
                          {formatDate(milestone.date)}
                        </p>
                      ) : milestone.reached ? (
                        <p className="text-xs text-[#52525B]">Reached</p>
                      ) : (
                        <p className="text-xs text-[#A1A1AA]">10+ years</p>
                      )}
                    </CenturionCardContent>
                  </CenturionCard>
                ))}
              </div>

              {/* Benchmark Card */}
              <CenturionCard id="benchmarks">
                <CenturionCardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="type-label text-[#A1A1AA] mb-1">{copy.benchmarks.title}</p>
                      <p className="text-sm text-[#52525B]">{getStageName(selectedStage)} founders</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-[#09090B]" strokeWidth={1.5} />
                  </div>

                  <div className="space-y-4">
                    {/* Your growth */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#09090B] font-medium">{copy.benchmarks.yourGrowth}</span>
                        <span className="font-mono text-sm font-semibold tabular-nums">{formatPercent(growthRate)}</span>
                      </div>
                      <div className="h-2.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#09090B] rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(growthRate / 0.25 * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Median */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#A1A1AA]">{copy.benchmarks.median}</span>
                        <span className="font-mono text-sm text-[#A1A1AA] tabular-nums">
                          {formatPercent(benchmarkResult.benchmark.median)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[rgba(0,0,0,0.2)] rounded-full"
                          style={{ width: `${benchmarkResult.benchmark.median / 0.25 * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Top 25% */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#A1A1AA]">{copy.benchmarks.top25}</span>
                        <span className="font-mono text-sm text-[#A1A1AA] tabular-nums">
                          {formatPercent(benchmarkResult.benchmark.p75)}
                        </span>
                      </div>
                      <div className="h-2.5 bg-[#F4F4F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[rgba(0,0,0,0.15)] rounded-full"
                          style={{ width: `${benchmarkResult.benchmark.p75 / 0.25 * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Percentile result */}
                    <div className="pt-4 border-t border-[rgba(0,0,0,0.06)]">
                      <p className="text-sm" data-testid="percentile-result">
                        <span className="text-[#09090B] font-medium">
                          {copy.benchmarks.percentile} {benchmarkResult.percentile}%
                        </span>{' '}
                        <span className="text-[#52525B]">{copy.benchmarks.ofFounders}</span>
                      </p>
                    </div>
                  </div>
                </CenturionCardContent>
              </CenturionCard>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  className={cn(
                    'flex items-center gap-2 h-10 px-5 rounded-lg',
                    'bg-white border border-[rgba(0,0,0,0.1)]',
                    'text-sm text-[#52525B]',
                    'hover:border-[rgba(0,0,0,0.2)] transition-colors'
                  )}
                  data-testid="share-button"
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
                  Share projection
                </button>
                <button
                  className={cn(
                    'flex items-center gap-2 h-10 px-5 rounded-lg',
                    'bg-white border border-[rgba(0,0,0,0.1)]',
                    'text-sm text-[#52525B]',
                    'hover:border-[rgba(0,0,0,0.2)] transition-colors'
                  )}
                  data-testid="download-button"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HundredCrCalculator;
