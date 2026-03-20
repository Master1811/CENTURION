-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Align subscriptions with Starter/Founder pricing (March 2026)
-- Run in: Supabase SQL Editor
-- Purpose: backfill billing cadence, expiry, and comments for new plans
-- ═══════════════════════════════════════════════════════════════════════════

-- Ensure comments reflect valid values
COMMENT ON COLUMN subscriptions.plan IS 'Plan: free, starter, founder, studio, vc_portfolio';
COMMENT ON COLUMN subscriptions.billing IS 'Billing cadence: monthly, annual, trial_7d';
COMMENT ON COLUMN subscriptions.status IS 'Status: active, trialing, expired, cancelled';

-- Backfill billing for legacy rows
UPDATE subscriptions
  SET billing = 'annual'
  WHERE plan = 'founder'
    AND (billing IS NULL OR billing = 'monthly');

UPDATE subscriptions
  SET billing = 'monthly'
  WHERE billing IS NULL
    AND plan NOT IN ('founder');

-- Normalize trial rows
UPDATE subscriptions
  SET status = 'trialing', billing = 'trial_7d'
  WHERE plan = 'starter'
    AND status = 'active'
    AND billing = 'trial_7d';

-- Ensure expires_at is populated based on billing cadence
UPDATE subscriptions
  SET expires_at = CASE
    WHEN billing = 'annual' THEN created_at + INTERVAL '365 days'
    WHEN billing = 'trial_7d' THEN created_at + INTERVAL '7 days'
    ELSE created_at + INTERVAL '30 days'
  END
  WHERE expires_at IS NULL;

-- Helpful index for expiry-driven queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan_expires
  ON subscriptions(status, plan, expires_at);

