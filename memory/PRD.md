# Project Centurion - 100Cr Engine PRD

## Original Problem Statement
Revenue milestone prediction platform for Indian founders answering: "When will my business reach ₹100 Crore in annual revenue?"

- Domain: 100crengine.in
- Pricing: Free tier + ₹899/year Founder Plan
- Tagline: "Know exactly when you'll reach ₹100 Crore."

## Architecture

### Frontend (React + Tailwind)
- **Landing Page**: Hero, LogoCarousel, FeatureStorySection, MetricsSection, PricingSection, CTASection, Footer
- **Navbar**: Centered glassmorphism floating pill with Free Tools dropdown + auth integration
- **Free Tools**: 100Cr Calculator, ARR Calculator, Runway Calculator, Growth Calculator
- **Dashboard (9 modules)**: Command Centre, Revenue Intelligence, Forecasting Engine, Benchmark Intelligence, Reporting Engine, AI Growth Coach, Goal Architecture, Investor Relations, API Connectors
- **Auth Components**: AuthModal (magic link), ProtectedRoute, AuthCallback
- **Design System**: Monochrome (black/gray/white), Manrope + Inter fonts, three-layer shadow system, glassmorphism

### Backend (FastAPI + MongoDB)
- **Engine Routes**: `/api/engine/projection` - calculates milestones and trajectory
- **Benchmark Routes**: `/api/benchmarks/{stage}` - returns median/p75/p90 growth rates
- **User Routes**: `/api/user/profile`, `/api/user/onboarding` - user management
- **Dashboard Routes**: `/api/dashboard/overview`, `/api/dashboard/revenue` - dashboard data
- **Check-in Routes**: `/api/checkin`, `/api/checkins` - monthly revenue tracking
- **Connector Routes**: `/api/connectors`, `/api/connectors/{provider}/connect` - data source integration
- **Quiz Routes**: `/api/quiz/submit` - Founder DNA Quiz
- **Rate Limiting**: In-memory (Redis placeholder ready)
- **Auth**: Supabase JWT verification

### Engine Logic (Pure JS)
- **Projection**: R_t = R_0 × (1 + g)^t formula
- **Milestones**: ₹1Cr, ₹10Cr, ₹50Cr, ₹100Cr
- **Benchmarks**: Pre-Seed (8% median), Seed (6%), Series A (4%)

## User Personas
1. **Early-stage founders** - bootstrapped, < ₹1Cr ARR, need validation
2. **Seed-funded founders** - ₹1-5Cr ARR, need to track against plan
3. **Series A founders** - ₹5-20Cr ARR, need board reports

## What's Been Implemented

### Phase 1 - Core Calculator + Landing (Complete)
- AnnouncementBar, Navbar (glassmorphism), HeroSection, FeatureStorySection
- MetricsSection, PricingSection, CTASection, Footer
- 100Cr Calculator with sliders, chart, benchmarks

### Phase 2 - Free Tools + Dashboard UI (Complete)
- **Glassmorphism Navbar**: Centered floating pill with backdrop-blur
- **Free Tools Dropdown**: 4 calculators with icons and descriptions
- **Founder Plan Dashboard (9 Modules)**: Complete static UI

### Phase 3 - Supabase Authentication (Complete - March 2026)
- **AuthContext**: Global auth state management with session handling
- **AuthModal**: Magic link authentication with email input
- **ProtectedRoute**: Route guard redirecting unauthenticated users
- **AuthCallback**: Handles Supabase magic link redirect
- **Navbar Integration**: Shows user menu when authenticated, Get Started when not
- **Backend JWT Verification**: Validates Supabase tokens on protected endpoints
- **Environment Config**: Supabase URL and keys configured

## MOCKED/Placeholder Features
- Dashboard data is static mock data (not connected to user-specific backend)
- AI coaching responses are pre-written
- Connector sync functionality is simulated
- Board report generation is mocked

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] Supabase authentication integration

### P1 (High) - Next Sprint
- [ ] Connect all 9 dashboard modules to live backend APIs
- [ ] Implement Founder DNA Quiz on landing page
- [ ] Monthly check-in form with actual data persistence

### P2 (Medium)
- [ ] AI coaching integration (Claude via Emergent LLM Key)
- [ ] Actual board report PDF generation
- [ ] Email alerts via Resend
- [ ] Add announcement bar below navbar
- [ ] Add engaging animations to landing page headings

### P3 (Future)
- [ ] Razorpay payment integration
- [ ] Redis rate limiting for production scale
- [ ] Real connector API integrations (Razorpay, Stripe)
- [ ] Create local_setup_guide.md documentation
- [ ] Create comprehensive_guide.md documentation
- [ ] Create Next.js migration guide

## Technical Configuration

### Supabase Config
- URL: https://dryfkpbfuayzwrrkygsy.supabase.co
- Magic Link redirect: /auth/callback

### API Endpoints Summary
| Endpoint | Auth | Description |
|----------|------|-------------|
| POST /api/engine/projection | Optional | Run revenue projection |
| GET /api/engine/projection/{slug} | No | Get shared projection |
| GET /api/benchmarks/{stage} | No | Get stage benchmarks |
| POST /api/benchmarks/compare | No | Compare growth to benchmark |
| GET /api/user/profile | Required | Get user profile |
| PUT /api/user/profile | Required | Update profile |
| POST /api/checkin | Required + Paid | Submit monthly revenue |
| GET /api/checkins | Required + Paid | Get check-in history |
| GET /api/dashboard/overview | Required + Paid | Dashboard data |
| POST /api/quiz/submit | No | Submit Founder DNA Quiz |

## Next Immediate Tasks
1. Connect Command Centre dashboard to /api/dashboard/overview
2. Implement Founder DNA Quiz UI on landing page
3. Connect Revenue Intelligence to /api/dashboard/revenue
4. Wire up monthly check-in form in dashboard
