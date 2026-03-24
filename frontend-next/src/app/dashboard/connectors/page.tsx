'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plug, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { useConnectorProviders, useConnectors, useConnectProvider, useDisconnectProvider } from '@/hooks/useApi';
import { CenturionCard, CenturionCardHeader, CenturionCardTitle, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

const PROVIDERS = [
  { id: 'razorpay', name: 'Razorpay', description: 'Payment gateway', category: 'payment', status: 'available' },
  { id: 'stripe', name: 'Stripe', description: 'Payment processing', category: 'payment', status: 'available' },
  { id: 'zoho', name: 'Zoho Books', description: 'Accounting software', category: 'accounting', status: 'coming_soon' },
  { id: 'tally', name: 'Tally', description: 'Accounting & ERP', category: 'accounting', status: 'coming_soon' },
];

export default function ConnectorsPage() {
  const { data: providers, isLoading: providersLoading } = useConnectorProviders();
  const { data: connectors, isLoading: connectorsLoading, refetch } = useConnectors();
  const connectMutation = useConnectProvider();
  const disconnectMutation = useDisconnectProvider();

  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const connectedProviders = connectors?.connectors || [];
  const allProviders = providers?.providers || PROVIDERS;

  const handleConnect = async (providerId: string) => {
    if (!apiKeyInput.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      await connectMutation.mutateAsync({ provider: providerId, apiKey: apiKeyInput });
      toast.success(`${providerId} connected successfully!`);
      setConnectingId(null);
      setApiKeyInput('');
      refetch();
    } catch (error) {
      toast.error('Failed to connect');
    }
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      await disconnectMutation.mutateAsync(providerId);
      toast.success(`${providerId} disconnected`);
      refetch();
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  const isConnected = (providerId: string) => {
    return connectedProviders.some((c: any) => c.provider === providerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Connectors</h1>
          <p className="text-white/60 mt-1">Connect your payment and accounting tools</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Connected */}
      {connectedProviders.length > 0 && (
        <CenturionCard>
          <CenturionCardHeader>
            <CenturionCardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Connected
            </CenturionCardTitle>
          </CenturionCardHeader>
          <CenturionCardContent>
            <div className="space-y-3">
              {connectedProviders.map((connector: any) => (
                <div key={connector.id} className="flex items-center justify-between p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div>
                    <p className="font-semibold text-white">{connector.provider}</p>
                    <p className="text-sm text-white/50">Connected {new Date(connector.connected_at).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(connector.provider)}
                    loading={disconnectMutation.isPending}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CenturionCardContent>
        </CenturionCard>
      )}

      {/* Available Connectors */}
      <CenturionCard>
        <CenturionCardHeader>
          <CenturionCardTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-cyan-400" />
            Available Connectors
          </CenturionCardTitle>
        </CenturionCardHeader>
        <CenturionCardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {allProviders.map((provider: any, i: number) => {
              const connected = isConnected(provider.id);
              const connecting = connectingId === provider.id;

              return (
                <motion.div
                  key={provider.id}
                  className={`p-4 rounded-lg border transition-all ${
                    connected
                      ? 'bg-green-500/10 border-green-500/20'
                      : provider.status === 'coming_soon'
                        ? 'bg-white/5 border-white/10 opacity-50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{provider.name}</p>
                        {connected && <Check className="w-4 h-4 text-green-400" />}
                        {provider.status === 'coming_soon' && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">Soon</span>
                        )}
                      </div>
                      <p className="text-sm text-white/50">{provider.description}</p>
                    </div>
                    {!connected && provider.status === 'available' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConnectingId(connecting ? null : provider.id)}
                      >
                        {connecting ? 'Cancel' : 'Connect'}
                      </Button>
                    )}
                  </div>

                  {/* API Key Input */}
                  {connecting && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 space-y-3"
                    >
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter API Key"
                        className="centurion-input"
                      />
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        loading={connectMutation.isPending}
                        className="w-full"
                      >
                        Connect {provider.name}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CenturionCardContent>
      </CenturionCard>
    </div>
  );
}

