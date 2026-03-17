// Investor Relations Dashboard
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Download, 
  Share2, 
  Copy, 
  Calendar, 
  TrendingUp, 
  PieChart,
  ArrowRight,
  Check,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { formatCrore, formatPercent, CRORE, LAKH } from '@/lib/engine/constants';

export const InvestorRelations = () => {
  const [copied, setCopied] = useState(false);
  
  // Dilution modeller state
  const [preMoneyVal, setPreMoneyVal] = useState(200000000); // ₹20 Cr
  const [raiseAmount, setRaiseAmount] = useState(50000000); // ₹5 Cr
  const [founderShares, setFounderShares] = useState(100);

  // Calculate dilution
  const postMoneyVal = preMoneyVal + raiseAmount;
  const dilutionPercent = (raiseAmount / postMoneyVal) * 100;
  const founderOwnership = ((100 - dilutionPercent) / 100) * founderShares;

  const shareUrl = 'https://100crengine.in/p/abc123';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Funding timeline
  const fundingTimeline = [
    { stage: 'Pre-Seed', amount: '₹50L - ₹2Cr', timeline: 'Now', status: 'current' },
    { stage: 'Seed', amount: '₹2Cr - ₹10Cr', timeline: 'Q3 2025', status: 'upcoming' },
    { stage: 'Series A', amount: '₹10Cr - ₹50Cr', timeline: 'Q1 2027', status: 'future' },
    { stage: 'Series B', amount: '₹50Cr - ₹150Cr', timeline: 'Q1 2028', status: 'future' },
  ];

  return (
    <div className="space-y-6" data-testid="investor-relations">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.investorRelations.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.investorRelations.subtitle}
        </p>
      </div>

      {/* Projection Pack */}
      <CenturionCard className="bg-[#09090B]">
        <CenturionCardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-white mb-2">
                {copy.dashboard.investorRelations.projectionPack}
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Share your revenue projection with potential investors
              </p>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-10 px-4 rounded-lg bg-white/10 flex items-center">
                  <span className="text-sm text-white/70 truncate">{shareUrl}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className={cn(
                    'h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all',
                    copied 
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-[#09090B] hover:bg-white/90'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-3">
                <button className="h-10 px-5 rounded-lg bg-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/20 transition-colors">
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  Download PDF
                </button>
                <button className="h-10 px-5 rounded-lg bg-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                  Preview
                </button>
              </div>
            </div>
            
            {/* Mini preview */}
            <div className="hidden md:block w-48 h-32 rounded-lg bg-white/10 p-3">
              <div className="text-[8px] text-white/50 mb-1">100Cr Engine Projection</div>
              <div className="font-mono text-lg text-white font-bold">₹100Cr</div>
              <div className="text-[10px] text-white/60">by March 2029</div>
              <div className="mt-2 h-10 bg-white/5 rounded" />
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Funding Timeline */}
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-6">
              {copy.dashboard.investorRelations.fundingTimeline}
            </h3>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-[#E4E4E7]" />
              
              <div className="space-y-6">
                {fundingTimeline.map((stage, i) => (
                  <div key={stage.stage} className="flex items-start gap-4">
                    <div className={cn(
                      'relative z-10 w-6 h-6 rounded-full flex items-center justify-center',
                      stage.status === 'current' && 'bg-[#09090B]',
                      stage.status === 'upcoming' && 'bg-white border-2 border-[#09090B]',
                      stage.status === 'future' && 'bg-white border-2 border-[#E4E4E7]'
                    )}>
                      {stage.status === 'current' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          'font-medium',
                          stage.status === 'future' ? 'text-[#A1A1AA]' : 'text-[#09090B]'
                        )}>
                          {stage.stage}
                        </h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          stage.status === 'current' && 'bg-emerald-50 text-emerald-600',
                          stage.status === 'upcoming' && 'bg-blue-50 text-blue-600',
                          stage.status === 'future' && 'bg-[#F4F4F5] text-[#A1A1AA]'
                        )}>
                          {stage.timeline}
                        </span>
                      </div>
                      <p className={cn(
                        'text-sm mt-1',
                        stage.status === 'future' ? 'text-[#A1A1AA]' : 'text-[#71717A]'
                      )}>
                        {stage.amount}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Dilution Modeller */}
        <CenturionCard>
          <CenturionCardContent className="p-6">
            <h3 className="font-medium text-[#09090B] mb-6">
              {copy.dashboard.investorRelations.dilutionModeller}
            </h3>
            
            <div className="space-y-6">
              <SliderInput
                label="Pre-money Valuation"
                value={preMoneyVal}
                onChange={setPreMoneyVal}
                min={10000000}
                max={1000000000}
                step={10000000}
                formatValue={(v) => formatCrore(v)}
              />
              
              <SliderInput
                label="Raise Amount"
                value={raiseAmount}
                onChange={setRaiseAmount}
                min={5000000}
                max={500000000}
                step={5000000}
                formatValue={(v) => formatCrore(v)}
              />
              
              <SliderInput
                label="Your Current Ownership"
                value={founderShares}
                onChange={setFounderShares}
                min={10}
                max={100}
                step={1}
                formatValue={(v) => `${v}%`}
              />

              <div className="pt-4 border-t border-[rgba(0,0,0,0.06)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#52525B]">Post-money Valuation</span>
                  <span className="font-mono font-semibold">{formatCrore(postMoneyVal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#52525B]">Dilution</span>
                  <span className="font-mono font-semibold text-amber-600">{dilutionPercent.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#52525B]">Your Ownership After</span>
                  <span className="font-mono font-semibold">{founderOwnership.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Quick Pitch Stats */}
      <CenturionCard className="bg-[#F4F4F5]">
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-4">Quick Pitch Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white">
              <p className="text-xs text-[#71717A] mb-1">Current ARR</p>
              <p className="font-mono text-xl font-bold text-[#09090B]">₹50.4L</p>
            </div>
            <div className="p-4 rounded-lg bg-white">
              <p className="text-xs text-[#71717A] mb-1">MoM Growth</p>
              <p className="font-mono text-xl font-bold text-emerald-600">+12%</p>
            </div>
            <div className="p-4 rounded-lg bg-white">
              <p className="text-xs text-[#71717A] mb-1">Path to ₹1Cr ARR</p>
              <p className="font-mono text-xl font-bold text-[#09090B]">5 mo</p>
            </div>
            <div className="p-4 rounded-lg bg-white">
              <p className="text-xs text-[#71717A] mb-1">Runway</p>
              <p className="font-mono text-xl font-bold text-[#09090B]">18 mo</p>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default InvestorRelations;
