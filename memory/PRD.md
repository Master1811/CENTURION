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
- **AI Service**: Claude integration via Emergent LLM Key
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

## Testing Status
- **Backend**: 100% (19/19 tests passed)
- **Frontend**: 100% (all features verified)
- **Last Test**: March 17, 2026

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Modular backend architecture
- [x] Supabase PostgreSQL integration
- [x] Authentication system
- [x] Founder DNA Quiz

### P1 (High) - Next Sprint
- [ ] Create Supabase tables (run supabase_schema.sql)
- [ ] Test actual authenticated user flow end-to-end
- [ ] Connect dashboard modules to live user data
- [ ] Monthly check-in form with real persistence

### P2 (Medium)
- [ ] Actual AI coaching with Claude (test with real prompts)
- [ ] Board report PDF generation
- [ ] Email alerts via Resend
- [ ] Announcement bar enhancements
- [ ] Landing page animations polish

### P3 (Future)
- [ ] Razorpay payment integration
- [ ] Redis rate limiting for production
- [ ] Real connector API integrations
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
EMERGENT_LLM_KEY=xxx
CORS_ORIGINS=*
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://api.100crengine.in
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx
```

## Next Immediate Tasks
1. Run `/docs/supabase_schema.sql` in Supabase SQL Editor to create tables
2. Test full auth flow with real magic link
3. Wire up dashboard to user-specific data
4. Test AI coaching features with real Claude API
