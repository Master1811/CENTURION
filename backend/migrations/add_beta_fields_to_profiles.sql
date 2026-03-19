-- INSTRUCTIONS: Run in Supabase SQL editor before
-- deploying. After running, use the admin endpoint
-- POST /api/admin/beta/{user_id} to grant
-- beta access to invited users.

-- Run in Supabase SQL editor
-- Adds beta access fields to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS beta_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMPTZ;

-- Index for fast expiry checks
CREATE INDEX IF NOT EXISTS profiles_beta_status_idx
  ON profiles(beta_status);

-- Grant beta access helper (run manually per user
-- or via admin endpoint)
-- UPDATE profiles
--   SET beta_status = 'active',
--       beta_expires_at = now() + interval '60 days'
--   WHERE id = 'user-uuid-here';

