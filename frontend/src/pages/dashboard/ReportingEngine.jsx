// Reporting Engine Dashboard
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Clock, Sparkles, Lock, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';

// Mock reports data
const reports = [
  { 
    id: 1, 
    type: 'board', 
    title: 'January 2025 Board Report', 
    date: '2025-02-05', 
    status: 'ready',
    preview: 'Revenue grew 20% MoM to ₹4.2L. Key wins: 12 new customers, reduced churn by 1.5%.'
  },
  { 
    id: 2, 
    type: 'board', 
    title: 'December 2024 Board Report', 
    date: '2025-01-05', 
    status: 'ready',
    preview: 'Strong December with 18% growth. Launched v2.0 of core product.'
  },
  { 
    id: 3, 
    type: 'strategy', 
    title: 'Q1 2025 Growth Strategy', 
    date: '2025-01-15', 
    status: 'ready',
    preview: 'Focus areas: Reduce churn to 4%, expand ARPU by 15%, hit ₹6L MRR.'
  },
];

const reportTypes = [
  { 
    key: 'board', 
    name: copy.dashboard.reporting.boardReport, 
    description: 'AI-generated monthly summary for your board',
    limit: '2 per month',
    used: 1,
    total: 2,
  },
  { 
    key: 'investor', 
    name: copy.dashboard.reporting.investorUpdate, 
    description: 'Shareable update for investors',
    limit: 'Unlimited',
    used: null,
    total: null,
  },
  { 
    key: 'strategy', 
    name: copy.dashboard.reporting.strategyBrief, 
    description: 'Quarterly growth recommendations',
    limit: '1 per month',
    used: 1,
    total: 1,
  },
  { 
    key: 'dataroom', 
    name: copy.dashboard.reporting.dataRoom, 
    description: 'Export key metrics for due diligence',
    limit: 'Unlimited',
    used: null,
    total: null,
  },
  { 
    key: 'annual', 
    name: copy.dashboard.reporting.annualReview, 
    description: 'Year in review with projections',
    limit: '1 per year',
    used: 0,
    total: 1,
  },
];

export const ReportingEngine = () => {
  const [generating, setGenerating] = useState(null);

  const handleGenerate = async (type) => {
    setGenerating(type);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(null);
  };

  return (
    <div className="space-y-6" data-testid="reporting-engine">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.reporting.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.reporting.subtitle}
        </p>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <CenturionCard key={report.key} hover>
            <CenturionCardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#F4F4F5]">
                  <FileText className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                </div>
                {report.total !== null && (
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    report.used >= report.total 
                      ? 'bg-red-50 text-red-600'
                      : 'bg-[#F4F4F5] text-[#52525B]'
                  )}>
                    {report.used}/{report.total} used
                  </span>
                )}
              </div>
              <h3 className="font-medium text-[#09090B] mb-1">{report.name}</h3>
              <p className="text-xs text-[#71717A] mb-4">{report.description}</p>
              <button
                onClick={() => handleGenerate(report.key)}
                disabled={generating === report.key || (report.total !== null && report.used >= report.total)}
                className={cn(
                  'w-full h-9 rounded-lg text-sm font-medium',
                  'flex items-center justify-center gap-2',
                  'transition-all duration-150',
                  report.total !== null && report.used >= report.total
                    ? 'bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed'
                    : 'bg-[#09090B] text-white hover:bg-[#18181B]'
                )}
              >
                {generating === report.key ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    </motion.div>
                    Generating...
                  </>
                ) : report.total !== null && report.used >= report.total ? (
                  <>
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                    Limit reached
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    Generate
                  </>
                )}
              </button>
            </CenturionCardContent>
          </CenturionCard>
        ))}
      </div>

      {/* Recent Reports */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <h3 className="font-medium text-[#09090B] mb-6">Recent Reports</h3>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border border-[rgba(0,0,0,0.06)]',
                  'hover:bg-[rgba(0,0,0,0.02)] transition-colors cursor-pointer'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  report.type === 'board' && 'bg-blue-50',
                  report.type === 'strategy' && 'bg-amber-50',
                  report.type === 'investor' && 'bg-emerald-50'
                )}>
                  <FileText className={cn(
                    'w-4 h-4',
                    report.type === 'board' && 'text-blue-600',
                    report.type === 'strategy' && 'text-amber-600',
                    report.type === 'investor' && 'text-emerald-600'
                  )} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-[#09090B] truncate">{report.title}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-xs text-emerald-600">
                      <Check className="w-3 h-3" strokeWidth={2} />
                      Ready
                    </span>
                  </div>
                  <p className="text-sm text-[#71717A] mb-2 line-clamp-2">{report.preview}</p>
                  <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1.5} />
                      {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors">
                    <Download className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors">
                    <ArrowRight className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Next Auto-Report */}
      <CenturionCard className="bg-[#F4F4F5]">
        <CenturionCardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white">
              <Clock className="w-5 h-5 text-[#52525B]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#09090B]">
                Next auto-generated board report on February 5th
              </p>
              <p className="text-xs text-[#71717A] mt-1">
                We'll automatically generate your monthly board report on the 5th of each month using Claude Sonnet.
              </p>
            </div>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default ReportingEngine;
