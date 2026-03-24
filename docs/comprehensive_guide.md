# 100Cr Engine — Comprehensive Technical Guide

**Last Updated:** March 24, 2026
**Version:** 5.1.0 — Hybrid Architecture (SaaS + Agency Persona Routing)
**Status:** Production Ready

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [Next.js 15 Production Migration Guide](./NEXTJS_15_PRODUCTION_MIGRATION_GUIDE.md) | Complete migration guide to Next.js 15 with App Router |
| [Next.js 15 Migration Checklist](./NEXTJS_15_MIGRATION_CHECKLIST.md) | Step-by-step implementation checklist |
| [Beta Launch Checklist](./BETA_LAUNCH_CHECKLIST.md) | Beta waitlist and launch strategy |
| [Project Summary Guide](./PROJECT_SUMMARY_GUIDE.md) | Executive overview of the platform |
| [Local Setup Guide](./local_setup_guide.md) | Developer setup instructions |

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File-by-File Breakdown](#2-file-by-file-breakdown)
3. [API Endpoint Reference](#3-api-endpoint-reference)
4. [Database Schema](#4-database-schema)
5. [Authentication Flow](#5-authentication-flow)
6. [Access Control System](#6-access-control-system)
7. [Payment Integration](#7-payment-integration)
8. [Onboarding Flow](#8-onboarding-flow)
9. [Hybrid Architecture — Persona Routing](#9-hybrid-architecture--persona-routing)
10. [Dashboard Modules](#10-dashboard-modules)
11. [AI Integration](#11-ai-integration)
12. [Beta Waitlist System](#12-beta-waitlist-system)
13. [DPDP Compliance](#13-dpdp-compliance)
14. [Observability Layer](#14-observability-layer)
15. [Admin Dashboard](#15-admin-dashboard)
16. [Habit Engine](#16-habit-engine)
17. [Environment Configuration](#17-environment-configuration)
18. [Known Issues & Fixes](#18-known-issues--fixes)
19. [Next.js 15 Migration](#19-nextjs-15-migration)

---

## 1. Architecture Overview

### 1.1 System Diagram

```
+------------------------------------------------------------------------------+
|                              FRONTEND (React SPA)                            |
|  +-------------+  +--------------------+  +-----------------------------+   |
|  |  Landing    |  |   Free Tools (5)   |  |  Dashboard (Protected)      |   |
|  |  /          |  |  /tools/*          |  |  /dashboard/*               |   |
|  +-------------+  +--------------------+  +-----------------------------+   |
|                                            SaaS View  |  Agency View         |
|                                            SAAS_NAV   |  AGENCY_NAV          |
|  +-------------+  +-------------+  +-----------------------------+          |
|  |   Admin     |  |   Checkout  |  |    Auth/Privacy             |          |
|  |  /admin     |  |  /checkout  |  |  /auth/callback  /privacy   |          |
|  +-------------+  +-------------+  +-----------------------------+          |
|                                                                              |
|  Context: AuthProvider (user, session, profile, subscription,                |
|            businessModel, isSaaS, isAgency, hasPersona)                      |
|  Routing: react-router-dom v6 + ProtectedRoute (admin/dashboard)             |
|  Observability: Sentry + Error Boundaries                                    |
+--------------------------------------+---------------------------------------+
                                       | REST API (HTTPS)
                                       v
+------------------------------------------------------------------------------+
|                              BACKEND (FastAPI)                               |
|  +-------------+  +-------------+  +-------------+  +-------------------+   |
|  |  /api/user  |  | /api/engine |  |  /api/ai    |  |  /api/payments    |   |
|  |  Profile    |  | Projection  |  |  Coach      |  |  Razorpay         |   |
|  +-------------+  +-------------+  +-------------+  +-------------------+   |
|  +-------------+  +-------------+  +-------------+                          |
|  | /api/admin  |  |/api/waitlist|  |  Scheduler  |                          |
|  |  Dashboard  |  |  Beta List  |  | Habit Engine|                          |
|  +-------------+  +-------------+  +-------------+                          |
|                                                                              |
|  Services: auth.py, supabase.py, anthropic.py, ai_cost_control.py           |
|             context.py, encryption.py, rate_limiter.py                       |
|  Observability: sentry_config.py, logging_service.py                        |
+--------------------------------------+---------------------------------------+
                                       |
          +----------------------------+----------------------------+
          v                            v                            v
+-----------------+         +-----------------+         +-----------------+
|    Supabase     |         |    Anthropic    |         |    Razorpay     |
|  PostgreSQL+Auth|         |  Claude AI      |         |   Payments      |
|  (JWKS RS256)   |         | Sonnet + Haiku  |         |   Webhooks      |
+-----------------+         +-----------------+         +-----------------+
```

### 1.2 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 18 + CRA + Craco | SPA with AnimatePresence transitions |
| Styling | Tailwind CSS 3.x | + `cn()` utility from clsx/twMerge |
| Animation | Framer Motion 11.x | Page transitions + modal animations |
| Charts | Recharts 2.x | Revenue graphs |
| Backend | FastAPI (Python 3.11) | Async, Pydantic v2 validation |
| Database | Supabase PostgreSQL | RLS on all tables |
| Auth | Supabase Auth | Magic Link + Google OAuth |
| JWT | python-jose + PyJWKClient | RS256 (JWKS) + HS256 fallback |
| AI | Anthropic Claude | Sonnet-3.5 + Haiku-3 cost routing |
| Payments | Razorpay | HMAC webhook verification |
| Observability | Sentry (frontend + backend) | PII filtering, traces |
| Logging | Structured JSON (logging_service.py) | Named loggers per component |
| Scheduler | APScheduler | Cron jobs for habit engine |
| Encryption | Fernet (cryptography) | Connector API key storage |

---

## 2. File-by-File Breakdown

### 2.1 Backend Structure

```
backend/
├── main.py                    # FastAPI app, CORS, routers, middleware, lifespan, user routes
├── server.py                  # Uvicorn entry point
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (gitignored)
├── migrations/
│   ├── create_subscriptions_table.sql
│   ├── add_beta_fields_to_profiles.sql
│   ├── habit_engine_schema.sql       # streak_count, engagement_events
│   ├── dpdp_compliance.sql           # DPDP consent columns, waitlist table
│   ├── persona_routing.sql           # business_model column + ensures profile columns exist ✅ APPLIED
│   └── ai_usage_log.sql              # AI cost tracking table + RLS ✅ APPLIED
├── models/
│   ├── __init__.py
│   ├── founder.py             # UserProfile, OnboardingData, SubscriptionStatus, MagicLinkRequest
│   ├── projection.py          # ProjectionInputs, ProjectionResult, Milestone, ScenarioInputs
│   ├── checkin.py             # CheckIn models
│   ├── ai.py                  # AI request/response models
│   └── waitlist.py            # WaitlistEntry model
├── routers/
│   ├── __init__.py
│   ├── engine.py              # /api/engine/* (projection, scenario)
│   ├── benchmarks.py          # /api/benchmarks/*
│   ├── ai.py                  # /api/ai/* (daily-pulse, weekly-question, board-report, etc.)
│   ├── connectors.py          # /api/connectors/*
│   ├── reports.py             # /api/checkin*, /api/dashboard/*; wires streak update
│   ├── admin.py               # /api/admin/* (stats, scheduler, beta grants)
│   ├── payments.py            # /api/payments/razorpay/*; wires anomaly trigger
│   └── waitlist.py            # /api/waitlist/*
└── services/
    ├── __init__.py
    ├── auth.py                # JWT verification (JWKS RS256 + HS256 fallback), require_auth, require_paid
    ├── supabase.py            # ALL database operations — profiles, subscriptions, waitlist,
    │                          # ai_usage_log (get_monthly_ai_spend, record_ai_transaction),
    │                          # habit engine methods, update_business_model
    ├── anthropic.py           # Claude API integration (prompts, streaming)
    ├── context.py             # FounderContext builder for AI prompts (null-safe)
    ├── ai_cost_control.py     # Per-user ₹25/month Sonnet budget, Haiku overflow
    ├── encryption.py          # Fernet encryption for connector API keys
    ├── rate_limiter.py        # InMemory/Redis rate limiting; AI limits: 60/day + 7/day
    ├── validation.py          # sanitize_text, sanitize_url, validate_phone
    ├── logging_service.py     # Structured JSON logging, named loggers
    ├── sentry_config.py       # Sentry init with PII filter
    ├── engagement_engine.py   # Email batch + dedup (dev: local JSON log)
    ├── habit_layers.py        # Digest, reminders, milestone countdown, streak, anomaly alert
    └── scheduler.py           # APScheduler cron job wiring
```

### 2.2 Frontend Structure

```
frontend/src/
├── App.js                     # All routes, AuthProvider wrapper, AnimatePresence
├── index.js                   # React entry, Sentry init
├── App.css / index.css        # Global styles + Tailwind imports
├── context/
│   └── AuthContext.jsx        # Auth state, profile, subscription, persona values
│                              # (isSaaS, isAgency, hasPersona, businessModel)
├── lib/
│   ├── api/
│   │   ├── client.js          # Axios instance (baseURL from REACT_APP_BACKEND_URL)
│   │   └── dashboard.js       # API function wrappers (fetchDashboardOverview, etc.)
│   ├── auth/
│   │   └── intent.js          # Auth intent: localStorage with 30-min expiry
│   ├── engine/
│   │   ├── projection.js      # Revenue projection math (frontend-only)
│   │   ├── benchmarks.js      # Benchmark comparison
│   │   └── constants.js       # CRORE, LAKH, formatCrore, formatDate
│   ├── supabase/
│   │   └── client.js          # Supabase client init (isSupabaseConfigured guard)
│   ├── sentry.js              # setUserContext, clearUserContext, addBreadcrumb
│   ├── logger.js              # Frontend structured logger
│   ├── copy.js                # All user-facing strings (centralised)
│   └── utils.js               # cn() = clsx + twMerge
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx # Route guard (requireDashboardAccess, requireAdmin)
│   │   └── AuthModal.jsx      # Email input + Google OAuth + DPDP consent
│   ├── dashboard/
│   │   ├── DashboardSidebar.jsx    # SAAS_NAV (9) vs AGENCY_NAV (6); signOut via useAuth
│   │   ├── CheckInModal.jsx        # Monthly check-in form
│   │   ├── OnboardingModal.jsx     # Step 0 persona + 3-step data collection
│   │   │                           # personaOnly prop for existing users missing persona
│   │   ├── FreeTierBanner.jsx      # Beta countdown / upgrade prompt
│   │   └── OnboardingChecklist.jsx # Post-onboarding checklist
│   ├── landing/
│   │   ├── HeroSectionNew.jsx
│   │   ├── FounderDNAQuiz.jsx
│   │   ├── PricingSection.jsx
│   │   └── WaitlistSection.jsx
│   ├── layout/
│   │   ├── Navbar.jsx         # Top nav + Free Tools dropdown (incl. Invoice Health Calculator)
│   │   └── Footer.jsx
│   ├── tour/
│   │   └── OnboardingTour.jsx
│   ├── upgrade/
│   │   └── UpgradeModal.jsx
│   ├── ui/                    # CenturionCard, CenturionCardContent, SyncIndicator, etc.
│   └── CookieConsentBanner.jsx
└── pages/
    ├── LandingPage.jsx
    ├── PricingPage.jsx
    ├── AuthCallback.jsx        # Magic link + Google OAuth callback handler
    ├── CheckoutPage.jsx        # Razorpay checkout with polling
    ├── PrivacyPage.jsx         # DPDP privacy policy
    ├── tools/
    │   ├── HundredCrCalculator.jsx
    │   ├── ARRCalculator.jsx
    │   ├── RunwayCalculator.jsx
    │   ├── GrowthCalculator.jsx
    │   └── InvoiceHealthCalculator.jsx  # NEW — Agency free tool (5 sliders, risk score)
    ├── admin/
    │   └── AdminDashboard.jsx
    ├── dashboard/
    │   ├── DashboardLayout.jsx
    │   ├── CommandCentre.jsx       # Main dashboard; persona-conditional copy
    │   ├── RevenueIntelligence.jsx
    │   ├── ForecastingEngine.jsx
    │   ├── BenchmarkIntelligence.jsx
    │   ├── ReportingEngine.jsx
    │   ├── AIGrowthCoach.jsx
    │   ├── GoalArchitecture.jsx
    │   ├── InvestorRelations.jsx
    │   ├── Connectors.jsx
    │   ├── Settings.jsx
    │   ├── CashFlowRadar.jsx       # NEW — Agency (stub)
    │   ├── ARAgingDashboard.jsx    # NEW — Agency (stub)
    │   └── Collections.jsx         # NEW — Agency (stub)
    └── preview/
        └── PreviewPages.jsx        # Screenshot previews (no auth)
```

---

## 3. API Endpoint Reference

### 3.1 Authentication Levels

| Symbol | Meaning |
|--------|---------|
| Open | Public — no auth required |
| Auth | Valid Supabase JWT required |
| Paid | Auth + active paid subscription |
| Admin | Auth + email in ADMIN_EMAILS |
| HMAC | Razorpay webhook signature required |

### 3.2 Complete Endpoint List

#### Health & Root

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/` | Open | API info + version |
| GET | `/api/health` | Open | Supabase connectivity check |

#### User Management (main.py — user_router)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Auth | Get profile + subscription. Auto-creates profile on first call. |
| PUT | `/api/user/profile` | Auth | Update profile fields including `business_model` for persona. |
| POST | `/api/user/onboarding` | Auth | Complete 4-step onboarding. Saves all fields incl. `business_model`, `company_name`, `sector`, `growth_rate`. Generates initial projection if MRR provided. |
| DELETE | `/api/user/delete` | Auth | Hard-delete: checkins, projections, connector_keys, ai_usage_log, profile, subscription, auth identity. Irreversible. |

#### Projection Engine

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/engine/projection` | Open* | Run revenue projection. Rate-limited by IP (10/day free). |
| GET | `/api/engine/projection/{slug}` | Open | Get shared projection by slug. |
| POST | `/api/engine/scenario` | Auth | Multi-scenario analysis. |

#### Benchmarks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/benchmarks/stages` | Open | List all stage definitions. |
| GET | `/api/benchmarks/{stage}` | Open | Benchmarks for a specific stage. |
| POST | `/api/benchmarks/compare` | Open | Compare user growth to benchmark. |

#### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/overview` | Paid | Command Centre data: MRR, health score, next milestone, action queue, streak. |
| GET | `/api/dashboard/revenue` | Paid | Revenue Intelligence data. |
| POST | `/api/checkin` | Paid | Submit monthly check-in (updates streak, triggers anomaly alert if >10% drop). |
| GET | `/api/checkins` | Paid | List all check-ins for user. |

#### Connectors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/connectors/providers` | Open | List all available providers. |
| GET | `/api/connectors` | Paid | List user's connected providers. |
| POST | `/api/connectors/{provider}/connect` | Paid | Store encrypted API key for provider. |
| DELETE | `/api/connectors/{provider}` | Paid | Remove connector. |
| POST | `/api/connectors/{provider}/sync` | Paid | Sync data (stub — returns "coming soon"). |

#### AI Features

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/api/ai/usage` | Paid | — | AI usage stats for current user. |
| GET | `/api/ai/daily-pulse` | Paid | 60/day | Daily AI insight from FounderContext. Returns 503 with fallback question if AI not configured. |
| GET | `/api/ai/weekly-question` | Paid | 7/day | Strategic question. Falls back to static question if context build fails. |
| POST | `/api/ai/board-report` | Paid | 2/month | Generate full board report. |
| POST | `/api/ai/strategy-brief` | Paid | 1/month | Strategy brief. |
| POST | `/api/ai/deviation` | Paid | — | Deviation analysis from plan. |

#### Quiz (Lead Gen)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quiz/submit` | Open | Submit Founder DNA quiz. Returns archetype + percentile. |

#### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/razorpay/create-order` | Auth | Create Razorpay order (amount in paisa). |
| POST | `/api/payments/razorpay/webhook` | HMAC | Handle payment capture. Creates subscription, prevents duplicates via payment_ref check. Triggers anomaly check. |

#### Waitlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/waitlist` | Open | Join beta waitlist. Records DPDP consent, IP, referral source. |
| GET | `/api/waitlist/count` | Open | Public waitlist count (for social proof). |

#### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform stats (user count, MRR, etc.). |
| GET | `/api/admin/system/health` | Admin | Detailed system health check. |
| GET | `/api/admin/scheduler/status` | Admin | APScheduler jobs + next run times. |
| POST | `/api/admin/trigger/{job}` | Admin | Manually trigger cron job (digest, reminder, etc.). |
| GET | `/api/admin/engagement/stats` | Admin | Aggregate engagement metrics (30d). |
| GET | `/api/admin/engagement/user/{id}` | Admin | Per-user engagement history. |
| GET | `/api/admin/dedup/status` | Admin | Email dedup cache status. |
| GET | `/api/admin/waitlist` | Admin | All waitlist entries. |
| PUT | `/api/admin/waitlist/{email}/convert` | Admin | Mark waitlist entry as converted. |
| POST | `/api/admin/subscription/{user_id}` | Admin | Manually grant subscription. |
| POST | `/api/admin/beta/{user_id}` | Admin | Grant beta access (body: `{"days": 60}`). |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├──< profiles (1:1)
    │       ├── id (PK, FK → auth.users)
    │       ├── email, name, full_name
    │       ├── company, company_name        ← both maintained (legacy + onboarding)
    │       ├── website
    │       ├── stage                         ← pre-seed/seed/series-a/series-b
    │       ├── sector                        ← B2B SaaS/D2C/EdTech/FinTech/HealthTech/Other
    │       ├── current_mrr, growth_rate
    │       ├── business_model                ← 'saas' | 'agency' | NULL (CHECK constraint)
    │       ├── onboarding_completed
    │       ├── beta_status, beta_expires_at
    │       ├── plan_tier
    │       ├── streak_count, last_checkin_at
    │       └── dpdp_consent_given, dpdp_consent_at
    │
    ├──< subscriptions (1:1)
    │       ├── id (PK)
    │       ├── user_id (FK, UNIQUE)
    │       ├── status                        ← active/inactive/cancelled/expired
    │       ├── plan                          ← founder/studio/vc_portfolio
    │       ├── plan_tier
    │       ├── payment_provider, payment_ref
    │       └── expires_at
    │
    ├──< checkins (1:N)
    │       ├── id (PK)
    │       ├── user_id (FK)
    │       ├── month, actual_revenue
    │       └── UNIQUE(user_id, month)
    │
    ├──< connector_keys (1:N)
    │       ├── id (PK)
    │       ├── user_id (FK)
    │       ├── provider, encrypted_key
    │       └── UNIQUE(user_id, provider)
    │
    ├──< ai_usage_log (1:N)                  ← NEW — tracks AI cost per call
    │       ├── id (PK)
    │       ├── user_id (FK)
    │       ├── feature, model
    │       ├── input_tokens, output_tokens
    │       ├── cost_inr (DECIMAL 10,4)
    │       └── created_at
    │
    └──< engagement_events (1:N)
            ├── id (PK)
            ├── user_id (FK)
            ├── event_type, event_data
            └── created_at

projection_runs (standalone)
    ├── id (PK), slug (UNIQUE)
    ├── user_id (FK, nullable)
    └── inputs, result, created_at

quiz_submissions (standalone)
    ├── id (PK)
    ├── answers, email
    └── result, percentile

waitlist (standalone)
    ├── id (PK), email (UNIQUE)
    ├── name, company, stage
    ├── referral_source, ip_address
    ├── dpdp_consent_given, dpdp_consent_at
    ├── converted, referral_count
    └── created_at
```

### 4.2 RLS Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | auth.uid()=id | auth.uid()=id | auth.uid()=id | — |
| subscriptions | auth.uid()=user_id | service_role | service_role | service_role |
| checkins | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| connector_keys | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| ai_usage_log | auth.uid()=user_id | service_role | — | — |
| engagement_events | auth.uid()=user_id | service_role | — | — |
| projection_runs | TRUE (public) | TRUE | service_role | service_role |
| waitlist | — | TRUE (public) | service_role | service_role |

### 4.3 Migrations Status

| Migration File | Applied | Purpose |
|----------------|---------|---------|
| `create_subscriptions_table.sql` | ✅ | Subscriptions table + RLS |
| `add_beta_fields_to_profiles.sql` | ✅ | beta_status, beta_expires_at |
| `habit_engine_schema.sql` | ✅ | streak_count, last_checkin_at, engagement_events |
| `dpdp_compliance.sql` | ✅ | DPDP consent columns on profiles, waitlist table |
| `persona_routing.sql` | ✅ 2026-03-22 | business_model column (CHECK: saas/agency) + index; ensures company_name, sector, growth_rate, website, full_name columns exist |
| `ai_usage_log.sql` | ✅ 2026-03-22 | ai_usage_log table + index + RLS |

---

## 5. Authentication Flow

### 5.1 Magic Link + Google OAuth Sequence

```
+----------+     +--------------+     +------------+     +--------------+
|   User   |     |   Frontend   |     |  Supabase  |     |   Backend    |
+----+-----+     +------+-------+     +-----+------+     +------+-------+
     │                  │                   │                   │
     │ Enter email      │                   │                   │
     │ + DPDP consent   │                   │                   │
     │─────────────────>│                   │                   │
     │                  │ signInWithOtp()   │                   │
     │                  │──────────────────>│                   │
     │                  │    OR             │                   │
     │                  │ signInWithOAuth() │                   │
     │                  │──────────────────>│                   │
     │  Email link / OAuth redirect         │                   │
     │<─────────────────────────────────────│                   │
     │ Click/complete   │                   │                   │
     │─────────────────>│ /auth/callback    │                   │
     │                  │ getSession()      │                   │
     │                  │──────────────────>│                   │
     │                  │<── session + JWT──│                   │
     │                  │ GET /api/user/profile                 │
     │                  │──────────────────────────────────────>│
     │                  │<── profile + subscription ────────────│
     │                  │ getRedirectPathAfterAuth()            │
     │<── /dashboard or /checkout or /pricing                   │
```

### 5.2 JWT Verification (Backend)

**File:** `backend/services/auth.py`

```python
async def verify_jwt_token(token: str) -> Dict[str, Any]:
    header = jwt.get_unverified_header(token)
    algorithm = header.get('alg', 'HS256')

    # 1. RS256 via JWKS (Supabase default)
    if algorithm == 'RS256':
        jwks_client = get_jwks_client()  # PyJWKClient
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(token, signing_key.key,
                              algorithms=['RS256'], audience='authenticated')

    # 2. HS256 fallback for legacy tokens
    jwt_secret = AuthConfig.get_jwt_secret()
    return jwt.decode(token, jwt_secret, algorithms=['HS256'],
                      audience='authenticated')
```

### 5.3 Profile Auto-Creation

On first `GET /api/user/profile`, if no row exists in `profiles`, the backend auto-creates one:
```python
if profile is None:
    profile = await supabase_service.upsert_profile({
        'id': user_id,
        'email': user_email,
        'onboarding_completed': False,
        'plan_tier': 'FREE',
    })
```

### 5.4 Auth Intent Storage

**File:** `frontend/src/lib/auth/intent.js`

Stores pre-auth intent in `localStorage` with 30-minute TTL:
```javascript
{
  intent: 'checkout' | 'calculator' | null,
  plan: 'founder' | null,
  redirectTo: '/dashboard' | '/checkout',
  storedAt: timestamp
}
```
`getRedirectPathAfterAuth()` reads and clears this intent at `/auth/callback`.

### 5.5 Sign Out (Fixed)

`signOut()` in AuthContext now:
1. Calls `supabase.auth.signOut()`
2. Clears `localStorage.auth_token`
3. Clears `localStorage.centurion_gate_dismissed`
4. Resets all state (`user`, `session`, `profile`, `subscription`)

Previously the sidebar used `localStorage.removeItem` + `window.location.href` directly, which did not invalidate the Supabase session.

---

## 6. Access Control System

### 6.1 Three-Tier Access Model

```
Authenticated?
├── NO  → Redirect to /
└── YES → Check route type
          ├── Admin route     → Check ADMIN_EMAILS → allow or redirect to /
          ├── Dashboard route → Check canAccessDashboard
          │                     ├── YES → Allow
          │                     └── NO  → beta_expired? → /checkout
          │                               else          → /pricing
          ├── Auth-only route → Allow
          └── Public route    → Allow
```

### 6.2 ProtectedRoute Component

**File:** `frontend/src/components/auth/ProtectedRoute.jsx`

```javascript
export const ProtectedRoute = ({
  children,
  requireDashboardAccess = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, loading, canAccessDashboard, user } = useAuth();

  // Admin: silent redirect to / (security through obscurity)
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

### 6.3 AuthContext Computed Values

**File:** `frontend/src/context/AuthContext.jsx`

```javascript
// ── Persona (Hybrid Architecture) ──────────────────────────────
const businessModel = profile?.business_model ?? null;  // 'saas' | 'agency' | null
const isSaaS        = businessModel === 'saas';
const isAgency      = businessModel === 'agency';
const hasPersona    = businessModel !== null;

// ── Access control ──────────────────────────────────────────────
const isBetaUser = Boolean(
  profile?.beta_status === 'active' &&
  profile?.beta_expires_at &&
  new Date(profile.beta_expires_at) > new Date()
);

const hasPaidSubscription = () => {
  return ['founder', 'studio', 'vc_portfolio'].includes(subscription?.plan) &&
         subscription?.status === 'active' &&
         subscription?.expires_at &&
         new Date(subscription.expires_at) > new Date();
};

const canAccessDashboard = isBetaUser || hasPaidSubscription();
```

---

## 7. Payment Integration

### 7.1 Razorpay Flow

```
User clicks Pay
    │
    ├── POST /api/payments/razorpay/create-order (Auth)
    │   Backend creates order via Razorpay SDK
    │   Returns { orderId, keyId, amount }
    │
    ├── Razorpay JS modal opens
    │   User enters card / UPI / netbanking
    │
    ├── Payment captured by Razorpay
    │
    ├── POST /api/payments/razorpay/webhook (HMAC verified)
    │   Event: payment.captured
    │   Backend:
    │     1. Verifies HMAC SHA-256 signature (constant-time compare)
    │     2. Checks for duplicate via get_subscription_by_ref(payment_id)
    │     3. Creates subscription row (status='active')
    │     4. Wires anomaly trigger via background task
    │
    └── Frontend polls GET /api/user/profile
        subscription.plan='founder' → canAccessDashboard=true → /dashboard
```

### 7.2 Webhook Security

```python
# backend/routers/payments.py
expected = hmac.new(
    RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected, signature):
    raise HTTPException(status_code=401, detail="Invalid webhook signature")
```

### 7.3 Plan Pricing (paisa)

```python
PLAN_PRICING = {
    "founder": { "amount": 399900, "billing": "annual",   "expires_days": 365 },
    "starter": { "amount": 49900,  "billing": "monthly",  "expires_days": 30  },
    "trial":   { "amount": 9900,   "billing": "trial_7d", "expires_days": 7   },
}
```

---

## 8. Onboarding Flow

### 8.1 Trigger Logic (CommandCentre)

```javascript
// Two separate conditions for showing the onboarding modal:
const needsOnboarding       = Boolean(!profile?.company || !profile?.onboarding_completed);
const needsPersonaSelection = Boolean(profile && !profile.business_model);
const shouldShowOnboarding  = needsOnboarding || needsPersonaSelection;

// personaOnly = existing user who completed onboarding but has no business_model
<OnboardingModal
  personaOnly={!needsOnboarding && needsPersonaSelection}
  onComplete={() => { setShowOnboarding(false); refreshProfile(); }}
/>
```

### 8.2 Four-Step Flow

| Step | Shown When | Title | Fields |
|------|-----------|-------|--------|
| 0 | Always (first) | "What kind of business do you run?" | Persona card selection: SaaS / Agency |
| 1 | needsOnboarding | "Your Company" | company_name, website (optional) |
| 2 | needsOnboarding | "Stage & Sector" | stage (pre-seed/seed/series-a/series-b), sector |
| 3 | needsOnboarding | "Monthly Revenue" | current_mrr (slider ₹10K – ₹1Cr) |

**personaOnly mode:** Shows only Step 0. On persona card click, fires `PUT /api/user/profile` immediately and closes. No further steps.

### 8.3 API Calls

```javascript
// Full onboarding (Step 0 → 3)
POST /api/user/onboarding
{
  company_name, website, stage, sector, current_mrr,
  growth_rate, business_model  ← all fields now persisted
}

// Persona-only update (existing users)
PUT /api/user/profile
{ business_model: 'saas' | 'agency' }
```

### 8.4 Backend Onboarding Handler

`POST /api/user/onboarding` in `main.py` now persists all fields including previously-dropped ones:

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

Also generates an initial projection if MRR and growth rate are provided.

---

## 9. Hybrid Architecture — Persona Routing

This is the major feature addition in v5.0. The platform now dynamically adapts its navigation, copy, and feature set based on the user's `business_model`.

### 9.1 Data Model

```sql
-- profiles table (persona_routing.sql migration)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS business_model TEXT
  CHECK (business_model IN ('saas', 'agency'))
  DEFAULT NULL;

CREATE INDEX IF NOT EXISTS profiles_business_model_idx ON profiles(business_model);
```

### 9.2 AuthContext Persona Values

```javascript
// frontend/src/context/AuthContext.jsx
const businessModel = profile?.business_model ?? null;
const isSaaS        = businessModel === 'saas';
const isAgency      = businessModel === 'agency';
const hasPersona    = businessModel !== null;
// All four values exposed in context
```

### 9.3 Sidebar Navigation

**File:** `frontend/src/components/dashboard/DashboardSidebar.jsx`

```javascript
const SAAS_NAV = [
  { label: 'Command Centre',      path: '/dashboard',            icon: LayoutDashboard },
  { label: 'Revenue Intelligence',path: '/dashboard/revenue',    icon: TrendingUp },
  { label: 'Forecasting',         path: '/dashboard/forecasting',icon: LineChart },
  { label: 'Benchmarks',          path: '/dashboard/benchmarks', icon: BarChart2 },
  { label: 'Reports',             path: '/dashboard/reports',    icon: FileText },
  { label: 'AI Growth Coach',     path: '/dashboard/coach',      icon: Sparkles },
  { label: 'Goals',               path: '/dashboard/goals',      icon: Target },
  { label: 'Investors',           path: '/dashboard/investors',  icon: Users },
  { label: 'Connectors',          path: '/dashboard/connectors', icon: Plug },
];

const AGENCY_NAV = [
  { label: 'Overview',            path: '/dashboard',            icon: LayoutDashboard },
  { label: 'Cash Flow Radar',     path: '/dashboard/cashflow',   icon: Activity, badge: 'New' },
  { label: 'AR Aging',            path: '/dashboard/ar-aging',   icon: Clock },
  { label: 'Collections',         path: '/dashboard/collections',icon: MessageSquare },
  { label: 'AI Business Coach',   path: '/dashboard/coach',      icon: Sparkles },
  { label: 'Connectors',          path: '/dashboard/connectors', icon: Plug },
];

const navItems = isSaaS ? SAAS_NAV : isAgency ? AGENCY_NAV : SAAS_NAV;
```

### 9.4 CommandCentre Conditional Copy

```javascript
// frontend/src/pages/dashboard/CommandCentre.jsx
const title      = isSaaS ? 'Command Centre'       : isAgency ? 'Agency Overview'     : 'Command Centre';
const mrrLabel   = isSaaS ? 'Monthly Recurring Revenue' : isAgency ? 'Monthly Revenue' : 'Monthly Revenue';
const checkinCTA = isSaaS ? 'Log Monthly Check-in'  : isAgency ? 'Log Monthly Revenue' : 'Log Check-in';
const aiLabel    = isSaaS ? 'AI Growth Priority'    : isAgency ? 'AI Business Insight' : 'AI Priority';
const milestoneL = isSaaS ? 'Next Milestone'        : isAgency ? 'Revenue Target'      : 'Next Milestone';
```

### 9.5 Agency-Specific Routes (Stubs — ready for implementation)

| Route | Component | Status |
|-------|-----------|--------|
| `/dashboard/cashflow` | CashFlowRadar | Stub UI |
| `/dashboard/ar-aging` | ARAgingDashboard | Stub UI |
| `/dashboard/collections` | Collections | Stub UI |

### 9.6 Invoice Health Calculator (Agency Free Tool)

**Route:** `/tools/invoice-health-calculator` (public, no auth)
**File:** `frontend/src/pages/tools/InvoiceHealthCalculator.jsx`

Features:
- 5 interactive sliders: outstanding invoices, overdue %, average days outstanding, collection rate, monthly recurring clients
- Real-time risk score and "safe cash days" calculation
- Cards 3 and 4 gated (blurred + upgrade prompt) for non-paying users
- Listed in Navbar Free Tools dropdown

---

## 10. Dashboard Modules

### 10.1 Command Centre (`/dashboard`)

**API:** `GET /api/dashboard/overview`

Data returned:
- `companyName`, `currentMRR`, `growthRate`
- `nextMilestone` — `{ label, value, date, monthsAway }`
- `healthScore` (0–100) + `healthSignals` — `{ growth, retention, runway, engagement }`
- `aiPriority` — AI-generated daily priority string
- `actionQueue` — Array of pending actions (check-in, report, connector)
- `streak` — consecutive check-in months

Fallback: If API fails or no token, uses static `fallbackData` object. Rate limit errors (429) trigger UpgradeModal.

Daily Pulse: Fetched separately from `GET /api/ai/daily-pulse`. Returns 503 with fallback question if Anthropic not configured.

### 10.2 Revenue Intelligence (`/dashboard/revenue`)

Revenue tracking over time with comparison to previous periods and growth trend indicators.

### 10.3 Forecasting Engine (`/dashboard/forecasting`)

Interactive projection scenarios using the same math as the public calculator.

### 10.4 Benchmark Intelligence (`/dashboard/benchmarks`)

Peer comparison by stage. Uses anonymous benchmark data from `benchmark_contributions` table.

### 10.5 Reporting Engine (`/dashboard/reports`)

AI-generated reports: board reports (2/month), strategy briefs (1/month). Downloads as formatted text (PDF export is a future feature).

### 10.6 AI Growth Coach (`/dashboard/coach`)

Full AI coaching interface. Accesses weekly question, deviation analysis, what-if scenarios.

### 10.7 Goal Architecture (`/dashboard/goals`)

Set and track OKRs tied to revenue milestones.

### 10.8 Investor Relations (`/dashboard/investors`)

Investor update generation. Uses AI Investor Narrator (2/month).

### 10.9 Connectors (`/dashboard/connectors`)

Connect Razorpay, Stripe, QuickBooks etc. API keys encrypted with Fernet. Sync is currently a stub.

### 10.10 Settings (`/dashboard/settings`)

Profile update (name, company, stage), billing management (cancel subscription), account deletion.

```javascript
// Settings.jsx - Profile save wired correctly
const handleSaveProfile = async (data) => {
  const result = await updateUserProfile(accessToken, {
    name: data.fullName || data.name,
    company: data.company,
    stage: data.stage,
  });
  await refreshProfile();
  return result;
};
```

### 10.11 Agency Modules (Stubs)

`CashFlowRadar`, `ARAgingDashboard`, `Collections` — currently placeholder UIs using `CenturionCard`. Ready to implement cash flow data, invoice aging buckets, and collection workflow.

---

## 11. AI Integration

### 11.1 Cost Control Architecture

**File:** `backend/services/ai_cost_control.py`

```
For each AI request:
1. get_monthly_ai_spend(user_id)    ← queries ai_usage_log, sums cost_inr for current month
2. If spend < ₹25:  use DEFAULT_MODELS[feature]  (Sonnet for reports, Haiku for pulse)
3. If spend >= ₹25: use OVERFLOW_ROUTING[feature] (always Haiku)
4. Call Anthropic API
5. record_ai_transaction(record)    ← inserts row to ai_usage_log
```

**Model costs:**
| Model | Input (per 1K tokens) | Output (per 1K tokens) |
|-------|-----------------------|------------------------|
| claude-3-5-sonnet-20241022 | ₹0.25 | ₹1.25 |
| claude-3-haiku-20240307 | ₹0.02 | ₹0.10 |

**Monthly Sonnet budget per user:** ₹25

Both `get_monthly_ai_spend` and `record_ai_transaction` are methods on `SupabaseService` — previously missing (Bug 1 + Bug 2), silently failing via `except Exception: return 0.0`, meaning budget was always 0 and AI usage was never recorded.

### 11.2 Rate Limits

| Feature | Limit | Window |
|---------|-------|--------|
| `daily_pulse` | 60 | per day |
| `weekly_question` | 7 | per day |
| `board_report` | 2 | per month |
| `strategy_brief` | 1 | per month |
| `investor_narrator` | 2 | per month |
| `what_if_story` | 20 | per month |
| `checkin_interpret` | 3 | per month |

Previously `daily_pulse` and `weekly_question` had `limit: -1` (treated as 999,999 — effectively unlimited). Fixed to 60/day and 7/day.

### 11.3 Context Builder

**File:** `backend/services/context.py`

Builds `FounderContext` for AI prompts from: profile data, recent check-ins, computed growth rate, benchmark percentile, projection milestones, streak.

**Critical null-safety fixes applied:**

```python
# WRONG (returns None when DB column is NULL — key exists but value is None):
profile.get('growth_rate', 0.08)

# CORRECT (or-default fires when value is None OR key absent):
profile.get('growth_rate') or 0.08
```

All nullable columns now use the `or default` pattern. `_add_benchmark_comparison` has an explicit None guard, and both projection/benchmark helpers are wrapped in try/except in `build()`.

### 11.4 Graceful Degradation

- `GET /api/ai/daily-pulse`: Returns HTTP 503 with a fallback question dict if Anthropic is not configured.
- `GET /api/ai/weekly-question`: Returns a static hardcoded question if context build fails entirely.
- AI cost tracking failures are logged as warnings and never bubble up to the user.

---

## 12. Beta Waitlist System

### 12.1 Backend

**File:** `backend/routers/waitlist.py`

```python
@router.post("/waitlist")
async def join_waitlist(entry: WaitlistEntry, request: Request):
    # 409 if duplicate email
    existing = await supabase_service.get_waitlist_entry(entry.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already on waitlist")

    position = (await supabase_service.get_waitlist_count()) + 1

    await supabase_service.create_waitlist_entry({
        "email": entry.email, "name": entry.name,
        "company": entry.company, "stage": entry.stage,
        "referral_source": entry.referral_source,
        "ip_address": request.client.host,
        "dpdp_consent_given": entry.dpdp_consent,
        "dpdp_consent_at": datetime.now(timezone.utc).isoformat(),
    })

    if entry.referral_source:
        await supabase_service.boost_referrer_position(entry.referral_source)

    return {"position": position, "referral_url": f"{FRONTEND_URL}?ref={entry.email}"}
```

### 12.2 Frontend

**File:** `frontend/src/components/landing/WaitlistSection.jsx`

- Email, name, company, stage inputs
- DPDP consent checkbox (required to submit)
- Success state: position number + shareable referral URL
- Copy-to-clipboard button

---

## 13. DPDP Compliance

The Digital Personal Data Protection Act 2023 (India) requires explicit consent before collecting personal data.

### 13.1 Implementation

**Privacy Page:** `frontend/src/pages/PrivacyPage.jsx` at `/privacy`
- Identity of Data Fiduciary, data categories, purpose, retention, user rights, DPO contact

**Consent Gates:**
- `AuthModal.jsx` — checkbox required before email submission
- `WaitlistSection.jsx` — checkbox required before waitlist join

**Cookie Consent:** `CookieConsentBanner.jsx`
- Shown on first visit
- Stored as `localStorage.centurion_cookie_consent`
- If declined: analytics scripts not loaded

### 13.2 Database Columns

```sql
-- profiles
dpdp_consent_given BOOLEAN DEFAULT FALSE,
dpdp_consent_at    TIMESTAMPTZ,

-- waitlist
dpdp_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
dpdp_consent_at    TIMESTAMPTZ,
```

---

## 14. Observability Layer

### 14.1 Sentry Integration

**Backend:** `backend/services/sentry_config.py`
```python
sentry_sdk.init(
    dsn=SENTRY_DSN,
    integrations=[StarletteIntegration(), FastApiIntegration()],
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
    before_send=filter_pii,  # Strips email, tokens, keys before sending
)
```

**Frontend:** `frontend/src/lib/sentry.js`
```javascript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

AuthContext sets Sentry user context on profile load and clears it on sign-out.

### 14.2 Structured Logging

**File:** `backend/services/logging_service.py`

Named loggers per component:
```
auth_logger    → authentication events
api_logger     → request/response (masks tokens, emails)
habit_logger   → habit engine jobs
payment_logger → payment events (never logs amounts in prod)
ai_logger      → AI calls, model routing decisions
admin_logger   → admin actions
```

### 14.3 Request Middleware

**File:** `backend/main.py`

```python
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    start_time = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception as e:
        # Returns JSONResponse(500) instead of bare raise
        # — prevents Starlette anyio.TaskGroup from wrapping in ExceptionGroup
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
    return response
```

**ExceptionGroup handler** also registered (Python 3.11+ with Python < 3.11 compatibility guard).

---

## 15. Admin Dashboard

### 15.1 Security

**Frontend:** `ProtectedRoute requireAdmin={true}` — checks email against hashed admin list client-side. Silently redirects to `/` for non-admins (no indication the route exists).

**Backend:** `backend/routers/admin.py` uses `_is_admin_email(email)` which compares SHA-256 hashes to prevent timing attacks.

### 15.2 Features

**File:** `frontend/src/pages/admin/AdminDashboard.jsx`

- System health monitoring cards
- Platform statistics with real DB counts
- Engagement metrics visualization (30 days)
- Scheduler job management with manual trigger buttons
- Email dedup cache inspection
- Production readiness checklist

---

## 16. Habit Engine

### 16.1 Scheduler Jobs

| Job | Schedule (IST) | Purpose |
|-----|----------------|---------|
| `monday_digest` | Mon 8:00 AM | Weekly MRR summary + AI strategic question |
| `checkin_reminder` | 25th of month 10:00 AM | Prompt monthly check-in |
| `milestone_countdown` | Daily 9:00 AM | Alerts at 30/14/7/3/1 days from milestone |
| `streak_protection` | Daily 6:00 PM | Warn users about streak at risk |

### 16.2 Implementation Files

| File | Purpose |
|------|---------|
| `backend/services/engagement_engine.py` | Email batch + dedup (dev: JSON file log; prod: Resend API) |
| `backend/services/habit_layers.py` | 5 engagement layers: digest, reminder, countdown, streak, anomaly |
| `backend/services/scheduler.py` | APScheduler wiring (AsyncIOScheduler, IST timezone) |

### 16.3 Anomaly Alerts

Triggered by check-in submission (reports.py) when revenue drops >10%:
```python
if previous_mrr > 0 and checkin.actual_revenue < previous_mrr:
    drop_pct = ((previous_mrr - checkin.actual_revenue) / previous_mrr) * 100
    if drop_pct > 10:
        background_tasks.add_task(fire_anomaly_alert, user_id, new_mrr, previous_mrr)
```

### 16.4 Streak Tracking

35-day window for streak continuity. Updated on each check-in submission:
```python
days_since = (now - last_checkin).days
new_streak = current_streak + 1 if days_since <= 35 else 1
await supabase_service.update_streak(user_id, new_streak, now.isoformat())
```

---

## 17. Environment Configuration

### 17.1 Backend (`backend/.env` — gitignored)

```env
# Runtime
ENVIRONMENT=production            # development | production
LOG_LEVEL=INFO                    # DEBUG | INFO | WARNING | ERROR

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxx           # For HS256 fallback

# Payments
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Admin
ADMIN_EMAILS=admin@company.com    # Comma-separated for multiple admins

# CORS — all allowed origins are explicit (no wildcards)
FRONTEND_URL=https://100crengine.in
# ADDITIONAL_CORS_ORIGINS=https://staging.100crengine.in

# Observability
SENTRY_DSN=https://xxx@sentry.io/xxx

# Email (habit engine)
RESEND_API_KEY=re_xxx             # If absent, emails are logged locally

# Rate limiting (optional — in-memory used if absent)
REDIS_URL=redis://localhost:6379

# Scheduler
SCHEDULER_ENABLED=true
```

### 17.2 Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://api.100crengine.in
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_ADMIN_EMAILS=admin@company.com
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 18. Known Issues & Fixes

### 18.1 Issues Fixed (March 2026)

| Issue | Root Cause | Fix | Commit |
|-------|-----------|-----|--------|
| Settings profile save not working | `handleSaveProfile` only console.logged | Wired to `updateUserProfile` API | Earlier |
| CORS: hardcoded Codespace URL | Security risk — leaked into prod builds | `FRONTEND_URL` + `ADDITIONAL_CORS_ORIGINS` env vars | `45f04c7` |
| `business_model` dropped from onboarding | Hardcoded `profile_data` dict omitted the field | Added all fields to dict | `45f04c7` |
| `company_name`, `sector`, `growth_rate` also dropped | Same cause | Included in same fix | `45f04c7` |
| `TypeError: None >= float` in context.py | `.get(key, default)` only fires when key absent; DB NULL returns key=present, value=None | Changed to `or default` pattern; added None guard in `_add_benchmark_comparison` | `ce6e469` |
| ExceptionGroup wrapping middleware errors | Starlette anyio.TaskGroup wraps re-raised exceptions in ExceptionGroup | Replaced bare `raise` with `return JSONResponse(500)` | `ce6e469` |
| AI budget always 0 (Sonnet used with no cap) | `get_monthly_ai_spend` method missing from `SupabaseService`; silent `except Exception: return 0.0` | Added method to SupabaseService | `915d9f6` |
| AI usage never persisted | `record_ai_transaction` method missing; same silent fallback pattern | Added method to SupabaseService | `915d9f6` |
| `daily_pulse` effectively unlimited | `limit: -1` treated as 999,999 | Changed to 60/day | `915d9f6` |
| `weekly_question` effectively unlimited | Same | Changed to 7/day | `915d9f6` |
| Sign-out left auth_token in localStorage | Sidebar used `localStorage.removeItem` directly, not `signOut()` | DashboardSidebar now calls `signOut()` from useAuth | Hybrid arch |
| Existing users without persona never prompted | `needsOnboarding` only checked `company` + `onboarding_completed` | Added `needsPersonaSelection` and `personaOnly` prop | Hybrid arch |

### 18.2 Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Agency pages content | Stub | CashFlowRadar, ARAgingDashboard, Collections have placeholder UI only |
| Connector sync | Stub | Returns "coming soon" |
| PDF export | Not implemented | Print-to-PDF workaround only |
| Email sending in dev | Local JSON log | Set `RESEND_API_KEY` for production emails |
| Rate limiter (multi-instance) | In-memory only | Set `REDIS_URL` for horizontal scaling |
| Admin backend guard | Client-side only | `require_admin` dependency not applied to all admin endpoints |

### 18.3 Python Version Compatibility Note

ExceptionGroup was introduced in Python 3.11. The ExceptionGroup handler in `main.py` is wrapped in `try/except ImportError` so the app still runs on Python 3.10, but ExceptionGroups will not be caught on older versions.

---

## Appendix A: Quick Commands

### Start Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start                     # http://localhost:3000
```

### Apply Migrations (Supabase SQL Editor)

```sql
-- Run in order (all are idempotent — safe to re-run):
-- 1. Core tables (if not already applied)
\i backend/migrations/create_subscriptions_table.sql
\i backend/migrations/add_beta_fields_to_profiles.sql
\i backend/migrations/habit_engine_schema.sql
\i backend/migrations/dpdp_compliance.sql

-- 2. Hybrid Architecture (applied 2026-03-22)
\i backend/migrations/persona_routing.sql
\i backend/migrations/ai_usage_log.sql
```

### Grant Beta Access

```bash
curl -X POST "https://api.100crengine.in/api/admin/beta/{user_id}" \
  -H "Authorization: Bearer {admin_jwt}" \
  -H "Content-Type: application/json" \
  -d '{"days": 60}'
```

### Trigger Habit Engine Jobs

```bash
# Manually fire digest job
curl -X POST "https://api.100crengine.in/api/admin/trigger/digest" \
  -H "Authorization: Bearer {admin_jwt}"
```

### Check AI Usage for a User

```sql
-- In Supabase SQL Editor (service role)
SELECT feature, model, cost_inr, created_at
FROM ai_usage_log
WHERE user_id = '{user_id}'
  AND created_at >= date_trunc('month', now())
ORDER BY created_at DESC;
```

---

## 19. Next.js 15 Migration

### 19.1 Migration Overview

The 100Cr Engine is migrating from CRA + React Router to Next.js 15 with App Router. This migration brings:

- **Performance**: React Server Components, streaming, Turbopack
- **Security**: Middleware-based auth, server-only code isolation
- **AI Capabilities**: Server Actions for AI streaming responses
- **SEO**: Built-in metadata API, automatic sitemap generation

### 19.2 Key Architecture Changes

| Aspect | Current (CRA) | Target (Next.js 15) |
|--------|---------------|---------------------|
| Router | react-router-dom v6 | Next.js App Router |
| Bundler | Webpack via CRA | Turbopack (dev) |
| SSR | None (client-only) | Hybrid (RSC + Client) |
| Auth | Client-side only | Middleware + Server |
| API Calls | Client fetch only | Server + Client |

### 19.3 Directory Structure (Next.js)

```
frontend-next/src/
├── app/
│   ├── (public)/          # Public routes (landing, pricing, tools)
│   ├── (auth)/            # Auth routes (callback, checkout)
│   ├── (protected)/       # Dashboard & admin routes
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── providers.tsx      # Client providers
├── components/            # Migrated components
├── lib/
│   ├── api/              # Server + Client API clients
│   └── supabase/         # Supabase SSR clients
├── context/              # Auth context
├── hooks/                # React Query hooks
└── middleware.ts         # Auth middleware
```

### 19.4 Frontend ↔ Backend Integration

The backend remains unchanged. Frontend API integration uses:

| Context | API Client | Usage |
|---------|------------|-------|
| Server Component | `serverFetch()` | Initial data loading |
| Client Component | `clientFetch()` | User interactions |
| Server Action | `serverFetch()` | Form submissions, AI generation |

### 19.5 Migration Documents

For complete migration instructions, see:

1. **[NEXTJS_15_PRODUCTION_MIGRATION_GUIDE.md](./NEXTJS_15_PRODUCTION_MIGRATION_GUIDE.md)**
   - Complete technical guide
   - Phase-by-phase implementation plan
   - Frontend-backend integration map
   - Security hardening
   - Performance optimizations

2. **[NEXTJS_15_MIGRATION_CHECKLIST.md](./NEXTJS_15_MIGRATION_CHECKLIST.md)**
   - Day-by-day task breakdown
   - Verification checkpoints
   - API integration testing checklist
   - Deployment procedures

### 19.6 Migration Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| A | Day 1 | Project setup, styles |
| B | Day 1-2 | Auth foundation |
| C | Day 2-3 | API layer |
| D | Day 3-5 | Public routes |
| E | Day 5-7 | Dashboard routes |
| F | Day 7-8 | Admin & payments |
| G | Day 8-9 | AI features |
| H | Day 9-10 | Testing & deployment |

---

**End of Comprehensive Guide**

*Last updated: March 24, 2026*
*Version: 5.1.0 — Hybrid Architecture + Next.js 15 Migration*
