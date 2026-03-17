// Settings Dashboard
import React, { useState } from 'react';
import { User, Building, Bell, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';

export const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'Founder Name',
    email: 'founder@startup.com',
    company: 'Your Startup',
    stage: 'pre-seed',
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [benchmarkOptIn, setBenchmarkOptIn] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl" data-testid="settings">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">Settings</h1>
        <p className="type-body text-[#52525B]">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#F4F4F5]">
              <User className="w-5 h-5 text-[#52525B]" strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-[#09090B]">Profile</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#52525B] mb-1 block">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
              />
            </div>
            <div>
              <label className="text-sm text-[#52525B] mb-1 block">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm bg-[#F4F4F5] text-[#A1A1AA]"
              />
            </div>
            <div>
              <label className="text-sm text-[#52525B] mb-1 block">Company</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
              />
            </div>
            <div>
              <label className="text-sm text-[#52525B] mb-1 block">Funding Stage</label>
              <select
                value={profile.stage}
                onChange={(e) => setProfile({ ...profile, stage: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[#09090B]"
              >
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series-a">Series A</option>
              </select>
            </div>
          </div>

          <button className="mt-6 h-10 px-5 rounded-lg bg-[#09090B] text-white text-sm font-medium hover:bg-[#18181B] transition-colors">
            Save Changes
          </button>
        </CenturionCardContent>
      </CenturionCard>

      {/* Notifications */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#F4F4F5]">
              <Bell className="w-5 h-5 text-[#52525B]" strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-[#09090B]">Notifications</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium text-[#09090B]">Email Alerts</p>
                <p className="text-xs text-[#71717A]">Daily pulse, weekly questions, check-in reminders</p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={cn(
                  'w-11 h-6 rounded-full transition-colors',
                  emailAlerts ? 'bg-[#09090B]' : 'bg-[#E4E4E7]'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full bg-white shadow transition-transform',
                  emailAlerts ? 'translate-x-5' : 'translate-x-0.5'
                )} />
              </button>
            </label>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Privacy */}
      <CenturionCard>
        <CenturionCardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-[#F4F4F5]">
              <Shield className="w-5 h-5 text-[#52525B]" strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-[#09090B]">Privacy</h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#09090B]">Benchmark Opt-In</p>
              <p className="text-xs text-[#71717A]">Contribute anonymized data to help other founders</p>
            </div>
            <button
              onClick={() => setBenchmarkOptIn(!benchmarkOptIn)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors',
                benchmarkOptIn ? 'bg-[#09090B]' : 'bg-[#E4E4E7]'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-full bg-white shadow transition-transform',
                benchmarkOptIn ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </button>
          </label>
        </CenturionCardContent>
      </CenturionCard>

      {/* Danger Zone */}
      <CenturionCard className="border-red-200">
        <CenturionCardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-50">
              <Trash2 className="w-5 h-5 text-red-500" strokeWidth={1.5} />
            </div>
            <h3 className="font-medium text-red-600">Danger Zone</h3>
          </div>

          <p className="text-sm text-[#52525B] mb-4">
            Once you delete your account, there is no going back. All your data will be permanently deleted.
          </p>

          <button className="h-10 px-5 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors">
            Delete Account
          </button>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
};

export default Settings;
