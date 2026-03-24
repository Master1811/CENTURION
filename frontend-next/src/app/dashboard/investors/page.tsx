'use client';
import { Users, Mail, Plus, ExternalLink } from 'lucide-react';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';

export default function InvestorsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-white'>Investor Relations</h1>
        <p className='text-white/60 mt-1'>Manage investor communications</p>
      </div>
      <CenturionCard>
        <CenturionCardContent className='pt-6'>
          <div className='text-center py-8 text-white/40'>
            <Users className='w-12 h-12 mx-auto mb-3 opacity-50' />
            <p>No investors added yet</p>
            <Button variant='secondary' size='sm' className='mt-3'>Add Investor</Button>
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}
