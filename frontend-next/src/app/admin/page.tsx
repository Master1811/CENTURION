'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  RefreshCw,
  Shield,
  UserPlus,
  Activity,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

// Admin-only page
export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    paidUsers: 0,
    betaUsers: 0,
    totalMRR: 0,
    waitlistCount: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
      return;
    }

    // Check if admin
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (user?.email && adminEmails.includes(user.email.toLowerCase())) {
      setIsAdmin(true);
      // Fetch admin stats here
      setStats({
        totalUsers: 127,
        activeUsers: 89,
        paidUsers: 23,
        betaUsers: 50,
        totalMRR: 92000,
        waitlistCount: 342,
      });
    } else if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-centurion-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-centurion-dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-cyan-400" />
              Admin Dashboard
            </h1>
            <p className="text-white/60 mt-1">Platform management and analytics</p>
          </div>
          <Button variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              <p className="text-xs text-white/50">Total Users</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
              <p className="text-xs text-white/50">Active Users</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <CreditCard className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.paidUsers}</p>
              <p className="text-xs text-white/50">Paid Users</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <Shield className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.betaUsers}</p>
              <p className="text-xs text-white/50">Beta Users</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalMRR, true)}</p>
              <p className="text-xs text-white/50">Monthly MRR</p>
            </CenturionCardContent>
          </CenturionCard>

          <CenturionCard>
            <CenturionCardContent className="pt-6 text-center">
              <UserPlus className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.waitlistCount}</p>
              <p className="text-xs text-white/50">Waitlist</p>
            </CenturionCardContent>
          </CenturionCard>
        </div>

        {/* Admin Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Beta Management */}
          <CenturionCard>
            <CenturionCardHeader>
              <CenturionCardTitle>Beta User Management</CenturionCardTitle>
            </CenturionCardHeader>
            <CenturionCardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-white/60 mb-3">Grant beta access to a user (60 days)</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="user@email.com"
                      className="centurion-input flex-1"
                    />
                    <Button>Grant Access</Button>
                  </div>
                </div>
                <p className="text-sm text-white/40">
                  Beta users get full dashboard access without payment for the specified duration.
                </p>
              </div>
            </CenturionCardContent>
          </CenturionCard>

          {/* Quick Actions */}
          <CenturionCard>
            <CenturionCardHeader>
              <CenturionCardTitle>Quick Actions</CenturionCardTitle>
            </CenturionCardHeader>
            <CenturionCardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span>View All Users</span>
                </Button>
                <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Transactions</span>
                </Button>
                <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
                  <Settings className="w-5 h-5" />
                  <span>Feature Flags</span>
                </Button>
                <Button variant="secondary" className="h-auto py-4 flex-col gap-2">
                  <Activity className="w-5 h-5" />
                  <span>System Health</span>
                </Button>
              </div>
            </CenturionCardContent>
          </CenturionCard>
        </div>

        {/* Recent Activity */}
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle>Recent Activity</CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="text-center py-8 text-white/40">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Activity log will appear here</p>
            </div>
          </CenturionCardContent>
        </CenturionCard>
      </div>
    </div>
  );
}

