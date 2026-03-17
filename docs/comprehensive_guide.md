# 100Cr Engine - Comprehensive Guide

## Overview

100Cr Engine is a revenue milestone prediction platform built specifically for Indian founders. It answers the critical question: **"When will my business reach ₹100 Crore in annual revenue?"**

## Core Value Proposition

- **Instant Projections**: Calculate your path to ₹100 Crore in seconds
- **Benchmark Intelligence**: Compare your growth against Indian SaaS founders
- **Monthly Tracking**: Log actual revenue and see if you're on track
- **AI Coaching**: Get personalized growth advice powered by Claude

## Architecture Overview

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Tailwind CSS | Modern, responsive UI |
| Backend | FastAPI (Python) | High-performance async API |
| Database | MongoDB | Flexible document storage |
| Auth | Supabase Magic Link | Passwordless authentication |
| AI | Claude (via Emergent) | Growth coaching & reports |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  React + Tailwind + Framer Motion + Recharts                │
├─────────────────────────────────────────────────────────────┤
│                         API Layer                            │
│  FastAPI with JWT Auth + Rate Limiting                      │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│  MongoDB (Users, Projections, Check-ins, Connectors)        │
├─────────────────────────────────────────────────────────────┤
│                    External Services                         │
│  Supabase Auth │ Claude AI │ Razorpay │ Stripe              │
└─────────────────────────────────────────────────────────────┘
```

## Feature Breakdown

### 1. Free Tools (Public)

#### 100Cr Calculator
- Input: Current MRR + Monthly Growth Rate
- Output: Milestone dates (₹1Cr, ₹10Cr, ₹50Cr, ₹100Cr)
- Includes: Sensitivity analysis, benchmark comparison

#### ARR Calculator
- Convert MRR to ARR with growth projections

#### Runway Calculator
- Calculate months of runway based on burn rate

#### Growth Rate Calculator
- Calculate MoM growth from two revenue figures

### 2. Founder DNA Quiz (Lead Generation)
- 5 quick questions about your startup
- Generates personalized projection
- Optional email capture for follow-up

### 3. Dashboard (Paid - ₹899/year)

#### Command Centre
- Health Score (0-100)
- Next milestone countdown
- AI priority recommendation
- Action queue

#### Revenue Intelligence
- Revenue vs Baseline vs Benchmark chart
- Revenue Quality Score
- Cohort retention tracking

#### Forecasting Engine
- Scenario branching (optimistic/pessimistic)
- Sensitivity matrix (growth × churn)
- What-if narrator

#### Benchmark Intelligence
- Percentile ranking among Indian founders
- Peer comparison (anonymized)
- Stage transition readiness score

#### Reporting Engine
- Monthly board report (AI-generated)
- Investor update templates
- Growth strategy briefs
- Data room snapshot

#### AI Growth Coach
- Daily pulse updates
- Weekly strategic questions
- Deviation alerts
- Monthly coaching summary

#### Goal Architecture
- Milestone ladder visualization
- Quarterly goal tracking
- Weekly commitment tracker

#### Investor Relations
- Shareable projection pack
- Funding timeline
- Dilution modeller

#### API Connectors
- Tier 1 (API Key): Razorpay, Stripe, Cashfree
- Tier 2 (OAuth): GA4, Zoho, QuickBooks
- Tier 3 (CSV): Tally, Amazon, Flipkart

## API Reference

### Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <supabase_jwt_token>
```

### Public Endpoints

#### POST /api/engine/projection
Calculate revenue projection.

**Request:**
```json
{
  "currentMRR": 500000,
  "growthRate": 0.08,
  "monthsToProject": 120,
  "targetRevenue": 1000000000
}
```

**Response:**
```json
{
  "inputs": {"currentMRR": 500000, "growthRate": 0.08},
  "currentARR": 6000000,
  "milestones": [
    {"value": 10000000, "label": "₹1 Crore", "monthsToReach": 7, "date": "2026-10-01"},
    {"value": 100000000, "label": "₹10 Crore", "monthsToReach": 37, "date": "2029-04-01"},
    {"value": 500000000, "label": "₹50 Crore", "monthsToReach": 58, "date": "2031-01-01"},
    {"value": 1000000000, "label": "₹100 Crore", "monthsToReach": 67, "date": "2031-10-01"}
  ],
  "sensitivity": {"growthIncrease": 0.01, "monthsGained": 7},
  "slug": "abc12345"
}
```

#### GET /api/benchmarks/{stage}
Get benchmark data for a funding stage.

**Stages:** `pre-seed`, `seed`, `series-a`

**Response:**
```json
{
  "stage": "pre-seed",
  "median": 0.08,
  "p75": 0.14,
  "p90": 0.20,
  "sample_size": 150
}
```

### Protected Endpoints (Requires Auth)

#### GET /api/user/profile
Get current user's profile and subscription.

#### POST /api/checkin
Submit monthly revenue check-in.

**Request:**
```json
{
  "month": "2025-03",
  "actual_revenue": 450000,
  "note": "Closed 3 enterprise deals"
}
```

#### GET /api/dashboard/overview
Get Command Centre data.

### Rate Limiting

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Projections | 10/day | 1000/day |
| PDF Export | 1/day | Unlimited |
| AI Reports | 0 | 2/month |

## Database Schema

### Collections

#### users
```javascript
{
  id: "uuid",           // Supabase user ID
  email: "string",
  name: "string",
  company: "string",
  stage: "pre-seed|seed|series-a",
  current_mrr: Number,
  growth_rate: Number,
  onboarding_completed: Boolean,
  current_streak: Number,
  created_at: ISODate
}
```

#### subscriptions
```javascript
{
  user_id: "uuid",
  status: "active|cancelled|expired",
  plan: "founder",
  starts_at: ISODate,
  expires_at: ISODate,
  payment_provider: "razorpay|stripe"
}
```

#### projection_runs
```javascript
{
  slug: "string",       // Unique 8-char ID for sharing
  user_id: "uuid|null", // Null for anonymous
  inputs: Object,
  result: Object,
  created_at: ISODate
}
```

#### checkins
```javascript
{
  user_id: "uuid",
  month: "YYYY-MM",
  actual_revenue: Number,
  projected_revenue: Number,
  deviation_pct: Number,
  note: "string",
  source: "manual|razorpay|stripe",
  created_at: ISODate
}
```

## Security Considerations

### Authentication
- Supabase handles all authentication
- Magic link (passwordless) - no passwords to leak
- JWT tokens with 1-hour expiry
- Automatic token refresh

### Data Protection
- API keys encrypted with Fernet before storage
- Row-level security on user data
- No sensitive data in URLs

### Rate Limiting
- IP-based for free tier
- User-based for paid tier
- Prevents abuse and controls costs

## Deployment

### Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb+srv://...
DB_NAME=centurion_db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxx
EMERGENT_LLM_KEY=sk-emergent-xxx
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://api.100crengine.in
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

### Production Checklist

- [ ] Set all environment variables
- [ ] Configure Supabase redirect URLs
- [ ] Set up MongoDB Atlas with proper indexes
- [ ] Configure CORS for production domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup strategy

## Roadmap

### Phase 1 ✅ (Complete)
- Core calculator
- Landing page
- Dashboard UI

### Phase 2 ✅ (Complete)
- Supabase authentication
- Protected routes
- Backend API structure

### Phase 3 (Current)
- Connect dashboard to live APIs
- Monthly check-ins
- Founder DNA Quiz

### Phase 4 (Upcoming)
- AI coaching integration
- PDF report generation
- Razorpay payments

### Phase 5 (Future)
- Real connector APIs
- Redis rate limiting
- Mobile app

## Support

- **Documentation**: This guide + API docs
- **Issues**: GitHub Issues
- **Email**: support@100crengine.in
