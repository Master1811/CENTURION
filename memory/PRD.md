# 100Cr Engine - Product Requirements Document

## Product Overview
Revenue prediction platform for Indian founders. AI-powered dashboard to track, predict, and grow startups to ₹100 Crore.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Craco, Shadcn/UI
- **Backend**: FastAPI, Pydantic, APScheduler
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Link + Google OAuth)

## Architecture
```
/app
├── backend/        # FastAPI (routers, models, services)
├── frontend/       # React (components, pages, context, hooks, lib)
├── docs/           # BETA_READINESS_AUDIT.md
└── test_reports/   # Testing reports
```

## What's Implemented

### Core Features
- Landing page with hero, scroll story, quiz, social proof, FAQ, waitlist
- 4 Free calculators: 100Cr, ARR, Runway, Growth Rate
- Pricing page (Free, Founder ₹899/yr, Scale ₹4,999/yr)
- Dashboard with 9 modules (Command Centre, Revenue, Forecasting, Benchmarks, Reports, Coach, Goals, Investors, Connectors)
- Settings page (Profile, Billing, Support, Account Deletion)
- Admin panel (system health, scheduler, engagement stats)
- Waitlist with referral system
- Habit engine (5 layers: Monday Digest, Check-in Reminder, Milestone, Streak, Anomaly)
- Help widget with FAQs + bug report form
- Cookie consent (DPDP compliant)
- Privacy policy page

### UI/UX (Completed March 21, 2026)
- Hybrid light/dark premium theme (dark landing, light tools/dashboard)
- **Premium floating glassmorphic navbar** (adaptive dark/light, scroll hide/show, mobile hamburger menu)
- **Page transition animations** (Framer Motion AnimatePresence, fade + slide)
- **Mobile responsive** (verified on 390px viewport)
- Announcement bar with promotional CTA

### Backend APIs
- `/api/health` - Health check
- `/api/engine/projection` - Revenue projection
- `/api/benchmarks/*` - India SaaS benchmarks
- `/api/quiz/submit` - Founder DNA quiz
- `/api/user/profile` - Profile CRUD
- `/api/dashboard/overview` - Dashboard data
- `/api/checkin` - Monthly check-ins
- `/api/connectors/*` - Connector management
- `/api/ai/usage` - AI usage tracking
- `/api/waitlist` - Waitlist management
- `/api/payments/razorpay/*` - Payment processing
- `/api/admin/*` - Admin operations

## Beta Readiness Score: 4/10
Full audit report: `/app/docs/BETA_READINESS_AUDIT.md`

## P0/P1/P2 Prioritized Backlog

### P0 - Critical (Blocks Beta)
- [ ] Configure real Supabase credentials (URL, anon key, service role key)
- [ ] Configure real Razorpay keys for payment flow
- [ ] Fix pricing mismatch (Frontend ₹899 vs Backend ₹3,999)
- [ ] Set up email service (Resend) for magic links + habit engine

### P1 - Important (Beta Quality)
- [ ] NPS survey / in-app feedback (make MicroFeedback functional)
- [ ] Guided onboarding tour (wire up existing OnboardingTour component)
- [ ] Empty state design for dashboard modules (replace fallback data)
- [ ] Analytics integration (Mixpanel/Amplitude)
- [ ] Referral dashboard UI
- [ ] Bug report backend storage + admin view

### P2 - Nice to Have
- [ ] AI Growth Coach (connect Claude API)
- [ ] Board report generation (requires Anthropic key)
- [ ] Sentry error tracking (configure DSN)
- [ ] Session replay
- [ ] Feature request board
- [ ] Churn exit survey
- [ ] Referral anti-gaming protection

## Completed Tasks Log
| Date | Task | Status |
|------|------|--------|
| Mar 21, 2026 | Beta Readiness Audit (7-part report) | DONE |
| Mar 21, 2026 | Navbar Redesign (premium glassmorphic floating pill) | DONE |
| Mar 21, 2026 | Page Transition Animations (Framer Motion) | DONE |
| Mar 21, 2026 | Mobile Responsiveness Audit & Fixes | DONE |
| Mar 21, 2026 | Announcement Bar mobile fix | DONE |
| Mar 21, 2026 | CORS configuration fix | DONE |
| Earlier | Floating Help Widget | DONE |
| Earlier | Hybrid Light/Dark Theme | DONE |
| Earlier | Dashboard enhancements (placeholders) | DONE |
| Earlier | Bug fix: React hook order in HundredCrCalculator | DONE |

## Test Reports
- `/app/test_reports/iteration_11.json` - Navbar, transitions, mobile (34/34 PASS)
