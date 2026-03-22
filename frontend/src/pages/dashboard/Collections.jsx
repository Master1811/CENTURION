import React from 'react'
import { MessageSquare } from 'lucide-react'
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard'

export const Collections = () => (
  <div className="space-y-6">
    <div>
      <h1 className="type-title text-[#09090B] mb-1">
        Collections
      </h1>
      <p className="type-body text-[#52525B]">
        AI-drafted follow-ups for overdue invoices
      </p>
    </div>
    <CenturionCard>
      <CenturionCardContent className="p-8 flex flex-col items-center text-center gap-4">
        <MessageSquare className="w-12 h-12 text-[#A1A1AA]" strokeWidth={1} />
        <p className="font-medium text-[#09090B]">
          AI Collections Agent coming soon
        </p>
        <p className="text-sm text-[#52525B] max-w-md">
          Select any overdue invoice and get an AI-drafted WhatsApp and email follow-up
          personalised to your client relationship. Polite on day 1. Firm on day 30.
        </p>
      </CenturionCardContent>
    </CenturionCard>
  </div>
)

export default Collections
