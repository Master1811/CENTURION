# Project Centurion — 100Cr Engine
## Comprehensive Project Summary Guide

This guide provides an end-to-end understanding of the **100Cr Engine** (100crengine.in): a revenue milestone prediction platform for Indian founders. It covers backend and frontend implementation, feature-by-feature behaviour, current capabilities, and recommended next steps.

---

## 1. Executive Summary

**100Cr Engine** helps Indian SaaS founders answer: *“When will I reach ₹100 Crore in annual revenue?”* Users enter current monthly revenue and growth rate; the system projects milestones (₹1 Cr, ₹10 Cr, ₹50 Cr, ₹100 Cr), compares them to benchmarks, and—for paid users—offers monthly check-ins, AI coaching, and reporting.

- **Frontend:** React 19, React Router 7, Tailwind CSS, Radix UI, Recharts, Framer Motion. CRA with Craco.
- **Backend:** FastAPI (Python), Supabase (PostgreSQL + Auth), server-side JWT verification, rate limiting, encrypted connector keys, AI via Anthropic/Claude.
- **Deployment:** Backend runs as FastAPI (e.g. uvicorn); frontend builds as static SPA. Environment-driven configuration (no hardcoded secrets in code).

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React SPA)                            │
│  Landing │ Tools (100Cr, ARR, Runway, Growth) │ Dashboard │ Auth         │
│  copy.js │ lib/engine (projection, benchmarks) │ lib/api/dashboard.js    │
│  AuthContext (Supabase session + backend profile/subscription)            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │ HTTPS / REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                                 │
│  /api/health │ /api/user/* │ /api/engine/* │ /api/benchmarks/*           │
│  /api/dashboard/* │ /api/checkin(s) │ /api/connectors/* │ /api/ai/*        │
│  /api/quiz/submit │ /api/admin/*                                          │
│  Auth: JWT (Supabase) │ Rate limit (in-memory / Redis) │ CORS            │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Supabase    │         │  Anthropic /     │         │  Encryption     │
│   PostgreSQL  │         │  Claude (AI)     │         │  (Fernet)       │
│   + Auth      │         │  ANTHROPIC_API_KEY│        │  Connector keys │
└───────────────┘         └─────────────────┘         └─────────────────┘
```

- **Data:** Supabase holds profiles, subscriptions, projection_runs, checkins, connector_keys (encrypted), quiz_submissions, ai_usage_log. Backend uses **service role** server-side only.
- **Auth:** Magic link via Supabase; frontend gets session; backend verifies JWT on each request and enforces optional vs required auth and paid subscription where applicable.
- **AI:** Backend only; uses ANTHROPIC_API_KEY and optional cost control (Sonnet/Haiku overflow).

---

## 3. Backend Implementation

### 3.1 Stack and Entry Points

- **Runtime:** Python 3.x, FastAPI, Uvicorn.
- **Entry:** `server.py` imports `app` from `main.py` (for uvicorn: `uvicorn server:app --reload --port 8001`). Main app and routing live in `main.py`.
- **Config:** `python-dotenv` loads `backend/.env`. No `.env.example` in repo; required vars documented in production readiness report.

### 3.2 Directory Structure

| Path | Purpose |
|------|--------|
| `main.py` | FastAPI app, CORS, lifespan, mounts `/api` router, user/quiz routes, error handlers, request-id middleware |
| `routers/` | Engine, benchmarks, AI, reports (dashboard + check-ins), connectors, admin |
| `services/` | auth (JWT, require_auth, require_paid_subscription), supabase (DB), encryption (Fernet), anthropic (AI), rate_limiter, context (FounderContext), ai_cost_control |
| `models/` | Pydantic: projection, checkin, ai, founder (UserProfile, MagicLink, etc.) |

### 3.3 Key Services

- **auth.py** — Verifies Supabase JWT (SUPABASE_JWT_SECRET or ANON_KEY), exposes `get_current_user` (optional), `require_auth`, `require_paid_subscription`, `get_client_identifier` (user or IP), plan-tier checks for STUDIO/VC_PORTFOLIO.
- **supabase.py** — Single Supabase client (service role). Async-style methods for profiles, subscriptions, projection_runs, checkins, connector_keys, quiz_submissions, ai_usage_log; user deletion cascade; benchmark contributions (anonymised).
- **encryption.py** — Fernet (ENCRYPTION_KEY or fallback to service role key). Encrypts connector API keys before DB store; decrypts for sync path.
- **anthropic.py** — Uses ANTHROPIC_API_KEY and the official `anthropic` SDK. Board report, strategy brief, daily pulse, weekly question, deviation analysis. Returns structured strings/sections.
- **context.py** — Builds FounderContext (profile, check-ins, subscription, benchmarks, milestones) for AI prompts.
- **rate_limiter.py** — In-memory or Redis. Tiers: free (e.g. 10 projections/day by IP), paid (higher limits), AI (e.g. board_report 2/month).
- **ai_cost_control.py** — Per-user Sonnet budget; overflow to Haiku when exceeded. In-memory usage cache.

### 3.4 API Route Summary

| Prefix | Auth | Purpose |
|--------|------|--------|
| GET /api/, /api/health | — | Root and health |
| /api/user/profile | required | GET/PUT profile, POST onboarding, DELETE account |
| /api/quiz/submit | — | Founder DNA quiz; stores answers + optional email; returns projection + benchmark |
| /api/engine/projection | optional | POST projection (rate-limited), GET by slug |
| /api/engine/scenario | optional | POST scenario (base/optimistic/pessimistic) |
| /api/benchmarks/* | — | Stages, by stage, compare |
| /api/dashboard/overview, /revenue | paid | Command Centre and Revenue Intelligence data |
| /api/checkin, /api/checkins | paid | Submit and list check-ins |
| /api/connectors/* | paid (except providers) | List providers, connect/disconnect, sync (stub) |
| /api/ai/* | paid | Usage, board report, strategy brief, daily pulse, weekly question, deviation |
| /api/admin/stats, /subscription/{user_id} | admin | Stats (stub), grant subscription |

All write paths use `user_id` from JWT; admin uses hardcoded email list (MVP).

---

## 4. Frontend Implementation

### 4.1 Stack and Entry Points

- **Stack:** React 19, React Router 7, Tailwind CSS, Radix UI (shadcn-style components), Recharts, Framer Motion, Zustand, React Query (TanStack), Axios, Supabase JS.
- **Entry:** `index.js` → `App.js`. CRA + Craco (e.g. path alias `@/` → `src/`). Build: `yarn build` (or npm).

### 4.2 Directory Structure

| Path | Purpose |
|------|--------|
| `src/App.js` | Routes: landing, tools, pricing, auth/callback, dashboard (protected), preview |
| `src/context/AuthContext.jsx` | Session (Supabase), profile + subscription (backend), sign-in/sign-out, getAccessToken |
| `src/lib/engine/` | projection.js, benchmarks.js, constants.js — pure math and formatting |
| `src/lib/copy.js` | Single source of user-facing strings |
| `src/lib/api/client.js` | Axios client for backend (projection, benchmarks, check-in, shared projection) |
| `src/lib/api/dashboard.js` | fetch wrapper; dashboard, profile, check-in, connectors, AI, scenario, quiz |
| `src/lib/supabase/client.js` | Supabase createClient (anon key); used for auth only |
| `src/components/` | UI primitives (button, card, input, etc.), layout (Navbar, Footer, Sidebar), landing, dashboard, auth, upgrade |
| `src/pages/` | Landing, tools (100Cr, ARR, Runway, Growth), Pricing, AuthCallback, dashboard pages, preview pages |

### 4.3 Routing and Auth

- **Public:** `/`, `/pricing`, `/auth/callback`, `/tools/*`.
- **Protected:** All under `/dashboard/*` wrapped in `<ProtectedRoute>`. ProtectedRoute uses AuthContext: loading → redirect if !isAuthenticated; optional requirePaid → redirect to /pricing.
- **Dashboard layout:** `DashboardLayout` renders sidebar + outlet; sidebar links to Command Centre, Revenue, Forecasting, Benchmarks, Reports, Coach, Goals, Investors, Connectors, Settings. Mobile bottom nav for key sections.
- **Note:** `DashboardLayout.jsx` still has a legacy `isLoggedIn = true` check; actual enforcement is in App.js via ProtectedRoute.

### 4.4 State and Data Flow

- **Auth state:** AuthContext holds user, session, profile, subscription, loading; fetches profile/subscription from backend when session exists; token sent as Bearer for all dashboard API calls.
- **Dashboard data:** Each dashboard page (CommandCentre, RevenueIntelligence, AIGrowthCoach, etc.) uses local state + useEffect to call dashboard.js functions with `getAccessToken()`. On failure, some pages fall back to mock data for demo.
- **Calculator (100Cr):** Uses only frontend engine (`predictTrajectory`, `generateChartData`, `compareToBenchmark`); no backend call for the main tool. Backend projection is used when saving/sharing or when rate-limited flow is desired.

---

## 5. Feature-by-Feature Breakdown

### 5.1 Landing and Acquisition

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Landing page** | Hero (HeroSectionNew), logo carousel, scroll story, Founder DNA Quiz, social proof, teaser locked section, pricing, CTA. All copy from copy.js. | ✅ |
| **Founder DNA Quiz** | User answers (revenue range, growth, stage); frontend or backend maps to MRR/growth; POST /api/quiz/submit with answers + optional email. Backend returns projection + benchmark insight; stores submission + IP. | ✅ |
| **Announcement bar** | Small top banner with CTA. | ✅ |
| **Pricing** | PricingSection with Free vs Founder plan; copy from copy.js. No payment integration in UI (checkout not implemented). | ✅ |

### 5.2 Authentication

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Magic link** | User enters email → Supabase signInWithOtp; redirect to `/auth/callback`. Callback reads session from hash or exchanges code for session; creates profile on first login (backend); redirects to /dashboard. | ✅ |
| **Session persistence** | Supabase client persistSession + autoRefreshToken; AuthContext getSession and onAuthStateChange. | ✅ |
| **Profile + subscription** | After session, AuthContext calls GET /api/user/profile with Bearer token; backend returns user + profile + subscription. | ✅ |
| **Sign out** | Supabase signOut; clear local state. | ✅ |
| **Protected routes** | ProtectedRoute checks isAuthenticated (and optionally hasPaidSubscription); redirects to / or /pricing. | ✅ |

### 5.3 Revenue Projection Engine

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Formula** | R_t = R_0 × (1 + g)^t (monthly). Frontend: projection.js (sanitizeInput, calculateRevenueAtMonth, findMilestoneMonth, predictTrajectory). Backend: same logic in routers/engine.py with Pydantic ProjectionInputs. | ✅ |
| **Milestones** | ₹1 Cr, ₹10 Cr, ₹50 Cr, ₹100 Cr; months to reach and date; “reached” if current ARR ≥ value. | ✅ |
| **Sensitivity** | “What if 1% higher growth?” — months gained to 100 Cr. | ✅ |
| **100Cr Calculator (tool)** | Sliders for MRR and growth; useMemo runs predictTrajectory + generateChartData + compareToBenchmark (frontend only). Chart and milestone list. | ✅ |
| **Backend projection** | POST /api/engine/projection with currentMRR, growthRate. Rate limit by IP (free) or user (paid). Returns result + slug; saves to projection_runs for sharing. | ✅ |
| **Shared projection** | GET /api/engine/projection/{slug}. Public; no auth. | ✅ |
| **Scenario analysis** | POST /api/engine/scenario (base/optimistic/pessimistic growth). Backend runs three projections and returns comparison. | ✅ |

### 5.4 Benchmarks

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Stages** | Pre-seed, Seed, Series A (frontend); backend adds Series B. Static median/p75/p90 growth per stage. | ✅ |
| **Compare** | User growth rate vs stage benchmarks → percentile and status (exceptional / above-average / average / below-average). Frontend: benchmarks.js compareToBenchmark; backend: POST /api/benchmarks/compare. | ✅ |
| **Calculator integration** | 100Cr tool shows benchmark comparison and stage selector. | ✅ |

### 5.5 Dashboard (Paid)

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Command Centre** | GET /api/dashboard/overview (paid). Backend: profile + check-ins + connectors → current MRR, growth, health score, next milestone, action queue. Frontend: fetchDashboardOverview(token); fallback mock on error. | ✅ |
| **Revenue Intelligence** | GET /api/dashboard/revenue (paid). Backend: check-ins + baseline + benchmark curve. Frontend: chart (actual vs baseline vs benchmark); fallback mock. | ✅ |
| **Forecasting Engine** | Scenario-style what-if (likely uses engine/scenario or local engine). | ✅ |
| **Benchmark Intelligence** | Benchmark comparison UI for dashboard context. | ✅ |
| **Reporting Engine** | Board report and report generation UI; calls AI board report / strategy brief. | ✅ |
| **AI Growth Coach** | GET daily pulse, weekly question; POST deviation analysis. All require paid; backend uses FounderContext + Claude. | ✅ |
| **Goal Architecture** | Goals/milestones UI. | ✅ |
| **Investor Relations** | Investor-facing content / projection pack. | ✅ |
| **Connectors** | List providers; connect (POST with API key, stored encrypted); disconnect; sync (stub: “coming soon”). | ✅ |
| **Settings** | Tabs: profile, billing, support. Profile form exists but **handleSaveProfile only console.log** — does not call updateUserProfile; **profile save not persisted**. | ⚠️ Stub |
| **Check-in modal** | Month + actual_revenue + note; POST /api/checkin (paid). Backend updates profile MRR and streak. | ✅ |

### 5.6 AI Features (Paid / Plan Tier)

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Daily pulse** | GET /api/ai/daily-pulse. Context builder aggregates profile + check-ins; Anthropic service generates short pulse. Rate limit (e.g. 30/month). | ✅ |
| **Weekly question** | GET /api/ai/weekly-question. Claude generates question + hint from context. | ✅ |
| **Board report** | POST /api/ai/board-report. Plan tier STUDIO+; rate limit 2/month. Context → Claude → sections (summary, metrics, analysis, next steps). | ✅ |
| **Strategy brief** | POST /api/ai/strategy-brief. Same tier and cost control. | ✅ |
| **Deviation analysis** | POST /api/ai/deviation with actual, projected, note. Backend computes deviation % and calls Claude for analysis. | ✅ |
| **Cost control** | ai_cost_control: per-user Sonnet budget; overflow to Haiku. | ✅ |

### 5.7 Admin

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **Stats** | GET /api/admin/stats. require_admin (hardcoded email list). Returns total_users, active_subscriptions, etc. — **currently all zeros** (TODO: DB counts). | ⚠️ Stub |
| **Grant subscription** | POST /api/admin/subscription/{user_id}. Creates/extends subscription (e.g. founder, 365 days). | ✅ |

### 5.8 Other Tools

| Feature | How it works | Implemented |
|---------|----------------|-------------|
| **ARR Calculator** | Converts MRR → ARR and related metrics. | ✅ |
| **Runway Calculator** | Runway from burn/cash. | ✅ |
| **Growth Calculator** | Growth rate calculations. | ✅ |

---

## 6. Current Capabilities and Implemented Flows

### 6.1 Summary Table

| Area | Capability | Flow status |
|------|------------|------------|
| Auth | Magic link, session, profile + subscription fetch | End-to-end |
| Projection | Run projection (frontend + backend), share by slug, scenario | End-to-end |
| Benchmarks | Stages, compare, percentile | End-to-end |
| Check-ins | Submit and list; profile MRR/streak update | End-to-end |
| Dashboard data | Overview and revenue with fallback mock | End-to-end |
| Connectors | Connect/disconnect; keys encrypted; sync | Connect/disconnect only; sync stub |
| AI | Daily pulse, weekly question, board report, strategy brief, deviation | End-to-end (with plan tier) |
| Quiz | Submit answers + email; get projection + benchmark | End-to-end |
| User profile (backend) | GET/PUT profile, onboarding, delete account | Backend ready |
| User profile (Settings UI) | Form present; save not wired to API | **Not persisted** |
| Admin | Grant subscription | End-to-end; stats stub |
| Payments | No Razorpay/Stripe UI or webhooks | Not implemented |

### 6.2 Key End-to-End Flows

1. **Anonymous → Projection**  
   User opens 100Cr Calculator → adjusts MRR/growth → sees milestones and chart (frontend engine only). Optional: POST /api/engine/projection for slug/sharing; rate limit applies.

2. **Sign-in**  
   Email → magic link → /auth/callback → session established → GET /api/user/profile → redirect to /dashboard.

3. **Paid user – Command Centre**  
   GET /api/dashboard/overview with Bearer → backend fetches profile, check-ins, connectors → returns metrics, health, next milestone, actions → UI (or mock on error).

4. **Check-in**  
   User opens CheckInModal → month + revenue + note → POST /api/checkin → backend upserts check-in, updates profile MRR and streak → success.

5. **Connector**  
   User enters API key → POST /api/connectors/{provider}/connect → backend encrypts key, saves to connector_keys → listed in overview. Sync returns “coming soon”.

6. **AI board report**  
   User requests report → POST /api/ai/board-report → backend checks plan tier and rate limit → builds FounderContext → calls Claude → returns sections → UI displays.

---

## 7. Gaps and Areas for Improvement

### 7.1 Critical / Launch-Blocking

- **Settings profile save:** handleSaveProfile does not call updateUserProfile; profile edits are lost. Backend PUT /api/user/profile is implemented.
- **main.py error handler:** Uses `status.HTTP_500_*` without importing `status` → NameError on user-deletion failure.
- **CORS:** Default `*`; should be explicit origins in production.
- **.env.example:** Missing; deploy will lack variable documentation.
- **Payment webhooks:** If Razorpay/Stripe are used for paid plans, webhook endpoints with signature verification are required.

### 7.2 High Priority

- **Connector sync:** Sync is stub; no real fetch from Razorpay/Stripe etc. to create check-ins.
- **Connector key validation:** API key is not validated with provider before save (e.g. test request).
- **Admin:** Role from DB or JWT instead of hardcoded email; real stats from DB.
- **DashboardLayout:** Remove redundant `isLoggedIn = true` and rely on ProtectedRoute.
- **Rate limiting:** Add for GET /api/engine/projection/{slug} and POST /api/quiz/submit.
- **Copy:** Move Settings page strings into copy.js.

### 7.3 Medium / Quality

- **Frontend engine tests:** No unit tests for projection/benchmarks/constants; backend projection tests give indirect coverage.
- **Logging:** Replace or gate console.log/console.error (e.g. AuthContext, Settings, dashboard pages).
- **Lazy loading:** Dashboard routes could be React.lazy to reduce initial bundle.
- **Recharts:** Consider React.memo for chart components where re-renders are heavy.

### 7.4 Product / Ops

- **Checkout:** No payment UI (Razorpay/Stripe integration) for Founder plan.
- **Subscription lifecycle:** Grant/revoke via admin exists; no automated renewal or webhook-driven status.
- **Benchmark data:** Static; could be driven by anonymised contributions (backend has contribute_to_benchmarks).
- **Indexes:** Ensure DB indexes on (user_id, month), (user_id), (slug) for checkins, profiles, projection_runs.

---

## 8. Recommended Enhancements and Next Steps

### 8.1 Before Production Launch

1. **Wire Settings save:** In Settings.jsx, call `updateUserProfile(getAccessToken(), profileData)` from handleSaveProfile; map form fields to backend UserProfile shape; add loading/error/success handling.
2. **Fix main.py:** Add `from fastapi import status` (or use literal 500) in the user-deletion exception handler.
3. **CORS and .env.example:** Set CORS_ORIGINS to production origins; add .env.example with all required and optional variables (no real secrets).
4. **Payment webhooks (if monetising):** Implement POST /api/webhooks/razorpay and /api/webhooks/stripe; verify signatures; update subscription status and sync with DB.

### 8.2 Short-Term (Next Sprint)

5. **Connector key validation:** Before saving, call provider’s “test” or “me” endpoint; return 400 with clear message if invalid.
6. **Connector sync (MVP):** For one provider (e.g. Razorpay), implement fetch of transactions/summary → map to monthly revenue → create or update check-ins and set last_synced_at.
7. **Admin improvements:** Store admin role in profile or JWT; implement real counts for GET /api/admin/stats.
8. **Centralise copy:** Add copy.settings.* and replace all Settings page hardcoded strings.
9. **Remove or guard console logs:** Use a small logger module or env check; remove debug logs from AuthContext and Settings.

### 8.3 Medium-Term (Product Elevation)

10. **Checkout flow:** Integrate Razorpay/Stripe for Founder plan: pricing page → checkout session → success/cancel redirects; webhooks to activate subscription.
11. **Subscription tiers in UI:** Show plan (Free/PRO/STUDIO/VC_PORTFOLIO) and gate features (e.g. board report) with clear upgrade prompts.
12. **Frontend engine tests:** Jest (or Vitest) tests for sanitizeInput, calculateRevenueAtMonth, findMilestoneMonth, predictTrajectory, compareToBenchmark.
13. **Dashboard performance:** Lazy-load dashboard route chunks; optional React Query for overview/revenue to cache and dedupe.
14. **Live benchmarks:** Use benchmark_contributions and aggregate by stage; expose in benchmarks API and UI.
15. **User onboarding:** Guided flow after first login (company name, stage, first MRR) calling POST /api/user/onboarding.

### 8.4 Longer-Term

16. **PDF export:** Generate and download board report or projection summary as PDF (backend or client).
17. **Email:** Transactional email (e.g. Resend) for magic link, payment confirmation, or monthly reminder.
18. **Audit and observability:** Structured logging, request IDs (already present), and optional APM for API and AI latency.
19. **Multi-company / VC_PORTFOLIO:** If supporting multiple companies per user, extend profile and data model and add company switcher in UI.

---

## 9. Quick Reference

| I want to… | Where to look |
|------------|----------------|
| Change projection formula or milestones | frontend: `src/lib/engine/projection.js` + `constants.js`; backend: `routers/engine.py` + `models/projection.py` |
| Add a dashboard API | backend: `routers/reports.py` or new router; frontend: `src/lib/api/dashboard.js` + page component |
| Change auth or subscription check | backend: `services/auth.py` (require_auth, require_paid_subscription); frontend: `ProtectedRoute`, `AuthContext` |
| Add or change copy | `src/lib/copy.js` |
| Add a new AI feature | backend: `services/anthropic.py` + `routers/ai.py`; optional: `services/ai_cost_control.py`, `services/context.py` |
| Add a connector provider | backend: `routers/connectors.py` SUPPORTED_PROVIDERS; encryption and storage already generic |
| Run backend | `cd backend && uvicorn server:app --reload --port 8001` (set .env) |
| Run frontend | `cd frontend && yarn start` (set REACT_APP_BACKEND_URL, Supabase vars) |

This guide, together with the **Production Readiness Report** (PRODUCTION_READINESS_REPORT.md), gives a full picture of what is implemented, what is stubbed, and what to do next to ship and improve the product.
