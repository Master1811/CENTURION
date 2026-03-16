# Project Centurion - 100Cr Engine PRD

## Original Problem Statement
Revenue milestone prediction platform for Indian founders answering: "When will my business reach ₹100 Crore in annual revenue?"

- Domain: 100crengine.in
- Pricing: Free tier + ₹899/year Founder Plan
- Tagline: "Know exactly when you'll reach ₹100 Crore."

## Architecture

### Frontend (React + Tailwind)
- **Landing Page**: Hero, LogoCarousel, FeatureStorySection, MetricsSection, PricingSection, CTASection, Footer
- **Calculator Page**: SliderInput controls, ProjectionChart (Recharts), MilestoneCards, BenchmarkComparison
- **Design System**: Monochrome (black/gray/white), Manrope + Inter fonts, three-layer shadow system

### Backend (FastAPI + MongoDB)
- **Engine Routes**: `/api/engine/projection` - calculates milestones and trajectory
- **Benchmark Routes**: `/api/benchmarks/{stage}` - returns median/p75/p90 growth rates
- **Rate Limiting**: In-memory (Redis placeholder ready)

### Engine Logic (Pure JS)
- **Projection**: R_t = R_0 × (1 + g)^t formula
- **Milestones**: ₹1Cr, ₹10Cr, ₹50Cr, ₹100Cr
- **Benchmarks**: Pre-Seed (8% median), Seed (6%), Series A (4%)

## User Personas
1. **Early-stage founders** - bootstrapped, < ₹1Cr ARR, need validation
2. **Seed-funded founders** - ₹1-5Cr ARR, need to track against plan
3. **Series A founders** - ₹5-20Cr ARR, need board reports

## Core Requirements (Static)
- [x] Revenue projection calculator
- [x] Milestone date calculation
- [x] Growth rate benchmarking
- [x] Stage comparison (Pre-Seed/Seed/Series A)
- [x] Shareable projection URLs
- [ ] Supabase authentication (placeholder)
- [ ] Monthly check-in tracking
- [ ] AI coaching insights
- [ ] Board-ready reports
- [ ] Payment gateway (Razorpay)

## What's Been Implemented (Phase 1 - Jan 2026)

### Landing Page
- AnnouncementBar (dismissible)
- Floating pill Navbar with scroll effects
- HeroSection with dot grid background and product preview chart
- LogoCarousel (infinite marquee)
- FeatureStorySection (3 alternating rows: Check-in, Benchmarks, Sharing)
- MetricsSection (4 animated stat cards)
- PricingSection (Free vs Founder Plan)
- CTASection
- Footer

### Calculator Tool (/tools/100cr-calculator)
- Revenue slider (₹10K - ₹5Cr)
- Growth rate slider (1% - 30%)
- Stage selector (Pre-Seed, Seed, Series A)
- Projection chart with benchmark line
- 4 milestone cards with dates
- Sensitivity analysis ("grow 1% faster")
- Benchmark comparison with percentile

### Backend APIs
- `/api/health` - health check
- `/api/engine/projection` - POST projection calculation
- `/api/engine/projection/{slug}` - GET shared projection
- `/api/benchmarks/{stage}` - GET benchmark data
- `/api/benchmarks/compare` - POST comparison

## Prioritized Backlog

### P0 (Critical)
- [ ] Supabase authentication integration
- [ ] Monthly check-in form and tracking
- [ ] User dashboard with projection history

### P1 (High)
- [ ] AI coaching integration (Claude via Emergent LLM Key)
- [ ] Board-ready PDF reports
- [ ] Email alerts for check-in reminders

### P2 (Medium)
- [ ] Razorpay payment integration
- [ ] Redis rate limiting
- [ ] Connector APIs (Razorpay/Stripe sync)

### P3 (Low)
- [ ] ARR Calculator tool
- [ ] Runway Calculator tool
- [ ] Revenue Growth Calculator tool

## Next Tasks
1. Integrate Supabase for magic link auth
2. Build /dashboard routes with protected auth
3. Create MonthlyCheckIn component
4. Integrate Claude AI for check-in insights
5. Add Redis for production rate limiting
