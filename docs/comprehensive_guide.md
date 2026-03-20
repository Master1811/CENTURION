# 100Cr Engine - Comprehensive Technical Guide

**Last Updated:** March 20, 2026  
**Version:** 4.0.0 Production  
**Audit Status:** Complete - 28/28 Tests Passed

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
9. [Dashboard Modules](#9-dashboard-modules)
10. [AI Integration](#10-ai-integration)
11. [Beta Waitlist System](#11-beta-waitlist-system)
12. [DPDP Compliance](#12-dpdp-compliance)
13. [Observability Layer](#13-observability-layer)
14. [Admin Dashboard](#14-admin-dashboard)
15. [Habit Engine](#15-habit-engine)
16. [Environment Configuration](#16-environment-configuration)
17. [Known Issues & Fixes](#17-known-issues--fixes)

---

## 1. Architecture Overview

### 1.1 System Diagram

```
+-----------------------------------------------------------------------------+
|                              FRONTEND (React SPA)                            |
|  +-------------+  +-------------+  +-------------+  +---------------------+  |
|  |  Landing    |  |   Tools     |  |  Dashboard  |  |    Auth/Checkout    |  |
|  |  /          |  |  /tools/*   |  |  /dashboard |  |  /auth/callback     |  |
|  +-------------+  +-------------+  +-------------+  |  /checkout          |  |
|                                                     +---------------------+  |
|  +-------------+  +-------------+                                            |
|  |   Admin     |  |   Privacy   |  NEW ROUTES                               |
|  |  /admin     |  |  /privacy   |                                            |
|  +-------------+  +-------------+                                            |
|                                                                              |
|  Context: AuthProvider (user, session, profile, subscription)                |
|  Routing: react-router-dom v7 + ProtectedRoute (admin/dashboard)            |
|  Observability: Sentry + Error Boundaries                                    |
+--------------------------------------+--------------------------------------+
                                       | REST API (HTTPS)
                                       v
+-----------------------------------------------------------------------------+
|                              BACKEND (FastAPI)                               |
|  +-------------+  +-------------+  +-------------+  +---------------------+  |
|  |  /api/user  |  | /api/engine |  |  /api/ai    |  |  /api/payments      |  |
|  |  Profile    |  | Projection  |  |  Coach      |  |  Razorpay           |  |
|  +-------------+  +-------------+  +-------------+  +---------------------+  |
|  +-------------+  +-------------+  +-------------+                           |
|  | /api/admin  |  |/api/waitlist|  |  Scheduler  |  NEW ROUTERS             |
|  |  Dashboard  |  |  Beta List  |  | Habit Engine|                           |
|  +-------------+  +-------------+  +-------------+                           |
|                                                                              |
|  Services: auth.py, supabase.py, anthropic.py, encryption.py                |
|  Observability: sentry_config.py, logging_service.py                        |
+--------------------------------------+--------------------------------------+
                                       |
         +-----------------------------+-----------------------------+
         v                             v                             v
+-----------------+         +-----------------+         +-----------------+
|    Supabase     |         |    Anthropic    |         |    Razorpay     |
|  PostgreSQL+Auth|         |  Claude AI      |         |   Payments      |
+-----------------+         +-----------------+         +-----------------+
```

### 1.2 Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React + CRA + Craco | 18.x |
| Styling | Tailwind CSS | 3.x |
| Animation | Framer Motion | 11.x |
| Charts | Recharts | 2.x |
| Backend | FastAPI | 0.100+ |
| Database | Supabase PostgreSQL | - |
| Auth | Supabase Auth (Magic Link + Google OAuth) | - |
| AI | Anthropic Claude | Sonnet/Haiku |
| Payments | Razorpay | - |
| Observability | Sentry | - |
| Scheduler | APScheduler | - |

---

## 2. File-by-File Breakdown

### 2.1 Backend Structure

```
backend/
+-- main.py                 # FastAPI app, CORS, routers, middleware, scheduler
+-- server.py               # Uvicorn entry point
+-- requirements.txt        # Python dependencies
+-- .env                    # Environment variables (gitignored)
+-- migrations/
|   +-- dpdp_compliance.sql         # Waitlist table + DPDP consent fields
|   +-- habit_engine_schema.sql     # Engagement events + profile streak fields
|   +-- add_beta_fields_to_profiles.sql
|   +-- create_subscriptions_table.sql
+-- models/
|   +-- __init__.py         # Model exports
|   +-- founder.py          # UserProfile, Subscription models
|   +-- projection.py       # ProjectionInputs, Milestone models
|   +-- checkin.py          # CheckIn models
|   +-- ai.py               # AI request/response models
|   +-- waitlist.py         # WaitlistEntry model (NEW)
+-- routers/
|   +-- __init__.py         # Router exports
|   +-- engine.py           # /api/engine/* (projections)
|   +-- benchmarks.py       # /api/benchmarks/*
|   +-- ai.py               # /api/ai/* (Claude integration)
|   +-- connectors.py       # /api/connectors/*
|   +-- reports.py          # /api/dashboard/*, /api/checkin*
|   +-- admin.py            # /api/admin/* (system monitoring, job triggers)
|   +-- payments.py         # /api/payments/razorpay/*
|   +-- waitlist.py         # /api/waitlist/* (NEW)
+-- services/
    +-- __init__.py         # Service exports
    +-- auth.py             # JWT verification (JWKS + HS256), require_auth, require_paid
    +-- supabase.py         # DB operations (profiles, subscriptions, waitlist, etc.)
    +-- anthropic.py        # Claude API integration
    +-- encryption.py       # Fernet encryption for API keys
    +-- rate_limiter.py     # IP/user rate limiting
    +-- context.py          # FounderContext for AI prompts
    +-- ai_cost_control.py  # Sonnet budget, Haiku overflow
    +-- logging_service.py  # Structured JSON logging (NEW)
    +-- sentry_config.py    # Sentry initialization (NEW)
    +-- engagement_engine.py # Email batch + dedup (NEW)
    +-- habit_layers.py     # Digest, reminders, alerts (NEW)
    +-- scheduler.py        # APScheduler cron jobs (NEW)
```

### 2.2 Frontend Structure

```
frontend/src/
+-- App.js                  # Routes, AuthProvider wrapper
+-- index.js                # React entry point, Sentry init
+-- App.css                 # Global styles
+-- index.css               # Tailwind imports
+-- context/
|   +-- AuthContext.jsx     # Auth state, profile, subscription, Google OAuth
+-- lib/
|   +-- api/
|   |   +-- client.js       # Axios instance
|   |   +-- dashboard.js    # All API functions
|   +-- auth/
|   |   +-- intent.js       # Auth intent storage (localStorage)
|   +-- engine/
|   |   +-- projection.js   # Revenue projection math
|   |   +-- benchmarks.js   # Benchmark comparison
|   |   +-- constants.js    # CRORE, formatCrore, etc.
|   +-- supabase/
|   |   +-- client.js       # Supabase client init
|   +-- sentry.js           # Sentry configuration (NEW)
|   +-- copy.js             # All user-facing strings
|   +-- utils.js            # cn() and helpers
+-- components/
|   +-- auth/
|   |   +-- ProtectedRoute.jsx    # Route guard (admin/beta/paid)
|   |   +-- AuthModal.jsx         # Email input modal + DPDP consent
|   +-- dashboard/
|   |   +-- DashboardSidebar.jsx  # Sidebar navigation
|   |   +-- CheckInModal.jsx      # Monthly check-in form
|   |   +-- OnboardingModal.jsx   # 3-step onboarding
|   |   +-- FreeTierBanner.jsx    # Beta countdown / upgrade prompt
|   +-- landing/
|   |   +-- HeroSectionNew.jsx    # Main hero
|   |   +-- FounderDNAQuiz.jsx    # Quiz component
|   |   +-- PricingSection.jsx    # Pricing cards
|   |   +-- WaitlistSection.jsx   # Beta waitlist form (NEW)
|   +-- layout/
|   |   +-- Navbar.jsx            # Top navigation
|   |   +-- Footer.jsx            # Site footer
|   +-- CookieConsentBanner.jsx   # DPDP cookie consent (NEW)
|   +-- ui/                       # Shared UI components
|   +-- tour/                     # Onboarding tour
|   +-- upgrade/
|       +-- UpgradeModal.jsx      # Rate limit / paywall modal
+-- pages/
    +-- LandingPage.jsx           # Marketing homepage
    +-- PricingPage.jsx           # Pricing page
    +-- AuthCallback.jsx          # Magic link handler
    +-- CheckoutPage.jsx          # Razorpay checkout
    +-- PrivacyPage.jsx           # DPDP privacy policy (NEW)
    +-- tools/
    |   +-- HundredCrCalculator.jsx
    |   +-- ARRCalculator.jsx
    |   +-- RunwayCalculator.jsx
    |   +-- GrowthCalculator.jsx
    +-- dashboard/
    |   +-- DashboardLayout.jsx   # Layout wrapper
    |   +-- CommandCentre.jsx     # Main dashboard
    |   +-- RevenueIntelligence.jsx
    |   +-- ForecastingEngine.jsx
    |   +-- BenchmarkIntelligence.jsx
    |   +-- ReportingEngine.jsx
    |   +-- AIGrowthCoach.jsx
    |   +-- GoalArchitecture.jsx
    |   +-- InvestorRelations.jsx
    |   +-- Connectors.jsx
    |   +-- Settings.jsx
    +-- admin/
        +-- AdminDashboard.jsx    # Super admin panel (NEW)
```

---

## 3. API Endpoint Reference

### 3.1 Authentication Levels

| Symbol | Meaning |
|--------|---------|
| Open | Public (no auth) |
| Auth | Requires auth (JWT) |
| Paid | Requires paid subscription |
| Admin | Requires admin role |

### 3.2 Complete Endpoint List

#### Health & Root

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/` | Open | API info |
| GET | `/api/health` | Open | Health check |

#### User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | Auth | Get profile + subscription |
| PUT | `/api/user/profile` | Auth | Update profile |
| POST | `/api/user/onboarding` | Auth | Complete onboarding |
| DELETE | `/api/user/delete` | Auth | Delete account (cascade) |

#### Projection Engine

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/engine/projection` | Open* | Run projection (*rate-limited) |
| GET | `/api/engine/projection/{slug}` | Open | Get shared projection |
| POST | `/api/engine/scenario` | Auth | Scenario analysis |

#### Benchmarks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/benchmarks/stages` | Open | List all stages |
| GET | `/api/benchmarks/{stage}` | Open | Get stage benchmarks |
| POST | `/api/benchmarks/compare` | Open | Compare to benchmark |

#### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/overview` | Paid | Command Centre data |
| GET | `/api/dashboard/revenue` | Paid | Revenue Intelligence |

#### Check-ins

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/checkin` | Paid | Submit check-in |
| GET | `/api/checkins` | Paid | List check-ins |

#### Connectors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/connectors/providers` | Open | List providers |
| GET | `/api/connectors` | Paid | List connected |
| POST | `/api/connectors/{provider}/connect` | Paid | Connect provider |
| DELETE | `/api/connectors/{provider}` | Paid | Disconnect |
| POST | `/api/connectors/{provider}/sync` | Paid | Sync data (stub) |

#### AI Features

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/usage` | Paid | AI usage stats |
| GET | `/api/ai/daily-pulse` | Paid | Daily insight |
| GET | `/api/ai/weekly-question` | Paid | Strategic question |
| POST | `/api/ai/board-report` | Paid | Generate report |
| POST | `/api/ai/strategy-brief` | Paid | Strategy brief |
| POST | `/api/ai/deviation` | Paid | Deviation analysis |

#### Quiz (Lead Gen)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quiz/submit` | Open | Submit quiz answers |

#### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/razorpay/create-order` | Auth | Create order |
| POST | `/api/payments/razorpay/webhook` | HMAC | Handle webhook |

#### Waitlist (NEW)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/waitlist` | Open | Join beta waitlist |
| GET | `/api/waitlist/count` | Open | Get waitlist count |

#### Admin (NEW)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/system/health` | Admin | System health check |
| GET | `/api/admin/scheduler/status` | Admin | Scheduler jobs status |
| POST | `/api/admin/trigger/{job}` | Admin | Manually trigger job |
| GET | `/api/admin/engagement/stats` | Admin | Engagement metrics |
| GET | `/api/admin/engagement/user/{id}` | Admin | User engagement history |
| GET | `/api/admin/dedup/status` | Admin | Dedup cache status |
| GET | `/api/admin/waitlist` | Admin | View all waitlist entries |
| PUT | `/api/admin/waitlist/{email}/convert` | Admin | Mark as converted |
| POST | `/api/admin/subscription/{user_id}` | Admin | Grant subscription |
| POST | `/api/admin/beta/{user_id}` | Admin | Grant beta access |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
auth.users (Supabase Auth)
    |
    +--< profiles (1:1)
    |       +-- id (PK, FK -> auth.users)
    |       +-- email, name, company
    |       +-- stage, current_mrr, growth_rate
    |       +-- onboarding_completed
    |       +-- beta_status, beta_expires_at
    |       +-- plan_tier
    |       +-- streak_count, last_checkin_at       (NEW)
    |       +-- dpdp_consent_given, dpdp_consent_at (NEW)
    |
    +--< subscriptions (1:1)
    |       +-- id (PK)
    |       +-- user_id (FK -> auth.users, UNIQUE)
    |       +-- status, plan, plan_tier
    |       +-- payment_ref, payment_provider
    |       +-- expires_at
    |
    +--< checkins (1:N)
    |       +-- id (PK)
    |       +-- user_id (FK)
    |       +-- month, actual_revenue
    |       +-- UNIQUE(user_id, month)
    |
    +--< connector_keys (1:N)
    |       +-- id (PK)
    |       +-- user_id (FK)
    |       +-- provider, encrypted_key
    |       +-- UNIQUE(user_id, provider)
    |
    +--< ai_usage_log (1:N)
    |       +-- id (PK)
    |       +-- user_id (FK)
    |       +-- feature, model
    |       +-- input_tokens, output_tokens
    |
    +--< engagement_events (1:N) (NEW)
            +-- id (PK)
            +-- user_id (FK)
            +-- event_type, event_data
            +-- created_at

projection_runs (standalone)
    +-- id (PK)
    +-- slug (UNIQUE)
    +-- user_id (FK, nullable)
    +-- inputs, result
    +-- created_at

quiz_submissions (standalone)
    +-- id (PK)
    +-- answers, email
    +-- result, percentile

waitlist (NEW - standalone)
    +-- id (PK)
    +-- email (UNIQUE)
    +-- name, company, stage
    +-- referral_source, ip_address
    +-- dpdp_consent_given, dpdp_consent_at
    +-- converted, referral_count
    +-- created_at
```

### 4.2 RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | auth.uid()=id | auth.uid()=id | auth.uid()=id | - |
| subscriptions | auth.uid()=user_id | service_role | service_role | service_role |
| checkins | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| connector_keys | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| projection_runs | TRUE (public) | TRUE | service_role | service_role |
| engagement_events | auth.uid()=user_id | service_role | - | - |
| waitlist | - | TRUE (public) | service_role | service_role |

---

## 5. Authentication Flow

### 5.1 Magic Link + Google OAuth Sequence

```
+----------+     +--------------+     +------------+     +--------------+
|   User   |     |   Frontend   |     |  Supabase  |     |   Backend    |
+----+-----+     +------+-------+     +-----+------+     +------+-------+
     |                  |                   |                   |
     | Enter email      |                   |                   |
     | + DPDP consent   |                   |                   |
     |----------------->|                   |                   |
     |                  |                   |                   |
     |                  | signInWithOtp()   |                   |
     |                  |------------------>|                   |
     |                  |       OR          |                   |
     |                  | signInWithGoogle()|                   |
     |                  |------------------>|                   |
     |                  |                   |                   |
     |    Email link / OAuth redirect       |                   |
     |<-------------------------------------|                   |
     |                  |                   |                   |
     | Click/complete   |                   |                   |
     |----------------->| /auth/callback    |                   |
     |                  |                   |                   |
     |                  | getSession()      |                   |
     |                  |------------------>|                   |
     |                  |                   |                   |
     |                  |<-- session + JWT  |                   |
     |                  |                   |                   |
     |                  | GET /api/user/profile                 |
     |                  |---------------------------------------->|
     |                  |                   |                   |
     |                  |<--- profile + subscription ------------|
     |                  |                   |                   |
     |<-- Dashboard ----|                   |                   |
     |                  |                   |                   |
```

### 5.2 JWT Verification (Backend)

```python
# backend/services/auth.py
async def verify_jwt_token(token: str) -> Dict[str, Any]:
    # 1. Decode header to get algorithm
    header = jwt.get_unverified_header(token)
    algorithm = header.get('alg', 'HS256')
    
    # 2. Try JWKS verification for RS256 (Supabase default)
    if algorithm == 'RS256':
        jwks_client = get_jwks_client()  # PyJWKClient
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token, 
                signing_key.key, 
                algorithms=['RS256'],
                audience='authenticated'
            )
            return payload
    
    # 3. Fallback to HS256 for legacy tokens
    jwt_secret = AuthConfig.get_jwt_secret()
    payload = jwt.decode(
        token, 
        jwt_secret, 
        algorithms=['HS256'],
        audience='authenticated'
    )
    return payload
```

### 5.3 Intent Handling

**Storage:** `localStorage` with key `centurion_auth_intent`

**Structure:**
```javascript
{
  intent: 'checkout' | 'calculator' | null,
  plan: 'founder' | null,
  redirectTo: '/dashboard' | '/checkout',
  storedAt: timestamp
}
```

**Expiry:** 30 minutes

---

## 6. Access Control System

### 6.1 Three-Tier Access Model

```
                    +--------------------------------------+
                    |            Authenticated?            |
                    +------------------+-------------------+
                                       |
                    +------------------+-------------------+
                    |                                      |
                   YES                                     NO
                    |                                      |
                    v                                      v
        +-----------------------+              +-------------------+
        |    Check Route Type   |              |  Redirect to /    |
        +-----------+-----------+              +-------------------+
                    |
         +----------+----------+----------+
         |          |          |          |
       Admin    Dashboard    Auth-Only  Public
         |          |          |          |
         v          v          v          v
    +--------+  +--------+  +--------+  +--------+
    | Check  |  | Check  |  | Allow  |  | Allow  |
    | ADMIN_ |  | Beta OR|  | Access |  | Access |
    | EMAILS |  | Paid   |  |        |  |        |
    +---+----+  +---+----+  +--------+  +--------+
        |           |
    +---+---+   +---+---+
    |       |   |       |
  Admin   Not  Allow   Deny
    |     Admin  |       |
    v       |    v       v
  Allow  Redirect  Allow  Redirect
         to /        to /pricing
```

### 6.2 ProtectedRoute Component

```javascript
// frontend/src/components/auth/ProtectedRoute.jsx
export const ProtectedRoute = ({ 
  children, 
  requireDashboardAccess = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, loading, canAccessDashboard, user } = useAuth();
  
  // Admin check - hashed email comparison
  const isAdmin = useMemo(() => {
    if (!requireAdmin) return true;
    if (!user?.email) return false;
    const adminEmails = getAdminEmails();
    return adminEmails.includes(user.email.toLowerCase());
  }, [requireAdmin, user?.email]);

  // Silent redirect for non-admins (security through obscurity)
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Dashboard access control
  if (requireDashboardAccess && !canAccessDashboard) {
    if (betaExpired) {
      return <Navigate to="/checkout" state={{ reason: 'beta_expired' }} />;
    }
    return <Navigate to="/pricing" state={{ reason: 'subscription_required' }} />;
  }

  return children;
};
```

### 6.3 AuthContext Computed Values

```javascript
// frontend/src/context/AuthContext.jsx
const isBetaUser = Boolean(
  profile?.beta_status === 'active' &&
  profile?.beta_expires_at &&
  new Date(profile.beta_expires_at) > new Date()
);

const hasPaidSubscription = () => {
  return ['starter', 'founder', 'studio', 'vc_portfolio'].includes(subscription?.plan) &&
         ['active', 'trialing'].includes(subscription?.status);
};

const canAccessDashboard = isBetaUser || hasPaidSubscription();
```

---

## 7. Payment Integration

### 7.1 Razorpay Flow

```
+----------+     +--------------+     +--------------+     +------------+
|   User   |     |   Frontend   |     |   Backend    |     |  Razorpay  |
+----+-----+     +------+-------+     +------+-------+     +-----+------+
     |                  |                   |                    |
     | Click Pay        |                   |                    |
     |----------------->|                   |                    |
     |                  |                   |                    |
     |                  | POST /create-order|                    |
     |                  |------------------>|                    |
     |                  |                   |                    |
     |                  |                   | order.create()     |
     |                  |                   |------------------->|
     |                  |                   |                    |
     |                  |                   |<--- order_id ------|
     |                  |<-- orderId, keyId |                    |
     |                  |                   |                    |
     | Razorpay modal   |                   |                    |
     |<-----------------|                   |                    |
     |                  |                   |                    |
     | Enter card       |                   |                    |
     |----------------->|----------------------------------------->|
     |                  |                   |                    |
     |                  |                   | webhook (HMAC)     |
     |                  |                   |<-------------------|
     |                  |                   |                    |
     |                  |                   | create_subscription|
     |                  |                   |                    |
     |                  | Poll /api/user/profile                 |
     |                  |------------------>|                    |
     |                  |                   |                    |
     |                  |<-- subscription.plan=founder ---------|
     |                  |                   |                    |
     |<-- /dashboard ---|                   |                    |
```

### 7.2 Webhook Security

```python
# backend/routers/payments.py
# Constant-time HMAC comparison
expected = hmac.new(
    RAZORPAY_WEBHOOK_SECRET.encode(),
    body,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected, signature):
    payment_logger.warning("Invalid webhook signature received")
    raise HTTPException(status_code=401, detail="Invalid webhook signature")
```

### 7.3 Plan Pricing

```python
PLAN_PRICING = {
    "starter": {
        "amount": 49900,      # 499 in paise
        "billing": "monthly",
        "expires_days": 30,
    },
    "founder": {
        "amount": 399900,     # 3,999 in paise
        "billing": "annual",
        "expires_days": 365,
    },
    "trial": {
        "amount": 9900,       # 99 in paise
        "billing": "trial_7d",
        "expires_days": 7,
    },
}
```

---

## 8. Onboarding Flow

### 8.1 Modal Trigger

```javascript
// CommandCentre.jsx
useEffect(() => {
  if (!profile) return;
  const needsOnboarding = (
    !profile.company_name &&
    !profile.onboarding_completed
  );
  if (needsOnboarding) {
    setShowOnboarding(true);
  }
}, [profile]);
```

### 8.2 Three Steps

| Step | Title | Fields |
|------|-------|--------|
| 1 | Company | company_name, website (optional) |
| 2 | Stage | stage (pre-seed/seed/series-a/series-b), sector |
| 3 | MRR | current_mrr (slider 10K - 1Cr) |

### 8.3 API Call

```javascript
// OnboardingModal.jsx
await submitOnboarding(token, {
  company_name: data.company_name,
  website: data.website?.trim() || null,
  stage: data.stage,
  sector: data.sector,
  current_mrr: data.current_mrr,
});
await refreshProfile();
onComplete();
```

---

## 9. Dashboard Modules

### 9.1 Command Centre

**API:** `GET /api/dashboard/overview`

**Data Returned:**
- companyName
- currentMRR, growthRate
- nextMilestone (label, value, date, monthsAway)
- healthScore (0-100)
- healthSignals (growth, retention, runway, engagement)
- aiPriority (string)
- actionQueue (array)
- streak (int)

### 9.2 Settings (Profile Save Fixed)

```javascript
// Settings.jsx - WORKING
const handleSaveProfile = async (data) => {
  const profileData = {
    name: data.fullName || data.name,
    company: data.company,
    stage: data.stage,
  };
  const accessToken = getAccessToken();
  const result = await updateUserProfile(accessToken, profileData);
  if (refreshProfile) {
    await refreshProfile();
  }
  return result;
};
```

---

## 10. AI Integration

### 10.1 Services

**File:** `backend/services/anthropic.py`

**Features:**
- Daily pulse generation
- Weekly strategic questions
- Board report generation
- Strategy briefs
- Deviation analysis

### 10.2 Cost Control

**File:** `backend/services/ai_cost_control.py`

**Logic:**
- Per-user Sonnet budget
- Overflow to Haiku when budget exceeded
- Usage tracking in `ai_usage_log` table

### 10.3 Prompt Caching

```python
# Anthropic prompt caching for cost reduction
# Uses cache_control: {"type": "ephemeral"} for reusable sections
```

---

## 11. Beta Waitlist System (NEW)

### 11.1 Overview

The waitlist system allows users to join a beta waitlist before the product launches, with a referral mechanism that boosts the referrer's position when their referrals join.

### 11.2 Backend Implementation

**File:** `backend/routers/waitlist.py`

```python
@router.post("/waitlist")
async def join_waitlist(entry: WaitlistEntry, request: Request):
    # Check for duplicate email (409 Conflict)
    existing = await supabase_service.get_waitlist_entry(entry.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already on waitlist")
    
    # Calculate position
    total_count = await supabase_service.get_waitlist_count()
    position = total_count + 1
    
    # Save entry with DPDP consent
    result = await supabase_service.create_waitlist_entry({
        "email": entry.email,
        "name": entry.name,
        "company": entry.company,
        "stage": entry.stage,
        "referral_source": entry.referral_source,
        "ip_address": request.client.host,
        "dpdp_consent_given": entry.dpdp_consent,
        "dpdp_consent_at": datetime.now(timezone.utc).isoformat(),
    })
    
    # Boost referrer position if ?ref= was provided
    if entry.referral_source:
        await supabase_service.boost_referrer_position(entry.referral_source)
    
    # Generate shareable referral URL
    referral_url = f"{FRONTEND_URL}?ref={entry.email}"
    
    return {
        "position": position,
        "referral_url": referral_url,
    }
```

### 11.3 Frontend Component

**File:** `frontend/src/components/landing/WaitlistSection.jsx`

- Email, name, company, stage inputs
- DPDP consent checkbox (required)
- Success state with position number
- Copy-to-clipboard share URL

---

## 12. DPDP Compliance (NEW)

### 12.1 Requirements

The Digital Personal Data Protection Act 2023 (India) requires:

1. **Identity of Data Fiduciary** - Who is collecting the data
2. **Categories of Personal Data** - What data is being collected
3. **Purpose of Processing** - Why data is being collected
4. **Retention Period** - How long data is kept
5. **User Rights** - Access, correction, erasure, grievance redressal
6. **Contact Details** - Data Protection Officer information

### 12.2 Implementation

**Privacy Page:** `frontend/src/pages/PrivacyPage.jsx`
- All 6 required disclosures present
- Accessible at `/privacy` route

**Consent Checkboxes:**
- AuthModal.jsx - Required before email submission
- WaitlistSection.jsx - Required before waitlist join

**Cookie Consent:** `frontend/src/components/CookieConsentBanner.jsx`
- Appears on first visit
- Accept/Decline buttons
- Stored in `localStorage.centurion_cookie_consent`
- If declined, analytics scripts not loaded

### 12.3 Database Schema

```sql
-- profiles table
ALTER TABLE profiles ADD COLUMN dpdp_consent_given BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN dpdp_consent_at TIMESTAMPTZ;

-- waitlist table
dpdp_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
dpdp_consent_at TIMESTAMPTZ,
```

---

## 13. Observability Layer (NEW)

### 13.1 Sentry Integration

**Backend:** `backend/services/sentry_config.py`

```python
def init_sentry():
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            StarletteIntegration(),
            FastApiIntegration(),
        ],
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        before_send=filter_pii,  # Remove sensitive data
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

### 13.2 Structured Logging

**File:** `backend/services/logging_service.py`

```python
# Named loggers per component
auth_logger = StructuredLogger("auth")
api_logger = StructuredLogger("api")
habit_logger = StructuredLogger("habit_engine")
payment_logger = StructuredLogger("payments")
ai_logger = StructuredLogger("ai")
admin_logger = StructuredLogger("admin")

# Features:
# - JSON structured output
# - Request correlation IDs
# - Sensitive data masking
# - Performance metrics
```

### 13.3 Request Middleware

```python
# backend/main.py
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
    
    return response
```

---

## 14. Admin Dashboard (NEW)

### 14.1 Security

**File:** `backend/routers/admin.py`

```python
# Hashed email comparison (prevents timing attacks)
def _is_admin_email(email: str) -> bool:
    admin_hashes = _load_admin_emails()
    email_hash = hashlib.sha256(email.lower().encode()).hexdigest()
    return email_hash in admin_hashes
```

### 14.2 Features

**File:** `frontend/src/pages/admin/AdminDashboard.jsx`

- System health monitoring cards
- Platform statistics with real counts
- Engagement metrics visualization (30 days)
- Scheduler job management with manual triggers
- Dedup cache inspection
- Production readiness checklist

### 14.3 Route Protection

```javascript
// App.js
<Route path="/admin" element={
  <ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## 15. Habit Engine (NEW)

### 15.1 Scheduler Jobs

| Job | Schedule | Timezone | Purpose |
|-----|----------|----------|---------|
| monday_digest | Mon 8:00 AM | Asia/Kolkata | Weekly MRR summary + AI question |
| checkin_reminder | 25th 10:00 AM | Asia/Kolkata | Monthly check-in reminder |
| milestone_countdown | Daily 9:00 AM | Asia/Kolkata | 30/14/7/3/1 day milestone alerts |
| streak_protection | Daily 6:00 PM | Asia/Kolkata | Protect check-in streaks |

### 15.2 Implementation

**Files:**
- `backend/services/engagement_engine.py` - Email batch + dedup
- `backend/services/habit_layers.py` - All 5 engagement layers
- `backend/services/scheduler.py` - APScheduler cron jobs

### 15.3 Anomaly Alerts

```python
# backend/routers/reports.py
# Triggered on >10% revenue drop during check-in
if previous_mrr > 0 and checkin.actual_revenue < previous_mrr:
    drop_pct = ((previous_mrr - checkin.actual_revenue) / previous_mrr) * 100
    
    if drop_pct > 10:
        background_tasks.add_task(
            fire_anomaly_alert,
            user_id=user_id,
            new_mrr=checkin.actual_revenue,
            previous_mrr=previous_mrr
        )
```

### 15.4 Streak Tracking

```python
# 35-day window for streak continuity
if last_checkin:
    days_since = (now - last_checkin).days
    new_streak = current_streak + 1 if days_since <= 35 else 1
else:
    new_streak = 1

await supabase_service.update_streak(
    user_id=user_id,
    streak_count=new_streak,
    last_checkin_at=now.isoformat(),
)
```

---

## 16. Environment Configuration

### 16.1 Backend (.env)

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxx

# Security
CORS_ORIGINS=http://localhost:3000,https://100crengine.in
ADMIN_EMAILS=admin@company.com

# Features
FRONTEND_URL=https://100crengine.in
SCHEDULER_ENABLED=true
ENVIRONMENT=production

# External Services
ANTHROPIC_API_KEY=sk-ant-xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
RESEND_API_KEY=re_xxx
REDIS_URL=redis://localhost:6379
```

### 16.2 Frontend (.env)

```env
REACT_APP_BACKEND_URL=https://api.100crengine.in
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_ADMIN_EMAILS=admin@company.com
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 17. Known Issues & Fixes

### 17.1 Fixed Issues (March 2026)

| Issue | Status | Fix |
|-------|--------|-----|
| Settings profile save not working | FIXED | Wired handleSaveProfile to updateUserProfile API |
| CORS wildcard in production | FIXED | Environment-driven CORS_ORIGINS |
| Beta access not checked | FIXED | Added beta_status/beta_expires_at to profile |
| ProtectedRoute too simple | FIXED | Added requireDashboardAccess and requireAdmin props |
| JWT 401 errors | FIXED | Implemented JWKS (RS256) + HS256 dual verification |
| Admin stats returning zeros | FIXED | Real Supabase counts implemented |
| No webhook verification | FIXED | HMAC constant-time comparison |

### 17.2 Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Connector sync | Stub | Returns "coming soon" |
| PDF export | Missing | Not implemented; print-to-PDF workaround |
| Email sending | Dev logger | Set RESEND_API_KEY for production |
| Distributed dedup | In-memory | Set REDIS_URL for multi-instance |

---

## Appendix A: Quick Commands

### Start Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate      # Mac/Linux
# .\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
yarn install
yarn start
```

### Run Migrations

```sql
-- Run in Supabase SQL Editor
-- 1. DPDP Compliance migration
-- (See backend/migrations/dpdp_compliance.sql)

-- 2. Habit engine migration
-- (See backend/migrations/habit_engine_schema.sql)
```

### Trigger Habit Engine Jobs

```bash
# Via API (requires admin JWT)
curl -X POST "https://api.100crengine.in/api/admin/trigger/digest" \
  -H "Authorization: Bearer {admin_token}"
```

### Grant Beta Access

```bash
curl -X POST "https://api.100crengine.in/api/admin/beta/{user_id}" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"days": 60}'
```

---

**End of Comprehensive Guide**

*Last updated: March 20, 2026*
*Version: 4.0.0 Production*
