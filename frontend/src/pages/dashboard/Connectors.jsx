// API Connectors Dashboard - Enhanced with #00BFFF cyan gradient theme
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, ShieldCheck, Upload, RefreshCw, Check, X,
  AlertTriangle, Eye, EyeOff, ExternalLink, Trash2, Loader2, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { useAuth } from '@/context/AuthContext';
import { fetchConnectors, connectProvider, disconnectProvider } from '@/lib/api/dashboard';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  brightCyan:  '#00BFFF',
  brightCyan2: '#00C8E8',
  midCyan:     '#0099CC',
  tealEdge:    '#006080',
  darkCorner:  '#050A10',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const tier1Connectors = [
  { id: 'razorpay',   name: 'Razorpay',    description: 'Payments, settlements, subscription MRR', logo: '💳', connected: true,  lastSync: '2 hours ago' },
  { id: 'stripe',     name: 'Stripe',      description: 'Charges, invoices, subscription revenue',  logo: '💳', connected: false },
  { id: 'cashfree',   name: 'Cashfree',    description: 'Orders, settlements, refunds',             logo: '💰', connected: false },
  { id: 'chargebee',  name: 'Chargebee',   description: 'Real MRR, churn events, plan revenue',     logo: '📊', connected: false },
  { id: 'woocommerce',name: 'WooCommerce', description: 'Orders, GMV, AOV',                         logo: '🛒', connected: false },
];
const tier2Connectors = [
  { id: 'ga4',        name: 'Google Analytics 4', description: 'Purchase revenue, conversions',    logo: '📈', connected: false },
  { id: 'zoho',       name: 'Zoho Books',          description: 'Invoices, P&L, payments received', logo: '📚', connected: false },
  { id: 'quickbooks', name: 'QuickBooks',           description: 'P&L report, invoice list',        logo: '📒', connected: false },
  { id: 'google-ads', name: 'Google Ads',           description: 'Spend, ROAS, CAC calculation',    logo: '🎯', connected: false },
  { id: 'meta-ads',   name: 'Meta Ads',             description: 'Ad spend, conversions, CAC',      logo: '📱', connected: false },
];
const tier3Connectors = [
  { id: 'tally',    name: 'Tally / Excel',   description: 'Upload your Tally export',  logo: '📄', type: 'upload' },
  { id: 'amazon',   name: 'Amazon Seller',   description: 'Seller Central reports',     logo: '📦', type: 'upload' },
  { id: 'flipkart', name: 'Flipkart Seller', description: 'Seller Hub exports',         logo: '🏪', type: 'upload' },
  { id: 'swiggy',   name: 'Swiggy / Zomato', description: 'Payout reports',            logo: '🍔', type: 'upload' },
];

// ─── Glass card primitive ─────────────────────────────────────────────────────
const GlassCard = ({ children, className = '', connected = false, style = {} }) => (
  <div
    className={cn('relative rounded-2xl overflow-hidden', className)}
    style={{
      background: connected
        ? 'rgba(0,191,255,0.06)'
        : 'rgba(5,15,24,0.55)',
      border: connected
        ? `1px solid rgba(0,191,255,0.30)`
        : '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: connected
        ? `0 0 20px rgba(0,191,255,0.10), 0 8px 32px rgba(0,0,0,0.35)`
        : '0 4px 24px rgba(0,0,0,0.35)',
      ...style,
    }}
  >
    {/* top sheen */}
    <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
      style={{ background: `linear-gradient(90deg, transparent, ${connected ? 'rgba(0,191,255,0.45)' : 'rgba(255,255,255,0.10)'}, transparent)` }} />
    {children}
  </div>
);

// ─── Section label ────────────────────────────────────────────────────────────
const TierLabel = ({ title, desc }) => (
  <div className="flex items-center gap-3 mb-4">
    <h3 className="font-semibold text-sm text-white">{title}</h3>
    <div className="h-px flex-1" style={{ background: 'rgba(0,191,255,0.15)' }} />
    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</span>
  </div>
);

// ─── Connector card ───────────────────────────────────────────────────────────
const ConnectorCard = ({ connector, onConnect, onDisconnect, onSync }) => {
  const [showKey, setShowKey]     = useState(false);
  const [apiKey, setApiKey]       = useState('');
  const [connecting, setConnecting] = useState(false);
  const [hovered, setHovered]     = useState(false);

  const handleConnect = async () => {
    if (!apiKey) return;
    setConnecting(true);
    await new Promise(r => setTimeout(r, 1500));
    setConnecting(false);
    onConnect(connector.id, apiKey);
    setApiKey('');
  };

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -2, scale: 1.012 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard connected={connector.connected}
        style={{
          border: hovered && !connector.connected
            ? `1px solid rgba(0,191,255,0.28)`
            : undefined,
          boxShadow: hovered && !connector.connected
            ? `0 0 18px rgba(0,191,255,0.08), 0 8px 32px rgba(0,0,0,0.40)`
            : undefined,
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Logo bubble */}
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: connector.connected
                  ? 'rgba(0,191,255,0.12)'
                  : 'rgba(255,255,255,0.06)',
                border: connector.connected
                  ? '1px solid rgba(0,191,255,0.30)'
                  : '1px solid rgba(255,255,255,0.08)',
              }}
              animate={hovered ? { scale: 1.10, rotate: 4 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            >
              {connector.logo}
            </motion.div>

            <div className="flex-1 min-w-0">
              {/* Name + badge */}
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-white">{connector.name}</h4>
                {connector.connected && (
                  <motion.span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.30)', color: '#22C55E' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 350 }}
                  >
                    <Check className="w-2.5 h-2.5" strokeWidth={2.5} />
                    Connected
                  </motion.span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{connector.description}</p>

              {/* Connected state */}
              {connector.connected ? (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Synced {connector.lastSync}
                  </span>
                  <button
                    onClick={() => onSync(connector.id)}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: C.brightCyan2 }}
                    onMouseEnter={e => e.currentTarget.style.color = C.brightCyan}
                    onMouseLeave={e => e.currentTarget.style.color = C.brightCyan2}
                  >
                    <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
                    Sync now
                  </button>
                  <button
                    onClick={() => onDisconnect(connector.id)}
                    className="ml-auto text-xs flex items-center gap-1 transition-colors"
                    style={{ color: 'rgba(239,68,68,0.70)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.70)'}
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  {connector.type === 'upload' ? (
                    <button
                      className="w-full h-8 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                      style={{
                        background: 'rgba(0,191,255,0.06)',
                        border: '1px dashed rgba(0,191,255,0.28)',
                        color: `${C.brightCyan2}99`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.12)'; e.currentTarget.style.color = C.brightCyan2; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.06)'; e.currentTarget.style.color = `${C.brightCyan2}99`; }}
                    >
                      <Upload className="w-3 h-3" strokeWidth={1.5} />
                      Upload CSV
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={e => setApiKey(e.target.value)}
                          placeholder="Enter API key..."
                          className="w-full h-8 px-3 pr-8 rounded-lg text-xs focus:outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(0,191,255,0.20)',
                            color: '#fff',
                            caretColor: C.brightCyan,
                          }}
                          onFocus={e => e.target.style.borderColor = 'rgba(0,191,255,0.50)'}
                          onBlur={e => e.target.style.borderColor  = 'rgba(0,191,255,0.20)'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                          {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                      <motion.button
                        onClick={handleConnect}
                        disabled={!apiKey || connecting}
                        className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 relative overflow-hidden"
                        style={{
                          background: !apiKey || connecting
                            ? 'rgba(255,255,255,0.08)'
                            : `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                          color: !apiKey || connecting ? 'rgba(255,255,255,0.35)' : C.darkCorner,
                          boxShadow: apiKey && !connecting ? `0 0 12px rgba(0,191,255,0.25)` : 'none',
                        }}
                        whileHover={apiKey && !connecting ? { scale: 1.04 } : {}}
                        whileTap={apiKey && !connecting ? { scale: 0.96 } : {}}
                      >
                        {connecting
                          ? <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                          : 'Connect'}
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Connectors = () => {
  const { getAccessToken } = useAuth();
  const [connectedProviders, setConnectedProviders] = useState({});
  const [syncResult, setSyncResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const result = await fetchConnectors(token);
          const connected = {};
          result.forEach(c => { connected[c.provider] = { isActive: c.is_active, lastSynced: c.last_synced_at }; });
          setConnectedProviders(connected);
        }
      } catch (err) { console.error('Failed to load connectors:', err); }
      finally { setLoading(false); }
    };
    load();
  }, [getAccessToken]);

  const handleConnect = async (id, apiKey) => {
    try {
      const token = getAccessToken();
      if (token) {
        await connectProvider(token, id, apiKey);
        setConnectedProviders(prev => ({ ...prev, [id]: { isActive: true, lastSynced: 'Just now' } }));
      }
    } catch (err) { console.error(`Failed to connect ${id}:`, err); }
  };

  const handleDisconnect = async (id) => {
    try {
      const token = getAccessToken();
      if (token) {
        await disconnectProvider(token, id);
        setConnectedProviders(prev => { const u = { ...prev }; delete u[id]; return u; });
      }
    } catch (err) { console.error(`Failed to disconnect ${id}:`, err); }
  };

  const handleSync = (id) => {
    setSyncResult({ provider: id.charAt(0).toUpperCase() + id.slice(1), revenue: '4.23', month: 'January' });
  };

  const withStatus = (c) => ({
    ...c,
    connected: !!connectedProviders[c.id]?.isActive,
    lastSync: connectedProviders[c.id]?.lastSynced || '2 hours ago',
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader2 className="w-6 h-6" style={{ color: C.brightCyan }} strokeWidth={1.5} />
      </motion.div>
    </div>
  );

  return (
    <div
      className="min-h-full relative"
      style={{ background: C.darkCorner }}
      data-testid="connectors"
    >
      {/* Page background atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 65% 40% at 50% 0%, rgba(0,191,255,0.12) 0%, transparent 55%),
          radial-gradient(ellipse 35% 50% at 5%  60%, rgba(0,96,128,0.14) 0%, transparent 55%),
          radial-gradient(ellipse 35% 50% at 95% 60%, rgba(0,96,128,0.14) 0%, transparent 55%)
        `,
      }} />

      <div className="relative z-10 space-y-8 p-6 md:p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,191,255,0.12)', border: '1px solid rgba(0,191,255,0.28)' }}>
              <Plug className="w-4 h-4" style={{ color: C.brightCyan }} strokeWidth={1.5} />
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{
                background: `linear-gradient(135deg, #fff 35%, ${C.brightCyan2} 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
            >
              {copy.dashboard.connectors.title}
            </h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'rgba(255,255,255,0.50)' }}>
            {copy.dashboard.connectors.subtitle}
          </p>
        </motion.div>

        {/* Trust banner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl"
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.22)',
            }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.28)' }}>
              <ShieldCheck className="w-4 h-4" style={{ color: '#22C55E' }} strokeWidth={1.5} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {copy.dashboard.connectors.trustHeader}
            </p>
          </div>
        </motion.div>

        {/* Tier 1 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <TierLabel title={copy.dashboard.connectors.tier1.title} desc={copy.dashboard.connectors.tier1.description} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier1Connectors.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}>
                <ConnectorCard connector={withStatus(c)} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tier 2 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <TierLabel title={copy.dashboard.connectors.tier2.title} desc={copy.dashboard.connectors.tier2.description} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier2Connectors.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}>
                <ConnectorCard connector={withStatus(c)} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tier 3 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <TierLabel title={copy.dashboard.connectors.tier3.title} desc={copy.dashboard.connectors.tier3.description} />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tier3Connectors.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}>
                <ConnectorCard connector={withStatus(c)} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sync result modal */}
        <AnimatePresence>
          {syncResult && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSyncResult(null)}
            >
              <motion.div
                className="w-full max-w-md"
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(5,15,24,0.92)',
                    border: '1px solid rgba(0,191,255,0.25)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 0 1px rgba(0,191,255,0.06), 0 32px 64px rgba(0,0,0,0.60)',
                  }}>
                  {/* top sheen */}
                  <div className="absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.50), transparent)' }} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.28)' }}>
                        <Check className="w-5 h-5" style={{ color: '#22C55E' }} strokeWidth={1.5} />
                      </div>
                      <button onClick={() => setSyncResult(null)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <h3 className="font-bold text-white mb-2">Sync Complete</h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.58)' }}>
                      Your {syncResult.provider} data shows{' '}
                      <span className="font-mono font-bold" style={{ color: C.brightCyan2 }}>₹{syncResult.revenue}L</span>{' '}
                      in {syncResult.month}. {copy.dashboard.connectors.syncConfirm}
                    </p>
                    <div className="flex gap-3">
                      <motion.button onClick={() => setSyncResult(null)}
                        className="flex-1 h-11 rounded-xl font-semibold text-sm relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${C.brightCyan} 0%, ${C.midCyan} 60%, ${C.tealEdge} 100%)`,
                          color: C.darkCorner,
                          boxShadow: `0 0 0 1px rgba(0,191,255,0.30), 0 6px 20px rgba(0,191,255,0.22)`,
                        }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        Confirm & Save
                      </motion.button>
                      <motion.button onClick={() => setSyncResult(null)}
                        className="h-11 px-5 rounded-xl text-sm font-medium"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.70)',
                        }}
                        whileHover={{ background: 'rgba(255,255,255,0.10)', color: '#fff', scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}>
                        Edit
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Connectors;