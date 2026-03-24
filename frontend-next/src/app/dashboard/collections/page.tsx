'use client';

import { MessageCircle, Mail, Phone, CheckCircle, Clock } from 'lucide-react';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const PENDING_COLLECTIONS = [
  { id: '1', client: 'TechCorp Solutions', amount: 125000, dueDate: '2026-03-10', daysPast: 14 },
  { id: '2', client: 'Digital Ventures', amount: 85000, dueDate: '2026-03-15', daysPast: 9 },
  { id: '3', client: 'StartupX Labs', amount: 45000, dueDate: '2026-03-20', daysPast: 4 },
];

export default function CollectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Collections</h1>
        <p className="text-white/60 mt-1">Manage overdue invoices and follow-ups</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
          <Mail className="w-5 h-5" />
          <span>Send Reminders</span>
        </Button>
        <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
          <Phone className="w-5 h-5" />
          <span>Call List</span>
        </Button>
        <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp</span>
        </Button>
      </div>

      {/* Pending Collections */}
      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Pending Collections
          </CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="space-y-4">
            {PENDING_COLLECTIONS.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{item.client}</p>
                    <p className="text-sm text-white/50">Due: {item.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white tabular-nums">
                      {formatCurrency(item.amount, true)}
                    </p>
                    <p className="text-sm text-amber-400">{item.daysPast} days overdue</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button size="sm" className="flex-1">
                    <CheckCircle className="w-4 h-4" />
                    Mark Paid
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

