-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Add billing and expires_at columns to subscriptions table
-- Run in: Supabase SQL Editor
-- Date: March 2026
-- ═══════════════════════════════════════════════════════════════════════════

-- Add new columns for billing cycle and expiration tracking
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS billing TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update existing founder subscriptions (created under old annual pricing)
UPDATE subscriptions
  SET billing = 'annual',
      expires_at = created_at + INTERVAL '365 days'
  WHERE plan = 'founder'
    AND billing IS NULL;

-- Update existing subscriptions that don't have expires_at set
UPDATE subscriptions
  SET expires_at = created_at + INTERVAL '30 days'
  WHERE expires_at IS NULL
    AND billing != 'annual';

-- Create index for expiration queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at
  ON subscriptions(expires_at);

-- Add comment documenting valid values
COMMENT ON COLUMN subscriptions.billing IS 'Billing cycle: monthly, annual, trial_7d';
COMMENT ON COLUMN subscriptions.plan IS 'Plan name: free, starter, founder, studio, vc_portfolio';
COMMENT ON COLUMN subscriptions.status IS 'Status: active, trialing, expired, cancelled';

