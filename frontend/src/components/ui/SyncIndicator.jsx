// SyncIndicator - Real-time data sync indicators for dashboard cards
// =================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SyncStatus Component
 * Shows a pulsing dot indicating data freshness
 */
export const SyncStatus = ({ 
  lastSynced, // ISO timestamp or Date
  isLoading = false,
  isError = false,
  showLabel = true,
  size = 'sm', // 'sm' | 'md'
}) => {
  const [timeSince, setTimeSince] = useState('');
  
  useEffect(() => {
    if (!lastSynced) return;
    
    const updateTimeSince = () => {
      const now = new Date();
      const synced = new Date(lastSynced);
      const diffMs = now - synced;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      
      if (diffSec < 30) {
        setTimeSince('Just now');
      } else if (diffSec < 60) {
        setTimeSince(`${diffSec}s ago`);
      } else if (diffMin < 60) {
        setTimeSince(`${diffMin}m ago`);
      } else if (diffHour < 24) {
        setTimeSince(`${diffHour}h ago`);
      } else {
        setTimeSince(synced.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    };
    
    updateTimeSince();
    const interval = setInterval(updateTimeSince, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [lastSynced]);
  
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  
  return (
    <div className="flex items-center gap-2">
      {/* Pulse indicator */}
      <div className="relative">
        <motion.div
          className={cn(
            'rounded-full',
            dotSize,
            isLoading && 'bg-amber-500',
            isError && 'bg-red-500',
            !isLoading && !isError && 'bg-emerald-500'
          )}
          animate={!isLoading && !isError ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Outer pulse ring for live status */}
        {!isLoading && !isError && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full',
              'bg-emerald-500 opacity-30'
            )}
            animate={{
              scale: [1, 2],
              opacity: [0.4, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </div>
      
      {/* Label */}
      {showLabel && (
        <span className={cn(
          'text-xs',
          isLoading && 'text-amber-600',
          isError && 'text-red-600',
          !isLoading && !isError && 'text-[#A1A1AA]'
        )}>
          {isLoading ? 'Syncing...' : isError ? 'Sync failed' : timeSince}
        </span>
      )}
    </div>
  );
};

/**
 * RefreshButton Component
 * Button to manually trigger data refresh
 */
export const RefreshButton = ({ 
  onClick, 
  isLoading = false,
  size = 'sm',
  showTooltip = true,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleClick = async () => {
    if (isLoading) return;
    await onClick?.();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };
  
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const padding = size === 'sm' ? 'p-1.5' : 'p-2';
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'rounded-lg transition-all duration-200',
        padding,
        'hover:bg-[#F4F4F5]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'relative group'
      )}
      title={showTooltip ? 'Refresh data' : undefined}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <CheckCircle className={cn(iconSize, 'text-emerald-500')} strokeWidth={1.5} />
          </motion.div>
        ) : (
          <motion.div
            key="refresh"
            animate={isLoading ? { rotate: 360 } : {}}
            transition={isLoading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <RefreshCw className={cn(iconSize, 'text-[#71717A]')} strokeWidth={1.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

/**
 * ConnectionStatus Component
 * Shows overall connection/API health
 */
export const ConnectionStatus = ({ isConnected = true }) => {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
      isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
    )}>
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" strokeWidth={1.5} />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" strokeWidth={1.5} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

/**
 * DataCard Header with Sync
 * Reusable card header with title and sync indicator
 */
export const DataCardHeader = ({
  title,
  subtitle,
  lastSynced,
  isLoading,
  isError,
  onRefresh,
  icon: Icon,
  iconClassName,
  rightElement,
}) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={cn('p-2 rounded-lg', iconClassName || 'bg-[#F4F4F5]')}>
            <Icon className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h3 className="font-medium text-[#09090B]">{title}</h3>
          {subtitle && <p className="text-xs text-[#A1A1AA] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {lastSynced !== undefined && (
          <SyncStatus 
            lastSynced={lastSynced} 
            isLoading={isLoading} 
            isError={isError}
          />
        )}
        {onRefresh && (
          <RefreshButton onClick={onRefresh} isLoading={isLoading} />
        )}
        {rightElement}
      </div>
    </div>
  );
};

/**
 * useSyncState Hook
 * Manages sync state for a data fetching operation
 */
export const useSyncState = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      const result = await fetchFn();
      setData(result);
      setLastSynced(new Date().toISOString());
    } catch (error) {
      console.error('Sync error:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn]);
  
  useEffect(() => {
    refresh();
  }, [...dependencies, refresh]);
  
  return {
    data,
    isLoading,
    isError,
    lastSynced,
    refresh,
  };
};

export default {
  SyncStatus,
  RefreshButton,
  ConnectionStatus,
  DataCardHeader,
  useSyncState,
};
