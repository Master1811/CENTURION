'use client';

import { Activity, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCurrency } from '@/lib/utils';

export default function CashFlowPage() {
  const metrics = {
    inflow: 850000,
    outflow: 620000,
    netFlow: 230000,
    runway: 8,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Cash Flow Radar</h1>
        <p className="text-white/60 mt-1">Monitor your cash flow in real-time</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <p className="text-sm text-white/60">Cash Inflow</p>
            </div>
            <p className="text-2xl font-bold text-green-400 tabular-nums">
              {formatCurrency(metrics.inflow, true)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <p className="text-sm text-white/60">Cash Outflow</p>
            </div>
            <p className="text-2xl font-bold text-red-400 tabular-nums">
              {formatCurrency(metrics.outflow, true)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <p className="text-sm text-white/60">Net Cash Flow</p>
            </div>
            <p className="text-2xl font-bold text-cyan-400 tabular-nums">
              {formatCurrency(metrics.netFlow, true)}
            </p>
          </CenturionCardContent>
        </CenturionCard>

        <CenturionCard>
          <CenturionCardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-white/60">Runway</p>
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">
              {metrics.runway} months
            </p>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle>Cash Flow Trend</CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="h-64 flex items-center justify-center text-white/40">
            <p>Connect your accounting software to see cash flow trends</p>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

