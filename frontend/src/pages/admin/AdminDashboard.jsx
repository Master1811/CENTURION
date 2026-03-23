/**
 * Admin Control Panel — Full Rebuild
 * ====================================
 * 6 tabs: Overview, Users, AI Costs, Subscriptions, System, Waitlist
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Users, Mail, Clock, AlertTriangle, CheckCircle,
  RefreshCw, Play, Eye, Database, Server,
  TrendingUp, Calendar, Zap, Shield, BarChart3, Bell,
  ExternalLink, Search, XCircle, DollarSign, Radio,
  ToggleLeft, ToggleRight, Download, X,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('en-IN'));
const fmtInr = (n) => (n == null ? '—' : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`);
const fmtDate = (s) => (s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—');

// ─── shared UI components ─────────────────────────────────────────────────────

const GlassCard = ({ children, className = '', danger = false }) => (
  <div className={`bg-zinc-900/50 rounded-xl border ${danger ? 'border-red-800/60' : 'border-zinc-800'} p-5 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, sub, icon: Icon, highlight = false }) => (
  <GlassCard className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-400">{title}</span>
      {Icon && <Icon className="w-4 h-4 text-zinc-500" />}
    </div>
    <div className={`text-2xl font-bold ${highlight ? 'text-[#B8962E]' : 'text-white'}`}>{value}</div>
    {sub && <div className="text-xs text-zinc-500">{sub}</div>}
  </GlassCard>
);

const Badge = ({ children, color = 'zinc' }) => {
  const map = {
    green: 'bg-green-900/40 text-green-400',
    red: 'bg-red-900/40 text-red-400',
    yellow: 'bg-yellow-900/40 text-yellow-400',
    zinc: 'bg-zinc-800 text-zinc-400',
    gold: 'bg-[#B8962E]/20 text-[#B8962E]',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[color] || map.zinc}`}>{children}</span>;
};

const Btn = ({ children, onClick, disabled, variant = 'default', size = 'md', className = '' }) => {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-40';
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-1.5 text-sm', lg: 'px-5 py-2.5 text-base' };
  const variants = {
    default: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    gold: 'bg-[#B8962E]/20 hover:bg-[#B8962E]/30 text-[#B8962E]',
    danger: 'bg-red-900/40 hover:bg-red-900/60 text-red-400',
    success: 'bg-green-900/40 hover:bg-green-800/60 text-green-400',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Toggle = ({ on, onToggle, label, disabled = false }) => (
  <button
    onClick={onToggle}
    disabled={disabled}
    className="flex items-center gap-2 group"
    title={on ? 'ON — click to disable' : 'OFF — click to enable'}
  >
    {on
      ? <ToggleRight className="w-6 h-6 text-green-400 group-hover:text-green-300" />
      : <ToggleLeft className="w-6 h-6 text-red-500 group-hover:text-red-400" />}
    <span className={`text-sm font-medium ${on ? 'text-green-400' : 'text-red-400'}`}>
      {label} {on ? 'ON' : 'OFF'}
    </span>
  </button>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="text-sm text-zinc-400 mt-1">{message}</div>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Btn variant="default" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>Confirm</Btn>
      </div>
    </div>
  </div>
);

// ─── main component ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { getAccessToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { title, message, onConfirm }

  // Data buckets
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [aiSpend, setAiSpend] = useState(null);
  const [crisisStatus, setCrisisStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [systemHealth, setSystemHealth] = useState(null);
  const [schedulerJobs, setSchedulerJobs] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '', target: 'all' });
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  const fetchWithAuth = useCallback(async (endpoint, opts = {}) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }, [getAccessToken]);

  const postAdmin = useCallback((path, body) =>
    fetchWithAuth(path, { method: 'POST', body: JSON.stringify(body) }), [fetchWithAuth]);

  const deleteAdmin = useCallback((path) =>
    fetchWithAuth(path, { method: 'DELETE' }), [fetchWithAuth]);

  // ── load overview data ───────────────────────────────────────────────────
  const loadOverview = useCallback(async () => {
    const [s, r, ai, cs] = await Promise.allSettled([
      fetchWithAuth('/api/admin/stats'),
      fetchWithAuth('/api/admin/revenue'),
      fetchWithAuth('/api/admin/ai/spend'),
      fetchWithAuth('/api/admin/crisis/status'),
    ]);
    if (s.status === 'fulfilled') setStats(s.value);
    if (r.status === 'fulfilled') setRevenue(r.value);
    if (ai.status === 'fulfilled') setAiSpend(ai.value);
    if (cs.status === 'fulfilled') {
      setCrisisStatus(cs.value);
      setMaintenanceMsg(cs.value?.maintenance_message || '');
    }
  }, [fetchWithAuth]);

  const loadUsers = useCallback(async (page = 1, search = '') => {
    const params = new URLSearchParams({ page, limit: 20 });
    if (search) params.set('search', search);
    const data = await fetchWithAuth(`/api/admin/users?${params}`);
    setUsers(data.users || []);
    setUsersTotal(data.total || 0);
  }, [fetchWithAuth]);

  const loadSubscriptions = useCallback(async (statusFilter = 'all') => {
    const data = await fetchWithAuth(`/api/admin/subscriptions?status=${statusFilter}&limit=50`);
    setSubscriptions(data.subscriptions || []);
    setSubsTotal(data.total || 0);
  }, [fetchWithAuth]);

  const loadSystem = useCallback(async () => {
    const [health, sched] = await Promise.allSettled([
      fetchWithAuth('/api/admin/system/health'),
      fetchWithAuth('/api/admin/scheduler/status'),
    ]);
    if (health.status === 'fulfilled') setSystemHealth(health.value);
    if (sched.status === 'fulfilled') setSchedulerJobs(sched.value.jobs || []);
  }, [fetchWithAuth]);

  const loadWaitlist = useCallback(async () => {
    const data = await fetchWithAuth('/api/admin/waitlist');
    setWaitlist(data.entries || []);
  }, [fetchWithAuth]);

  // ── initial load ─────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await loadOverview();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadOverview]);

  useEffect(() => { if (isAuthenticated) loadAll(); }, [isAuthenticated, loadAll]);
  useEffect(() => { if (!loading && !isAuthenticated) navigate('/'); }, [loading, isAuthenticated, navigate]);

  // ── tab-lazy loading ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'users') loadUsers(userPage, userSearch).catch(() => {});
  }, [activeTab]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'subscriptions') loadSubscriptions(subStatusFilter).catch(() => {});
  }, [activeTab, subStatusFilter]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'system') loadSystem().catch(() => {});
  }, [activeTab]); // eslint-disable-line

  useEffect(() => {
    if (activeTab === 'waitlist') loadWaitlist().catch(() => {});
  }, [activeTab]); // eslint-disable-line

  // ── crisis helpers ────────────────────────────────────────────────────────
  const confirm_ = (title, message, fn) => setConfirm({ title, message, onConfirm: fn });

  const toggleAI = () => confirm_(
    'Toggle Global AI',
    `This will ${crisisStatus?.ai_enabled ? 'DISABLE' : 'ENABLE'} all AI endpoints immediately.`,
    async () => {
      await postAdmin('/api/admin/ai/kill-switch', { enabled: !crisisStatus.ai_enabled, reason: 'Admin toggle' });
      await loadOverview();
      setConfirm(null);
    }
  );

  const toggleSignups = () => confirm_(
    'Toggle Signups',
    `This will ${crisisStatus?.signups_disabled ? 'ENABLE' : 'DISABLE'} new user registrations.`,
    async () => {
      await postAdmin('/api/admin/crisis/disable-signups', { disabled: !crisisStatus.signups_disabled, message: 'Signups temporarily paused.' });
      await loadOverview();
      setConfirm(null);
    }
  );

  const toggleMaintenance = () => confirm_(
    'Toggle Maintenance Mode',
    `This will ${crisisStatus?.maintenance_mode ? 'EXIT' : 'ENTER'} maintenance mode. ${!crisisStatus?.maintenance_mode ? 'ALL non-admin API calls will return 503.' : ''}`,
    async () => {
      await postAdmin('/api/admin/crisis/maintenance-mode', { enabled: !crisisStatus.maintenance_mode, message: maintenanceMsg || ks_default_msg });
      await loadOverview();
      setConfirm(null);
    }
  );

  const toggleFeature = (feat, currentlyEnabled) => confirm_(
    `Toggle ${feat.replace(/_/g, ' ')}`,
    `This will ${currentlyEnabled ? 'DISABLE' : 'ENABLE'} the ${feat.replace(/_/g, ' ')} AI feature.`,
    async () => {
      await postAdmin(`/api/admin/ai/kill-switch/${feat}`, { enabled: !currentlyEnabled });
      await loadOverview();
      setConfirm(null);
    }
  );

  const disableUser = (uid, email) => confirm_(
    'Disable User',
    `Disable account for ${email}? They will get 403 on next request.`,
    async () => {
      await postAdmin(`/api/admin/users/${uid}/disable`, {});
      await loadUsers(userPage, userSearch);
      setConfirm(null);
    }
  );

  const enableUser = async (uid) => {
    await postAdmin(`/api/admin/users/${uid}/enable`, {});
    await loadUsers(userPage, userSearch);
  };

  const deleteUser = (uid, email) => confirm_(
    'Delete User',
    `PERMANENTLY delete ALL data for ${email}? This cannot be undone.`,
    async () => {
      await deleteAdmin(`/api/admin/users/${uid}`);
      await loadUsers(userPage, userSearch);
      setConfirm(null);
    }
  );

  const cancelSub = (uid, email) => confirm_(
    'Cancel Subscription',
    `Cancel the active subscription for ${email}?`,
    async () => {
      await postAdmin(`/api/admin/subscriptions/${uid}/cancel`, {});
      await loadSubscriptions(subStatusFilter);
      setConfirm(null);
    }
  );

  const triggerJob = async (jobId) => {
    try {
      await fetchWithAuth(`/api/admin/trigger/${jobId}`, { method: 'POST', body: '{}' });
      alert(`Job ${jobId} triggered.`);
    } catch (e) {
      alert(`Failed: ${e.message}`);
    }
  };

  const convertWaitlist = async (email) => {
    await fetchWithAuth(`/api/admin/waitlist/${encodeURIComponent(email)}/convert`, { method: 'PUT' });
    await loadWaitlist();
  };

  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const viewUser = async (u) => {
    setSelectedUser(u);
    setSelectedUserDetail(null);
    try {
      const detail = await fetchWithAuth(`/api/admin/users/${u.id}`);
      setSelectedUserDetail(detail);
    } catch (e) {
      setSelectedUserDetail({ error: e.message });
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastForm.subject || !broadcastForm.message) return;
    try {
      const res = await postAdmin('/api/admin/crisis/broadcast', broadcastForm);
      alert(`Broadcast sent to ${res.sent_to} users.`);
      setBroadcastModal(false);
      setBroadcastForm({ subject: '', message: '', target: 'all' });
    } catch (e) {
      alert(`Failed: ${e.message}`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-[#B8962E] animate-spin mx-auto mb-4" />
        <p className="text-zinc-400">Loading admin panel…</p>
      </div>
    </div>
  );

  const TABS = [
    { id: 'overview',       label: 'Overview',       icon: BarChart3 },
    { id: 'users',          label: 'Users',          icon: Users },
    { id: 'ai',             label: 'AI Costs',       icon: Zap },
    { id: 'subscriptions',  label: 'Subscriptions',  icon: DollarSign },
    { id: 'system',         label: 'System',         icon: Server },
    { id: 'waitlist',       label: 'Waitlist',       icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white" data-testid="admin-dashboard">

      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0B0B10]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#B8962E]" />
            <h1 className="text-lg font-bold">Admin Control Panel</h1>
            <Badge color="gold">SUPERADMIN</Badge>
            {crisisStatus?.maintenance_mode && <Badge color="red">MAINTENANCE</Badge>}
            {!crisisStatus?.ai_enabled && <Badge color="red">AI OFF</Badge>}
          </div>
          <div className="flex items-center gap-3">
            <Btn variant="default" size="sm" onClick={loadAll} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Btn>
            <Btn variant="default" size="sm" onClick={() => navigate('/dashboard')}>
              <ExternalLink className="w-3.5 h-3.5" /> Dashboard
            </Btn>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/40 border-b border-red-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-[#B8962E] text-black' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
              data-testid={`admin-tab-${t.id}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: OVERVIEW ═══════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Users" value={fmt(stats?.total_users)} icon={Users} />
              <StatCard title="Active Subscriptions" value={fmt(stats?.active_subscriptions)} icon={CheckCircle} />
              <StatCard title="MRR" value={fmtInr(revenue?.mrr_inr)} icon={DollarSign} highlight />
              <StatCard title="AI Spend (MTD)" value={fmtInr(aiSpend?.this_month_inr)} icon={Zap}
                sub={`Today: ${fmtInr(aiSpend?.today_inr)}`} />
            </div>

            {/* Crisis Panel */}
            <GlassCard danger>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold flex items-center gap-2 text-red-400">
                  <Radio className="w-4 h-4" /> Crisis Controls
                </h2>
                <Btn variant="gold" size="sm" onClick={() => setBroadcastModal(true)}>
                  <Mail className="w-3.5 h-3.5" /> Broadcast
                </Btn>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Global AI */}
                <div className="space-y-1">
                  <Toggle
                    on={crisisStatus?.ai_enabled ?? true}
                    onToggle={toggleAI}
                    label="Global AI"
                  />
                  <p className="text-xs text-zinc-500 pl-8">Kills all /ai/* endpoints immediately</p>
                </div>

                {/* Signups */}
                <div className="space-y-1">
                  <Toggle
                    on={!(crisisStatus?.signups_disabled ?? false)}
                    onToggle={toggleSignups}
                    label="New Signups"
                  />
                  <p className="text-xs text-zinc-500 pl-8">Block new user onboarding</p>
                </div>

                {/* Maintenance */}
                <div className="space-y-2">
                  <Toggle
                    on={!(crisisStatus?.maintenance_mode ?? false)}
                    onToggle={toggleMaintenance}
                    label="Service"
                  />
                  <input
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
                    placeholder="Maintenance message…"
                    value={maintenanceMsg}
                    onChange={e => setMaintenanceMsg(e.target.value)}
                  />
                </div>
              </div>

              {/* Per-feature toggles */}
              {crisisStatus?.feature_kill_switches && (
                <div className="mt-5 pt-5 border-t border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Per-feature AI</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {Object.entries(crisisStatus.feature_kill_switches).map(([feat, enabled]) => (
                      <button
                        key={feat}
                        onClick={() => toggleFeature(feat, enabled)}
                        className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                          enabled ? 'border-green-800/50 bg-green-900/20 text-green-400' : 'border-red-800/50 bg-red-900/20 text-red-400'
                        }`}
                      >
                        {feat.replace(/_/g, ' ')}<br />
                        <span className="opacity-70">{enabled ? 'ON' : 'OFF'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {crisisStatus?.last_updated_by && (
                <p className="text-xs text-zinc-600 mt-4">
                  Last changed by {crisisStatus.last_updated_by} at {fmtDate(crisisStatus.last_updated_at)}
                </p>
              )}
            </GlassCard>

            {/* Revenue strip */}
            {revenue && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="ARR" value={fmtInr(revenue.arr_inr)} icon={TrendingUp} />
                <StatCard title="Active Founders" value={fmt(revenue.active_founder_count)} icon={Users} />
                <StatCard title="New This Month" value={fmt(revenue.new_this_month)} icon={Calendar} />
                <StatCard title="Churned" value={fmt(revenue.churned_this_month)} icon={XCircle} />
                <StatCard title="Net New" value={fmt(revenue.net_new)} icon={Activity}
                  highlight={revenue.net_new > 0} />
              </div>
            )}
          </div>
        )}

        {/* ══ TAB: USERS ══════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="Search by email…"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setUserPage(1); loadUsers(1, userSearch); } }}
                />
              </div>
              <Btn variant="gold" size="sm" onClick={() => { setUserPage(1); loadUsers(1, userSearch); }}>Search</Btn>
              <span className="text-xs text-zinc-500">{fmt(usersTotal)} total</span>
            </div>

            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 text-xs uppercase tracking-wide">
                    {['Email', 'Company', 'Plan', 'MRR', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3 pl-5">
                        <div className="font-medium text-white">{u.email || '—'}</div>
                        {u.disabled && <Badge color="red">disabled</Badge>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{u.company_name || '—'}</td>
                      <td className="px-4 py-3">
                        {u.subscription
                          ? <Badge color="green">{u.subscription.plan}</Badge>
                          : u.beta_status === 'active'
                            ? <Badge color="gold">beta</Badge>
                            : <Badge color="zinc">free</Badge>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{u.current_mrr ? fmtInr(u.current_mrr) : '—'}</td>
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge color={u.onboarding_completed ? 'green' : 'zinc'}>
                          {u.onboarding_completed ? 'onboarded' : 'pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 pr-5">
                        <div className="flex gap-1.5 flex-wrap">
                          <Btn variant="default" size="sm" onClick={() => viewUser(u)}>
                            <Eye className="w-3 h-3" />
                          </Btn>
                          <Btn variant="gold" size="sm"
                            onClick={() => fetchWithAuth(`/api/admin/beta/${u.id}`, { method: 'POST', body: JSON.stringify({ days: 60 }) }).then(() => loadUsers(userPage, userSearch))}>
                            Beta
                          </Btn>
                          <Btn variant="success" size="sm"
                            onClick={() => fetchWithAuth(`/api/admin/subscription/${u.id}`, { method: 'POST', body: JSON.stringify({ plan: 'founder', duration_days: 365 }) }).then(() => loadUsers(userPage, userSearch))}>
                            Founder
                          </Btn>
                          {u.disabled
                            ? <Btn variant="success" size="sm" onClick={() => enableUser(u.id)}>Enable</Btn>
                            : <Btn variant="danger" size="sm" onClick={() => disableUser(u.id, u.email)}>Disable</Btn>}
                          <Btn variant="danger" size="sm" onClick={() => deleteUser(u.id, u.email)}>
                            <XCircle className="w-3 h-3" />
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!users.length && (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-500">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </GlassCard>

            {/* Pagination */}
            <div className="flex gap-2 justify-center">
              <Btn variant="default" size="sm" disabled={userPage <= 1}
                onClick={() => { const p = userPage - 1; setUserPage(p); loadUsers(p, userSearch); }}>
                Prev
              </Btn>
              <span className="text-sm text-zinc-400 self-center">Page {userPage}</span>
              <Btn variant="default" size="sm" disabled={users.length < 20}
                onClick={() => { const p = userPage + 1; setUserPage(p); loadUsers(p, userSearch); }}>
                Next
              </Btn>
            </div>
          </div>
        )}

        {/* ══ TAB: AI COSTS ════════════════════════════════════════════════════ */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Today" value={fmtInr(aiSpend?.today_inr)} icon={Zap} highlight />
              <StatCard title="This Month" value={fmtInr(aiSpend?.this_month_inr)} icon={Zap} />
              <StatCard title="Last Month" value={fmtInr(aiSpend?.last_month_inr)} icon={Zap} />
              <StatCard title="Global AI" icon={ToggleRight}
                value={crisisStatus?.ai_enabled ? '✅ Enabled' : '🔴 DISABLED'}
                highlight={!crisisStatus?.ai_enabled} />
            </div>

            {/* Kill switches */}
            <GlassCard danger>
              <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Kill Switches
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-sm font-medium">Global AI (all features)</span>
                  <Toggle on={crisisStatus?.ai_enabled ?? true} onToggle={toggleAI} label="" />
                </div>
                {crisisStatus?.feature_kill_switches && Object.entries(crisisStatus.feature_kill_switches).map(([feat, enabled]) => (
                  <div key={feat} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                    <span className="text-sm text-zinc-300">{feat.replace(/_/g, ' ')}</span>
                    <Toggle on={enabled} onToggle={() => toggleFeature(feat, enabled)} label="" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Top users */}
            {aiSpend?.top_users?.length > 0 && (
              <GlassCard>
                <h3 className="text-sm font-semibold mb-4">Top Spenders This Month</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-800 text-xs">
                      {['Email', 'Spend (INR)', 'Calls', 'Avg / Call'].map(h => (
                        <th key={h} className="pb-2 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aiSpend.top_users.map(u => {
                      const highSpend = u.this_month_inr > 50;
                      return (
                        <tr key={u.user_id} className={`border-b border-zinc-800/30 ${highSpend ? 'bg-red-900/10' : ''}`}>
                          <td className="py-2 pr-4 text-zinc-300">{u.email || u.user_id.slice(0, 8)}</td>
                          <td className={`py-2 pr-4 font-medium ${highSpend ? 'text-red-400' : 'text-white'}`}>
                            {fmtInr(u.this_month_inr)}
                          </td>
                          <td className="py-2 pr-4 text-zinc-400">{fmt(u.call_count)}</td>
                          <td className="py-2 text-zinc-400">
                            {u.call_count ? fmtInr((u.this_month_inr / u.call_count).toFixed(2)) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </GlassCard>
            )}
          </div>
        )}

        {/* ══ TAB: SUBSCRIPTIONS ══════════════════════════════════════════════ */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {revenue && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="MRR" value={fmtInr(revenue.mrr_inr)} highlight icon={DollarSign} />
                <StatCard title="ARR" value={fmtInr(revenue.arr_inr)} icon={TrendingUp} />
                <StatCard title="New This Month" value={fmt(revenue.new_this_month)} icon={Calendar} />
                <StatCard title="Churned" value={fmt(revenue.churned_this_month)} icon={XCircle} />
                <StatCard title="Net New" value={fmt(revenue.net_new)} icon={Activity} />
              </div>
            )}

            <div className="flex items-center gap-3">
              <select
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                value={subStatusFilter}
                onChange={e => setSubStatusFilter(e.target.value)}
              >
                {['all', 'active', 'expired', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <span className="text-xs text-zinc-500">{fmt(subsTotal)} total</span>
            </div>

            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 text-xs uppercase tracking-wide">
                    {['Email', 'Plan', 'Status', 'Expires', 'Payment Source', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 pl-5 text-zinc-300">{s.email || s.user_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3"><Badge color="gold">{s.plan}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge color={s.status === 'active' ? 'green' : s.status === 'cancelled' ? 'red' : 'zinc'}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{fmtDate(s.expires_at)}</td>
                      <td className="px-4 py-3 text-zinc-400">{s.payment_provider || '—'}</td>
                      <td className="px-4 py-3 pr-5">
                        {s.status === 'active' && (
                          <Btn variant="danger" size="sm" onClick={() => cancelSub(s.user_id, s.email)}>
                            Cancel
                          </Btn>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!subscriptions.length && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-500">No subscriptions found</td></tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}

        {/* ══ TAB: SYSTEM ═════════════════════════════════════════════════════ */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['API', systemHealth?.api, Server],
                ['Supabase', systemHealth?.supabase, Database],
                ['Scheduler', systemHealth?.scheduler, Clock],
                ['Redis', systemHealth?.redis, Activity],
                ['Anthropic', systemHealth?.anthropic, Zap],
                ['Sentry', systemHealth?.uptime_note?.startsWith('Sentry configured') ? 'configured' : 'not_configured', Shield],
              ].map(([name, val, Icon]) => (
                <GlassCard key={name} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    val === 'ok' || val === 'connected' || val === 'running' || val === 'configured'
                      ? 'bg-green-900/40 text-green-400'
                      : val === 'not_configured'
                        ? 'bg-zinc-800 text-zinc-500'
                        : 'bg-red-900/40 text-red-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500">{name}</div>
                    <div className="text-sm font-medium capitalize">{val ?? '—'}</div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {systemHealth?.uptime_note && (
              <div className="text-xs text-zinc-500 border border-zinc-800 rounded-lg p-3">
                {systemHealth.uptime_note}
              </div>
            )}

            {/* Scheduler */}
            <GlassCard>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B8962E]" /> Scheduled Jobs
              </h3>
              <div className="space-y-3">
                {schedulerJobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">{job.name || job.id}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        Next: {job.next_run ? fmtDate(job.next_run) : '—'} · {job.trigger}
                      </div>
                    </div>
                    <Btn variant="gold" size="sm" onClick={() => triggerJob(job.id)}>
                      <Play className="w-3 h-3" /> Run Now
                    </Btn>
                  </div>
                ))}
                {!schedulerJobs.length && (
                  <div className="text-center text-zinc-500 py-6 text-sm">No jobs loaded</div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ══ TAB: WAITLIST ════════════════════════════════════════════════════ */}
        {activeTab === 'waitlist' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{waitlist.length} entries</span>
              <Btn variant="default" size="sm" onClick={() => exportCSV(waitlist, 'waitlist.csv')}>
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Btn>
            </div>

            <GlassCard className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800 text-xs uppercase tracking-wide">
                    {['Email', 'Joined', 'Converted', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w, i) => (
                    <tr key={i} className="border-b border-zinc-800/40 hover:bg-zinc-800/20">
                      <td className="px-4 py-3 pl-5 text-zinc-300">{w.email}</td>
                      <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">{fmtDate(w.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge color={w.converted ? 'green' : 'zinc'}>{w.converted ? 'Yes' : 'No'}</Badge>
                      </td>
                      <td className="px-4 py-3 pr-5">
                        {!w.converted && (
                          <Btn variant="gold" size="sm" onClick={() => convertWaitlist(w.email)}>Convert</Btn>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!waitlist.length && (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-zinc-500">Waitlist is empty</td></tr>
                  )}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}

      </main>

      {/* ── User detail drawer ─────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">User Detail</h2>
              <button onClick={() => setSelectedUser(null)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-white">{selectedUser.email}</div>
              <div className="text-xs text-zinc-500">{selectedUser.id}</div>
            </div>
            {!selectedUserDetail && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
              </div>
            )}
            {selectedUserDetail?.error && (
              <div className="text-red-400 text-sm">{selectedUserDetail.error}</div>
            )}
            {selectedUserDetail && !selectedUserDetail.error && (
              <div className="space-y-4">
                <DetailRow label="Company" value={selectedUserDetail.company_name || selectedUserDetail.company} />
                <DetailRow label="Stage" value={selectedUserDetail.stage} />
                <DetailRow label="Business Model" value={selectedUserDetail.business_model} />
                <DetailRow label="Current MRR" value={fmtInr(selectedUserDetail.current_mrr)} />
                <DetailRow label="Streak" value={`${selectedUserDetail.streak_count ?? 0} days`} />
                <DetailRow label="Check-ins" value={fmt(selectedUserDetail.checkins_count)} />
                <DetailRow label="Last Check-in" value={fmtDate(selectedUserDetail.last_checkin_at)} />
                <DetailRow label="AI Spend (MTD)" value={fmtInr(selectedUserDetail.ai_spend_this_month)} />
                {selectedUserDetail.subscription && (
                  <div className="p-3 bg-zinc-800/50 rounded-lg space-y-1">
                    <div className="text-xs font-medium text-zinc-400 uppercase">Subscription</div>
                    <DetailRow label="Plan" value={selectedUserDetail.subscription.plan} />
                    <DetailRow label="Status" value={selectedUserDetail.subscription.status} />
                    <DetailRow label="Expires" value={fmtDate(selectedUserDetail.subscription.expires_at)} />
                  </div>
                )}
                {selectedUserDetail.engagement_last_30_days && Object.keys(selectedUserDetail.engagement_last_30_days).length > 0 && (
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs font-medium text-zinc-400 uppercase mb-2">Engagement (30d)</div>
                    {Object.entries(selectedUserDetail.engagement_last_30_days).map(([k, v]) => (
                      <DetailRow key={k} label={k.replace(/_/g, ' ')} value={v} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Broadcast modal ────────────────────────────────────────────────── */}
      {broadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Broadcast Message</h3>
              <button onClick={() => setBroadcastModal(false)}><X className="w-4 h-4 text-zinc-400" /></button>
            </div>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
              value={broadcastForm.target}
              onChange={e => setBroadcastForm(f => ({ ...f, target: e.target.value }))}
            >
              <option value="all">All Users</option>
              <option value="paid">Paid Only</option>
              <option value="beta">Beta Only</option>
            </select>
            <input
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Subject…"
              value={broadcastForm.subject}
              onChange={e => setBroadcastForm(f => ({ ...f, subject: e.target.value }))}
            />
            <textarea
              rows={5}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 resize-none"
              placeholder="Message body…"
              value={broadcastForm.message}
              onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))}
            />
            <div className="flex gap-3 justify-end">
              <Btn variant="default" onClick={() => setBroadcastModal(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={sendBroadcast}>Send Broadcast</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm dialog ─────────────────────────────────────────────────── */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-zinc-500">{label}</span>
    <span className="text-xs text-zinc-200">{value ?? '—'}</span>
  </div>
);

const ks_default_msg = 'The platform is under scheduled maintenance. Please try again later.';

export default AdminDashboard;
