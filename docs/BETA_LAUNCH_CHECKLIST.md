# Beta Launch Checklist — 100Cr Engine

> **Goal**: Ship a high-conversion beta waitlist → curated 60-day free trial → 50% founding-member conversion flow for the paid dashboard.

---

## Architecture Constraints (Enforced)

| Constraint | Decision |
|------------|----------|
| Database | **Supabase PostgreSQL only** — no MongoDB references |
| Admin curation | **Supabase Studio** — no custom admin UI for first 50 users |
| Referral engine | **Deferred** — manual tracking via Supabase Studio for beta |
| Data privacy | **DPDP Act 2023** compliance checkbox mandatory on waitlist |
| Connector sync | **Razorpay/Stripe read-only MRR sync** in Phase 4 (Day 1 for beta users) |

---

## Overview

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| 0. Pre-launch Prep | Week 1 | Environments, monitoring, Supabase schema |
| 1. /beta Landing | Week 1–2 | Story-driven page, no pricing |
| 2. Waitlist Modal + API | Week 2 | Email capture with DPDP consent, backend storage |
| 3. ~~Admin Curation~~ | — | **DEPRECATED** — use Supabase Studio |
| 4. Invite, Activation & Auto-Sync | Week 3 | Magic-link onboarding + Razorpay/Stripe MRR sync |
| 5. Feedback & Engagement | Week 3–4 | Chatbot, surveys, habit loops |
| 6. ~~Referral Engine~~ | — | **DEPRECATED** — manual tracking in Supabase Studio |
| 7. Conversion Window | Day 50–60 | Banners, emails, payment integration |
| 8. Migration & Grace | Day 60+ | Flip flags, preserve data |
| 9. Metrics & Iteration | Ongoing | Supabase dashboard views, A/B tests |

---

## Phase 0 — Pre-launch Prep

### 0.1 Environment Setup
- [ ] Create `beta` deployment (Vercel/Render/Railway) pointing to beta env vars
- [ ] Create `prod` deployment (or keep existing) pointing to prod env vars
- [ ] Use **single Supabase project** for both environments (recommended)
- [ ] Set env vars for each deployment:
  - `REACT_APP_BACKEND_URL`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`, `ENCRYPTION_KEY`

### 0.2 Observability & Safety
- [ ] Enable Sentry (frontend + backend) for error tracking
- [ ] Enable request logging (structured JSON) in FastAPI
- [ ] Enable Supabase Point-in-Time Recovery (PITR) for backups
- [ ] Test backup restore procedure once

### 0.3 Supabase Schema Additions (Run in SQL Editor)

```sql
-- ============================================================================
-- BETA STATUS ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE beta_status AS ENUM ('none', 'waitlist', 'invited', 'active', 'expired', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PROFILES TABLE — Add beta columns
-- ============================================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS beta_status beta_status DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS referred_by TEXT,
    ADD COLUMN IF NOT EXISTS feature_access JSONB DEFAULT '{"paid_dashboard": false, "ai_coach": false, "referrals": false}';

CREATE INDEX IF NOT EXISTS idx_profiles_beta_status ON profiles(beta_status);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- ============================================================================
-- WAITLIST_ENTRIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    startup_stage TEXT CHECK (startup_stage IN ('idea', 'pre-seed', 'seed', 'series-a', 'series-b')),
    revenue_range TEXT CHECK (revenue_range IN ('<10L', '10L-50L', '50L-1Cr', '1-5Cr', '5Cr+')),
    key_problem TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'invited', 'rejected', 'converted')),
    notes TEXT,
    dpdp_consent BOOLEAN NOT NULL DEFAULT FALSE,
    dpdp_consent_at TIMESTAMPTZ,
    ip_address TEXT,
    referred_by TEXT,
    invite_token UUID,
    invite_token_expires_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Only service role can access waitlist (admin via Supabase Studio)
DROP POLICY IF EXISTS "Service role full access waitlist" ON waitlist_entries;
CREATE POLICY "Service role full access waitlist" ON waitlist_entries
    FOR ALL USING (auth.role() = 'service_role');

-- Public insert for waitlist submissions (rate-limited at API layer)
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist_entries;
CREATE POLICY "Anyone can join waitlist" ON waitlist_entries
    FOR INSERT WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_invite_token ON waitlist_entries(invite_token);

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('chatbot', 'survey', 'popup', 'email', 'manual')),
    category TEXT CHECK (category IN ('usability', 'accuracy', 'speed', 'pricing', 'feature', 'bug', 'other')),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
    context JSONB DEFAULT '{}',
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    is_resolved BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can view and insert their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
CREATE POLICY "Users can view own feedback" ON feedback
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
CREATE POLICY "Users can insert feedback" ON feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role full access for admin review
DROP POLICY IF EXISTS "Service role full access feedback" ON feedback;
CREATE POLICY "Service role full access feedback" ON feedback
    FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_channel ON feedback(channel);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);

-- ============================================================================
-- REFERRALS TABLE (For future use — manual tracking via Studio for now)
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visits INTEGER DEFAULT 0,
    signups INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    total_extension_days INTEGER DEFAULT 0,
    abuse_flag BOOLEAN DEFAULT FALSE,
    last_visit_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral stats
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
    FOR SELECT USING (auth.uid() = owner_user_id);

-- Service role full access
DROP POLICY IF EXISTS "Service role full access referrals" ON referrals;
CREATE POLICY "Service role full access referrals" ON referrals
    FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_owner ON referrals(owner_user_id);

-- ============================================================================
-- CONNECTOR SYNC LOG TABLE (For automated MRR sync tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS connector_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'cashfree')),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled', 'onboarding')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    records_fetched INTEGER DEFAULT 0,
    checkins_created INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE connector_sync_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sync logs" ON connector_sync_log;
CREATE POLICY "Users can view own sync logs" ON connector_sync_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access sync_log" ON connector_sync_log;
CREATE POLICY "Service role full access sync_log" ON connector_sync_log
    FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_sync_log_user ON connector_sync_log(user_id, started_at DESC);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS update_waitlist_updated_at ON waitlist_entries;
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON waitlist_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR ADMIN (Query in Supabase Studio)
-- ============================================================================

CREATE OR REPLACE VIEW waitlist_summary AS
SELECT 
    status,
    startup_stage,
    revenue_range,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM waitlist_entries
GROUP BY status, startup_stage, revenue_range
ORDER BY status, count DESC;

CREATE OR REPLACE VIEW beta_user_health AS
SELECT 
    p.id,
    p.email,
    p.company,
    p.beta_status,
    p.beta_expires_at,
    p.current_streak,
    p.feature_access,
    s.status as subscription_status,
    (SELECT COUNT(*) FROM checkins c WHERE c.user_id = p.id) as total_checkins,
    (SELECT MAX(created_at) FROM checkins c WHERE c.user_id = p.id) as last_checkin,
    (SELECT COUNT(*) FROM feedback f WHERE f.user_id = p.id) as feedback_count
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
WHERE p.beta_status IN ('active', 'invited', 'expired')
ORDER BY p.beta_expires_at ASC;
```

- [ ] Run migration in Supabase SQL Editor
- [ ] Verify tables created: `waitlist_entries`, `feedback`, `referrals`, `connector_sync_log`
- [ ] Verify views created: `waitlist_summary`, `beta_user_health`
- [ ] Verify RLS policies active (test with anon key)

---

## Phase 1 — /beta Landing Page

### 1.1 Frontend Route & Layout
- [ ] Add route `/beta` in `App.js`
- [ ] Create `src/pages/BetaLandingPage.jsx`
- [ ] Hero section: problem → pain → transformation story (no pricing)
- [ ] Tease dashboard features (screenshots, feature list)
- [ ] Social proof (testimonial placeholders or early quotes)
- [ ] Single CTA button: **"Join the Beta Waitlist"**

### 1.2 Copy & Design
- [ ] Add copy keys to `src/lib/copy.js`:
  - `beta.hero.headline`
  - `beta.hero.subheadline`
  - `beta.features.*`
  - `beta.cta`
  - `beta.exclusivity` ("Only 50 founders…")
  - `beta.dpdp.consent` (DPDP Act 2023 consent text)
  - `beta.dpdp.link` (Link to privacy policy)
- [ ] Use existing Tailwind tokens; add Framer Motion entrance animations
- [ ] Mobile responsive check

### 1.3 SEO & Analytics
- [ ] Add `<title>` and `<meta description>` for /beta
- [ ] Add event tracking: `page_view`, `cta_click`

---

## Phase 2 — Waitlist Modal + API (with DPDP Compliance)

### 2.1 Frontend Modal
- [ ] Create `src/components/beta/WaitlistModal.jsx`
- [ ] Fields:
  - Email (required)
  - Startup stage (dropdown: idea, pre-seed, seed, series-a, series-b)
  - Revenue range (dropdown: <10L, 10L-50L, 50L-1Cr, 1-5Cr, 5Cr+)
  - Key problem (textarea, 200 char max)
  - **DPDP Consent Checkbox** (required, must be checked):
    ```
    ☐ I consent to 100Cr Engine collecting and processing my data as per the 
      Digital Personal Data Protection Act, 2023. View Privacy Policy.
    ```
- [ ] Submit → `POST /api/beta/waitlist`
- [ ] Validation: email format, consent checkbox required
- [ ] Success state: "You're on the list! 🎉 We'll email you when it's your turn."
- [ ] Error handling: duplicate email (409), rate limit (429), validation (400)

### 2.2 Backend Endpoint
- [ ] Create `backend/routers/beta.py`
- [ ] Pydantic model:
  ```python
  class WaitlistEntry(BaseModel):
      email: EmailStr
      startup_stage: Literal['idea', 'pre-seed', 'seed', 'series-a', 'series-b']
      revenue_range: Literal['<10L', '10L-50L', '50L-1Cr', '1-5Cr', '5Cr+']
      key_problem: str = Field(max_length=500)
      dpdp_consent: bool  # Must be True
      referred_by: Optional[str] = None
  ```
- [ ] `POST /api/beta/waitlist`
  - Rate limit: 5/hour per IP
  - Validate `dpdp_consent == True` → else 400 "DPDP consent required"
  - Check duplicate email → return 409
  - Insert into `waitlist_entries` via Supabase service role:
    - `status='new'`
    - `dpdp_consent=True`
    - `dpdp_consent_at=NOW()`
    - `ip_address` from request
    - `referred_by` if provided
  - (Optional) Send thank-you email via Resend/Postmark
  - Return `{ success: true, message: "You're on the waitlist!" }`
- [ ] Mount router in `main.py`

### 2.3 Email (Optional but Recommended)
- [ ] Set up transactional email provider (Resend recommended)
- [ ] Create template: "You're on the 100Cr Engine beta waitlist"
- [ ] Include: confirmation, expected timeline, DPDP compliance note

---

## Phase 3 — Admin Curation (Via Supabase Studio)

> **DEPRECATED**: No custom admin UI. Use Supabase Studio Table Editor for the first 50 users.

### 3.1 Supabase Studio Workflow
- [ ] Document the manual curation workflow:
  1. Open Supabase Dashboard → Table Editor → `waitlist_entries`
  2. Filter by `status = 'new'`
  3. Review entries (stage, revenue, problem)
  4. To invite:
     - Update `status` → `'invited'`
     - Set `invite_token` → generate UUID (use `gen_random_uuid()` or online tool)
     - Set `invite_token_expires_at` → NOW() + 7 days
     - Set `invited_at` → NOW()
  5. To reject:
     - Update `status` → `'rejected'`
     - Add `notes` with reason

### 3.2 Invite Email (Manual or Script)
- [ ] Create email template: "You're in! Your exclusive 100Cr Engine beta access"
- [ ] Body: welcome, 60-day free access, magic link to `/beta/accept?token={invite_token}`
- [ ] Send manually via Resend dashboard OR create a simple backend script:
  ```python
  # scripts/send_invite.py
  # Usage: python send_invite.py <waitlist_entry_id>
  ```

### 3.3 Useful Supabase Studio Queries
```sql
-- Count by status
SELECT status, COUNT(*) FROM waitlist_entries GROUP BY status;

-- High-value prospects (Series A, 1-5Cr+)
SELECT * FROM waitlist_entries 
WHERE status = 'new' 
  AND (startup_stage IN ('seed', 'series-a') OR revenue_range IN ('1-5Cr', '5Cr+'))
ORDER BY created_at;

-- Pending invites (not yet accepted)
SELECT * FROM waitlist_entries 
WHERE status = 'invited' 
  AND invite_token IS NOT NULL
  AND invite_token_expires_at > NOW();
```

---

## Phase 4 — Invite, Activation & Auto-Sync (Zero-Friction Onboarding)

### 4.1 Accept Invite Endpoint
- [ ] `POST /api/beta/accept`
  - Input: `{ token: UUID }`
  - Validate token exists in `waitlist_entries` and not expired
  - If email not in Supabase auth → create user via Admin API + send magic link
  - If email exists → return magic link for sign-in
  - Update `waitlist_entries.status = 'converted'`

### 4.2 Post-Auth Activation (On First Login)
- [ ] Create/update middleware or callback handler
- [ ] On successful auth callback for beta user:
  ```python
  # Update profiles
  profiles.update({
      'beta_status': 'active',
      'beta_expires_at': NOW() + 60 days,
      'feature_access': {
          'paid_dashboard': True,
          'ai_coach': True,
          'referrals': False  # Deferred
      },
      'referral_code': generate_8char_code()  # For future use
  })
  
  # Create subscription
  subscriptions.insert({
      'user_id': user_id,
      'status': 'trialing',
      'plan': 'beta',
      'plan_tier': 'PRO',
      'starts_at': NOW(),
      'expires_at': NOW() + 60 days
  })
  ```

### 4.3 Frontend Accept Page
- [ ] Create `src/pages/beta/BetaAccept.jsx`
- [ ] Route: `/beta/accept`
- [ ] Read `token` from query string
- [ ] Call `POST /api/beta/accept`
- [ ] Show "Setting up your account…" → redirect to `/auth/callback` or `/dashboard`

### 4.4 Automated Razorpay/Stripe MRR Sync (Day 1 Feature)
> **Critical**: Beta users should experience zero-friction data ingestion from Day 1.

- [ ] Create `backend/services/connector_sync.py`
- [ ] Implement read-only sync for Razorpay:
  ```python
  async def sync_razorpay_mrr(user_id: str, api_key: str, api_secret: str) -> SyncResult:
      """
      Fetch payments from Razorpay and calculate monthly revenue.
      Read-only: Only fetches data, never creates/modifies payments.
      """
      # 1. Fetch payments from last 12 months
      # 2. Aggregate by month
      # 3. Upsert into checkins table with source='razorpay'
      # 4. Log to connector_sync_log
  ```
- [ ] Implement read-only sync for Stripe:
  ```python
  async def sync_stripe_mrr(user_id: str, api_key: str) -> SyncResult:
      """
      Fetch charges/subscriptions from Stripe and calculate monthly revenue.
      Read-only: Only fetches data, never creates/modifies charges.
      """
      # 1. Fetch charges from last 12 months
      # 2. Aggregate by month
      # 3. Upsert into checkins table with source='stripe'
      # 4. Log to connector_sync_log
  ```

### 4.5 Connect & Sync Endpoints
- [ ] Update `POST /api/connectors/{provider}/connect`
  - After validating and storing encrypted key:
  - **Trigger immediate sync** (async background task)
  - Return `{ connected: true, sync_status: 'started' }`
- [ ] Create `GET /api/connectors/{provider}/sync-status`
  - Returns latest sync log entry
- [ ] Create `POST /api/connectors/{provider}/sync`
  - Manual re-sync trigger
  - Rate limit: 1/hour per user per provider

### 4.6 Onboarding Flow with Connector Prompt
- [ ] After first login, show onboarding modal:
  1. Company name, Current MRR (manual fallback)
  2. **"Connect your payment provider for automatic tracking"**
     - Razorpay button
     - Stripe button
     - "Skip for now" link
  3. If connected → show sync progress → "Found ₹X revenue across Y months!"
- [ ] Save via `POST /api/user/onboarding`

### 4.7 Sync UI in Dashboard
- [ ] Add sync status indicator in Connectors page
- [ ] Show last sync time and records synced
- [ ] "Sync Now" button (rate-limited)
- [ ] Error state with retry option

---

## Phase 5 — Feedback & Engagement Loops

### 5.1 Floating Feedback Chatbot
- [ ] Create `src/components/feedback/FeedbackWidget.jsx`
- [ ] Floating button (bottom-right)
- [ ] Opens chat-like interface
- [ ] Submit → `POST /api/feedback`
- [ ] Backend: store in `feedback` table with `channel='chatbot'`, context (page, feature)

### 5.2 Backend Feedback Endpoint
- [ ] `POST /api/feedback`
  - Auth required
  - Input: `{ message, category?, context?, rating?, nps_score? }`
  - Store in `feedback` table via Supabase service role
  - Return success

### 5.3 Weekly Micro-Survey
- [ ] Cron job (or scheduled email): send survey link every Monday
- [ ] 3 questions:
  1. How useful was 100Cr Engine this week? (1-5)
  2. What's one thing we should improve?
  3. Would you recommend us? (NPS 0-10)
- [ ] Store responses in `feedback` with `channel='survey'`

### 5.4 Engagement Triggers
- [ ] **No check-in for 7 days**: Send email reminder
- [ ] **After key action** (first projection, first check-in): Show "Was this helpful?" popup
- [ ] **Daily AI pulse**: Already implemented; ensure beta users see it
- [ ] **Streak display**: Show current streak prominently in Command Centre

### 5.5 In-App Prompts
- [ ] Weekly prompt in dashboard: "Quick feedback?" (opens chatbot)
- [ ] Store dismissed state in localStorage to avoid spam

---

## Phase 6 — Referral Engine

> **DEPRECATED**: Deferred to post-beta. Manual tracking via Supabase Studio for now.

### 6.1 Manual Tracking Workflow (Supabase Studio)
- [ ] Document manual referral tracking:
  1. Beta user shares their `referral_code` (from `profiles` table)
  2. Referred user joins waitlist with `referred_by` field
  3. On conversion, manually update `referrals` table:
     - Increment `conversions`
     - Add extension days to referrer's `beta_expires_at`
- [ ] Create simple SQL for common operations:
  ```sql
  -- Add 15 days extension to referrer
  UPDATE profiles 
  SET beta_expires_at = beta_expires_at + INTERVAL '15 days'
  WHERE referral_code = 'XXXXXXXX';
  
  -- Track conversion
  UPDATE referrals 
  SET conversions = conversions + 1
  WHERE code = 'XXXXXXXX';
  ```

---

## Phase 7 — Conversion Window (Days 50–60)

### 7.1 Conversion Banner
- [ ] Show banner in dashboard starting day 50:
  - "Your beta ends in X days. Lock in 50% off as a Founding Member!"
- [ ] CTA: "Upgrade Now"
- [ ] Dismissible but reappears daily

### 7.2 Conversion Modal
- [ ] Create `src/components/upgrade/BetaConversionModal.jsx`
- [ ] Show usage stats: projections run, check-ins, AI reports generated
- [ ] Show value: "You've tracked ₹X in revenue growth"
- [ ] Price: ~~₹899~~ → ₹449/year (Founding Member)
- [ ] CTA: "Become a Founding Member"

### 7.3 Email Drip
- [ ] Day 50: "Your beta is ending soon — here's what you've achieved"
- [ ] Day 55: "5 days left — lock in your Founding Member price"
- [ ] Day 58: "48 hours left — don't lose your data"
- [ ] Day 60: "Last chance — your access expires today"

### 7.4 Payment Integration
- [ ] Create `POST /api/payments/create-checkout`
  - Input: `{ plan: 'founder_beta', coupon: 'FOUNDING50' }`
  - Create Stripe/Razorpay checkout session
  - Return checkout URL
- [ ] Frontend: redirect to checkout on CTA click
- [ ] Create `POST /api/webhooks/stripe` (or `/razorpay`)
  - Verify signature
  - On `checkout.session.completed`:
    - Update `subscriptions`: `plan='founder'`, `status='active'`, `payment_provider`, `payment_id`
    - Clear `beta_expires_at`
    - Set `feature_access.paid_dashboard = true` (already true, but confirm)
    - Send confirmation email

### 7.5 Success & Failure Pages
- [ ] `/payment/success` — "Welcome, Founding Member! 🎉"
- [ ] `/payment/cancel` — "No worries, your beta access continues until [date]"

---

## Phase 8 — Migration & Grace Period

### 8.1 Grace Period Logic
- [ ] After day 60, if not converted:
  - Set `beta_status = 'expired'`
  - Keep `feature_access.paid_dashboard = true` for 7 more days (read-only mode)
  - Show banner: "Your trial has ended. Upgrade to continue editing."
- [ ] After day 67 (grace end):
  - Set `feature_access.paid_dashboard = false`
  - Redirect to pricing page on dashboard access

### 8.2 Expiry Cron Job (Supabase Edge Function or Backend)
- [ ] Daily job:
  ```sql
  -- Expire active beta users past their expiry date
  UPDATE profiles
  SET beta_status = 'expired'
  WHERE beta_status = 'active'
    AND beta_expires_at < NOW()
    AND id NOT IN (
      SELECT user_id FROM subscriptions WHERE status = 'active'
    );
  
  -- Revoke access after 7-day grace
  UPDATE profiles
  SET feature_access = jsonb_set(feature_access, '{paid_dashboard}', 'false')
  WHERE beta_status = 'expired'
    AND beta_expires_at < NOW() - INTERVAL '7 days'
    AND id NOT IN (
      SELECT user_id FROM subscriptions WHERE status = 'active'
    );
  ```

### 8.3 Data Preservation
- [ ] **Never delete user data** on expiry
- [ ] Users can still sign in and see read-only dashboard during grace
- [ ] After grace, they see upgrade prompt but data remains for when they convert

---

## Phase 9 — Metrics & Iteration

### 9.1 Key Metrics (Via Supabase Studio Views)
Use the `waitlist_summary` and `beta_user_health` views created in Phase 0.

Additional queries:
```sql
-- Conversion funnel
SELECT 
    (SELECT COUNT(*) FROM waitlist_entries) as total_waitlist,
    (SELECT COUNT(*) FROM waitlist_entries WHERE status = 'invited') as invited,
    (SELECT COUNT(*) FROM waitlist_entries WHERE status = 'converted') as converted,
    (SELECT COUNT(*) FROM profiles WHERE beta_status = 'active') as active_beta,
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan = 'founder') as paid;

-- Weekly active users
SELECT COUNT(DISTINCT user_id) 
FROM checkins 
WHERE created_at > NOW() - INTERVAL '7 days';

-- Feedback summary
SELECT channel, category, COUNT(*), AVG(rating)
FROM feedback
GROUP BY channel, category
ORDER BY COUNT(*) DESC;
```

### 9.2 Success Targets
| Metric | Target |
|--------|--------|
| Invite acceptance rate | ≥80% |
| Week 2 WAU (of active beta) | ≥60% |
| T+7 first check-in | ≥70% |
| Connector connected (Day 1) | ≥50% |
| Beta → Paid conversion | ≥40% |
| NPS | ≥30 |
| Time to first value | <10 min |

### 9.3 A/B Tests
- [ ] `pricing_reveal_variant`: reveal pricing on day 3 vs day 10
- [ ] `cta_copy_variant`: "Become Founding Member" vs "Lock Your Price"
- [ ] Store in `profiles.feature_access` or separate `feature_flags` table

### 9.4 Feedback Loop
- [ ] Weekly: review feedback by category in Supabase Studio
- [ ] Prioritize: impact × frequency × segment fit
- [ ] Ship fixes, send changelog email to beta users
- [ ] Close the loop: "You asked, we delivered"

---

## Quick Reference: New Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/beta/waitlist | — | Join waitlist (DPDP consent required) |
| POST | /api/beta/accept | — | Accept invite |
| POST | /api/feedback | user | Submit feedback |
| GET | /api/connectors/{provider}/sync-status | user | Check sync status |
| POST | /api/connectors/{provider}/sync | user | Trigger manual sync |
| POST | /api/payments/create-checkout | user | Start payment |
| POST | /api/webhooks/stripe | — | Payment webhook |
| POST | /api/webhooks/razorpay | — | Payment webhook |

---

## Quick Reference: New Frontend Routes

| Path | Component | Auth |
|------|-----------|------|
| /beta | BetaLandingPage | — |
| /beta/accept | BetaAccept | — |
| /payment/success | PaymentSuccess | user |
| /payment/cancel | PaymentCancel | user |

---

## Files to Create/Modify

### Backend
- [ ] `routers/beta.py` — waitlist (with DPDP), accept endpoints
- [ ] `routers/payments.py` — checkout, webhooks
- [ ] `services/connector_sync.py` — Razorpay/Stripe MRR sync
- [ ] `services/email.py` — Resend/Postmark integration
- [ ] `models/beta.py` — Pydantic models for waitlist, feedback
- [ ] `main.py` — mount new routers
- [ ] Update `routers/connectors.py` — add sync trigger on connect

### Frontend
- [ ] `pages/BetaLandingPage.jsx`
- [ ] `pages/beta/BetaAccept.jsx`
- [ ] `pages/PaymentSuccess.jsx`
- [ ] `pages/PaymentCancel.jsx`
- [ ] `components/beta/WaitlistModal.jsx` (with DPDP checkbox)
- [ ] `components/feedback/FeedbackWidget.jsx`
- [ ] `components/upgrade/BetaConversionModal.jsx`
- [ ] `lib/api/beta.js` — API functions
- [ ] `lib/copy.js` — add beta.* and dpdp.* keys
- [ ] `App.js` — add routes
- [ ] Update onboarding flow with connector prompt

### Supabase
- [ ] Run schema migration (Phase 0.3)
- [ ] Verify RLS policies
- [ ] Set up Edge Function for daily expiry (optional)

### Docs
- [ ] Update `comprehensive_guide.md` with Supabase-only architecture
- [ ] Update `PROJECT_SUMMARY_GUIDE.md` with beta flow
- [ ] Create Privacy Policy page for DPDP compliance

---

## Owner & Timeline Template

| Task | Owner | Due | Status |
|------|-------|-----|--------|
| Phase 0: Env setup | | | ⬜ |
| Phase 0: Supabase schema migration | | | ⬜ |
| Phase 1: /beta page | | | ⬜ |
| Phase 2: Waitlist modal (DPDP) | | | ⬜ |
| Phase 2: Waitlist API | | | ⬜ |
| Phase 3: Document Studio workflow | | | ⬜ |
| Phase 4: Accept flow | | | ⬜ |
| Phase 4: Razorpay sync service | | | ⬜ |
| Phase 4: Stripe sync service | | | ⬜ |
| Phase 4: Onboarding with connector | | | ⬜ |
| Phase 5: Feedback widget | | | ⬜ |
| Phase 5: Engagement emails | | | ⬜ |
| Phase 7: Conversion modal | | | ⬜ |
| Phase 7: Payment integration | | | ⬜ |
| Phase 8: Expiry job | | | ⬜ |
| Phase 9: Metrics queries | | | ⬜ |

---

## Launch Checklist (Go-Live)

- [ ] All Phase 0–2 complete
- [ ] Supabase schema verified with RLS
- [ ] /beta page live and tested on mobile
- [ ] DPDP consent checkbox working
- [ ] Waitlist API rate-limited and monitored
- [ ] Thank-you email sending
- [ ] Razorpay/Stripe sync tested end-to-end
- [ ] Supabase Studio curation workflow documented
- [ ] Sentry capturing errors
- [ ] Backup verified (PITR enabled)
- [ ] Announce on social / email list

---

## Removed/Deprecated Items

| Item | Reason | Alternative |
|------|--------|-------------|
| MongoDB references | Architecture constraint | Supabase PostgreSQL |
| Custom Admin UI (Phase 3) | Sprint time savings | Supabase Studio |
| Referral Engine (Phase 6) | Sprint time savings | Manual tracking in Studio |
| Admin endpoints (`/api/admin/waitlist/*`) | No custom UI | Direct Supabase queries |

---

*Last updated: March 17, 2026*

