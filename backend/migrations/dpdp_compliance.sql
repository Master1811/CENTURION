-- ============================================================================
-- DPDP Compliance Migration
-- ============================================================================
-- Digital Personal Data Protection Act 2023 (India)
-- This migration adds consent tracking fields to profiles table
-- 
-- Safe to re-run: Uses IF NOT EXISTS for all alterations
-- ============================================================================

-- Add DPDP consent fields to profiles table
DO $$ 
BEGIN
    -- Add dpdp_consent_given column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dpdp_consent_given'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dpdp_consent_given BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add dpdp_consent_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'dpdp_consent_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN dpdp_consent_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- Waitlist Table
-- ============================================================================
-- For beta launch waitlist management

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    company TEXT,
    stage TEXT,
    referral_source TEXT,
    ip_address TEXT,
    dpdp_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    dpdp_consent_at TIMESTAMPTZ,
    converted BOOLEAN NOT NULL DEFAULT FALSE,
    referral_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index for referral tracking
CREATE INDEX IF NOT EXISTS idx_waitlist_referral ON waitlist(referral_source);

-- RLS Policies for waitlist (admin-only read, public insert)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public signup)
DROP POLICY IF EXISTS "Allow public waitlist signup" ON waitlist;
CREATE POLICY "Allow public waitlist signup" ON waitlist
    FOR INSERT 
    WITH CHECK (true);

-- Only service role can read (admin access via backend)
DROP POLICY IF EXISTS "Service role can read waitlist" ON waitlist;
CREATE POLICY "Service role can read waitlist" ON waitlist
    FOR SELECT 
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON COLUMN profiles.dpdp_consent_given IS 'User consent for personal data processing under DPDP Act 2023';
COMMENT ON COLUMN profiles.dpdp_consent_at IS 'Timestamp when DPDP consent was given';
COMMENT ON TABLE waitlist IS 'Beta launch waitlist for Centurion';
COMMENT ON COLUMN waitlist.dpdp_consent_given IS 'DPDP consent required for waitlist signup';
COMMENT ON COLUMN waitlist.referral_source IS 'Email slug of referrer for viral loop tracking';
