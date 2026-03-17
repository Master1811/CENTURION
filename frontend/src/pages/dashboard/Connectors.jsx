// API Connectors Dashboard
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plug, 
  ShieldCheck, 
  Upload, 
  RefreshCw, 
  Check, 
  X, 
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';

// Connector providers by tier
const tier1Connectors = [
  { id: 'razorpay', name: 'Razorpay', description: 'Payments, settlements, subscription MRR', logo: '💳', connected: true, lastSync: '2 hours ago' },
  { id: 'stripe', name: 'Stripe', description: 'Charges, invoices, subscription revenue', logo: '💳', connected: false },
  { id: 'cashfree', name: 'Cashfree', description: 'Orders, settlements, refunds', logo: '💰', connected: false },
  { id: 'chargebee', name: 'Chargebee', description: 'Real MRR, churn events, plan revenue', logo: '📊', connected: false },
  { id: 'woocommerce', name: 'WooCommerce', description: 'Orders, GMV, AOV', logo: '🛒', connected: false },
];

const tier2Connectors = [
  { id: 'ga4', name: 'Google Analytics 4', description: 'Purchase revenue, conversions', logo: '📈', connected: false },
  { id: 'zoho', name: 'Zoho Books', description: 'Invoices, P&L, payments received', logo: '📚', connected: false },
  { id: 'quickbooks', name: 'QuickBooks', description: 'P&L report, invoice list', logo: '📒', connected: false },
  { id: 'google-ads', name: 'Google Ads', description: 'Spend, ROAS, CAC calculation', logo: '🎯', connected: false },
  { id: 'meta-ads', name: 'Meta Ads', description: 'Ad spend, conversions, CAC', logo: '📱', connected: false },
];

const tier3Connectors = [
  { id: 'tally', name: 'Tally / Excel', description: 'Upload your Tally export', logo: '📄', type: 'upload' },
  { id: 'amazon', name: 'Amazon Seller', description: 'Seller Central reports', logo: '📦', type: 'upload' },
  { id: 'flipkart', name: 'Flipkart Seller', description: 'Seller Hub exports', logo: '🏪', type: 'upload' },
  { id: 'swiggy', name: 'Swiggy / Zomato', description: 'Payout reports', logo: '🍔', type: 'upload' },
];

const ConnectorCard = ({ connector, onConnect, onDisconnect, onSync }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!apiKey) return;
    setConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnecting(false);
    onConnect(connector.id, apiKey);
    setApiKey('');
  };

  return (
    <CenturionCard hover className={cn(connector.connected && 'border-emerald-200 bg-emerald-50/30')}>
      <CenturionCardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{connector.logo}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-[#09090B]">{connector.name}</h4>
              {connector.connected && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">
                  <Check className="w-3 h-3" strokeWidth={2} />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-[#71717A]">{connector.description}</p>
            
            {connector.connected ? (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-[#A1A1AA]">Last sync: {connector.lastSync}</span>
                <button 
                  onClick={() => onSync(connector.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
                  Sync now
                </button>
                <button 
                  onClick={() => onDisconnect(connector.id)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="mt-3">
                {connector.type === 'upload' ? (
                  <button className="w-full h-8 rounded-lg border border-dashed border-[rgba(0,0,0,0.2)] text-xs text-[#52525B] hover:bg-[#F4F4F5] transition-colors flex items-center justify-center gap-1">
                    <Upload className="w-3 h-3" strokeWidth={1.5} />
                    Upload CSV
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter API key..."
                          className="w-full h-8 px-3 pr-8 rounded-lg border border-[rgba(0,0,0,0.1)] text-xs focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B]"
                        >
                          {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                      <button
                        onClick={handleConnect}
                        disabled={!apiKey || connecting}
                        className={cn(
                          'h-8 px-3 rounded-lg text-xs font-medium transition-colors',
                          'bg-[#09090B] text-white hover:bg-[#18181B]',
                          'disabled:bg-[#E4E4E7] disabled:text-[#A1A1AA] disabled:cursor-not-allowed'
                        )}
                      >
                        {connecting ? (
                          <RefreshCw className="w-3 h-3 animate-spin" strokeWidth={1.5} />
                        ) : (
                          'Connect'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CenturionCardContent>
    </CenturionCard>
  );
};

export const Connectors = () => {
  const [connectors, setConnectors] = useState({
    razorpay: tier1Connectors.find(c => c.id === 'razorpay'),
  });
  const [syncResult, setSyncResult] = useState(null);

  const handleConnect = (id, apiKey) => {
    console.log(`Connecting ${id} with key: ${apiKey.substring(0, 5)}...`);
    // In production, this would call the backend to encrypt and store the key
  };

  const handleDisconnect = (id) => {
    console.log(`Disconnecting ${id}`);
  };

  const handleSync = (id) => {
    // Show sync result modal
    setSyncResult({
      provider: 'Razorpay',
      revenue: '4.23',
      month: 'January',
    });
  };

  return (
    <div className="space-y-6" data-testid="connectors">
      {/* Header */}
      <div>
        <h1 className="type-title text-[#09090B] mb-1">
          {copy.dashboard.connectors.title}
        </h1>
        <p className="type-body text-[#52525B]">
          {copy.dashboard.connectors.subtitle}
        </p>
      </div>

      {/* Trust Header */}
      <CenturionCard className="bg-emerald-50 border-emerald-200">
        <CenturionCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-emerald-800">
              {copy.dashboard.connectors.trustHeader}
            </p>
          </div>
        </CenturionCardContent>
      </CenturionCard>

      {/* Tier 1 - API Key */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-medium text-[#09090B]">{copy.dashboard.connectors.tier1.title}</h3>
          <span className="text-xs text-[#71717A]">— {copy.dashboard.connectors.tier1.description}</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tier1Connectors.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
            />
          ))}
        </div>
      </div>

      {/* Tier 2 - OAuth */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-medium text-[#09090B]">{copy.dashboard.connectors.tier2.title}</h3>
          <span className="text-xs text-[#71717A]">— {copy.dashboard.connectors.tier2.description}</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tier2Connectors.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
            />
          ))}
        </div>
      </div>

      {/* Tier 3 - CSV Upload */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-medium text-[#09090B]">{copy.dashboard.connectors.tier3.title}</h3>
          <span className="text-xs text-[#71717A]">— {copy.dashboard.connectors.tier3.description}</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tier3Connectors.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onSync={handleSync}
            />
          ))}
        </div>
      </div>

      {/* Sync Result Modal */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSyncResult(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <CenturionCard>
                <CenturionCardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-emerald-50">
                      <Check className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                    </div>
                    <button 
                      onClick={() => setSyncResult(null)}
                      className="p-1 hover:bg-[#F4F4F5] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  <h3 className="font-medium text-[#09090B] mb-2">Sync Complete</h3>
                  <p className="text-sm text-[#52525B] mb-6">
                    Your {syncResult.provider} data shows <strong className="font-mono">₹{syncResult.revenue}L</strong> in {syncResult.month}. 
                    {copy.dashboard.connectors.syncConfirm}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSyncResult(null)}
                      className="flex-1 h-10 rounded-lg bg-[#09090B] text-white text-sm font-medium hover:bg-[#18181B] transition-colors"
                    >
                      Confirm & Save
                    </button>
                    <button
                      onClick={() => setSyncResult(null)}
                      className="h-10 px-4 rounded-lg border border-[rgba(0,0,0,0.1)] text-sm text-[#52525B] hover:bg-[#F4F4F5] transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </CenturionCardContent>
              </CenturionCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Connectors;
