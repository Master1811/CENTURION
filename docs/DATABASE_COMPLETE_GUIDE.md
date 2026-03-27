# Centurion 100Cr Engine - Complete Database Guide

> **Version:** 2.0  
> **Last Updated:** March 28, 2026  
> **Database:** Supabase PostgreSQL

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Database Schema Overview](#-database-schema-overview)
3. [Step-by-Step Setup](#-step-by-step-setup)
4. [Tables Reference](#-tables-reference)
5. [Admin Operations](#-admin-operations)
6. [User Management](#-user-management)
7. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Run Everything in Order

Copy and paste the following sections into **Supabase Dashboard → SQL Editor → New Query** in the order shown.

---

## 📊 Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CENTURION DATABASE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  auth.users (Supabase Auth)                                     │
│       │                                                          │
│       ├──────────────────┬──────────────────┐                   │
│       │                  │                  │                    │
│       ▼                  ▼                  ▼                    │
│  ┌─────────┐      ┌─────────────┐    ┌──────────────┐          │
│  │profiles │      │subscriptions│    │   checkins   │          │
│  └────┬────┘      └─────────────┘    └──────────────┘          │
│       │                                                          │
│       ├──────────────────┬──────────────────┐                   │
│       │                  │                  │                    │
│       ▼                  ▼                  ▼                    │
│  ┌──────────────┐ ┌─────────────┐   ┌───────────────┐          │
│  │connector_keys│ │ai_usage_log │   │engagement_    │          │
│  └──────────────┘ └─────────────┘   │events         │          │
│                                     └───────────────┘           │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │projection_runs  │  │quiz_submissions  │  │waitlist         ││
│  │(public/shared)  │  │(anonymous)       │  │(beta signups)   ││
│  └─────────────────┘  └──────────────────┘  └─────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │benchmark_contributions (fully anonymized - NO user data)    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Step-by-Step Setup

### STEP 1: Create Plan Tier Enum

```sql
-- ============================================================================
-- STEP 1: Plan Tier Enum
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('FREE', 'PRO', 'STUDIO', 'VC_PORTFOLIO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
```

---

### STEP 2: Create Profiles Table

```sql
-- ============================================================================
-- STEP 2: Profiles Table (Core User Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    full_name TEXT,
    company TEXT,
    company_name TEXT,
    website TEXT,
    stage TEXT DEFAULT 'pre-seed' CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b')),
    sector TEXT,
    industry TEXT,
    current_mrr DECIMAL(15, 2),
    growth_rate DECIMAL(5, 4),
    team_size INTEGER,
    
    -- Business model (SaaS vs Agency routing)
    business_model TEXT CHECK (business_model IN ('saas', 'agency')) DEFAULT NULL,
    
    -- Onboarding & engagement
    onboarding_completed BOOLEAN DEFAULT FALSE,
    current_streak INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    last_checkin_month TEXT,
    last_checkin_at TIMESTAMPTZ,
    
    -- Plan & access
    plan_tier plan_tier DEFAULT 'FREE',
    
    -- Beta access
    beta_status TEXT DEFAULT 'inactive',
    beta_expires_at TIMESTAMPTZ,
    
    -- DPDP compliance (India)
    dpdp_consent_given BOOLEAN DEFAULT FALSE,
    dpdp_consent_at TIMESTAMPTZ,
    
    -- Email preferences
    email_preferences JSONB DEFAULT '{
      "weekly_digest": true,
      "milestone_alerts": true,
      "checkin_reminders": true,
      "streak_reminders": true,
      "anomaly_alerts": true
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS profiles_beta_status_idx ON profiles(beta_status);
CREATE INDEX IF NOT EXISTS profiles_business_model_idx ON profiles(business_model);
```

---

### STEP 3: Create Subscriptions Table

```sql
-- ============================================================================
-- STEP 3: Subscriptions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Plan details
    plan TEXT DEFAULT 'founder',
    plan_tier plan_tier DEFAULT 'PRO',
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'trialing')),
    
    -- Billing
    billing TEXT DEFAULT 'annual',
    billing_cycle TEXT DEFAULT 'annual',
    
    -- Dates
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Payment info
    payment_provider TEXT,
    payment_id TEXT,
    payment_ref TEXT UNIQUE,
    razorpay_subscription_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Service role full access subs" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access subs" ON subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_payment_ref_idx ON subscriptions(payment_ref);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_plan_expires ON subscriptions(status, plan, expires_at);

-- Comments
COMMENT ON COLUMN subscriptions.plan IS 'Plan name: free, founder, studio, vc_portfolio';
COMMENT ON COLUMN subscriptions.billing IS 'Billing cycle: annual';
COMMENT ON COLUMN subscriptions.status IS 'Status: active, expired, cancelled';
```

---

### STEP 4: Create Check-ins Table

```sql
-- ============================================================================
-- STEP 4: Check-ins Table (Monthly Revenue Tracking)
-- ============================================================================
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

-- Enable RLS
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can insert own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can update own checkins" ON checkins;
DROP POLICY IF EXISTS "Users can delete own checkins" ON checkins;
DROP POLICY IF EXISTS "Service role full access checkins" ON checkins;

CREATE POLICY "Users can view own checkins" ON checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON checkins
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins" ON checkins
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access checkins" ON checkins
    FOR ALL USING (auth.role() = 'service_role');

-- Index
CREATE INDEX IF NOT EXISTS idx_checkins_user_month ON checkins(user_id, month DESC);
```

---

### STEP 5: Create Connector Keys Table

```sql
-- ============================================================================
-- STEP 5: Connector Keys Table (Encrypted API Keys)
-- ============================================================================
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

-- Enable RLS
ALTER TABLE connector_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own connectors" ON connector_keys;
DROP POLICY IF EXISTS "Users can insert own connectors" ON connector_keys;
DROP POLICY IF EXISTS "Users can update own connectors" ON connector_keys;
DROP POLICY IF EXISTS "Users can delete own connectors" ON connector_keys;
DROP POLICY IF EXISTS "Service role full access connectors" ON connector_keys;

CREATE POLICY "Users can view own connectors" ON connector_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connectors" ON connector_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connectors" ON connector_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connectors" ON connector_keys
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access connectors" ON connector_keys
    FOR ALL USING (auth.role() = 'service_role');
```

---

### STEP 6: Create AI Usage Log Table

```sql
-- ============================================================================
-- STEP 6: AI Usage Log Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    model TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost_inr DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_log;
DROP POLICY IF EXISTS "Service role full access ai" ON ai_usage_log;

CREATE POLICY "Users can view own AI usage" ON ai_usage_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access ai" ON ai_usage_log
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_feature ON ai_usage_log(user_id, feature, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_log_user_month_idx ON ai_usage_log(user_id, created_at DESC);
```

---

### STEP 7: Create Engagement Events Table

```sql
-- ============================================================================
-- STEP 7: Engagement Events Table (Habit Engine)
-- ============================================================================
CREATE TABLE IF NOT EXISTS engagement_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users NOT NULL,
    event_type TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'email',
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS eng_events_user_idx ON engagement_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS eng_events_time_idx ON engagement_events(sent_at DESC);

-- Enable RLS
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "users view own engagement events" ON engagement_events
    FOR SELECT USING (auth.uid() = user_id);
```

---

### STEP 8: Create Projection Runs Table

```sql
-- ============================================================================
-- STEP 8: Projection Runs Table (Shareable Projections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS projection_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    inputs JSONB NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projection_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (publicly readable by slug)
DROP POLICY IF EXISTS "Projections are publicly readable" ON projection_runs;
DROP POLICY IF EXISTS "Users can insert projections" ON projection_runs;
DROP POLICY IF EXISTS "Service role full access proj" ON projection_runs;

CREATE POLICY "Projections are publicly readable" ON projection_runs
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert projections" ON projection_runs
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service role full access proj" ON projection_runs
    FOR ALL USING (auth.role() = 'service_role');

-- Index
CREATE INDEX IF NOT EXISTS idx_projection_runs_slug ON projection_runs(slug);
```

---

### STEP 9: Create Quiz Submissions Table

```sql
-- ============================================================================
-- STEP 9: Quiz Submissions Table (Lead Generation - Anonymous)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answers JSONB NOT NULL,
    email TEXT,
    result JSONB,
    percentile INTEGER,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can insert quiz" ON quiz_submissions;
DROP POLICY IF EXISTS "Service role full access quiz" ON quiz_submissions;

CREATE POLICY "Anyone can insert quiz" ON quiz_submissions
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service role full access quiz" ON quiz_submissions
    FOR ALL USING (auth.role() = 'service_role');
```

---

### STEP 10: Create Waitlist Table

```sql
-- ============================================================================
-- STEP 10: Waitlist Table (Beta Signups)
-- ============================================================================
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_referral ON waitlist(referral_source);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public waitlist signup" ON waitlist;
DROP POLICY IF EXISTS "Service role can read waitlist" ON waitlist;

CREATE POLICY "Allow public waitlist signup" ON waitlist
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read waitlist" ON waitlist
    FOR SELECT USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE waitlist IS 'Beta launch waitlist for Centurion';
COMMENT ON COLUMN waitlist.dpdp_consent_given IS 'DPDP consent required for waitlist signup';
COMMENT ON COLUMN waitlist.referral_source IS 'Email slug of referrer for viral loop tracking';
```

---

### STEP 11: Create Benchmark Contributions Table

```sql
-- ============================================================================
-- STEP 11: Benchmark Contributions Table (FULLY ANONYMIZED)
-- ============================================================================
-- CRITICAL: This table contains NO user identifiable information
CREATE TABLE IF NOT EXISTS benchmark_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NO user_id field - completely anonymous
    stage TEXT NOT NULL CHECK (stage IN ('pre-seed', 'seed', 'series-a', 'series-b')),
    growth_rate DECIMAL(5, 4) NOT NULL,
    arr_bucket TEXT NOT NULL,  -- Bucketed range, not exact value
    industry_category TEXT,     -- Broad category only
    contribution_hash TEXT NOT NULL,  -- Hash to prevent duplicates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE benchmark_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can read benchmarks" ON benchmark_contributions;
DROP POLICY IF EXISTS "Service role full access bench" ON benchmark_contributions;

CREATE POLICY "Anyone can read benchmarks" ON benchmark_contributions
    FOR SELECT USING (TRUE);

CREATE POLICY "Service role full access bench" ON benchmark_contributions
    FOR ALL USING (auth.role() = 'service_role');

-- Prevent duplicate contributions
CREATE UNIQUE INDEX IF NOT EXISTS idx_benchmark_hash ON benchmark_contributions(contribution_hash);

-- Comment
COMMENT ON TABLE benchmark_contributions IS 'Fully anonymized - NO user_id or company stored';
```

---

### STEP 12: Create Functions and Triggers

```sql
-- ============================================================================
-- STEP 12: Functions and Triggers
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    onboarding_completed,
    beta_status,
    plan_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,
    'inactive',
    'FREE',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function: Complete user deletion (cascading)
CREATE OR REPLACE FUNCTION delete_user_complete(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM ai_usage_log WHERE user_id = target_user_id;
    DELETE FROM connector_keys WHERE user_id = target_user_id;
    DELETE FROM checkins WHERE user_id = target_user_id;
    DELETE FROM subscriptions WHERE user_id = target_user_id;
    DELETE FROM projection_runs WHERE user_id = target_user_id;
    DELETE FROM engagement_events WHERE user_id = target_user_id;
    DELETE FROM profiles WHERE id = target_user_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get paid users for weekly digest
CREATE OR REPLACE FUNCTION get_paid_users_for_digest()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  current_mrr NUMERIC,
  growth_rate NUMERIC,
  stage TEXT,
  streak_count INTEGER,
  email_preferences JSONB
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    u.email,
    COALESCE(p.name, p.full_name, 'Founder') AS full_name,
    COALESCE(p.company_name, p.company, 'your company') AS company_name,
    COALESCE(p.current_mrr, 0) AS current_mrr,
    COALESCE(p.growth_rate, 0.08) AS growth_rate,
    COALESCE(p.stage, 'seed') AS stage,
    COALESCE(p.streak_count, 0) AS streak_count,
    COALESCE(p.email_preferences, '{"weekly_digest": true}'::jsonb) AS email_preferences
  FROM profiles p
  JOIN auth.users u ON u.id = p.id
  JOIN subscriptions s ON s.user_id = p.id
  WHERE s.status IN ('active', 'trialing')
    AND s.plan IN ('starter','founder','studio','vc_portfolio')
    AND COALESCE(p.current_mrr, 0) > 0;
END;
$$;

-- Function: Get cohort percentile
CREATE OR REPLACE FUNCTION get_cohort_percentile(p_growth_rate NUMERIC, p_stage TEXT)
RETURNS INTEGER
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT COALESCE(
    (
      SELECT ROUND(
        COUNT(*) FILTER (WHERE COALESCE(growth_rate, 0) < p_growth_rate)::NUMERIC
        / NULLIF(COUNT(*)::NUMERIC, 0) * 100
      )::INTEGER
      FROM profiles
      WHERE COALESCE(stage, 'seed') = p_stage
        AND growth_rate IS NOT NULL
    ),
    50
  );
$$;

-- Function: Get cohort size
CREATE OR REPLACE FUNCTION get_cohort_size(p_stage TEXT)
RETURNS INTEGER
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER
  FROM profiles
  WHERE COALESCE(stage, 'seed') = p_stage
    AND growth_rate IS NOT NULL;
$$;
```

---

### STEP 13: Create Views

```sql
-- ============================================================================
-- STEP 13: Views
-- ============================================================================

-- View: Benchmark statistics by stage (anonymized aggregates)
CREATE OR REPLACE VIEW benchmark_stats AS
SELECT 
    stage,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY growth_rate) as median,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY growth_rate) as p75,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY growth_rate) as p90,
    COUNT(*) as sample_size
FROM benchmark_contributions
GROUP BY stage;
```

---

### STEP 14: Grant Permissions

```sql
-- ============================================================================
-- STEP 14: Grant Permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.subscriptions TO postgres, service_role;
GRANT SELECT ON public.subscriptions TO authenticated;
```

---

### STEP 15: Backfill Existing Users

```sql
-- ============================================================================
-- STEP 15: Backfill Profiles for Existing Users
-- ============================================================================
INSERT INTO public.profiles (id, email, onboarding_completed, beta_status, plan_tier, created_at, updated_at)
SELECT
  u.id,
  u.email,
  FALSE,
  'inactive',
  'FREE',
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

---

## 👤 Admin Operations

### Grant Beta Access to a User

```sql
-- Grant beta access (60 days) by email
UPDATE public.profiles
SET 
  beta_status = 'active',
  beta_expires_at = NOW() + INTERVAL '60 days',
  updated_at = NOW()
WHERE email = 'user@example.com';

-- Verify
SELECT id, email, beta_status, beta_expires_at 
FROM public.profiles 
WHERE email = 'user@example.com';
```

### Grant Full Subscription Access

```sql
-- Grant founder subscription (1 year) by email
INSERT INTO public.subscriptions (
  user_id, plan, plan_tier, status, billing, payment_provider, expires_at, created_at, updated_at
)
SELECT 
  id, 'founder', 'PRO', 'active', 'annual', 'admin_grant', NOW() + INTERVAL '365 days', NOW(), NOW()
FROM public.profiles 
WHERE email = 'user@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET
  plan = 'founder',
  plan_tier = 'PRO',
  status = 'active',
  expires_at = NOW() + INTERVAL '365 days',
  updated_at = NOW();
```

### Grant Beta + Subscription Together

```sql
-- COMPLETE ACCESS: Beta + Founder Subscription
-- Step 1: Grant beta
UPDATE public.profiles
SET 
  beta_status = 'active',
  beta_expires_at = NOW() + INTERVAL '60 days',
  updated_at = NOW()
WHERE email = 'user@example.com';

-- Step 2: Grant subscription
INSERT INTO public.subscriptions (user_id, plan, plan_tier, status, billing, payment_provider, expires_at, created_at, updated_at)
SELECT id, 'founder', 'PRO', 'active', 'annual', 'admin_grant', NOW() + INTERVAL '365 days', NOW(), NOW()
FROM public.profiles WHERE email = 'user@example.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan = 'founder', plan_tier = 'PRO', status = 'active', expires_at = NOW() + INTERVAL '365 days', updated_at = NOW();
```

### Grant Bulk Beta Access (All Users)

```sql
-- WARNING: Grants beta to ALL existing users
UPDATE public.profiles
SET 
  beta_status = 'active',
  beta_expires_at = NOW() + INTERVAL '60 days',
  updated_at = NOW()
WHERE beta_status IS NULL OR beta_status = 'inactive';
```

---

## 🔍 User Management Queries

### Check User Access Status

```sql
SELECT 
  p.id,
  p.email,
  p.beta_status,
  p.beta_expires_at,
  p.beta_expires_at > NOW() as beta_valid,
  p.onboarding_completed,
  s.plan,
  s.status as subscription_status,
  s.expires_at as subscription_expires,
  s.expires_at > NOW() as subscription_valid
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
WHERE p.email = 'user@example.com';
```

### List All Users with Access Status

```sql
SELECT 
  p.email,
  p.beta_status,
  p.beta_expires_at > NOW() as beta_active,
  s.plan,
  s.status,
  s.expires_at > NOW() as subscription_active,
  p.created_at
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
ORDER BY p.created_at DESC
LIMIT 50;
```

### Find Users Without Profiles

```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### Find Expired Beta Users

```sql
SELECT id, email, beta_status, beta_expires_at
FROM public.profiles
WHERE beta_status = 'active' 
  AND beta_expires_at < NOW();
```

### Find Expired Subscriptions

```sql
SELECT 
  p.email,
  s.plan,
  s.status,
  s.expires_at
FROM subscriptions s
JOIN profiles p ON p.id = s.user_id
WHERE s.expires_at < NOW()
  AND s.status = 'active';
```

---

## 🔧 Troubleshooting

### User Can't Access Dashboard

```sql
-- Check if user has profile and valid access
SELECT 
  p.email,
  p.beta_status,
  p.beta_expires_at > NOW() as beta_valid,
  s.plan,
  s.status,
  s.expires_at > NOW() as sub_valid
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
WHERE p.email = 'problem-user@example.com';
```

**If beta_valid = false:** Run the beta grant SQL.  
**If sub_valid = false:** Run the subscription grant SQL.  
**If no row returned:** User needs to sign in first to create their profile.

### Profile Doesn't Exist After Signup

```sql
-- Manually create profile for auth user
INSERT INTO public.profiles (id, email, beta_status, plan_tier, created_at, updated_at)
SELECT id, email, 'inactive', 'FREE', NOW(), NOW()
FROM auth.users 
WHERE email = 'user@example.com'
ON CONFLICT (id) DO NOTHING;
```

### Reset User's Onboarding

```sql
UPDATE public.profiles
SET onboarding_completed = FALSE, updated_at = NOW()
WHERE email = 'user@example.com';
```

### Delete User Completely

```sql
-- Get user ID first
SELECT id FROM public.profiles WHERE email = 'user@example.com';

-- Then call the delete function (replace with actual UUID)
SELECT delete_user_complete('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');

-- Note: You still need to delete from auth.users via Supabase Admin API
```

---

## 📊 Analytics Queries

### Total Users by Plan

```sql
SELECT 
  COALESCE(s.plan, 'no_subscription') as plan,
  COUNT(*) as user_count
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
GROUP BY s.plan
ORDER BY user_count DESC;
```

### Active Beta Users

```sql
SELECT COUNT(*) as active_beta_users
FROM profiles
WHERE beta_status = 'active' 
  AND beta_expires_at > NOW();
```

### Revenue by Plan (Estimated)

```sql
SELECT 
  s.plan,
  COUNT(*) as users,
  CASE 
    WHEN s.plan = 'founder' THEN COUNT(*) * 3999
    WHEN s.plan = 'studio' THEN COUNT(*) * 9999
    ELSE 0
  END as estimated_arr
FROM subscriptions s
WHERE s.status = 'active'
GROUP BY s.plan;
```

---

## ✅ Verification Checklist

Run these queries to verify your setup:

```sql
-- 1. Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Check profile trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Check users without profiles
SELECT COUNT(*) as orphaned_users
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

---

## 📝 Quick Reference

| Access Type | Requires | Duration |
|-------------|----------|----------|
| Beta Access | `beta_status = 'active'` + valid `beta_expires_at` | Usually 60 days |
| Paid Access | `subscriptions.status = 'active'` + valid `expires_at` | Usually 365 days |
| Admin Access | Email in `ADMIN_EMAILS` env variable | Permanent |
| Dashboard | Beta OR Paid access | Depends on type |
| AI Features | Paid access (founder+) | Depends on subscription |

---

*Generated: March 28, 2026*

