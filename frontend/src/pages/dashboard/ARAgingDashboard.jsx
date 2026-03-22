import React from 'react'
import { Clock } from 'lucide-react'
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard'

export const ARAgingDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="type-title text-[#09090B] mb-1">
        AR Aging
      </h1>
      <p className="type-body text-[#52525B]">
        Who owes you money and how overdue
      </p>
    </div>
    <CenturionCard>
      <CenturionCardContent className="p-8 flex flex-col items-center text-center gap-4">
        <Clock className="w-12 h-12 text-[#A1A1AA]" strokeWidth={1} />
        <p className="font-medium text-[#09090B]">
          AR Aging dashboard coming soon
        </p>
        <p className="text-sm text-[#52525B] max-w-md">
          Connect your invoice data via Razorpay or upload a Tally export to see your
          full AR aging report with Verified and Self-Reported badges.
        </p>
      </CenturionCardContent>
    </CenturionCard>
  </div>
)

export default ARAgingDashboard
