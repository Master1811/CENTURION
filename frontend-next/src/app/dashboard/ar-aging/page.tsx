'use client';

import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { formatCurrency } from '@/lib/utils';

const AGING_DATA = [
  { bucket: 'Current', amount: 350000, count: 12, color: 'text-green-400', bg: 'bg-green-500/10' },
  { bucket: '1-30 Days', amount: 150000, count: 8, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { bucket: '31-60 Days', amount: 75000, count: 4, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { bucket: '61-90 Days', amount: 25000, count: 2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { bucket: '90+ Days', amount: 15000, count: 1, color: 'text-red-400', bg: 'bg-red-500/10' },
];

export default function ARAgingPage() {
  const totalAR = AGING_DATA.reduce((sum, bucket) => sum + bucket.amount, 0);
  const totalInvoices = AGING_DATA.reduce((sum, bucket) => sum + bucket.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AR Aging Dashboard</h1>
        <p className="text-white/60 mt-1">Track accounts receivable by age</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <CenturionCard>
          <CenturionCardContent className="pt-6 text-center">
            <p className="text-sm text-white/60">Total AR</p>
            <p className="text-2xl font-bold text-white tabular-nums">{formatCurrency(totalAR, true)}</p>
          </CenturionCardContent>
        </CenturionCard>
        <CenturionCard>
          <CenturionCardContent className="pt-6 text-center">
            <p className="text-sm text-white/60">Open Invoices</p>
            <p className="text-2xl font-bold text-white">{totalInvoices}</p>
          </CenturionCardContent>
        </CenturionCard>
        <CenturionCard>
          <CenturionCardContent className="pt-6 text-center">
            <p className="text-sm text-white/60">Average DSO</p>
            <p className="text-2xl font-bold text-white">32 days</p>
          </CenturionCardContent>
        </CenturionCard>
      </div>

      {/* Aging Buckets */}
      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Aging Breakdown
          </CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="space-y-3">
            {AGING_DATA.map((bucket) => (
              <div key={bucket.bucket} className={`p-4 rounded-lg ${bucket.bg} border border-white/10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-semibold ${bucket.color}`}>{bucket.bucket}</p>
                    <p className="text-sm text-white/50">{bucket.count} invoices</p>
                  </div>
                  <p className={`text-xl font-bold tabular-nums ${bucket.color}`}>
                    {formatCurrency(bucket.amount, true)}
                  </p>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bucket.color.replace('text-', 'bg-')}`}
                    style={{ width: `${(bucket.amount / totalAR) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

