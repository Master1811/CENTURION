'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Building, CreditCard, Shield, Bell, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile, useDeleteAccount } from '@/hooks/useApi';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { profile, subscription, signOut } = useAuth();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: profile?.name || profile?.full_name || '',
    company_name: profile?.company_name || profile?.company || '',
    website: profile?.website || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success('Account deleted');
      await signOut();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/60 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <CenturionCard className="lg:col-span-1 h-fit">
          <CenturionCardContent className="py-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </CenturionCardContent>
        </CenturionCard>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CenturionCard>
                <CenturionCardHeader>
                  <CenturionCardTitle>Profile Information</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="centurion-input"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="centurion-input opacity-50"
                      />
                      <p className="text-xs text-white/40 mt-1">Email cannot be changed</p>
                    </div>
                    <Button onClick={handleSave} loading={updateProfile.isPending}>
                      Save Changes
                    </Button>
                  </div>
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CenturionCard>
                <CenturionCardHeader>
                  <CenturionCardTitle>Company Information</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Company Name</label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="centurion-input"
                        placeholder="Your company"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Website</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="centurion-input"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                    <Button onClick={handleSave} loading={updateProfile.isPending}>
                      Save Changes
                    </Button>
                  </div>
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CenturionCard>
                <CenturionCardHeader>
                  <CenturionCardTitle>Subscription</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Free'} Plan
                        </p>
                        <p className="text-sm text-white/50">
                          {subscription?.status === 'active' ? 'Active' : 'No active subscription'}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm">
                        {subscription?.status === 'active' ? 'Manage' : 'Upgrade'}
                      </Button>
                    </div>
                  </div>
                  {subscription?.expires_at && (
                    <p className="text-sm text-white/50">
                      Renews on {new Date(subscription.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CenturionCard>
                <CenturionCardHeader>
                  <CenturionCardTitle>Notification Preferences</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <div className="space-y-4">
                    {[
                      { id: 'email_weekly', label: 'Weekly Summary Email' },
                      { id: 'email_checkin', label: 'Check-in Reminders' },
                      { id: 'email_insights', label: 'AI Insights' },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10">
                        <span className="text-white">{item.label}</span>
                        <input type="checkbox" defaultChecked className="accent-cyan-500" />
                      </label>
                    ))}
                  </div>
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <CenturionCard>
                <CenturionCardHeader>
                  <CenturionCardTitle>Security Settings</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <p className="text-white/60 mb-4">
                    Your account uses passwordless authentication via magic links and OAuth.
                  </p>
                  <Button variant="secondary">
                    View Login History
                  </Button>
                </CenturionCardContent>
              </CenturionCard>

              {/* Danger Zone */}
              <CenturionCard className="border-red-500/20">
                <CenturionCardHeader>
                  <CenturionCardTitle className="text-red-400">Danger Zone</CenturionCardTitle>
                </CenturionCardHeader>
                <CenturionCardContent>
                  <p className="text-white/60 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 mb-4">Are you absolutely sure? This action cannot be undone.</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} loading={deleteAccount.isPending}>
                          Yes, Delete My Account
                        </Button>
                      </div>
                    </div>
                  )}
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

