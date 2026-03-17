# Project Centurion - 100Cr Engine PRD

## Original Problem Statement
Revenue milestone prediction platform for Indian founders answering: "When will my business reach ₹100 Crore in annual revenue?"

- Domain: 100crengine.in
- Pricing: Free tier + ₹899/year Founder Plan
- Tagline: "Know exactly when you'll reach ₹100 Crore."

## Architecture

### Frontend (React + Tailwind)
- **Landing Page**: Hero, LogoCarousel, FeatureStorySection, MetricsSection, PricingSection, CTASection, Footer
- **Navbar**: Centered glassmorphism floating pill with Free Tools dropdown
- **Free Tools**: 100Cr Calculator, ARR Calculator, Runway Calculator, Growth Calculator
- **Dashboard (9 modules)**: Command Centre, Revenue Intelligence, Forecasting Engine, Benchmark Intelligence, Reporting Engine, AI Growth Coach, Goal Architecture, Investor Relations, API Connectors
- **Design System**: Monochrome (black/gray/white), Manrope + Inter fonts, three-layer shadow system, glassmorphism

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

## What's Been Implemented (Jan 2026)

### Phase 1 - Core Calculator + Landing
- AnnouncementBar, Navbar (glassmorphism), HeroSection, FeatureStorySection
- MetricsSection, PricingSection, CTASection, Footer
- 100Cr Calculator with sliders, chart, benchmarks

### Phase 2 - Free Tools + Dashboard (Current)
- **Glassmorphism Navbar**: Centered floating pill with backdrop-blur
- **Free Tools Dropdown**: 4 calculators with icons and descriptions
  - 100Cr Calculator
  - ARR Calculator  
  - Runway Calculator
  - Growth Rate Calculator

- **Founder Plan Dashboard (9 Modules)**:
  1. Command Centre - Milestone countdown, health score, AI priority, action queue
  2. Revenue Intelligence - Revenue vs baseline/benchmark, quality score, cohorts
  3. Forecasting Engine - Scenario branching, sensitivity matrix, projections
  4. Benchmark Intelligence - Live percentiles, peer comparison, transition readiness
  5. Reporting Engine - Board reports, investor updates, strategy briefs
  6. AI Growth Coach - Daily pulse, weekly question, deviation alerts
  7. Goal Architecture - Milestone ladder, quarterly goals, commitment tracker
  8. Investor Relations - Projection pack, funding timeline, dilution modeller
  9. API Connectors - Razorpay, Stripe, Cashfree, GA4, Zoho, CSV uploads

## MOCKED/Placeholder Features
- Dashboard data is static mock data
- AI coaching responses are pre-written
- Connector sync functionality is simulated
- Supabase auth is placeholder
- Board report generation is mocked

## Prioritized Backlog

### P0 (Critical)
- [ ] Supabase authentication integration
- [ ] Monthly check-in form with actual data persistence
- [ ] Connect dashboard to real user data

### P1 (High)
- [ ] AI coaching integration (Claude via Emergent LLM Key)
- [ ] Actual board report PDF generation
- [ ] Email alerts via Resend

### P2 (Medium)
- [ ] Razorpay payment integration
- [ ] Redis rate limiting
- [ ] Real connector API integrations

## Next Tasks
1. Integrate Supabase for magic link auth
2. Connect dashboard modules to real backend APIs
3. Implement Claude AI for coaching insights
4. Add actual PDF export for reports
