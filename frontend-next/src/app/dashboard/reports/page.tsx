'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Mail, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { useGenerateBoardReport } from '@/hooks/useApi';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

const REPORT_TEMPLATES = [
  {
    id: 'board-update',
    name: 'Monthly Board Update',
    description: 'Executive summary for board members and investors',
    icon: FileText,
  },
  {
    id: 'investor-update',
    name: 'Investor Update',
    description: 'Shareable progress report for existing investors',
    icon: Mail,
  },
  {
    id: 'quarterly-review',
    name: 'Quarterly Review',
    description: 'Comprehensive quarterly business review',
    icon: Calendar,
  },
];

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('board-update');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const generateReport = useGenerateBoardReport();

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync(selectedMonth);
      setGeneratedReport(result.report);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleCopy = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      toast.success('Report copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-report-${selectedMonth}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reporting Engine</h1>
        <p className="text-white/60 mt-1">Generate AI-powered reports for stakeholders</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Report Templates</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-3">
              {REPORT_TEMPLATES.map((template) => (
                <motion.button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <template.icon className={`w-5 h-5 mt-0.5 ${
                      selectedTemplate === template.id ? 'text-cyan-400' : 'text-white/50'
                    }`} />
                    <div>
                      <p className={`font-semibold ${
                        selectedTemplate === template.id ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {template.name}
                      </p>
                      <p className="text-sm text-white/50">{template.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>

        {/* Configuration & Generate */}
        <CenturionCard className="lg:col-span-2">
          <CenturionCardHeader>
            <CenturionCardTitle>Generate Report</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-6">
              {/* Month Selection */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Report Period</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="centurion-input max-w-xs"
                />
              </div>

              {/* What's Included */}
              <div>
                <p className="text-sm text-white/60 mb-3">What's Included</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Revenue Summary',
                    'Growth Analysis',
                    'Key Metrics',
                    'Milestone Progress',
                    'Challenges & Wins',
                    'Next Steps',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                loading={generateReport.isPending}
                className="w-full"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <CenturionCard>
          <CenturionCardHeader>
            <div className="flex items-center justify-between">
              <CenturionCardTitle>Generated Report</CenturionCardTitle>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
                <Button variant="secondary" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="p-6 rounded-lg bg-white/5 border border-white/10 prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-white/80 font-sans">
                {generatedReport}
              </pre>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}

      {/* Past Reports */}
      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle>Report History</CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="text-center py-8 text-white/40">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first report above</p>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

