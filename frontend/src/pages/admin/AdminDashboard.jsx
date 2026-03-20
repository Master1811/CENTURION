/**
 * Admin Control Panel Dashboard
 * ==============================
 * Centralized admin interface for monitoring, debugging, and managing the platform.
 * 
 * Features:
 * - Real-time system health monitoring
 * - User engagement metrics and analytics
 * - Habit engine job management
 * - Dedup cache inspection
 * - User management actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Mail, Clock, AlertTriangle, CheckCircle, 
  RefreshCw, Play, Pause, Eye, Settings, Database, Server,
  TrendingUp, Calendar, Zap, Shield, BarChart3, Bell,
  ChevronRight, ExternalLink, Search, Filter
} from 'lucide-react';

// Admin API endpoints
const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const { user, getAccessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [systemHealth, setSystemHealth] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [engagementStats, setEngagementStats] = useState(null);
  const [dedupStatus, setDedupStatus] = useState([]);
  const [schedulerJobs, setSchedulerJobs] = useState([]);
  
  // Fetch data helper
  const fetchWithAuth = useCallback(async (endpoint) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
  }, [getAccessToken]);
  
  // Load all admin data
  const loadAdminData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Fetch health check (public)
      const healthRes = await fetch(`${API_URL}/api/health`);
      const health = await healthRes.json();
      setSystemHealth(health);
      
      // Fetch admin-protected endpoints
      const [stats, engagement, dedup] = await Promise.all([
        fetchWithAuth('/api/admin/stats').catch(() => null),
        fetchWithAuth('/api/admin/engagement/stats').catch(() => ({ last_30_days: {}, total: 0 })),
        fetchWithAuth('/api/admin/dedup/status').catch(() => [])
      ]);
      
      setPlatformStats(stats);
      setEngagementStats(engagement);
      setDedupStatus(dedup);
      
      // Mock scheduler jobs (would come from backend in production)
      setSchedulerJobs([
        { id: 'monday_digest', name: 'Monday Morning Digest', schedule: 'Mon 8:00 AM IST', status: 'active', lastRun: null },
        { id: 'checkin_reminder', name: 'Check-in Reminder', schedule: '25th 10:00 AM IST', status: 'active', lastRun: null },
        { id: 'milestone_countdown', name: 'Milestone Countdown', schedule: 'Daily 9:00 AM IST', status: 'active', lastRun: null },
        { id: 'streak_protection', name: 'Streak Protection', schedule: 'Daily 6:00 PM IST', status: 'active', lastRun: null },
      ]);
      
    } catch (err) {
      console.error('Admin data load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchWithAuth]);
  
  // Trigger a job manually
  const triggerJob = async (jobId) => {
    try {
      const result = await fetchWithAuth(`/api/admin/trigger/${jobId}`);
      alert(`Job ${jobId} completed:\n${JSON.stringify(result, null, 2)}`);
      loadAdminData();
    } catch (err) {
      alert(`Failed to trigger job: ${err.message}`);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#B8962E] animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#09090B] text-white" data-testid="admin-dashboard">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0B0B10]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#B8962E]" />
                <h1 className="text-xl font-bold">Admin Control Panel</h1>
              </div>
              <span className="px-2 py-1 bg-[#B8962E]/20 text-[#B8962E] text-xs font-bold rounded-full">
                SUPERADMIN
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={loadAdminData}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                data-testid="admin-refresh-btn"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-200">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'engagement', label: 'Engagement', icon: TrendingUp },
            { id: 'scheduler', label: 'Scheduler', icon: Clock },
            { id: 'system', label: 'System', icon: Server },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#B8962E] text-black' 
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              data-testid={`admin-tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <HealthCard 
                title="API Status" 
                status={systemHealth?.status === 'ok' ? 'healthy' : 'error'}
                value={systemHealth?.status || 'Unknown'}
                icon={Server}
              />
              <HealthCard 
                title="Supabase" 
                status={systemHealth?.supabase === 'connected' ? 'healthy' : 'warning'}
                value={systemHealth?.supabase || 'Unknown'}
                icon={Database}
              />
              <HealthCard 
                title="Version" 
                status="info"
                value={systemHealth?.version || '---'}
                icon={Settings}
              />
              <HealthCard 
                title="Environment" 
                status="info"
                value={systemHealth?.environment || '---'}
                icon={Activity}
              />
            </div>
            
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Users" 
                value={platformStats?.total_users || 0}
                icon={Users}
                trend={null}
              />
              <StatCard 
                title="Active Subscriptions" 
                value={platformStats?.active_subscriptions || 0}
                icon={CheckCircle}
                trend={null}
              />
              <StatCard 
                title="Total Projections" 
                value={platformStats?.total_projections || 0}
                icon={TrendingUp}
                trend={null}
              />
              <StatCard 
                title="Total Check-ins" 
                value={platformStats?.total_checkins || 0}
                icon={Calendar}
                trend={null}
              />
            </div>
            
            {/* Quick Actions */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#B8962E]" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton 
                  label="Trigger Digest" 
                  onClick={() => triggerJob('digest')}
                  icon={Mail}
                />
                <QuickActionButton 
                  label="Check-in Reminder" 
                  onClick={() => triggerJob('checkin_reminder')}
                  icon={Bell}
                />
                <QuickActionButton 
                  label="Milestone Alert" 
                  onClick={() => triggerJob('milestone_countdown')}
                  icon={TrendingUp}
                />
                <QuickActionButton 
                  label="Streak Protection" 
                  onClick={() => triggerJob('streak_protection')}
                  icon={Shield}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="space-y-6">
            {/* Engagement Overview */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#B8962E]" />
                  Engagement Events (Last 30 Days)
                </h3>
                <span className="text-2xl font-bold text-[#B8962E]">
                  {engagementStats?.total || 0} total
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(engagementStats?.last_30_days || {}).map(([type, count]) => (
                  <div key={type} className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="text-sm text-zinc-400 mb-1">{formatEventType(type)}</div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                ))}
                {Object.keys(engagementStats?.last_30_days || {}).length === 0 && (
                  <div className="col-span-4 text-center text-zinc-500 py-8">
                    No engagement events in the last 30 days
                  </div>
                )}
              </div>
            </div>
            
            {/* Dedup Cache Status */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#B8962E]" />
                  Dedup Cache Status
                </h3>
                <span className="text-sm text-zinc-400">
                  {dedupStatus.length} entries
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-800">
                      <th className="pb-3 pr-4">Key</th>
                      <th className="pb-3 pr-4">Expires At</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dedupStatus.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="border-b border-zinc-800/50">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{item.key}</td>
                        <td className="py-3 pr-4 text-zinc-300">{new Date(item.expires_at).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.expired ? 'bg-zinc-800 text-zinc-500' : 'bg-green-900/50 text-green-400'
                          }`}>
                            {item.expired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {dedupStatus.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-zinc-500">
                          Dedup cache is empty
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#B8962E]" />
                Scheduled Jobs
              </h3>
              
              <div className="space-y-4">
                {schedulerJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'
                      }`} />
                      <div>
                        <div className="font-medium">{job.name}</div>
                        <div className="text-sm text-zinc-400">{job.schedule}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        job.status === 'active' 
                          ? 'bg-green-900/50 text-green-400' 
                          : 'bg-zinc-800 text-zinc-500'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                      <button
                        onClick={() => triggerJob(job.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#B8962E]/20 hover:bg-[#B8962E]/30 text-[#B8962E] rounded-lg text-sm font-medium transition-colors"
                        data-testid={`trigger-${job.id}`}
                      >
                        <Play className="w-3 h-3" />
                        Run Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Scalability Note</p>
                    <p className="text-blue-300/80">
                      The habit engine is designed to handle 10,000+ concurrent users with:
                      batched email sending (100/batch), parallel AI calls (50 concurrent),
                      and in-memory deduplication. For production, enable Redis for distributed dedup.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Configuration */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#B8962E]" />
                System Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConfigItem 
                  label="API Version" 
                  value={systemHealth?.version || '---'} 
                />
                <ConfigItem 
                  label="Environment" 
                  value={systemHealth?.environment || '---'} 
                />
                <ConfigItem 
                  label="Database" 
                  value={systemHealth?.supabase === 'connected' ? 'Supabase PostgreSQL' : 'Not connected'} 
                  status={systemHealth?.supabase === 'connected' ? 'success' : 'error'}
                />
                <ConfigItem 
                  label="Scheduler" 
                  value="APScheduler (Asia/Kolkata)" 
                  status="success"
                />
                <ConfigItem 
                  label="Email Service" 
                  value="Local Logging (DEV)" 
                  status="warning"
                />
                <ConfigItem 
                  label="Dedup Store" 
                  value="In-Memory" 
                  status="warning"
                />
              </div>
            </div>
            
            {/* Production Checklist */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#B8962E]" />
                Production Readiness Checklist
              </h3>
              
              <div className="space-y-3">
                <ChecklistItem checked={systemHealth?.supabase === 'connected'} label="Supabase connected" />
                <ChecklistItem checked={systemHealth?.status === 'ok'} label="API health check passing" />
                <ChecklistItem checked={false} label="Redis enabled for distributed dedup" />
                <ChecklistItem checked={false} label="Resend configured for email delivery" />
                <ChecklistItem checked={false} label="CORS restricted to production domains" />
                <ChecklistItem checked={false} label="Rate limiting enabled" />
                <ChecklistItem checked={false} label="Monitoring/alerting configured" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper Components
const HealthCard = ({ title, status, value, icon: Icon }) => {
  const statusColors = {
    healthy: 'bg-green-900/30 border-green-800/50 text-green-400',
    warning: 'bg-yellow-900/30 border-yellow-800/50 text-yellow-400',
    error: 'bg-red-900/30 border-red-800/50 text-red-400',
    info: 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300',
  };
  
  return (
    <div className={`rounded-xl border p-4 ${statusColors[status]}`} data-testid={`health-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-lg font-bold capitalize">{value}</div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4" data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-zinc-400">{title}</span>
      <Icon className="w-4 h-4 text-zinc-500" />
    </div>
    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    {trend && (
      <div className={`text-sm mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend > 0 ? '+' : ''}{trend}% vs last month
      </div>
    )}
  </div>
);

const QuickActionButton = ({ label, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors group"
    data-testid={`quick-action-${label.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-[#B8962E] transition-colors" />
    <span className="text-sm text-zinc-300">{label}</span>
  </button>
);

const ConfigItem = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
    <span className="text-sm text-zinc-400">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{value}</span>
      {status && (
        <div className={`w-2 h-2 rounded-full ${
          status === 'success' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
      )}
    </div>
  </div>
);

const ChecklistItem = ({ checked, label }) => (
  <div className="flex items-center gap-3">
    <div className={`w-5 h-5 rounded flex items-center justify-center ${
      checked ? 'bg-green-900/50 text-green-400' : 'bg-zinc-800 text-zinc-500'
    }`}>
      {checked ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
    </div>
    <span className={checked ? 'text-zinc-200' : 'text-zinc-500'}>{label}</span>
  </div>
);

// Utility functions
const formatEventType = (type) => {
  const map = {
    'digest': 'Monday Digest',
    'checkin_reminder': 'Check-in Reminder',
    'milestone_countdown': 'Milestone Alert',
    'streak_protection': 'Streak Protection',
    'anomaly': 'Anomaly Alert',
  };
  return map[type] || type;
};

export default AdminDashboard;
