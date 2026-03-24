# Next.js 15 Migration Implementation Checklist

**Project:** Centurion 100Cr Engine  
**Migration:** CRA + React Router → Next.js 15 App Router  
**Estimated Duration:** 10 working days  
**Reference Document:** `docs/NEXTJS_15_PRODUCTION_MIGRATION_GUIDE.md`

---

## Pre-Migration Checklist

### Environment Verification
- [ ] Node.js version ≥ 18.17.0 installed
- [ ] npm version ≥ 10.0.0 installed
- [ ] Git repository clean (no uncommitted changes)
- [ ] Backend running and accessible at `http://localhost:8001`
- [ ] Supabase credentials available
- [ ] All current tests passing on CRA frontend

### Documentation Review
- [ ] Read `docs/comprehensive_guide.md`
- [ ] Read `docs/nextjs_migration_guide.md`
- [ ] Review `docs/PROJECT_SUMMARY_GUIDE.md`
- [ ] Understand current auth flow
- [ ] Understand API endpoint structure

---

## Phase A: Project Setup (Day 1 - Morning)

### A.1 Create Next.js Project
```powershell
cd "C:\Users\shresth_agarwal\Documents\devforge\New folder\CENTURION"
npx create-next-app@latest frontend-next --typescript --tailwind --eslint --app --src-dir --turbopack
```

**Verification:**
- [ ] `frontend-next/` directory created
- [ ] `npm run dev` starts without errors
- [ ] Browser opens at `http://localhost:3000`

### A.2 Install Dependencies
```powershell
cd frontend-next

# Core
npm install @supabase/supabase-js @supabase/ssr
npm install framer-motion lucide-react recharts sonner
npm install class-variance-authority clsx tailwind-merge
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers zustand
npm install date-fns axios

# Radix UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-checkbox @radix-ui/react-label @radix-ui/react-switch @radix-ui/react-progress @radix-ui/react-separator @radix-ui/react-popover @radix-ui/react-scroll-area

# Dev
npm install -D tailwindcss-animate @types/node
```

**Verification:**
- [ ] All packages installed without errors
- [ ] `package.json` contains all dependencies

### A.3 Environment Setup
Create `frontend-next/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dryfkpbfuayzwrrkygsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeWZrcGJmdWF5endycmt5Z3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODYxMDUsImV4cCI6MjA4OTI2MjEwNX0.lfR9M5nUdANrBAUXOgeys9sBrYsTjhoyLcBWuRP-sBo
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_ADMIN_EMAILS=admin@100crengine.in
NEXT_PUBLIC_APP_VERSION=5.0.0
```

**Verification:**
- [ ] `.env.local` file created
- [ ] File added to `.gitignore`

### A.4 Configure Tailwind
Replace `tailwind.config.ts` with production config from migration guide.

**Verification:**
- [ ] Tailwind config updated
- [ ] `npm run dev` still works
- [ ] Tailwind classes apply correctly

---

## Phase A.5: Copy Global Styles (Day 1 - Morning)

### Tasks:
- [ ] Copy `frontend/src/index.css` to `frontend-next/src/app/globals.css`
- [ ] Copy `frontend/src/styles/` directory to `frontend-next/src/styles/`
- [ ] Update import paths in `globals.css`
- [ ] Add CSS custom properties from migration guide

**Verification:**
- [ ] Global styles render correctly
- [ ] Centurion design tokens available

---

## Phase B: Authentication Foundation (Day 1 - Afternoon)

### B.1 Create Supabase Clients

Create the following files:

| File | Purpose |
|------|---------|
| `src/lib/supabase/client.ts` | Browser client |
| `src/lib/supabase/server.ts` | Server client |
| `src/lib/supabase/middleware.ts` | Middleware helper |

**Verification:**
- [ ] All three files created
- [ ] TypeScript compiles without errors

### B.2 Create Middleware
Create `src/middleware.ts` with auth protection logic.

**Verification:**
- [ ] Middleware file created
- [ ] Protected routes redirect when not authenticated
- [ ] Admin routes redirect non-admins

### B.3 Create Auth Context
Create `src/context/AuthContext.tsx` with full auth state.

**Verification:**
- [ ] AuthContext created
- [ ] `useAuth` hook works
- [ ] Context compiles without errors

### B.4 Create Auth Callback Page
Create `src/app/auth/callback/page.tsx`.

**Verification:**
- [ ] Auth callback page created
- [ ] Handles magic link codes
- [ ] Redirects after successful auth

---

## Phase C: API Layer (Day 2 - Morning)

### C.1 Create Type Definitions
Create `src/types/index.ts`:

```typescript
// Add all shared types
export interface Profile { ... }
export interface Subscription { ... }
export interface CheckIn { ... }
// etc.
```

**Verification:**
- [ ] Types file created
- [ ] Types match backend models

### C.2 Create Server API Client
Create `src/lib/api/server.ts` with typed fetch functions.

**Verification:**
- [ ] Server API client created
- [ ] Functions are typed correctly
- [ ] Works in Server Components

### C.3 Create Client API Client
Create `src/lib/api/client.ts` with typed fetch functions.

**Verification:**
- [ ] Client API client created
- [ ] Error handling works
- [ ] Auth token injection works

### C.4 Create React Query Hooks
Create `src/hooks/useApi.ts` with all API hooks.

**Verification:**
- [ ] Hooks file created
- [ ] Hooks return correct types
- [ ] Mutations invalidate correct queries

---

## Phase D: Public Routes (Day 2 - Afternoon to Day 3)

### D.1 Create Layout Structure
Create route groups:
- [ ] `src/app/(public)/layout.tsx` - Public layout with Navbar/Footer
- [ ] `src/app/(auth)/layout.tsx` - Auth routes layout
- [ ] `src/app/(protected)/layout.tsx` - Dashboard layout

### D.2 Migrate Components

| Component | Source | Target | Type |
|-----------|--------|--------|------|
| Navbar | `components/layout/Navbar.jsx` | `components/layout/Navbar.tsx` | Client |
| Footer | `components/layout/Footer.jsx` | `components/layout/Footer.tsx` | Server |
| CenturionCard | `components/ui/CenturionCard.jsx` | `components/ui/CenturionCard.tsx` | Server |
| Button | `components/ui/Button.jsx` | `components/ui/Button.tsx` | Server |

For each component:
- [ ] Add `'use client'` if needed
- [ ] Update imports
- [ ] Convert to TypeScript
- [ ] Test rendering

### D.3 Migrate Landing Page
- [ ] Create `src/app/(public)/page.tsx`
- [ ] Migrate HeroSection
- [ ] Migrate FounderDNAQuiz
- [ ] Migrate PricingSection
- [ ] Migrate WaitlistSection
- [ ] Migrate all other landing sections

**Verification:**
- [ ] Landing page renders
- [ ] All sections visible
- [ ] Animations work
- [ ] Quiz submits correctly

### D.4 Migrate Pricing Page
- [ ] Create `src/app/(public)/pricing/page.tsx`
- [ ] Copy and convert component
- [ ] Test plan selection

### D.5 Migrate Privacy Page
- [ ] Create `src/app/(public)/privacy/page.tsx`
- [ ] Copy content
- [ ] Test rendering

### D.6 Migrate Calculator Tools

| Tool | Route | Priority |
|------|-------|----------|
| 100Cr Calculator | `/tools/100cr-calculator` | High |
| ARR Calculator | `/tools/arr-calculator` | High |
| Runway Calculator | `/tools/runway-calculator` | Medium |
| Growth Calculator | `/tools/growth-calculator` | Medium |
| Invoice Health | `/tools/invoice-health-calculator` | Medium |

For each calculator:
- [ ] Create page file
- [ ] Migrate component logic
- [ ] Test calculations
- [ ] Test API calls (projection)

### D.7 Migrate Preview Pages
- [ ] Create `src/app/(public)/preview/` directory
- [ ] Create all 8 preview pages
- [ ] Test rendering

---

## Phase E: Dashboard Routes (Day 4-5)

### E.1 Create Dashboard Layout
- [ ] Create `src/app/(protected)/dashboard/layout.tsx`
- [ ] Migrate DashboardSidebar component
- [ ] Add persona-based navigation switching

### E.2 Migrate Dashboard Pages

| Page | Route | Priority | Complexity |
|------|-------|----------|------------|
| Command Centre | `/dashboard` | Critical | High |
| Revenue | `/dashboard/revenue` | High | Medium |
| Forecasting | `/dashboard/forecasting` | High | High |
| Benchmarks | `/dashboard/benchmarks` | High | Medium |
| Reports | `/dashboard/reports` | High | High |
| AI Coach | `/dashboard/coach` | High | High |
| Goals | `/dashboard/goals` | Medium | Medium |
| Investors | `/dashboard/investors` | Medium | Medium |
| Connectors | `/dashboard/connectors` | Medium | Medium |
| Settings | `/dashboard/settings` | High | Low |
| Cash Flow | `/dashboard/cashflow` | Low | Low |
| AR Aging | `/dashboard/ar-aging` | Low | Low |
| Collections | `/dashboard/collections` | Low | Low |

For each page:
- [ ] Create page file
- [ ] Migrate component
- [ ] Wire up API hooks
- [ ] Test data loading
- [ ] Test interactions

### E.3 Migrate Dashboard Components

| Component | Priority |
|-----------|----------|
| CheckInModal | High |
| OnboardingModal | High |
| FreeTierBanner | High |
| OnboardingChecklist | Medium |
| UpgradeModal | Medium |

For each:
- [ ] Migrate to TypeScript
- [ ] Add 'use client'
- [ ] Test functionality

---

## Phase F: Admin & Payments (Day 6-7)

### F.1 Migrate Checkout Page
- [ ] Create `src/app/(auth)/checkout/page.tsx`
- [ ] Integrate Razorpay SDK
- [ ] Test order creation
- [ ] Test payment flow (sandbox)
- [ ] Test subscription polling

### F.2 Migrate Admin Dashboard
- [ ] Create `src/app/(protected)/admin/page.tsx`
- [ ] Migrate admin components
- [ ] Test admin-only access
- [ ] Test admin API calls

---

## Phase G: AI Features (Day 7-8)

### G.1 Create Server Actions
- [ ] Create `src/app/actions/ai.ts`
- [ ] Implement generateBoardReport
- [ ] Implement generateStrategyBrief
- [ ] Implement analyzeDeviation

### G.2 Update AI Coach Page
- [ ] Add Server Actions integration
- [ ] Test AI generation
- [ ] Handle rate limits gracefully
- [ ] Add loading states

---

## Phase H: Testing & Hardening (Day 8-9)

### H.1 Functional Testing

#### Public Routes
- [ ] Landing page loads completely
- [ ] Pricing page shows plans
- [ ] Privacy page renders
- [ ] All calculators work
- [ ] All preview pages render

#### Authentication
- [ ] Magic link sends
- [ ] Magic link sign-in works
- [ ] Google OAuth works
- [ ] Sign out works
- [ ] Session persists across refresh

#### Protected Routes
- [ ] Dashboard loads with data
- [ ] Check-in submits
- [ ] Profile updates save
- [ ] Onboarding completes
- [ ] Settings work

#### Payments
- [ ] Order creates
- [ ] Razorpay modal opens
- [ ] Payment completes (sandbox)
- [ ] Subscription activates

#### Admin
- [ ] Admin access works
- [ ] Non-admin redirected
- [ ] Admin APIs work

### H.2 Performance Testing

```powershell
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse
lhci autorun
```

Targets:
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### H.3 Security Review
- [ ] No secrets in client bundle
- [ ] CSP headers configured
- [ ] Security headers present
- [ ] Auth tokens not logged
- [ ] API errors don't leak info

### H.4 Build Verification
```powershell
npm run build
npm run start
```

- [ ] Build succeeds
- [ ] Production server starts
- [ ] All routes work in production mode

---

## Phase I: Deployment (Day 9-10)

### I.1 Pre-Deployment
- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables documented
- [ ] Rollback plan ready

### I.2 Vercel Setup
- [ ] Vercel account connected
- [ ] Project imported
- [ ] Environment variables set
- [ ] Region configured (bom1)

### I.3 Staging Deployment
```powershell
vercel
```

- [ ] Preview deployment successful
- [ ] All routes work on preview
- [ ] API calls succeed
- [ ] Auth flow works

### I.4 Production Deployment
```powershell
vercel --prod
```

- [ ] Production deployment successful
- [ ] DNS configured
- [ ] SSL working
- [ ] All routes work

### I.5 Post-Deployment
- [ ] Monitor Sentry for errors
- [ ] Check Core Web Vitals
- [ ] Verify analytics tracking
- [ ] Test critical user flows
- [ ] Keep CRA as rollback option

---

## Frontend ↔ Backend Integration Verification

### User APIs
| Endpoint | Test |
|----------|------|
| `GET /api/user/profile` | [ ] Returns profile + subscription |
| `PUT /api/user/profile` | [ ] Updates profile fields |
| `POST /api/user/onboarding` | [ ] Completes onboarding |
| `DELETE /api/user/delete` | [ ] Deletes account |

### Dashboard APIs
| Endpoint | Test |
|----------|------|
| `GET /api/dashboard/overview` | [ ] Returns dashboard data |
| `GET /api/dashboard/revenue` | [ ] Returns revenue data |
| `POST /api/checkin` | [ ] Submits check-in |
| `GET /api/checkins` | [ ] Returns check-in history |

### Engine APIs
| Endpoint | Test |
|----------|------|
| `POST /api/engine/projection` | [ ] Runs projection |
| `GET /api/engine/projection/{slug}` | [ ] Gets shared projection |
| `POST /api/engine/scenario` | [ ] Runs scenarios |

### AI APIs
| Endpoint | Test |
|----------|------|
| `GET /api/ai/daily-pulse` | [ ] Returns AI question |
| `GET /api/ai/weekly-question` | [ ] Returns weekly question |
| `POST /api/ai/board-report` | [ ] Generates report |
| `GET /api/ai/usage` | [ ] Returns usage stats |

### Payment APIs
| Endpoint | Test |
|----------|------|
| `POST /api/payments/razorpay/create-order` | [ ] Creates order |

### Waitlist APIs
| Endpoint | Test |
|----------|------|
| `POST /api/waitlist` | [ ] Joins waitlist |
| `GET /api/waitlist/count` | [ ] Returns count |

### Admin APIs (if admin)
| Endpoint | Test |
|----------|------|
| `GET /api/admin/stats` | [ ] Returns stats |
| `GET /api/admin/system/health` | [ ] Returns health |
| `POST /api/admin/beta/{user_id}` | [ ] Grants beta |

---

## Rollback Procedure

If critical issues found post-deployment:

1. **Immediate (< 5 min)**
   - Vercel Dashboard → Deployments → Find previous deployment → Instant Rollback

2. **DNS Rollback (< 30 min)**
   - Point domain back to CRA deployment
   - CRA deployment must remain live during migration window

3. **Data Considerations**
   - No database changes in migration
   - User sessions handled by Supabase (unchanged)
   - Backend unchanged - no rollback needed

---

## Success Criteria

Migration is complete when:

- [ ] All 17+ pages render correctly
- [ ] Authentication flows work end-to-end
- [ ] All API integrations verified
- [ ] Performance scores meet targets
- [ ] Security review passed
- [ ] Production deployment stable for 48 hours
- [ ] No critical errors in Sentry
- [ ] Team sign-off obtained

---

## Notes & Blockers Log

| Date | Issue | Resolution | Status |
|------|-------|------------|--------|
| | | | |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Tech Lead | | | |
| Product | | | |

---

**Last Updated:** March 24, 2026  
**Document Version:** 1.0.0

