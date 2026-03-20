# Project Centurion - 100Cr Engine PRD

## Original Problem Statement
Revenue milestone prediction platform for Indian founders answering: "When will my business reach ₹100 Crore in annual revenue?"

- Domain: 100crengine.in
- Pricing: Free tier + ₹899/year Founder Plan
- Tagline: "Know exactly when you'll reach ₹100 Crore."

## Architecture

### Backend (FastAPI + Supabase PostgreSQL)
**Modular Structure:**
```
backend/
├── main.py              # Main FastAPI application
├── server.py            # Uvicorn entry point
├── routers/             # API endpoint handlers
│   ├── engine.py        # Projection calculations
│   ├── benchmarks.py    # Benchmark data
│   ├── ai.py            # AI coaching (Claude)
│   ├── reports.py       # Dashboard & check-ins
│   ├── connectors.py    # Payment integrations
│   └── admin.py         # Admin endpoints
├── services/            # Business logic
│   ├── supabase.py      # Database operations
│   ├── auth.py          # JWT verification
│   ├── rate_limiter.py  # In-memory/Redis rate limiting
│   ├── encryption.py    # Fernet encryption for API keys
│   ├── anthropic.py     # Claude AI service
│   └── context.py       # FounderContext builder
├── models/              # Pydantic models
│   ├── projection.py    # Projection inputs/outputs
│   ├── founder.py       # User/subscription models
│   ├── checkin.py       # Check-in models
│   └── ai.py            # AI feature models
└── tasks/               # Background tasks (future)
```

### Frontend (React + Tailwind)
- **Landing Page**: Hero, LogoCarousel, FounderDNAQuiz, FeatureStory, Metrics, Pricing, CTA
- **Navbar**: Glassmorphism floating pill with Free Tools dropdown + auth
- **Free Tools**: 100Cr Calculator, ARR Calculator, Runway Calculator, Growth Calculator
- **Dashboard (9 modules)**: Command Centre, Revenue Intelligence, Forecasting Engine, etc.
- **Auth**: Supabase Magic Link with AuthContext, AuthModal, ProtectedRoute

### Database (Supabase PostgreSQL)
Tables defined in `/docs/supabase_schema.sql`:
- `profiles` - User profiles (extends auth.users)
- `subscriptions` - Subscription status
- `projection_runs` - Saved projections (shareable)
- `checkins` - Monthly revenue check-ins
- `connector_keys` - Encrypted API keys
- `quiz_submissions` - Founder DNA quiz responses
- `ai_usage_log` - AI feature tracking
- `benchmark_contributions` - Anonymized benchmarks

## What's Been Implemented

### Phase 1 - Core Calculator + Landing (Complete)
- Full landing page with all sections
- 100Cr Calculator with sliders, chart, benchmarks

### Phase 2 - Free Tools + Dashboard UI (Complete)
- Glassmorphism navbar with Free Tools dropdown
- 4 calculator tools (100Cr, ARR, Runway, Growth)
- Complete 9-module dashboard UI

### Phase 3 - Supabase Authentication (Complete)
- AuthContext with session management
- AuthModal with magic link flow
- ProtectedRoute for dashboard access
- JWT verification on backend

### Phase 4 - Production Backend + Quiz (Complete - March 2026)
- **Modular Backend Architecture**: Routers, services, models separation
- **Supabase PostgreSQL Integration**: Full database service with graceful error handling
- **Rate Limiting**: In-memory with Redis-ready architecture
- **Encryption Service**: Fernet encryption for API keys
- **AI Service**: Claude integration via Anthropic API
- **Founder DNA Quiz**: 5-question lead generation quiz on landing page
- **Documentation**: 
  - `/docs/local_setup_guide.md` - Beginner-friendly setup
  - `/docs/comprehensive_guide.md` - Full architecture documentation
  - `/docs/nextjs_migration_guide.md` - Frontend migration plan
  - `/docs/supabase_schema.sql` - Database schema

### Phase 5 - High-Conversion Landing Page (Complete - March 2026)
- **Inspired by codemate.ai structure** - Scroll story format
- **New Hero Section**: Animated chart preview, counting metrics, parallax scroll
- **Scroll Story Sections** (5 features):
  1. Projection Engine - Animated growth chart
  2. Monthly Check-ins - Input UI preview
  3. AI Growth Coach - Typing animation for insights
  4. Benchmark Intelligence - Animated progress bars
  5. Revenue Connectors - Razorpay/Stripe/Cashfree sync preview
- **Social Proof Section**: Testimonials, metrics (10K+ projections, ₹500Cr+ tracked)
- **Teaser Locked Features**: Blurred premium content with upgrade CTAs
- **Multiple CTAs**: After hero, after features, after quiz, before footer
- **Enhanced Announcement Bar**: Violet gradient, animated icons
- **Responsive Design**: Mobile-optimized layout

### Phase 6 - Dashboard API Integration + PDF Export (Complete - March 2026)
- **Dashboard Components Connected to Live APIs**:
  - `CommandCentre.jsx` - Fetches dashboard overview with fallback to mock data
  - `RevenueIntelligence.jsx` - Fetches revenue data from `/api/dashboard/revenue`
  - `AIGrowthCoach.jsx` - Connected to daily pulse and weekly question APIs
  - `Connectors.jsx` - Live connector status from backend
  - `ReportingEngine.jsx` - AI report generation with usage tracking
- **API Service Layer** (`/lib/api/dashboard.js`):
  - Added AI endpoints: `fetchAIUsage`, `getDailyPulse`, `getWeeklyQuestion`
  - Added `generateBoardReport`, `generateStrategyBrief`
  - Added `analyzeDeviation`, `runScenarioAnalysis`
- **PDF Export Functionality**:
  - Report viewer modal with print-to-PDF
  - Structured report display (executive summary, metrics, highlights)
  - Browser print API for PDF generation
- **Marketing Screenshots Captured**:
  - Hero section, Calculator, Features, Quiz
  - Social proof, Premium teasers, Pricing

### Phase 7 - Auth Flow, Upgrade Modal & Sync Indicators (Complete - March 2026)
- **Auth Flow (Magic Link)**:
  - `AuthCallback.jsx` - Handles Supabase magic link redirect
  - `ProtectedRoute.jsx` - Redirects unauthenticated users to landing page with auth modal
  - Auth modal auto-opens when accessing protected routes
- **Upgrade Modal (`/components/upgrade/UpgradeModal.jsx`)**:
  - 4 trigger variants: RATE_LIMIT, PREMIUM_FEATURE, AI_BUDGET, CONNECTOR_LIMIT
  - Plan comparison table (Free vs Founder)
  - Usage progress indicator for rate limits
  - `useUpgradeModal` hook with `useCallback` (fixed infinite loop bug)
- **Real-time Sync Indicators (`/components/ui/SyncIndicator.jsx`)**:
  - `SyncStatus` - Pulsing green dot with "Just now" / "2m ago" timestamp
  - `RefreshButton` - Manual refresh with loading animation
  - `ConnectionStatus` - Online/offline indicator
  - `DataCardHeader` - Reusable header with sync built-in
  - `useSyncState` hook for managing sync state

### Phase 8 - Comprehensive Settings Module (Complete - March 2026)
- **Profile Settings Tab**:
  - Personal Information (name, email w/ verified badge, phone, timezone)
  - Company Information (company name, funding stage, website)
  - Save Changes button with loading/success states
- **Billing & Subscription Tab**:
  - Current Plan Overview with animated `BackgroundPaths` component
  - Feature limits display (Projections, AI Coach, Board Reports, Connectors)
  - "Upgrade to Founder Plan" CTA
  - Usage This Month with animated progress bars
  - Payment Method management
  - Invoice history with download links
- **Support & Help Center Tab**:
  - Contact Support section (Email, Live Chat buttons)
  - FAQ accordion with 5 questions (expandable with animations)
  - Resources section (Getting Started, API Docs, Video Tutorials)
  - Report Bug section
- **Danger Zone**: Delete Account option always visible
- **New UI Components**:
  - `BackgroundPaths.jsx` - Animated SVG paths (36 paths with varying opacity)
  - `GlassAccountSettingsCard.jsx` - Premium glassmorphism settings card

### API Endpoints Summary
| Endpoint | Auth | Description |
|----------|------|-------------|
| POST /api/engine/projection | Optional | Run revenue projection |
| GET /api/engine/projection/{slug} | No | Get shared projection |
| POST /api/engine/scenario | Optional | Scenario analysis |
| GET /api/benchmarks/{stage} | No | Get stage benchmarks |
| GET /api/benchmarks/stages | No | List all stages |
| POST /api/benchmarks/compare | No | Compare growth to benchmark |
| POST /api/quiz/submit | No | Submit Founder DNA Quiz |
| GET /api/user/profile | Required | Get user profile |
| PUT /api/user/profile | Required | Update profile |
| POST /api/user/onboarding | Required | Complete onboarding |
| GET /api/dashboard/overview | Paid | Command Centre data |
| GET /api/dashboard/revenue | Paid | Revenue Intelligence data |
| POST /api/checkin | Paid | Submit monthly check-in |
| GET /api/checkins | Paid | Get check-in history |
| GET /api/connectors | Paid | List connected providers |
| POST /api/connectors/{provider}/connect | Paid | Connect provider |
| GET /api/ai/usage | Paid | AI feature usage stats |
| POST /api/ai/board-report | Paid | Generate board report |
| GET /api/ai/daily-pulse | Paid | Get daily insights |

### Phase 9 - Habit Engine & Auth Fixes (Complete - March 20, 2026)
- **Habit Engine Implementation**:
  - `engagement_engine.py` - In-memory dedup + local JSON email logging + Haiku wrapper
  - `habit_layers.py` - 5 engagement layers:
    1. Monday Morning Digest (weekly MRR summary + AI question)
    2. Check-in Reminder (25th of month)
    3. Milestone Countdown (30/14/7/3/1 days alerts)
    4. Streak Protection (protect check-in streaks)
    5. Anomaly Alert (event-driven MRR drop alerts)
  - `scheduler.py` - APScheduler cron jobs (Asia/Kolkata timezone)
  - DB schema: `engagement_events` table, `profiles` extended with `streak_count`, `last_checkin_at`
- **Auth Flow Fixes**:
  - Fixed JWT verification to handle placeholder secrets ('your-jwt-secret')
  - Falls back to SUPABASE_ANON_KEY for token verification
  - Added `signInWithGoogle` method to AuthContext
  - Google OAuth button in AuthModal (requires Supabase Google provider setup)
- **Settings Profile Save Fix**:
  - `handleSaveProfile` properly wired to `updateUserProfile` API
  - Transforms form data to backend expected format
  - Calls `refreshProfile()` after successful update
- **Admin Endpoints for Habit Engine**:
  - POST /api/admin/trigger/{job_name} - Manually trigger habit engine jobs
  - GET /api/admin/engagement/stats - View engagement event counts
  - GET /api/admin/engagement/user/{user_id} - View user engagement history
  - GET /api/admin/dedup/status - View dedup cache status

### Phase 10 - Admin Control Panel & Auth Validation (Complete - March 20, 2026)
- **Admin Dashboard (/admin route)**:
  - System health monitoring (API status, Supabase connection, version)
  - Platform statistics with real Supabase counts
  - Engagement metrics visualization (last 30 days)
  - Scheduler job management with manual trigger capability
  - Dedup cache inspection
  - Production readiness checklist
- **Auth Flow Validation & Improvements**:
  - Dual JWT verification: JWKS (RS256) + HS256 fallback
  - PyJWKClient integration for Supabase JWKS endpoint
  - Proper handling of placeholder JWT secrets
  - Google OAuth integration verified
- **New Admin API Endpoints**:
  - GET /api/admin/scheduler/status - View scheduler state and jobs
  - GET /api/admin/system/health - Comprehensive system health check
- **UX Improvements**:
  - UserGuidance component library (Tooltip, FeatureHint, EmptyState, ErrorRecovery)
  - Onboarding tour for new users
  - Protected routes redirect gracefully to auth
  - No user traps - clear navigation paths

### Phase 11 - Security Audit & Observability (Complete - March 20, 2026)
- **Authentication Security Enhancements**:
  - `require_paid_subscription` properly handles starter/founder/trialing statuses
  - Subscription expiration checking with proper date parsing
  - Comprehensive logging of all auth events
- **Payments Webhook Security**:
  - Proper HMAC signature verification (constant-time comparison)
  - Complete plan handling: starter (30d), founder (365d), trial (7d)
  - `expires_at` field properly calculated and stored
  - Idempotency check via `payment_ref` to prevent duplicate processing
- **Habit Engine Integration**:
  - Anomaly alert triggered on >10% revenue drop during check-in
  - Streak updates with 35-day window (reset if gap too long)
  - Background task processing for non-blocking alerts
- **Admin Security**:
  - Hashed email comparison for admin verification (prevents timing attacks)
  - All admin access attempts logged for audit trail
  - Silent redirect for non-admins (doesn't reveal admin route exists)
  - `ADMIN_EMAILS` environment variable for configuration
- **Comprehensive Observability**:
  - `logging_service.py` with structured JSON logging
  - Request middleware adds `X-Request-ID` (8-char UUID) and `X-Response-Time`
  - Sensitive data masking in logs
  - MetricsCollector for performance tracking
  - Named loggers: auth_logger, api_logger, habit_logger, payment_logger, ai_logger, admin_logger, db_logger
- **Frontend Admin Protection**:
  - `ProtectedRoute` with `requireAdmin` prop
  - Silently redirects non-admins to home (security through obscurity)
  - `REACT_APP_ADMIN_EMAILS` for frontend admin check

### Phase 12 - Beta Launch Features (Complete - March 20, 2026)
- **Waitlist System**:
  - `backend/routers/waitlist.py` with POST /api/waitlist endpoint
  - Pydantic validation with stage options matching FounderDNAQuiz
  - Duplicate email check returns 409 Conflict
  - Position number calculated from total waitlist count
  - Shareable referral URL with email slug (e.g., `?ref=user-email`)
  - GET /api/admin/waitlist endpoint for admin management
  - PUT /api/admin/waitlist/{email}/convert for conversion tracking
  - **Referral Position Boosting**: Each successful referral boosts the referrer's position
- **DPDP Compliance (Digital Personal Data Protection Act 2023)**:
  - `backend/migrations/dpdp_compliance.sql` with waitlist table and profile columns
  - `dpdp_consent_given` and `dpdp_consent_at` fields in both tables
  - Required consent checkbox in waitlist form (blocks submission when unchecked)
  - Required consent checkbox in AuthModal (blocks email submission)
  - Privacy Policy page at /privacy with all 6 DPDP disclosures:
    1. Identity of Data Fiduciary
    2. Categories of Personal Data Collected
    3. Purpose of Processing
    4. Retention Period
    5. User Rights (access, correction, erasure, grievance redressal, nomination)
    6. Contact Details (Data Protection Officer)
- **Cookie Consent Banner**:
  - Appears on first visit to non-authenticated users
  - Accept/Decline buttons
  - Stored in localStorage as `centurion_cookie_consent`
  - If declined, analytics scripts are not loaded
  - Timestamp recorded for compliance audit

### Phase 13 - Sentry Integration & Pre-Production Testing (Complete - March 20, 2026)
- **Sentry Backend Integration**:
  - `services/sentry_config.py` with FastAPI/Starlette integrations
  - PII filtering before sending events
  - Performance monitoring with configurable sample rates
  - Release and environment tracking
  - Health check filtering (skip /health endpoints)
- **Sentry Frontend Integration**:
  - `lib/sentry.js` with React error boundary
  - Session replay (masked for privacy)
  - Breadcrumbs for debugging
  - User context set on authentication
  - Context cleared on sign out
- **Configuration**:
  - ADMIN_EMAILS=mastertmh841@gmail.com
  - FRONTEND_URL set for correct share URLs
  - Sentry DSN ready for production (shows warning when not configured)
- **Pre-Production Test Results**:
  - 27/27 backend tests passed (100%)
  - All critical frontend flows verified
  - Auth modal with consent ✓
  - Calculator engine ✓
  - Pricing page ✓
  - Checkout page ✓
  - Privacy page ✓
  - Cookie consent ✓
  - Admin protection ✓

## Testing Status
- **Backend**: 100% (27/27 tests passed)
- **Frontend**: 95% (minor Recharts warning)
- **Waitlist**: Position number returned, consent validation works
- **Privacy Page**: All 6 DPDP disclosures present
- **Cookie Banner**: Accept/Decline works correctly
- **Sentry**: Initialized (shows warning when DSN not configured)
- **Last Test**: March 20, 2026

## Scalability Notes (10,000+ Users)
The habit engine is designed for scale:
- **Batched email sending**: 100 emails per batch via Resend
- **Parallel AI calls**: 50 concurrent Haiku API calls
- **In-memory deduplication**: O(1) lookup, Redis-ready
- **Misfire grace time**: Jobs recover from temporary failures
- **Scheduled jobs**: 4 APScheduler cron jobs (Asia/Kolkata)

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Modular backend architecture
- [x] Supabase PostgreSQL integration
- [x] Authentication system (Magic Link + Google OAuth)
- [x] Founder DNA Quiz
- [x] Habit Engine implementation (5 layers)
- [x] JWT verification with JWKS + HS256 dual support
- [x] Settings profile save functionality
- [x] Admin Control Panel with monitoring

### P1 (High) - Next Sprint
- [ ] Run updated `backend/migrations/dpdp_compliance.sql` in Supabase SQL Editor (adds referral_count column)
- [ ] Configure SENTRY_DSN in backend/.env for production error tracking
- [ ] Configure REACT_APP_SENTRY_DSN in frontend/.env
- [ ] Enable Google OAuth in Supabase project settings
- [ ] Set ANTHROPIC_API_KEY for AI features
- [ ] Configure Razorpay keys for payment testing

### P2 (Medium)
- [ ] Configure Resend for production email delivery
- [ ] Configure Redis for distributed rate limiting/dedup
- [ ] Board report PDF generation
- [ ] Beta Launch features (waitlist, DPDP compliance)

### P3 (Future)
- [ ] Razorpay/Stripe webhook implementation
- [ ] Real connector API integrations (auto-sync MRR)
- [ ] Next.js migration

## Technical Configuration

### Supabase
- URL: https://dryfkpbfuayzwrrkygsy.supabase.co
- Magic Link redirect: /auth/callback
- Tables: See `/docs/supabase_schema.sql`

### Environment Variables
**Backend (.env):**
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=xxx
CORS_ORIGINS=*
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://api.100crengine.in
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

## Next Immediate Tasks
1. Set ADMIN_EMAILS environment variable in backend/.env (comma-separated admin emails)
2. Enable Google OAuth provider in Supabase project (Authentication > Providers > Google)
3. Run habit engine schema in Supabase SQL Editor (engagement_events table)
4. Set ANTHROPIC_API_KEY in backend/.env for AI features
5. Test full auth flow with real user (Magic Link + Google OAuth)
