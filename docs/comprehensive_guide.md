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
| AI | Claude (Anthropic API) | Growth coaching & reports |

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

#### waitlist_entries
```javascript
{
  id: ObjectId,
  email: "string",
  startup_stage: "idea|pre-seed|seed|series-a",
  revenue_range: "<10L|10L-50L|50L-1Cr|1-5Cr|5Cr+",
  key_problem: "string",
  status: "new|reviewed|invited|rejected",
  notes: "string",
  created_at: ISODate,
  invited_at: ISODate|null,
  invite_token: "uuid|null"          // for magic-link invite
}
```

#### referrals
```javascript
{
  code: "string",                    // unique per user
  owner_user_id: "uuid",
  visits: Number,
  signups: Number,
  conversions: Number,
  abuse_flag: Boolean,
  last_seen_ip: "string"
}
```

#### feedback
```javascript
{
  user_id: "uuid",
  channel: "chatbot|survey|popup|email",
  category: "usability|accuracy|speed|pricing|other",
  message: "string",
  context: {
    page: "string",
    feature: "string",
    session_id: "string"
  },
  sentiment: "pos|neu|neg",
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
ANTHROPIC_API_KEY=your-anthropic-key
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
- [ ] Verify Supabase RLS policies are active
- [ ] Configure CORS for production domain
- [ ] Enable SSL/TLS
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Enable Supabase Point-in-Time Recovery (PITR)

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

## Beta Waitlist & Launch Strategy (Paid Dashboard)

### Architecture Constraints (Enforced)
| Constraint | Decision |
|------------|----------|
| Database | **Supabase PostgreSQL only** — no MongoDB |
| Admin curation | **Supabase Studio** — no custom admin UI for first 50 users |
| Referral engine | **Deferred** — manual tracking via Supabase Studio |
| Data privacy | **DPDP Act 2023** compliance checkbox mandatory on waitlist |
| Connector sync | **Razorpay/Stripe read-only MRR sync** during activation (Day 1) |

### Goals
- Create a /beta flow that sells transformation first, hides pricing until users feel need, and converts curated founders into paying customers without data loss.

### Phase Plan (user experience)
- **Phase 1: /beta landing** — Story: problem → pain → transformation; tease dashboard capabilities; omit pricing; single CTA opens animated waitlist modal.
- **Phase 2: Waitlist popup** — Collect email, startup stage, revenue band, key problem + **DPDP consent checkbox**; show exclusivity copy ("Only 50 founders").
- **Phase 3: Manual curation** — Ops team selects 50 via **Supabase Studio** (no custom admin UI); grant 60-day free beta; add floating feedback chatbot + weekly prompts.
- **Phase 4: Activation + Auto-Sync** — Magic-link onboarding; **auto-trigger Razorpay/Stripe MRR sync** on connector connect for zero-friction data ingestion from Day 1.
- **Phase 5: Conversion window (last 10 days)** — In-app popups + emails; recap delivered value; offer 50% "Founding Member" pricing.
- **Phase 6: Migration** — Keep same accounts/data; attach billing; flip plan to paid; no reset.

> **Note**: Referral engine deferred to post-beta; manual tracking via Supabase Studio for now.

### Deployment strategy
- **Environments**: `beta` and `prod` deployments; use **single Supabase project** with feature flags to simplify migration.
- **Database**: Supabase PostgreSQL only. All tables (`waitlist_entries`, `feedback`, `referrals`, `connector_sync_log`) in same project with strict RLS.
- **Feature flags**: Store in `profiles.feature_access` JSONB or separate `feature_flags` table. Use LaunchDarkly/GrowthBook when experiments multiply.
- **Rollout hygiene**: Blue/green deploy or canary for backend; versioned API; enable request logging + Sentry; enable PITR before migrations.

### Beta user management
- **Flagging**: Add `beta_status`, `beta_expires_at`, `referral_code`, `referred_by`, `feature_access` on `profiles` table.
- **Access control**: Backend middleware reads Supabase user, checks `feature_access.paid_dashboard`; gates premium routes accordingly.
- **Dynamic enable/disable**: Backend reads flags; frontend consumes `/api/user/profile` to conditionally render UI.

### Supabase Schema (additive to existing)
- **profiles** (add columns):
```sql
beta_status beta_status DEFAULT 'none',
beta_expires_at TIMESTAMPTZ,
referral_code TEXT UNIQUE,
referred_by TEXT,
feature_access JSONB DEFAULT '{"paid_dashboard": false, "ai_coach": false, "referrals": false}'
```
- **waitlist_entries** (new table):
```sql
id UUID PRIMARY KEY,
email TEXT NOT NULL UNIQUE,
startup_stage TEXT,
revenue_range TEXT,
key_problem TEXT,
status TEXT DEFAULT 'new',
dpdp_consent BOOLEAN NOT NULL,
dpdp_consent_at TIMESTAMPTZ,
ip_address TEXT,
referred_by TEXT,
invite_token UUID,
invite_token_expires_at TIMESTAMPTZ,
invited_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW()
```
- **feedback** (new table):
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES auth.users(id),
channel TEXT NOT NULL,
category TEXT,
message TEXT NOT NULL,
rating INTEGER,
nps_score INTEGER,
context JSONB,
sentiment TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
```
- **referrals** (new table, for future use):
```sql
id UUID PRIMARY KEY,
code TEXT NOT NULL UNIQUE,
owner_user_id UUID REFERENCES auth.users(id),
visits INTEGER DEFAULT 0,
signups INTEGER DEFAULT 0,
conversions INTEGER DEFAULT 0,
abuse_flag BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
```
- **connector_sync_log** (new table):
```sql
id UUID PRIMARY KEY,
user_id UUID REFERENCES auth.users(id),
provider TEXT NOT NULL,
sync_type TEXT NOT NULL,
status TEXT NOT NULL,
records_fetched INTEGER,
checkins_created INTEGER,
error_message TEXT,
started_at TIMESTAMPTZ DEFAULT NOW(),
completed_at TIMESTAMPTZ
```

### Waitlist system design
- **Frontend**: /beta page with CTA → animated modal (Framer Motion). Fields: email, stage, revenue, problem, **DPDP consent checkbox**. Submit to `POST /api/beta/waitlist`.
- **Backend endpoints**:
  - `POST /api/beta/waitlist` (rate-limited): validate DPDP consent, store entry in Supabase, send thank-you email.
  - `POST /api/beta/accept` → consumes invite token, creates user (via Supabase magic link), seeds `beta_status=active`, `beta_expires_at=+60d`, `feature_access.paid_dashboard=true`.
- **Admin tool**: **Supabase Studio** Table Editor for the first 50 users (no custom UI). Filter, review, update `status`, set `invite_token`.
- **Email flow**: Thank-you on submission; invite with magic link + expiry; weekly check-ins during beta; conversion sequence in last 10 days.

### Connector auto-sync (Day 1 feature)
- On `POST /api/connectors/{provider}/connect`, after storing encrypted key:
  - **Trigger immediate read-only sync** (Razorpay or Stripe)
  - Fetch payments from last 12 months
  - Aggregate by month and upsert into `checkins` with `source='razorpay'|'stripe'`
  - Log to `connector_sync_log`
- Show sync progress in onboarding: "Found ₹X revenue across Y months!"
- Manual re-sync via `POST /api/connectors/{provider}/sync` (rate-limited 1/hour)

### DPDP Act 2023 Compliance
- Waitlist modal includes mandatory checkbox:
  > ☐ I consent to 100Cr Engine collecting and processing my data as per the Digital Personal Data Protection Act, 2023. [View Privacy Policy]
- Backend rejects submission if `dpdp_consent != true`
- Store `dpdp_consent_at` timestamp for audit trail

### Strategic guidance (FAQs)
- **Supabase project choice**: Use single project; RLS enforces data isolation; simpler migration.
- **Feature flags**: Store in `profiles.feature_access` JSONB; move to external service when experiments multiply.
- **Engagement over 60 days**: Habit loops (daily pulse, weekly review), visible streaks, quick wins in first session, tight feedback prompts.
- **Success definition**: ≥60% invitees active weekly by week 2; ≥40% convert to paid; NPS ≥30; time-to-first-value <10 min; ≥50% connect payment provider Day 1.
- **Churn avoidance after discount**: Remind of locked-in value, provide annual billing incentive, keep post-offer grace, highlight upcoming roadmap items they influenced.
- **Referral rewards**: Deferred; manual tracking via Supabase Studio for beta. Prefer access-based rewards when automated.
- **Feedback prioritization**: Score by impact × frequency × segment (stage/revenue). Run small experiments; avoid building for single-edge requests; publish changelog to close the loop.

### Step-by-step execution guide (noob-friendly)
1) **Set up environments**
   - Create `beta` and `prod` deployments. Use single Supabase project. Set env vars for each.
   - Enable Sentry, request logging, and Supabase PITR before inviting anyone.

2) **Run Supabase schema migration**
   - Execute SQL in Supabase SQL Editor to add beta columns to `profiles` and create `waitlist_entries`, `feedback`, `referrals`, `connector_sync_log` tables.
   - Verify RLS policies are active.

3) **Ship the /beta landing**
   - Add route `/beta` in frontend with hero + problem→pain→transformation story; no pricing shown.
   - Add single CTA button that opens the waitlist modal.

4) **Build the waitlist modal + API**
   - Frontend: modal with fields email, startup stage, revenue range, key problem, **DPDP consent checkbox**; submit to `POST /api/beta/waitlist`.
   - Backend: add waitlist endpoint, rate limit by IP, validate DPDP consent, store entry in Supabase, send thank-you email.

5) **Curate via Supabase Studio**
   - Open Supabase Dashboard → Table Editor → `waitlist_entries`.
   - Filter by `status = 'new'`, review entries, update to `'invited'` with `invite_token` and expiry.
   - Send invite email manually or via script.

6) **Invite and activate beta users**
   - Email contains magic link to `/beta/accept?token=...`.
   - Backend: `POST /api/beta/accept` consumes token, creates/links Supabase user, sets `beta_status=active`, `beta_expires_at=+60d`, `feature_access.paid_dashboard=true`.
   - **Onboarding prompts user to connect Razorpay/Stripe** → auto-sync MRR on connect.

7) **Add feedback + engagement loops**
   - Embed floating chatbot; route messages to `POST /api/feedback` and store in `feedback` table.
   - Cron/worker: send weekly micro-survey email; in-app weekly prompt; daily AI pulse notification.
   - Trigger email if no check-in for 7 days; trigger "Was this helpful?" popup after key actions.

8) **Prepare conversion window (days 50–60)**
   - In-app banner + modal showing usage value (runs, check-ins, AI uses). CTA to pay.
   - Emails on days 50, 55, 58, 60 summarising personal value and offering 50% Founding Member pricing.
   - Payment: Stripe/Razorpay checkout tied to Supabase user. Webhook sets `subscriptions.plan='founder'`, `status='active'`, clears beta expiry.

9) **Handle migration and grace**
   - Do not move data; only change flags/plan. Set grace period of 7 days post day 60 with read-only access until paid.
   - Run SQL job to expire users who did not pay: set `beta_status='expired'`, `feature_access.paid_dashboard=false`.

10) **Measure success and adjust**
    - Track: waitlist→invite→accept; T+7 activation (first projection + first check-in + connector connected); weekly active; beta→paid %. Target: ≥40% conversion, NPS ≥30.
    - Run A/B on pricing reveal timing via `pricing_reveal_variant` flag; ship changelog and close-the-loop emails on shipped feedback.
