-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION: Pricing Overhaul — Founder-Only Model (March 2026)
-- ═══════════════════════════════════════════════════════════════════════════
-- PURPOSE:
--   Collapse all legacy plans (starter, trial) into the single paid tier:
--   founder / annual / active.
--
-- BREAKING CHANGE — run BEFORE frontend deploy.
--
-- ORDER OF OPERATIONS:
--   1. Migrate starter → founder (annual, 365 days from created_at)
--   2. Migrate trialing → active  (keeps existing expires_at)
--   3. Update schema comments
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Upgrade starter plan to founder ──────────────────────────────────────
UPDATE subscriptions
SET
  plan        = 'founder',
  billing     = 'annual',
  billing_cycle = 'annual',
  expires_at  = created_at + INTERVAL '365 days',
  updated_at  = NOW()
WHERE plan = 'starter';

-- ── 2. Convert trialing status → active ─────────────────────────────────────
UPDATE subscriptions
SET
  status     = 'active',
  updated_at = NOW()
WHERE status = 'trialing';

-- ── 3. Normalise any trial_7d billing rows that slipped through ──────────────
UPDATE subscriptions
SET
  billing       = 'annual',
  billing_cycle = 'annual',
  plan          = 'founder',
  status        = 'active',
  expires_at    = created_at + INTERVAL '365 days',
  updated_at    = NOW()
WHERE billing = 'trial_7d'
   OR billing_cycle = 'trial_7d';

-- ── 4. Update schema comments ────────────────────────────────────────────────
COMMENT ON COLUMN subscriptions.plan IS
  'Plan name: free, founder, studio, vc_portfolio';

COMMENT ON COLUMN subscriptions.billing IS
  'Billing cadence: annual';

COMMENT ON COLUMN subscriptions.billing_cycle IS
  'Billing cadence: annual';

COMMENT ON COLUMN subscriptions.status IS
  'Status: active, expired, cancelled';

-- ── 5. Verify — expect zero rows ────────────────────────────────────────────
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM subscriptions WHERE plan = 'starter') = 0,
    'Migration failed: starter plan rows still exist';
  ASSERT (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing') = 0,
    'Migration failed: trialing status rows still exist';
  ASSERT (SELECT COUNT(*) FROM subscriptions WHERE billing = 'trial_7d' OR billing_cycle = 'trial_7d') = 0,
    'Migration failed: trial_7d billing rows still exist';
END $$;

COMMIT;
