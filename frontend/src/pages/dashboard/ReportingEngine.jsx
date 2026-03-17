// Reporting Engine Dashboard
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Clock, Sparkles, Lock, Check, ArrowRight, Loader2, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { useAuth } from '@/context/AuthContext';
import { generateBoardReport, generateStrategyBrief, fetchAIUsage } from '@/lib/api/dashboard';
import { formatCrore, CRORE, LAKH } from '@/lib/engine/constants';

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
  const { getAccessToken } = useAuth();
  const [generating, setGenerating] = useState(null);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const result = await fetchAIUsage(token);
          setUsage(result);
        }
      } catch (err) {
        console.error('Failed to load AI usage:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [getAccessToken]);

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      const token = getAccessToken();
      if (token) {
        let result;
        if (type === 'board') {
          result = await generateBoardReport(token, {});
        } else if (type === 'strategy') {
          result = await generateStrategyBrief(token, {});
        }
        
        if (result) {
          const newReport = {
            id: Date.now(),
            type,
            title: result.title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            date: new Date().toISOString().split('T')[0],
            status: 'ready',
            preview: result.executive_summary || result.situation_analysis || 'Report generated successfully.',
            content: result
          };
          setReports(prev => [newReport, ...prev]);
        }
      }
    } catch (err) {
      console.error(`Failed to generate ${type} report:`, err);
      // Show error to user
    } finally {
      setGenerating(null);
    }
  };

  // PDF Export function using browser print
  const handleExportPDF = (report) => {
    setSelectedReport(report);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Get updated report types with live usage
  const getReportTypes = () => [
    { 
      key: 'board', 
      name: copy.dashboard.reporting.boardReport, 
      description: 'AI-generated monthly summary for your board',
      limit: '2 per month',
      used: usage?.board_reports_used || 0,
      total: usage?.board_reports_limit || 2,
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
      used: usage?.strategy_briefs_used || 0,
      total: usage?.strategy_briefs_limit || 1,
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

  const reportTypes = getReportTypes();

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
          {reports.length === 0 ? (
            <div className="text-center py-8 text-[#71717A]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" strokeWidth={1.5} />
              <p className="text-sm">No reports generated yet.</p>
              <p className="text-xs mt-1">Generate your first report above!</p>
            </div>
          ) : (
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
                    <button 
                      onClick={() => handleExportPDF(report)}
                      className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
                      title="Export as PDF"
                    >
                      <FileDown className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            ref={reportRef}
            className="w-full max-w-3xl max-h-[80vh] overflow-auto bg-white rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Print-friendly header */}
            <div className="p-8 print:p-4">
              <div className="flex items-center justify-between mb-6 print:hidden">
                <h2 className="text-xl font-bold text-[#09090B]">{selectedReport.title}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportPDF(selectedReport)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#09090B] text-white text-sm font-medium hover:bg-[#18181B]"
                  >
                    <FileDown className="w-4 h-4" strokeWidth={1.5} />
                    Export PDF
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 rounded-lg hover:bg-[#F4F4F5]"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="prose prose-sm max-w-none">
                <div className="print:block hidden mb-8">
                  <h1 className="text-2xl font-bold">{selectedReport.title}</h1>
                  <p className="text-gray-500">{new Date(selectedReport.date).toLocaleDateString()}</p>
                </div>

                {selectedReport.content?.executive_summary && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#09090B] mb-2">Executive Summary</h3>
                    <p className="text-[#52525B]">{selectedReport.content.executive_summary}</p>
                  </div>
                )}

                {selectedReport.content?.key_metrics && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#09090B] mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReport.content.key_metrics.map((metric, i) => (
                        <div key={i} className="p-3 bg-[#F9FAFB] rounded-lg">
                          <p className="text-xs text-[#71717A]">{metric.label}</p>
                          <p className="font-mono font-bold text-[#09090B]">{metric.value}</p>
                          {metric.change && (
                            <p className={cn(
                              'text-xs',
                              metric.change > 0 ? 'text-emerald-600' : 'text-red-600'
                            )}>
                              {metric.change > 0 ? '+' : ''}{metric.change}% MoM
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedReport.content?.highlights && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#09090B] mb-2">Highlights</h3>
                    <ul className="space-y-2">
                      {selectedReport.content.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#52525B]">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5" strokeWidth={2} />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.content?.next_month_priorities && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-[#09090B] mb-2">Next Month Priorities</h3>
                    <ul className="space-y-2">
                      {selectedReport.content.next_month_priorities.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#52525B]">
                          <span className="w-5 h-5 rounded-full bg-[#09090B] text-white text-xs flex items-center justify-center">{i + 1}</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fallback for raw preview */}
                {!selectedReport.content?.executive_summary && (
                  <p className="text-[#52525B]">{selectedReport.preview}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            visibility: visible !important;
            display: block !important;
          }
          [ref="reportRef"], [ref="reportRef"] * {
            visibility: visible;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportingEngine;
