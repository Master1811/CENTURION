# CENTURION - 100Cr Engine: Complete Project Analysis

**Analysis Date:** March 22, 2026
**Version:** Production v5.0.0 (Hybrid Architecture)
**Status:** Production Ready — Hybrid SaaS/Agency Persona Routing Live

---

## 1. EXECUTIVE SUMMARY

### 1.1 System Overview

The **100Cr Engine** is a revenue milestone prediction and business intelligence platform for Indian founders. It answers: *"When will I reach 100 Crore in annual revenue?"*

The platform now supports two **distinct user personas** — **SaaS founders** and **Agency owners** — with persona-driven navigation, dashboard copy, and feature sets.

**Architecture:**
- **Frontend:** React 18 + Tailwind CSS + Framer Motion (CRA + Craco) + Sentry
- **Backend:** FastAPI (Python 3.11) with async patterns + APScheduler
- **Database:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Magic Link + Google OAuth (JWKS RS256 + HS256 verification)
- **Payments:** Razorpay integration with HMAC webhook verification
- **AI:** Anthropic Claude (Sonnet/Haiku) with per-user cost control
- **Observability:** Sentry + Structured JSON Logging
- **Compliance:** DPDP Act 2023 (India Data Privacy)

### 1.2 Access Control Summary

| User Type | Dashboard Access | Admin Access | Condition |
|-----------|-----------------|--------------|-----------|
| **Admin User** | Full | Full | Email in `ADMIN_EMAILS` AND authenticated |
| **Paid User** | Full | None | `subscription.plan` in ['founder', 'studio', 'vc_portfolio'] AND `status == 'active'` AND `expires_at > now()` |
| **Beta User** | Time-Limited | None | `beta_status === 'active'` AND `beta_expires_at > now()` |
| **Standard User** | Hard Paywall | None | Redirect to `/pricing` |
| **Anonymous** | Landing + Tools Only | None | Dashboard is protected |

### 1.3 Persona Summary

| Persona | `business_model` value | Sidebar Nav | Dashboard Terminology |
|---------|----------------------|-------------|----------------------|
| **SaaS** | `'saas'` | 9-item SAAS_NAV | MRR, ARR, Milestone, AI Growth Coach |
| **Agency** | `'agency'` | 6-item AGENCY_NAV | Revenue, Cash Flow, AR Aging, AI Business Coach |
| **Unknown** | `null` | Defaults to SAAS_NAV | Persona modal shown on first visit |

---

## 2. ACCESS CONTROL IMPLEMENTATION

### 2.1 ProtectedRoute Component

**File:** `frontend/src/components/auth/ProtectedRoute.jsx`

```javascript
export const ProtectedRoute = ({
  children,
  requireDashboardAccess = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, loading, canAccessDashboard, user } = useAuth();

  // Admin check — client-side hashed email comparison (silently redirects to /)
  const isAdmin = useMemo(() => {
    if (!requireAdmin) return true;
    const adminEmails = getAdminEmails();
    return adminEmails.includes(user?.email?.toLowerCase());
  }, [requireAdmin, user?.email]);

  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  if (requireDashboardAccess && !canAccessDashboard) {
    if (betaExpired) return <Navigate to="/checkout" state={{ reason: 'beta_expired' }} />;
    return <Navigate to="/pricing" state={{ reason: 'subscription_required' }} />;
  }

  return children;
};
```

### 2.2 AuthContext Computed Values

**File:** `frontend/src/context/AuthContext.jsx`

```javascript
// Persona / business model (NEW — Hybrid Architecture)
const businessModel = profile?.business_model ?? null;
const isSaaS     = businessModel === 'saas';
const isAgency   = businessModel === 'agency';
const hasPersona = businessModel !== null;

// Beta check
const isBetaUser = Boolean(
  profile?.beta_status === 'active' &&
  profile?.beta_expires_at &&
  new Date(profile.beta_expires_at) > new Date()
);

// Paid check — validates plan, status, AND expiry
const hasPaidSubscription = () => {
  return ['founder', 'studio', 'vc_portfolio'].includes(subscription?.plan) &&
         subscription?.status === 'active' &&
         subscription?.expires_at &&
         new Date(subscription.expires_at) > new Date();
};

const canAccessDashboard = isBetaUser || hasPaidSubscription();
```

**Values exposed via context:**
`user`, `session`, `profile`, `subscription`, `loading`, `isBetaUser`, `hasPaidSubscription`, `canAccessDashboard`, `businessModel`, `isSaaS`, `isAgency`, `hasPersona`, `signInWithMagicLink`, `signInWithGoogle`, `signOut`, `getAccessToken`, `refreshProfile`

**signOut behaviour (fixed):**
Calls `supabase.auth.signOut()` AND clears `localStorage.auth_token` and `localStorage.centurion_gate_dismissed`.

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

#### profiles
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID | PK | References auth.users |
| email | TEXT | - | User email |
| name / full_name | TEXT | - | Display name |
| company | TEXT | - | Company name (legacy field) |
| company_name | TEXT | - | Company name (onboarding field) |
| website | TEXT | - | Company website URL |
| stage | TEXT | 'pre-seed' | pre-seed / seed / series-a / series-b |
| sector | TEXT | NULL | B2B SaaS, D2C, EdTech, FinTech, HealthTech, Other |
| current_mrr | DECIMAL | NULL | Monthly recurring revenue (₹) |
| growth_rate | DECIMAL | NULL | MoM growth rate (0.08 = 8%) |
| **business_model** | TEXT | NULL | **'saas' or 'agency' — CHECK constraint** |
| onboarding_completed | BOOLEAN | FALSE | Set true after completing 4-step onboarding |
| beta_status | TEXT | 'inactive' | 'active' / 'inactive' |
| beta_expires_at | TIMESTAMPTZ | NULL | Beta access expiry |
| plan_tier | ENUM | 'FREE' | FREE / PRO / STUDIO / VC_PORTFOLIO |
| streak_count | INT | 0 | Consecutive check-in months |
| last_checkin_at | TIMESTAMPTZ | NULL | Last check-in timestamp |
| dpdp_consent_given | BOOLEAN | FALSE | DPDP Act consent flag |
| dpdp_consent_at | TIMESTAMPTZ | NULL | When consent was given |

#### subscriptions
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID | PK | Auto-generated |
| user_id | UUID | FK (UNIQUE) | References auth.users |
| status | TEXT | 'inactive' | active / inactive / cancelled / expired |
| plan | TEXT | 'founder' | founder / studio / vc_portfolio |
| plan_tier | ENUM | 'PRO' | Tier enum |
| payment_provider | TEXT | - | razorpay / stripe |
| payment_ref | TEXT | - | Razorpay payment ID |
| expires_at | TIMESTAMPTZ | - | Subscription expiry |

#### ai_usage_log *(new — migration: ai_usage_log.sql)*
| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | UUID | PK | Auto-generated |
| user_id | UUID | FK | References auth.users |
| feature | TEXT | - | board_report / daily_pulse / etc. |
| model | TEXT | - | claude-3-5-sonnet / claude-3-haiku |
| input_tokens | INT | 0 | Token count |
| output_tokens | INT | 0 | Token count |
| cost_inr | DECIMAL(10,4) | 0 | Cost in INR |
| created_at | TIMESTAMPTZ | now() | UTC timestamp |

*Index:* `ai_usage_log_user_month_idx` on `(user_id, created_at DESC)`
*RLS:* Users can SELECT their own rows. Backend writes via service role key.

#### Other Tables
- **checkins** — `(user_id, month)` UNIQUE; tracks monthly MRR submissions
- **connector_keys** — Encrypted API keys per provider; `(user_id, provider)` UNIQUE
- **engagement_events** — APScheduler habit layer events
- **projection_runs** — Shareable projection links (public read)
- **quiz_submissions** — Founder DNA quiz results (lead gen)
- **waitlist** — Beta waitlist entries with referral tracking

### 3.2 Migrations Applied

| File | Status | Purpose |
|------|--------|---------|
| `create_subscriptions_table.sql` | ✅ Applied | Subscriptions table |
| `add_beta_fields_to_profiles.sql` | ✅ Applied | beta_status, beta_expires_at |
| `habit_engine_schema.sql` | ✅ Applied | streak_count, engagement_events |
| `dpdp_compliance.sql` | ✅ Applied | DPDP consent columns, waitlist table |
| `persona_routing.sql` | ✅ Applied | business_model column + index; ensures company_name, sector, growth_rate, website, full_name exist |
| `ai_usage_log.sql` | ✅ Applied | AI cost tracking table with RLS |

### 3.3 RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | auth.uid()=id | auth.uid()=id | auth.uid()=id | — |
| subscriptions | auth.uid()=user_id | service_role | service_role | service_role |
| checkins | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| connector_keys | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| ai_usage_log | auth.uid()=user_id | service_role | — | — |
| engagement_events | auth.uid()=user_id | service_role | — | — |
| waitlist | — | TRUE (public) | service_role | service_role |
| projection_runs | TRUE (public) | TRUE | service_role | service_role |

---

## 4. CORE PRODUCT FLOWS

### 4.1 Anonymous User Flow ✅ WORKING

```
1. User lands on / or /tools/100cr-calculator
2. Uses calculator (frontend only, no auth)
3. Sees projection results
4. Prompted to sign up via Navbar CTA
5. Email submitted → Magic link sent (DPDP consent required)
6. User clicks link → /auth/callback
7. Session established → getRedirectPathAfterAuth()
8. If canAccessDashboard → /dashboard; else → /pricing
```

### 4.2 Paid Intent Flow ✅ WORKING

```
1. User clicks "Start Founder Plan" CTA
2. AuthModal opens → Email + DPDP consent submitted
3. Intent stored: { intent: 'checkout', plan: 'founder', redirectTo: '/checkout' }
4. Magic link sent
5. User clicks → /auth/callback
6. getRedirectPathAfterAuth() reads intent → '/checkout'
7. CheckoutPage loads → POST /api/payments/razorpay/create-order
8. User pays via Razorpay modal
9. Webhook (HMAC verified) → creates subscription, sets status='active'
10. Frontend polls profile → canAccessDashboard=true → /dashboard
```

**Intent storage:** `frontend/src/lib/auth/intent.js` — localStorage with 30-min expiry

### 4.3 Beta User Flow ✅ WORKING

```
1. Admin calls POST /api/admin/beta/{user_id} (sets beta_status='active', expires in N days)
2. User signs in → profile fetched → isBetaUser=true
3. canAccessDashboard=true → Dashboard access granted
4. FreeTierBanner shows countdown
5. On expiry → ProtectedRoute redirects to /checkout with reason: 'beta_expired'
```

### 4.4 First Login / Onboarding — 4 Steps ✅ WORKING

```
Step 0: Persona selection — "I'm building a SaaS" / "I run an Agency"
        → Sets business_model; personaOnly users (existing) save immediately via PUT /api/user/profile
Step 1: Company name (+ optional website)
Step 2: Stage (pre-seed/seed/series-a/series-b) + Sector
Step 3: MRR (slider ₹10K – ₹1Cr)
→ POST /api/user/onboarding (sets onboarding_completed=true)
→ refreshProfile() called → modal closes
```

**Trigger logic in CommandCentre:**
```javascript
const needsOnboarding      = Boolean(!profile?.company || !profile?.onboarding_completed);
const needsPersonaSelection = Boolean(profile && !profile.business_model);
const shouldShowOnboarding  = needsOnboarding || needsPersonaSelection;
```

**personaOnly mode:** Existing users who completed onboarding but have no `business_model` see only Step 0 (persona cards). On click, PUT `/api/user/profile` fires immediately — no further steps.

### 4.5 Persona-Driven Dashboard ✅ WORKING

After persona is set:
- **SaaS users** see SAAS_NAV (9 items) and SaaS-specific copy in CommandCentre
- **Agency users** see AGENCY_NAV (6 items) with Cash Flow Radar, AR Aging, Collections
- Copy changes: page title, MRR label, check-in CTA, AI priority label, milestone label

---

## 5. CRITICAL BUGS FIXED

### Bug 1 — Missing `get_monthly_ai_spend` ✅ FIXED

**Root Cause:** `ai_cost_control.py` called `supabase_service.get_monthly_ai_spend(user_id)` but the method didn't exist. The `except Exception: return 0.0` silently swallowed the AttributeError, so the budget was always reported as ₹0 and Sonnet was always used with no budget enforcement.

**Fix:** Added method to `SupabaseService` — queries `ai_usage_log`, sums `cost_inr` for current calendar month using `gte('created_at', month_start)`.

### Bug 2 — Missing `record_ai_transaction` ✅ FIXED

**Root Cause:** Same pattern — method called but never existed. Every AI call appeared to succeed (silent graceful degradation) but no usage was ever persisted to `ai_usage_log`, making cost tracking non-functional.

**Fix:** Added `record_ai_transaction(record: dict)` to `SupabaseService` — inserts one row to `ai_usage_log`.

### Bug 3 — `TypeError: None >= float` in context.py ✅ FIXED

**Root Cause:** `profile.get('growth_rate', 0.08)` returns `None` when the DB column is NULL (the key exists, value is None — Python's `.get()` default only fires when the key is **absent**). The NULL from the DB reached arithmetic operations.

**Fix:** Changed all nullable column reads to use the `or default` pattern:
- `profile.get('growth_rate') or 0.08`
- `profile.get('actual_revenue') or 0`
- `profile.get('current_mrr') or 0`
- `profile.get('current_streak') or 0`

Added explicit None guard in `_add_benchmark_comparison`:
```python
if growth is None or growth <= 0:
    context.benchmark_percentile = 50
    context.benchmark_status = 'average'
    return
```

Both `_add_projection_milestones` and `_add_benchmark_comparison` wrapped in try/except in `build()`.

### Bug 4 — ExceptionGroup wrapping middleware errors ✅ FIXED

**Root Cause:** Starlette 0.31+ wraps re-raised exceptions in `anyio.TaskGroup` into `ExceptionGroup`, bypassing FastAPI's `@exception_handler(Exception)`. A bare `raise` in `request_logging_middleware` caused 500s to become unhandled ExceptionGroups.

**Fix:** Replaced bare `raise` with `return JSONResponse(status_code=500, content={"detail": "Internal server error"})` in the middleware. Added `ExceptionGroup` handler (Python 3.11+ syntax wrapped in try/except for Python < 3.11 compatibility).

### Bug 5 — `business_model` dropped from onboarding ✅ FIXED

**Root Cause:** `complete_onboarding` in `main.py` built `profile_data` as a hardcoded dict that listed only a subset of fields — `business_model`, `company_name`, `sector`, and `growth_rate` were all missing.

**Fix:** Updated profile_data to include all fields:
```python
profile_data = {
    'id':                   user['id'],
    'email':                user['email'],
    'company':              profile.company_name or profile.company,
    'company_name':         profile.company_name or profile.company,
    'stage':                profile.stage,
    'sector':               profile.sector or profile.industry,
    'current_mrr':          profile.current_mrr or 0,
    'growth_rate':          profile.growth_rate or 0.08,
    'business_model':       profile.business_model,
    'onboarding_completed': True,
}
```

### Security Fix — Hardcoded Codespace URL in CORS ✅ FIXED

**Root Cause:** A specific `*.app.github.dev` Codespace URL was hardcoded in the CORS allowed origins list, which would remain in production builds even after the Codespace is deleted/rotated.

**Fix:** Removed hardcoded URL. CORS now reads from environment:
```python
ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url: ALLOWED_ORIGINS.append(frontend_url)
additional = os.getenv("ADDITIONAL_CORS_ORIGINS", "")
if additional: ALLOWED_ORIGINS.extend([u.strip() for u in additional.split(",") if u.strip()])
```

### Rate Limit Fix — Unlimited AI Endpoints ✅ FIXED

`daily_pulse` and `weekly_question` had `limit: -1` which the rate limiter treated as 999,999 (effectively unlimited). Changed to:
- `daily_pulse`: 60/day
- `weekly_question`: 7/day

---

## 6. BACKEND API COMPLETE REFERENCE

### 6.1 Public Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/` | GET | Health check / API info |
| `/api/health` | GET | Detailed health status |
| `/api/engine/projection` | POST | Run revenue projection (rate-limited by IP) |
| `/api/engine/projection/{slug}` | GET | Get shared projection |
| `/api/engine/scenario` | POST | Scenario analysis (auth optional) |
| `/api/benchmarks/stages` | GET | List all stages |
| `/api/benchmarks/{stage}` | GET | Stage benchmarks |
| `/api/benchmarks/compare` | POST | Compare growth to benchmark |
| `/api/quiz/submit` | POST | Founder DNA quiz (lead gen) |
| `/api/waitlist` | POST | Join beta waitlist |
| `/api/waitlist/count` | GET | Get waitlist count |

### 6.2 Auth-Required Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/profile` | GET | Get profile + subscription (auto-creates profile on first call) |
| `/api/user/profile` | PUT | Update profile (including business_model for persona) |
| `/api/user/onboarding` | POST | Complete onboarding (4 steps + persona) |
| `/api/user/delete` | DELETE | Hard-delete all user data + auth identity |

### 6.3 Paid-Subscription Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/overview` | GET | Command Centre data (MRR, health, projections) |
| `/api/dashboard/revenue` | GET | Revenue Intelligence data |
| `/api/checkin` | POST | Submit monthly check-in |
| `/api/checkins` | GET | List check-ins |
| `/api/connectors/providers` | GET | List available providers |
| `/api/connectors` | GET | List connected providers |
| `/api/connectors/{provider}/connect` | POST | Connect a provider |
| `/api/connectors/{provider}` | DELETE | Disconnect a provider |
| `/api/connectors/{provider}/sync` | POST | Sync data (stub) |
| `/api/ai/usage` | GET | AI usage stats |
| `/api/ai/daily-pulse` | GET | Daily AI insight (60/day limit) |
| `/api/ai/weekly-question` | GET | Strategic question (7/day limit) |
| `/api/ai/board-report` | POST | Generate board report (2/month) |
| `/api/ai/strategy-brief` | POST | Strategy brief (1/month) |
| `/api/ai/deviation` | POST | Deviation analysis |

### 6.4 Payment Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/payments/razorpay/create-order` | POST | Auth | Create Razorpay order |
| `/api/payments/razorpay/webhook` | POST | HMAC | Handle payment webhook |

### 6.5 Admin Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/stats` | GET | Platform statistics |
| `/api/admin/system/health` | GET | System health check |
| `/api/admin/scheduler/status` | GET | APScheduler jobs status |
| `/api/admin/trigger/{job}` | POST | Manually trigger a cron job |
| `/api/admin/engagement/stats` | GET | Aggregate engagement metrics |
| `/api/admin/engagement/user/{id}` | GET | Per-user engagement history |
| `/api/admin/dedup/status` | GET | Email dedup cache status |
| `/api/admin/waitlist` | GET | View all waitlist entries |
| `/api/admin/waitlist/{email}/convert` | PUT | Mark as converted |
| `/api/admin/subscription/{user_id}` | POST | Grant subscription |
| `/api/admin/beta/{user_id}` | POST | Grant beta access |

---

## 7. FRONTEND COMPONENT MAP

### 7.1 Route Table

| Route | Component | Auth | Purpose |
|-------|-----------|------|---------|
| `/` | LandingPage | None | Marketing homepage |
| `/pricing` | PricingPage | None | Plan comparison |
| `/privacy` | PrivacyPage | None | DPDP privacy policy |
| `/auth/callback` | AuthCallback | None | Magic link / OAuth handler |
| `/tools/100cr-calculator` | HundredCrCalculator | None | Main projection tool |
| `/tools/arr-calculator` | ARRCalculator | None | ARR calculator |
| `/tools/runway-calculator` | RunwayCalculator | None | Runway calculator |
| `/tools/growth-calculator` | GrowthCalculator | None | Growth rate calculator |
| `/tools/invoice-health-calculator` | InvoiceHealthCalculator | None | **NEW** Agency free tool |
| `/checkout` | CheckoutPage | Auth | Razorpay payment |
| `/admin` | AdminDashboard | Admin | Super-admin panel |
| `/dashboard` | CommandCentre | Dashboard | Main dashboard |
| `/dashboard/revenue` | RevenueIntelligence | Dashboard | Revenue tracking |
| `/dashboard/forecasting` | ForecastingEngine | Dashboard | Projections |
| `/dashboard/benchmarks` | BenchmarkIntelligence | Dashboard | Peer benchmarks |
| `/dashboard/reports` | ReportingEngine | Dashboard | Reports |
| `/dashboard/coach` | AIGrowthCoach | Dashboard | AI coaching |
| `/dashboard/goals` | GoalArchitecture | Dashboard | Goal setting |
| `/dashboard/investors` | InvestorRelations | Dashboard | Investor relations |
| `/dashboard/connectors` | Connectors | Dashboard | Data connectors |
| `/dashboard/settings` | Settings | Dashboard | Profile / billing |
| `/dashboard/cashflow` | CashFlowRadar | Dashboard | **NEW** Agency cash flow |
| `/dashboard/ar-aging` | ARAgingDashboard | Dashboard | **NEW** Agency AR aging |
| `/dashboard/collections` | Collections | Dashboard | **NEW** Agency collections |
| `/preview/*` | PreviewPages | None | Screenshot previews |

### 7.2 Dashboard Sidebar (Persona-Driven)

**File:** `frontend/src/components/dashboard/DashboardSidebar.jsx`

**SAAS_NAV (9 items):**
Command Centre → Revenue Intelligence → Forecasting → Benchmarks → Reports → AI Growth Coach → Goals → Investors → Connectors

**AGENCY_NAV (6 items):**
Overview → Cash Flow Radar *(New badge)* → AR Aging → Collections → AI Business Coach → Connectors

Selection logic:
```javascript
const navItems = isSaaS ? SAAS_NAV : isAgency ? AGENCY_NAV : SAAS_NAV;
```

Sign-out calls `signOut()` from `useAuth()` (previously used `localStorage.removeItem` + `window.location.href`, which leaked auth_token).

### 7.3 Key Context Providers

| Context | File | Provides |
|---------|------|----------|
| `AuthContext` | `context/AuthContext.jsx` | All auth state + persona values |

### 7.4 Modal Components

| Component | Trigger | Purpose |
|-----------|---------|---------|
| `OnboardingModal` | First dashboard visit OR missing persona | Step 0 persona + 3 data-collection steps; `personaOnly` prop for existing users |
| `CheckInModal` | Action queue click | Monthly revenue submission |
| `UpgradeModal` | Rate limit / paywall hit | Prompt upgrade |
| `AuthModal` | Sign in CTA | Email input + Google OAuth + DPDP consent |

---

## 8. AI SYSTEM

### 8.1 Cost Control Architecture

**File:** `backend/services/ai_cost_control.py`

```
Each AI call:
1. Check monthly spend via supabase_service.get_monthly_ai_spend(user_id)
2. If spend < ₹25: use configured model (Sonnet for reports, Haiku for pulse)
3. If spend >= ₹25: silently route to Haiku
4. Record usage via supabase_service.record_ai_transaction(record)
```

**Model costs (INR):**
- Sonnet: ₹0.25/1K input tokens, ₹1.25/1K output tokens
- Haiku: ₹0.02/1K input tokens, ₹0.10/1K output tokens

**Per-user monthly Sonnet budget:** ₹25

### 8.2 Rate Limits (AI Features)

| Feature | Limit | Window |
|---------|-------|--------|
| `daily_pulse` | 60 | per day |
| `weekly_question` | 7 | per day |
| `board_report` | 2 | per month |
| `strategy_brief` | 1 | per month |
| `investor_narrator` | 2 | per month |
| `what_if_story` | 20 | per month |
| `checkin_interpret` | 3 | per month |

### 8.3 Context Builder

**File:** `backend/services/context.py`

Builds `FounderContext` for AI prompts: profile data, recent check-ins, growth rate, benchmark percentile, projection milestones, streak.

**Critical fixes applied:**
- `or default` pattern for all nullable DB columns (`.get(key, default)` only fires when key is absent, not when value is NULL)
- None guard in `_add_benchmark_comparison` for missing growth_rate
- try/except wrap on `_add_projection_milestones` and `_add_benchmark_comparison`
- Static fallback in `get_weekly_question` if context build fails entirely

---

## 9. SECURITY POSTURE

### 9.1 Authentication
- [x] Magic link via Supabase (passwordless — no password storage)
- [x] Google OAuth via Supabase
- [x] JWT verification: RS256 via JWKS (primary), HS256 fallback for legacy tokens
- [x] Token stored in Supabase session (memory), not localStorage
- [x] Forced sign-out on 401 from `/api/user/profile`

### 9.2 Authorization
- [x] RLS enabled on ALL tables — `auth.uid() = user_id`
- [x] Service role key used for backend writes (bypasses RLS safely server-side)
- [x] Admin route guarded by email whitelist (client-side check + backend `require_admin`)
- [x] Paid subscription check validates plan + status + expiry (not just plan name)

### 9.3 Data Security
- [x] Connector API keys encrypted with Fernet symmetric encryption
- [x] Benchmark contributions anonymized before storage
- [x] No sensitive data in URLs
- [x] CORS restricted to explicit origins via env vars (`FRONTEND_URL`, `ADDITIONAL_CORS_ORIGINS`)
- [x] Razorpay webhook signature verification (HMAC SHA-256, constant-time comparison)
- [x] Request logging middleware masks sensitive fields (email, tokens)
- [x] Sentry PII filter removes sensitive data before sending

### 9.4 Known Remaining Gaps
- [ ] Admin check is client-side only (email comparison in ProtectedRoute) — backend `require_admin` guard needed on sensitive admin endpoints
- [ ] Rate limiter is in-memory (single-instance only) — Redis required for multi-instance production
- [ ] No CSRF protection (mitigated by JWT-only auth, no cookie sessions)

---

## 10. ENVIRONMENT CONFIGURATION

### 10.1 Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx    # Optional
```

### 10.2 Backend (`backend/.env`) — gitignored

```env
# Runtime
ENVIRONMENT=development          # development | production
LOG_LEVEL=DEBUG                  # DEBUG | INFO | WARNING | ERROR

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Payments
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Admin
ADMIN_EMAILS=admin@company.com

# CORS — required for deployed frontend
FRONTEND_URL=https://your-frontend.com
# ADDITIONAL_CORS_ORIGINS=https://other-origin.com,https://staging.com

# Sentry (optional)
SENTRY_DSN=https://xxx@sentry.io/xxx

# Redis (optional — for production rate limiting)
REDIS_URL=redis://localhost:6379
```

---

## 11. PRODUCTION READINESS STATUS

### 11.1 Complete ✅

| Feature | Status |
|---------|--------|
| Authentication (Magic Link + Google OAuth) | ✅ |
| Protected Routes (Beta / Paid / Admin) | ✅ |
| Onboarding Flow (4 steps + persona) | ✅ |
| Persona-Driven Navigation (SaaS / Agency) | ✅ |
| Persona Persistence via business_model | ✅ |
| Settings Profile Save | ✅ |
| Razorpay Payment + Webhook | ✅ |
| CORS (env-driven, no hardcoded URLs) | ✅ |
| AI Cost Control (budget + overflow routing) | ✅ |
| AI Usage Tracking (ai_usage_log table) | ✅ |
| AI Rate Limits (daily_pulse, weekly_question) | ✅ |
| Context Builder (null-safe) | ✅ |
| ExceptionGroup middleware fix | ✅ |
| DPDP Compliance | ✅ |
| Sentry Observability | ✅ |
| Habit Engine (digest, reminders, streak) | ✅ |
| Beta Waitlist | ✅ |
| Free Tools (5 tools including Invoice Health) | ✅ |

### 11.2 Working with Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Connector Sync | ⚠️ Stub | Returns "coming soon" |
| Agency Pages | ⚠️ Stub | CashFlowRadar, ARAgingDashboard, Collections are placeholder UIs |
| Admin Stats | ⚠️ Partial | Some counters return zeros |
| PDF Export | ⚠️ Not implemented | |
| Rate Limiter (multi-instance) | ⚠️ In-memory | Needs Redis for horizontal scaling |

### 11.3 Pre-Launch Checklist

1. **Verify all migrations applied** in Supabase SQL Editor:
   - `persona_routing.sql` ✅ applied 2026-03-22
   - `ai_usage_log.sql` ✅ applied 2026-03-22

2. **Set production environment variables:**
   - `FRONTEND_URL` to deployed frontend origin
   - `RAZORPAY_*` to live keys
   - `ADMIN_EMAILS` to production admin list
   - `SENTRY_DSN` for both frontend and backend

3. **Test critical flows:**
   - New user → persona selection → onboarding → dashboard
   - Existing user missing persona → sees only persona modal → correct nav
   - Beta user access and expiry redirect
   - Payment → webhook → subscription activated → dashboard access

---

## 12. RECOMMENDATIONS

### 12.1 Immediate
1. Build out Agency pages (CashFlowRadar, ARAgingDashboard, Collections) beyond stubs
2. Add backend `require_admin` dependency to all `/api/admin/*` endpoints
3. Configure Redis URL in production for distributed rate limiting
4. Test Razorpay webhook with live keys before launch

### 12.2 Short-Term
1. Add `growth_rate` and `sector` fields to Settings.jsx profile form
2. Implement connector sync for Razorpay/Stripe
3. Add email notifications for beta expiry (7-day warning)
4. Implement PDF report generation for board reports

### 12.3 Long-Term
1. Agency-specific AI coaching prompts (different from SaaS prompts)
2. Stripe as payment alternative
3. Mobile app for check-ins
4. Multi-user workspace support (agency team members)
