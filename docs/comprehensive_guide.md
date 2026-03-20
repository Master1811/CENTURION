# 100Cr Engine - Comprehensive Technical Guide

**Last Updated:** March 19, 2026  
**Version:** 3.0.0 Production  
**Audit Status:** Complete

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
11. [Environment Configuration](#11-environment-configuration)
12. [Known Issues & Fixes](#12-known-issues--fixes)

---

## 1. Architecture Overview

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React SPA)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Landing    │  │   Tools     │  │  Dashboard  │  │    Auth/Checkout    │ │
│  │  /          │  │  /tools/*   │  │  /dashboard │  │  /auth/callback     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  │  /checkout          │ │
│                                                      └─────────────────────┘ │
│  Context: AuthProvider (user, session, profile, subscription)               │
│  Routing: react-router-dom v7 + ProtectedRoute                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ REST API (HTTPS)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  /api/user  │  │ /api/engine │  │ /api/ai     │  │  /api/payments      │ │
│  │  Profile    │  │ Projection  │  │ Coach       │  │  Razorpay           │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  Services: auth.py, supabase.py, anthropic.py, encryption.py               │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    Supabase     │       │    Anthropic    │       │    Razorpay     │
│  PostgreSQL+Auth│       │  Claude AI      │       │   Payments      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
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
| Auth | Supabase Auth | - |
| AI | Anthropic Claude | - |
| Payments | Razorpay | - |

---

## 2. File-by-File Breakdown

### 2.1 Backend Structure

```
backend/
├── main.py                 # FastAPI app, CORS, routers, error handlers
├── server.py               # Uvicorn entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (gitignored)
├── .env.example            # Template for env vars
├── migrations/
│   ├── add_beta_fields_to_profiles.sql   # Beta access columns
│   └── create_subscriptions_table.sql    # Subscriptions table
├── models/
│   ├── __init__.py         # Model exports
│   ├── founder.py          # UserProfile, Subscription models
│   ├── projection.py       # ProjectionInputs, Milestone models
│   ├── checkin.py          # CheckIn models
│   └── ai.py               # AI request/response models
├── routers/
│   ├── __init__.py         # Router exports
│   ├── engine.py           # /api/engine/* (projections)
│   ├── benchmarks.py       # /api/benchmarks/* 
│   ├── ai.py               # /api/ai/* (Claude integration)
│   ├── connectors.py       # /api/connectors/*
│   ├── reports.py          # /api/dashboard/*, /api/checkin*
│   ├── admin.py            # /api/admin/*
│   └── payments.py         # /api/payments/razorpay/*
└── services/
    ├── __init__.py         # Service exports
    ├── auth.py             # JWT verification, require_auth, require_paid
    ├── supabase.py         # DB operations (profiles, subscriptions, etc.)
    ├── anthropic.py        # Claude API integration
    ├── encryption.py       # Fernet encryption for API keys
    ├── rate_limiter.py     # IP/user rate limiting
    ├── context.py          # FounderContext for AI prompts
    └── ai_cost_control.py  # Sonnet budget, Haiku overflow
```

### 2.2 Frontend Structure

```
frontend/src/
├── App.js                  # Routes, AuthProvider wrapper
├── index.js                # React entry point
├── App.css                 # Global styles
├── index.css               # Tailwind imports
├── context/
│   └── AuthContext.jsx     # Auth state, profile, subscription, methods
├── lib/
│   ├── api/
│   │   ├── client.js       # Axios instance
│   │   └── dashboard.js    # All API functions
│   ├── auth/
│   │   └── intent.js       # Auth intent storage (localStorage)
│   ├── engine/
│   │   ├── projection.js   # Revenue projection math
│   │   ├── benchmarks.js   # Benchmark comparison
│   │   └── constants.js    # CRORE, formatCrore, etc.
│   ├── supabase/
│   │   └── client.js       # Supabase client init
│   ├── copy.js             # All user-facing strings
│   └── utils.js            # cn() and helpers
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx    # Route guard (beta/paid)
│   │   └── AuthModal.jsx         # Email input modal
│   ├── dashboard/
│   │   ├── DashboardSidebar.jsx  # Sidebar navigation
│   │   ├── CheckInModal.jsx      # Monthly check-in form
│   │   ├── OnboardingModal.jsx   # 3-step onboarding
│   │   └── FreeTierBanner.jsx    # Beta countdown / upgrade prompt
│   ├── landing/
│   │   ├── HeroSectionNew.jsx    # Main hero
│   │   ├── FounderDNAQuiz.jsx    # Quiz component
│   │   └── PricingSection.jsx    # Pricing cards
│   ├── layout/
│   │   ├── Navbar.jsx            # Top navigation
│   │   └── Footer.jsx            # Site footer
│   ├── ui/                       # Shared UI components
│   ├── tour/                     # Onboarding tour
│   └── upgrade/
│       └── UpgradeModal.jsx      # Rate limit / paywall modal
└── pages/
    ├── LandingPage.jsx           # Marketing homepage
    ├── PricingPage.jsx           # Pricing page
    ├── AuthCallback.jsx          # Magic link handler
    ├── CheckoutPage.jsx          # Razorpay checkout
    ├── tools/
    │   ├── HundredCrCalculator.jsx
    │   ├── ARRCalculator.jsx
    │   ├── RunwayCalculator.jsx
    │   └── GrowthCalculator.jsx
    ├── dashboard/
    │   ├── DashboardLayout.jsx   # Layout wrapper
    │   ├── CommandCentre.jsx     # Main dashboard
    │   ├── RevenueIntelligence.jsx
    │   ├── ForecastingEngine.jsx
    │   ├── BenchmarkIntelligence.jsx
    │   ├── ReportingEngine.jsx
    │   ├── AIGrowthCoach.jsx
    │   ├── GoalArchitecture.jsx
    │   ├── InvestorRelations.jsx
    │   ├── Connectors.jsx
    │   └── Settings.jsx
    └── preview/                  # Screenshot routes (no auth)
```

---

## 3. API Endpoint Reference

### 3.1 Authentication Levels

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public (no auth) |
| 🔑 | Requires auth (JWT) |
| 💰 | Requires paid subscription |
| 🔐 | Requires admin role |

### 3.2 Complete Endpoint List

#### Health & Root
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/` | 🔓 | API info |
| GET | `/api/health` | 🔓 | Health check |

#### User Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile` | 🔑 | Get profile + subscription |
| PUT | `/api/user/profile` | 🔑 | Update profile |
| POST | `/api/user/onboarding` | 🔑 | Complete onboarding |
| DELETE | `/api/user/delete` | 🔑 | Delete account (cascade) |

#### Projection Engine
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/engine/projection` | 🔓* | Run projection (*rate-limited) |
| GET | `/api/engine/projection/{slug}` | 🔓 | Get shared projection |
| POST | `/api/engine/scenario` | 🔑 | Scenario analysis |

#### Benchmarks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/benchmarks/stages` | 🔓 | List all stages |
| GET | `/api/benchmarks/{stage}` | 🔓 | Get stage benchmarks |
| POST | `/api/benchmarks/compare` | 🔓 | Compare to benchmark |

#### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/overview` | 💰 | Command Centre data |
| GET | `/api/dashboard/revenue` | 💰 | Revenue Intelligence |

#### Check-ins
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/checkin` | 💰 | Submit check-in |
| GET | `/api/checkins` | 💰 | List check-ins |

#### Connectors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/connectors/providers` | 🔓 | List providers |
| GET | `/api/connectors` | 💰 | List connected |
| POST | `/api/connectors/{provider}/connect` | 💰 | Connect provider |
| DELETE | `/api/connectors/{provider}` | 💰 | Disconnect |
| POST | `/api/connectors/{provider}/sync` | 💰 | Sync data (stub) |

#### AI Features
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/usage` | 💰 | AI usage stats |
| GET | `/api/ai/daily-pulse` | 💰 | Daily insight |
| GET | `/api/ai/weekly-question` | 💰 | Strategic question |
| POST | `/api/ai/board-report` | 💰 | Generate report |
| POST | `/api/ai/strategy-brief` | 💰 | Strategy brief |
| POST | `/api/ai/deviation` | 💰 | Deviation analysis |

#### Quiz (Lead Gen)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/quiz/submit` | 🔓 | Submit quiz answers |

#### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/razorpay/create-order` | 🔑 | Create order |
| POST | `/api/payments/razorpay/webhook` | 🔓 | Handle webhook |

#### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | 🔐 | Platform stats |
| POST | `/api/admin/subscription/{user_id}` | 🔐 | Grant subscription |
| POST | `/api/admin/beta/{user_id}` | 🔐 | Grant beta access |

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram (Text)

```
auth.users (Supabase Auth)
    │
    ├──< profiles (1:1)
    │       ├── id (PK, FK → auth.users)
    │       ├── email, name, company
    │       ├── stage, current_mrr, growth_rate
    │       ├── onboarding_completed
    │       ├── beta_status, beta_expires_at
    │       └── plan_tier
    │
    ├──< subscriptions (1:1)
    │       ├── id (PK)
    │       ├── user_id (FK → auth.users, UNIQUE)
    │       ├── status, plan, plan_tier
    │       ├── payment_ref, payment_provider
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
    └──< ai_usage_log (1:N)
            ├── id (PK)
            ├── user_id (FK)
            ├── feature, model
            └── input_tokens, output_tokens

projection_runs (standalone)
    ├── id (PK)
    ├── slug (UNIQUE)
    ├── user_id (FK, nullable)
    ├── inputs, result
    └── created_at

quiz_submissions (standalone)
    ├── id (PK)
    ├── answers, email
    └── result, percentile

benchmark_contributions (anonymized)
    ├── id (PK)
    ├── stage, growth_rate
    ├── arr_bucket, industry_category
    └── contribution_hash
```

### 4.2 RLS Policies Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | auth.uid()=id | auth.uid()=id | auth.uid()=id | - |
| subscriptions | auth.uid()=user_id | service_role | service_role | service_role |
| checkins | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| connector_keys | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id | auth.uid()=user_id |
| projection_runs | TRUE (public) | TRUE | service_role | service_role |

---

## 5. Authentication Flow

### 5.1 Magic Link Sequence

```
┌─────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────────┐
│  User   │     │  Frontend   │     │ Supabase │     │   Backend   │
└────┬────┘     └──────┬──────┘     └────┬─────┘     └──────┬──────┘
     │                 │                  │                  │
     │ Enter email     │                  │                  │
     │────────────────>│                  │                  │
     │                 │                  │                  │
     │                 │ signInWithOtp()  │                  │
     │                 │─────────────────>│                  │
     │                 │                  │                  │
     │    Email with magic link          │                  │
     │<──────────────────────────────────│                  │
     │                 │                  │                  │
     │ Click link      │                  │                  │
     │────────────────>│ /auth/callback   │                  │
     │                 │                  │                  │
     │                 │ getSession()     │                  │
     │                 │─────────────────>│                  │
     │                 │                  │                  │
     │                 │<─ session + JWT  │                  │
     │                 │                  │                  │
     │                 │ GET /api/user/profile               │
     │                 │────────────────────────────────────>│
     │                 │                  │                  │
     │                 │<─── profile + subscription ─────────│
     │                 │                  │                  │
     │<── Dashboard ───│                  │                  │
     │                 │                  │                  │
```

### 5.2 Intent Handling

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

**Flow:**
1. User clicks CTA (e.g., "Start Founder Plan")
2. `storeAuthIntent({ intent: 'checkout', plan: 'founder', redirectTo: '/checkout' })`
3. AuthModal opens → user enters email
4. Magic link sent
5. User clicks link → `/auth/callback`
6. `getRedirectPathAfterAuth()` reads and clears intent
7. Redirect to intent's `redirectTo` path

---

## 6. Access Control System

### 6.1 Two-Tier Access Model

```
                    ┌──────────────────────────────────────┐
                    │            Authenticated?            │
                    └──────────────────┬───────────────────┘
                                       │
                    ┌──────────────────┴───────────────────┐
                    │                                      │
                   YES                                     NO
                    │                                      │
                    ▼                                      ▼
        ┌───────────────────────┐              ┌───────────────────┐
        │ requireDashboardAccess│              │  Redirect to /    │
        │ enabled?              │              │  (landing page)   │
        └───────────┬───────────┘              └───────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
        YES                    NO
         │                     │
         ▼                     ▼
  ┌─────────────────┐   ┌─────────────────┐
  │ Check access:   │   │ Allow access    │
  │ isBetaUser OR   │   │ (auth-only)     │
  │ hasPaidSub      │   │ e.g., /checkout │
  └────────┬────────┘   └─────────────────┘
           │
    ┌──────┴──────┐
    │             │
  TRUE          FALSE
    │             │
    ▼             ▼
  Allow    ┌─────────────────────────┐
           │ Beta expired?           │
           └───────────┬─────────────┘
                       │
           ┌───────────┴───────────┐
          YES                      NO
           │                       │
           ▼                       ▼
    Redirect to         Redirect to
    /checkout           /pricing
    (beta_expired)      (subscription_required)
```

### 6.2 AuthContext Values

```javascript
const value = {
  // State
  user,                 // Supabase user object
  session,              // Supabase session
  profile,              // Backend profile (includes beta_status, etc.)
  subscription,         // Backend subscription
  loading,              // Auth initialization in progress

  // Methods
  signInWithMagicLink,  // Send magic link
  signOut,              // Clear session
  getAccessToken,       // Get JWT for API calls
  refreshProfile,       // Re-fetch profile from backend

  // Computed (for access control)
  isAuthenticated,      // Boolean(user)
  isBetaUser,           // beta_status=active AND not expired
  hasPaidSubscription,  // plan in ['founder','studio','vc_portfolio'] AND status=active
  canAccessDashboard,   // isBetaUser OR hasPaidSubscription
};
```

---

## 7. Payment Integration

### 7.1 Razorpay Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│  User   │     │  Frontend   │     │   Backend   │     │ Razorpay │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └────┬─────┘
     │                 │                   │                  │
     │ Click Pay       │                   │                  │
     │────────────────>│                   │                  │
     │                 │                   │                  │
     │                 │ POST /create-order│                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │                   │ order.create()   │
     │                 │                   │─────────────────>│
     │                 │                   │                  │
     │                 │                   │<── order_id ─────│
     │                 │<── orderId, keyId │                  │
     │                 │                   │                  │
     │ Razorpay modal  │                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
     │ Enter card      │                   │                  │
     │────────────────>│ ─────────────────────────────────────│
     │                 │                   │                  │
     │                 │                   │ webhook (signed) │
     │                 │                   │<─────────────────│
     │                 │                   │                  │
     │                 │                   │ create_subscription
     │                 │                   │ (user_id, plan)  │
     │                 │                   │                  │
     │                 │ Poll /api/user/profile               │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │<── subscription.plan=founder ────────│
     │                 │                   │                  │
     │<── /dashboard ──│                   │                  │
```

### 7.2 Webhook Security

```python
# backend/routers/payments.py
expected = hmac.new(
    RAZORPAY_WEBHOOK_SECRET.encode(),
    body,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected, signature):
    raise HTTPException(status_code=401, detail="Invalid webhook signature")
```

### 7.3 Plan Pricing

```python
PLAN_PRICING = {
    "founder": {
        "amount": 1499900,  # ₹14,999 in paise
        "currency": "INR",
        "description": "Centurion Founder Plan — Annual",
    }
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
| 3 | MRR | current_mrr (slider ₹10K - ₹1Cr) |

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

### 8.4 Backend Handler

```python
# main.py
@user_router.post("/onboarding")
async def complete_onboarding(profile: UserProfile, user = Depends(require_auth)):
    profile_data = {
        'id': user['id'],
        'company_name': profile.company_name or profile.company,
        'stage': profile.stage,
        'sector': profile.sector or profile.industry,
        'current_mrr': profile.current_mrr,
        'onboarding_completed': True,
    }
    result = await supabase_service.upsert_profile(profile_data)
    return {'success': True, 'profile': result}
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

**Components Used:**
- FreeTierBanner
- OnboardingModal
- CheckInModal
- UpgradeModal
- SyncStatus

### 9.2 Revenue Intelligence

**API:** `GET /api/dashboard/revenue`

**Data:**
- Revenue vs Baseline chart data
- Benchmark comparison
- Revenue Quality Score
- Cohort tracking

### 9.3 Settings

**Tabs:**
1. **Profile** - Personal info, company info (saves to API ✅)
2. **Billing** - Plan overview, usage stats, invoices
3. **Support** - FAQs, contact, resources

**Save Flow:**
```javascript
const handleSaveProfile = async (data) => {
  const profileData = {
    name: data.fullName,
    company: data.company,
    stage: data.stage,
  };
  await updateUserProfile(accessToken, profileData);
  await refreshProfile();
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

### 10.3 Context Building

**File:** `backend/services/context.py`

**FounderContext includes:**
- Profile data
- Recent check-ins
- Subscription status
- Benchmarks for stage
- Current milestones

---

### 10.4 Production AI Optimizations (Required)

**Tuple-unpacking contract (FastAPI router vs AI service):**
- All generation methods in `backend/services/anthropic.py` return a **tuple**: `(payload, usage)`.
- Callers must **explicitly unpack**: e.g. `report, usage = await ai_service.generate_board_report(...)`.

**Anthropic Prompt Caching (Cost reduction):**
- Prompt caching is implemented in `backend/services/anthropic.py` inside `_call_claude` using Anthropic `cache_control: {"type": "ephemeral"}`.
- For board report generation, the reusable system prefix and the historical check-in section (`Recent Performance`) are cached.
- For strategy briefs, the reusable prefix and `Performance Summary` are cached.
- If prompt splitting fails, `_call_claude` falls back to enabling automatic caching.

**Claude Sonnet model alignment:**
- Ensure the cost controller and AI service use the same latest reasoning model id: `claude-3-5-sonnet-20241022`.

## 11. Environment Configuration

### 11.1 Backend (.env)

```env
# Core
ENVIRONMENT=development|production

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://100crengine.in

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxx  # Optional, defaults to ANON_KEY

# Payments
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# AI (Optional)
ANTHROPIC_API_KEY=sk-ant-xxx

# Admin
ADMIN_EMAILS=admin@company.com,ops@company.com

# Dev only
SKIP_SSL_VERIFY=false
```

### 11.2 Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

---

## 12. Known Issues & Fixes

### 12.1 Fixed Issues

| Issue | Status | Fix |
|-------|--------|-----|
| Settings profile save not working | ✅ Fixed | Wired handleSaveProfile to updateUserProfile API |
| CORS wildcard in production | ✅ Fixed | Environment-driven CORS_ORIGINS |
| Beta access not checked | ✅ Fixed | Added beta_status/beta_expires_at to profile |
| ProtectedRoute too simple | ✅ Fixed | Added requireDashboardAccess prop |
| Onboarding modal missing | ✅ Fixed | Created OnboardingModal component |

### 12.2 Known Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Connector sync | ⚠️ Stub | Returns "coming soon" |
| Admin stats | ⚠️ Stub | Returns zeros |
| PDF export | ❌ Missing | Not implemented |
| Email notifications | ❌ Missing | No transactional emails |

### 12.3 Recommended Improvements

1. **Add Sentry** for error tracking
2. **Add Redis** for distributed rate limiting
3. **Add Stripe** as payment alternative
4. **Implement connector sync** (Razorpay first)
5. **Add email service** (Resend/Postmark)

---

## Appendix A: Quick Commands

### Start Development

```bash
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd frontend
npm install
npm start
```

### Run Migrations

```sql
-- Run in Supabase SQL Editor
-- 1. Beta fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS beta_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS beta_expires_at TIMESTAMPTZ;

-- 2. Index
CREATE INDEX IF NOT EXISTS profiles_beta_status_idx
  ON profiles(beta_status);
```

### Grant Beta Access

```bash
# Via API (requires admin)
curl -X POST "https://api.100crengine.in/api/admin/beta/{user_id}" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"days": 60}'
```

---

**End of Comprehensive Guide**

---

## Habit-Forming Engagement System (Centurion Habit Engine) — Status Update

### Implemented (code + DB artifacts)
- Added Supabase migration `backend/migrations/habit_engine_schema.sql` (profiles: `streak_count`, `last_checkin_at`, `email_preferences`; new `engagement_events`; RPCs `get_paid_users_for_digest`, `get_cohort_percentile`, `get_cohort_size`).
- Implemented `backend/services/engagement_engine.py` (in-memory dedup, local JSON email logger, Async Anthropic Haiku wrapper, batch runner).
- Implemented `backend/services/habit_layers.py`:
  - L1 Monday Morning Digest
  - L2 Check-in Reminder
  - L3 Milestone Countdown
  - L4 Streak Protection
  - L5 Anomaly Alert (event-driven)
- Implemented `backend/services/scheduler.py` (APScheduler cron jobs, Asia/Kolkata, gated by `SCHEDULER_ENABLED=true`).
- Wired scheduler lifecycle into `backend/main.py`.
- Updated `backend/routers/reports.py` to update streak fields after check-ins.
- Updated `backend/routers/payments.py` to trigger anomaly alerts on Razorpay failure/refund/cancel/halt events (via `BackgroundTasks`).
- Updated `backend/routers/admin.py` with localhost admin endpoints to:
  - Trigger jobs (`/api/admin/trigger/{job_name}`)
  - View engagement event stats and per-user events
  - Inspect dedup cache (`/api/admin/dedup/status`)

### Verified
- `python -m compileall` passed for backend modules after implementation.
- Uvicorn startup shows scheduler job registration logs and app scheduler lifecycle prints.

### Pending / Incomplete Verification
- Confirm Supabase migration ran successfully after the final script adjustments (RPC column references required DB-specific field names).
- Confirm admin engagement routes are reachable on the running localhost instance (curl attempts for `/api/admin/trigger/*` and `/api/admin/dedup/status` returned `404` during verification).
- Confirm `backend/logs/emails.log` is being written when triggering jobs (and that digest preview includes the Haiku-generated board question).
- Confirm end-to-end dedup behavior (trigger digest twice; second run should mostly skip).
- Confirm streak updates end-to-end:
  - POST check-in endpoint updates `profiles.streak_count` and `profiles.last_checkin_at`.
- Confirm engagement events are logged to `engagement_events` after any successful trigger/alert.

### Next Steps
1. Re-run the Supabase migration file and confirm `get_paid_users_for_digest()` and both cohort RPCs exist.
2. Use a valid admin JWT (depends on `ADMIN_EMAILS` + Supabase JWT verification) and re-test:
   - `POST /api/admin/trigger/digest`
   - `POST /api/admin/trigger/checkin_reminder`
   - `POST /api/admin/trigger/milestone_countdown`
   - `POST /api/admin/trigger/streak_protection`
3. Inspect `backend/logs/emails.log` for JSON lines and board-question previews.
4. Validate streak + engagement event flows via authenticated user check-ins and admin engagement endpoints.

### Production Upgrade Path (not done yet)
- Add `REDIS_URL` and `RESEND_API_KEY` to `.env` to switch dedup and email sending from dev-local mode to production services.
