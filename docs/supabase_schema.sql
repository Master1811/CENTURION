-- 100Cr Engine Database Schema
-- ==============================
-- Run this in Supabase SQL Editor to create all required tables.
-- 
-- Tables:
-- 1. profiles - User profiles and settings
-- 2. subscriptions - Subscription status
-- 3. projection_runs - Saved projections (shareable)
-- 4. checkins - Monthly revenue check-ins
-- 5. connector_keys - Encrypted API keys
-- 6. quiz_submissions - Founder DNA quiz responses
-- 7. ai_usage_log - Track AI feature usage
-- 8. benchmark_contributions - Anonymized benchmarks

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information extending Supabase auth.users

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    company TEXT,
    stage TEXT DEFAULT 'pre-seed' CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b')),
    current_mrr DECIMAL(15, 2),
    growth_rate DECIMAL(5, 4),
    industry TEXT,
    team_size INTEGER,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    current_streak INTEGER DEFAULT 0,
    last_checkin_month TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can do everything
CREATE POLICY "Service role full access" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
-- Tracks user subscription status

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'trialing')),
    plan TEXT DEFAULT 'founder',
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    payment_provider TEXT,
    payment_id TEXT,
    razorpay_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- PROJECTION RUNS TABLE
-- ============================================================================
-- Stores projection calculations for sharing

CREATE TABLE IF NOT EXISTS projection_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inputs JSONB NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projections are publicly readable by slug
ALTER TABLE projection_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projections are publicly readable" ON projection_runs
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert projections" ON projection_runs
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can view own projections" ON projection_runs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON projection_runs
    FOR ALL USING (auth.role() = 'service_role');

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_projection_runs_slug ON projection_runs(slug);

-- ============================================================================
-- CHECKINS TABLE
-- ============================================================================
-- Monthly revenue check-ins

CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,  -- Format: YYYY-MM
    actual_revenue DECIMAL(15, 2) NOT NULL,
    projected_revenue DECIMAL(15, 2),
    deviation_pct DECIMAL(6, 2),
    note TEXT,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'razorpay', 'stripe', 'cashfree', 'csv')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON checkins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON checkins
    FOR ALL USING (auth.role() = 'service_role');

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_checkins_user_month ON checkins(user_id, month DESC);

-- ============================================================================
-- CONNECTOR KEYS TABLE
-- ============================================================================
-- Encrypted API keys for payment gateway integrations

CREATE TABLE IF NOT EXISTS connector_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'cashfree', 'chargebee')),
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

ALTER TABLE connector_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own connectors (without the encrypted key)
CREATE POLICY "Users can view own connectors" ON connector_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connectors" ON connector_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connectors" ON connector_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connectors" ON connector_keys
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON connector_keys
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- QUIZ SUBMISSIONS TABLE
-- ============================================================================
-- Founder DNA quiz responses for lead generation

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answers JSONB NOT NULL,
    email TEXT,
    result JSONB,
    percentile INTEGER,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz submissions don't need user auth
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert quiz submissions" ON quiz_submissions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service role full access" ON quiz_submissions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- AI USAGE LOG TABLE
-- ============================================================================
-- Track AI feature usage for rate limiting

CREATE TABLE IF NOT EXISTS ai_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage" ON ai_usage_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON ai_usage_log
    FOR ALL USING (auth.role() = 'service_role');

-- Index for rate limit queries
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON ai_usage_log(user_id, feature, created_at DESC);

-- ============================================================================
-- BENCHMARK CONTRIBUTIONS TABLE
-- ============================================================================
-- Anonymized benchmark data contributed by users

CREATE TABLE IF NOT EXISTS benchmark_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage TEXT NOT NULL,
    growth_rate DECIMAL(5, 4) NOT NULL,
    arr_range TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Benchmark contributions are fully anonymous
ALTER TABLE benchmark_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read benchmarks" ON benchmark_contributions
    FOR SELECT USING (TRUE);

CREATE POLICY "Service role full access" ON benchmark_contributions
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for benchmark statistics by stage
CREATE OR REPLACE VIEW benchmark_stats AS
SELECT 
    stage,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY growth_rate) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY growth_rate) as p75,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY growth_rate) as p90,
    COUNT(*) as sample_size
FROM benchmark_contributions
GROUP BY stage;
