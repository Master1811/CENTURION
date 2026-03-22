import React from 'react'
import { Upload, Activity } from 'lucide-react'
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard'

export const CashFlowRadar = () => (
  <div className="space-y-6">
    <div>
      <h1 className="type-title text-[#09090B] mb-1">
        Cash Flow Radar
      </h1>
      <p className="type-body text-[#52525B]">
        See exactly when your cash runs out
      </p>
    </div>

    <CenturionCard>
      <CenturionCardContent className="p-8 flex flex-col items-center text-center gap-4">
        <Activity className="w-12 h-12 text-[#A1A1AA]" strokeWidth={1} />
        <div>
          <p className="font-medium text-[#09090B] mb-2">
            Connect your data to see your 90-day cash position
          </p>
          <p className="text-sm text-[#52525B] mb-6 max-w-md">
            Drop your Tally export or connect Razorpay to instantly see your
            cash flow radar and know which invoices to chase this week.
          </p>
          <button
            onClick={() => alert('Tally upload coming in next update')}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#09090B] text-white text-sm font-medium mx-auto"
          >
            <Upload className="w-4 h-4" strokeWidth={1.5} />
            Drop Tally PDF or CSV
          </button>
        </div>
      </CenturionCardContent>
    </CenturionCard>
  </div>
)

export default CashFlowRadar
