# 100Cr Engine - Next.js Migration Source of Truth

**Last Updated:** March 24, 2026  
**Current Frontend:** CRA + CRACO + React Router 6  
**Target Frontend:** Next.js 14+ (App Router, `src/` layout)  
**Migration Model:** Parallel app (`frontend-next`) with phased cutover

---

## 1) Scope and non-goals

This guide is the canonical implementation plan to migrate the current `frontend` app to Next.js without changing backend architecture.

### In scope

- Move routing from `react-router-dom` to Next App Router.
- Move frontend runtime from CRA/CRACO to Next.js.
- Preserve all existing frontend features and routes.
- Keep Supabase auth and FastAPI backend integration working.
- Replace CRA env variable conventions with Next conventions.
- Preserve styling, design tokens, and current UI behavior.

### Explicit non-goals

- Do **not** move backend logic into Next API routes.
- Do **not** merge frontend and backend into a monolith.
- Do **not** redesign UI or change product behavior during migration.

---

## 2) Verified current state (what exists now)

### Frontend runtime and tooling

- App lives at `frontend`.
- Runtime: `react@18.2.0` + `react-dom@18.2.0`.
- Build/dev scripts in `frontend/package.json`:
  - `start`: `craco start`
  - `build`: `craco build`
  - `test`: `craco test`
- Router: `react-router-dom@^6.22.3`.
- Alias: `@/* -> src/*` configured in `frontend/jsconfig.json`.

### Auth and API

- Supabase client currently uses `@supabase/supabase-js` (`frontend/src/lib/supabase/client.js`).
- Auth state is managed in `frontend/src/context/AuthContext.jsx`.
- Backend base URL is read from `REACT_APP_BACKEND_URL` and used in:
  - `frontend/src/context/AuthContext.jsx`
  - `frontend/src/lib/api/client.js`
  - `frontend/src/lib/api/dashboard.js`
- Current API client also reads token from `localStorage` (`auth_token`) in `frontend/src/lib/api/client.js`.

### Styling

- Global CSS entry is `frontend/src/index.css`.
- It imports:
  - `frontend/src/styles/tokens.css`
  - `frontend/src/styles/design-system.css`
- `frontend/src/App.css` is intentionally empty and can be dropped in migration.

### Route inventory (must be preserved exactly)

Source of truth: `frontend/src/App.js`

#### Public routes

- `/` -> `LandingPage`
- `/pricing` -> `PricingPage`
- `/privacy` -> `PrivacyPage`
- `/auth/callback` -> `AuthCallback`
- `/tools` -> redirect to `/tools/100cr-calculator`
- `/tools/100cr-calculator` -> `HundredCrCalculator`
- `/tools/arr-calculator` -> `ARRCalculator`
- `/tools/runway-calculator` -> `RunwayCalculator`
- `/tools/growth-calculator` -> `GrowthCalculator`
- `/tools/invoice-health-calculator` -> `InvoiceHealthCalculator`
- `/preview/command-centre` -> `PreviewCommandCentre`
- `/preview/revenue` -> `PreviewRevenue`
- `/preview/forecasting` -> `PreviewForecasting`
- `/preview/coach` -> `PreviewCoach`
- `/preview/reports` -> `PreviewReports`
- `/preview/benchmarks` -> `PreviewBenchmarks`
- `/preview/connectors` -> `PreviewConnectors`
- `/preview/settings` -> `PreviewSettings`

#### Protected routes

- `/checkout` -> `CheckoutPage` (`ProtectedRoute`)
- `/dashboard` -> `CommandCentre` inside `DashboardLayout`
- `/dashboard/revenue` -> `RevenueIntelligence`
- `/dashboard/forecasting` -> `ForecastingEngine`
- `/dashboard/benchmarks` -> `BenchmarkIntelligence`
- `/dashboard/reports` -> `ReportingEngine`
- `/dashboard/coach` -> `AIGrowthCoach`
- `/dashboard/goals` -> `GoalArchitecture`
- `/dashboard/investors` -> `InvestorRelations`
- `/dashboard/connectors` -> `Connectors`
- `/dashboard/settings` -> `Settings`
- `/dashboard/cashflow` -> `CashFlowRadar`
- `/dashboard/ar-aging` -> `ARAgingDashboard`
- `/dashboard/collections` -> `Collections`
- `/admin` -> `AdminDashboard` (`ProtectedRoute requireAdmin`)

#### Fallback

- `*` -> redirect to `/`

### Known cleanup item to include in migration

- Two auth callback files currently exist:
  - `frontend/src/pages/AuthCallback.jsx` (active route import in `App.js`)
  - `frontend/src/pages/auth/AuthCallback.jsx` (legacy duplicate)
- During migration, standardize on one callback implementation (recommended: use `frontend/src/pages/AuthCallback.jsx` logic as base).

---

## 3) Environment variable migration map

Use this exact mapping in Next:

| CRA variable | Next variable | Required |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `REACT_APP_BACKEND_URL` | `NEXT_PUBLIC_BACKEND_URL` | Yes |
| `REACT_APP_ADMIN_EMAILS` | `NEXT_PUBLIC_ADMIN_EMAILS` | Yes (admin gating) |
| `REACT_APP_SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | Optional but recommended |
| `REACT_APP_VERSION` | `NEXT_PUBLIC_APP_VERSION` | Optional (if keeping release tag logic) |

Important: no `REACT_APP_*` references should remain in `frontend-next`.

---

## 4) End-to-end implementation plan

Execute these steps in order. Do not skip phase validation gates.

## Phase A - Create and baseline Next app

### A1. Create app

From repo root:

```bash
npx create-next-app@latest frontend-next --typescript --tailwind --eslint --app --src-dir
```

When prompted for alias, set `@/* -> ./src/*`.

### A2. Install core dependencies needed on day one

Inside `frontend-next`:

```bash
npm i @supabase/supabase-js @supabase/ssr axios framer-motion lucide-react recharts sonner
```

Then add any missing Radix/shadcn-related dependencies as soon as a migrated component requires them.

### A3. Configure env

Create `frontend-next/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<value from frontend env>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<value from frontend env>
NEXT_PUBLIC_BACKEND_URL=<value from frontend env>
NEXT_PUBLIC_ADMIN_EMAILS=<value from frontend env>
NEXT_PUBLIC_SENTRY_DSN=<value from frontend env>
NEXT_PUBLIC_APP_VERSION=<optional, e.g. 3.0.0>
```

### A4. Validate baseline

- `npm run dev` starts without config errors.
- Alias `@/` resolves in TS and runtime.

---

## Phase B - Global styles, layout shell, and providers

### B1. Migrate global styles

- Copy `frontend/src/index.css` -> `frontend-next/src/app/globals.css`.
- Copy the whole `frontend/src/styles` directory -> `frontend-next/src/styles`.
- Keep `@import './styles/tokens.css';` and `@import './styles/design-system.css';` in `globals.css` valid relative to `src/app`.

### B2. Root layout

Edit `frontend-next/src/app/layout.tsx`:

- Import `./globals.css`.
- Keep `<html lang="en">`.
- Mount global providers (`AuthProvider`, toaster, theme wrappers if used).

### B3. Provider extraction pattern

Create `frontend-next/src/app/providers.tsx` as a client component:

- Put `AuthProvider` and `Toaster` there.
- Wrap `{children}` in providers.
- Import providers in server `layout.tsx`.

### B4. Validation gate

- Base app renders with migrated global styles.
- No hydration errors from provider placement.

---

## Phase C - Auth and API foundation

### C1. Supabase client for Next client components

Create `frontend-next/src/lib/supabase/client.ts`:

- Use `createBrowserClient` from `@supabase/ssr`.
- Read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Keep a helper equivalent to `isSupabaseConfigured()`.

### C2. Migrate AuthContext

Copy `frontend/src/context/AuthContext.jsx` -> `frontend-next/src/context/AuthContext.tsx` (or keep `.jsx` initially).

Required edits:

- Add `'use client';` at top.
- Replace all `process.env.REACT_APP_*` with `process.env.NEXT_PUBLIC_*`.
- Preserve existing behavior: session init, auth listener, `canAccessDashboard`, profile fetch, sign-out side effects.
- Keep callback redirect path `/auth/callback`.

### C3. API utilities

Copy and patch:

- `frontend/src/lib/api/client.js` -> `frontend-next/src/lib/api/client.ts`
- `frontend/src/lib/api/dashboard.js` -> `frontend-next/src/lib/api/dashboard.ts`

Required edits:

- Replace `REACT_APP_BACKEND_URL` with `NEXT_PUBLIC_BACKEND_URL`.
- Preserve endpoint paths under `/api/...`.
- Keep auth header behavior consistent.

### C4. Validation gate

- Login state can initialize without crashes.
- A simple authenticated call (`/api/user/profile`) works in Next dev runtime.

---

## Phase D - Route migration (file-system routing)

Create the full App Router tree below under `frontend-next/src/app`:

### D1. Public routes

- `page.tsx` -> landing page
- `pricing/page.tsx`
- `privacy/page.tsx`
- `auth/callback/page.tsx`
- `tools/page.tsx` (redirect to `/tools/100cr-calculator`)
- `tools/100cr-calculator/page.tsx`
- `tools/arr-calculator/page.tsx`
- `tools/runway-calculator/page.tsx`
- `tools/growth-calculator/page.tsx`
- `tools/invoice-health-calculator/page.tsx`

### D2. Preview routes

- `preview/command-centre/page.tsx`
- `preview/revenue/page.tsx`
- `preview/forecasting/page.tsx`
- `preview/coach/page.tsx`
- `preview/reports/page.tsx`
- `preview/benchmarks/page.tsx`
- `preview/connectors/page.tsx`
- `preview/settings/page.tsx`

### D3. Protected routes

- `checkout/page.tsx`
- `admin/page.tsx`
- `dashboard/layout.tsx`
- `dashboard/page.tsx`
- `dashboard/revenue/page.tsx`
- `dashboard/forecasting/page.tsx`
- `dashboard/benchmarks/page.tsx`
- `dashboard/reports/page.tsx`
- `dashboard/coach/page.tsx`
- `dashboard/goals/page.tsx`
- `dashboard/investors/page.tsx`
- `dashboard/connectors/page.tsx`
- `dashboard/settings/page.tsx`
- `dashboard/cashflow/page.tsx`
- `dashboard/ar-aging/page.tsx`
- `dashboard/collections/page.tsx`

### D4. Not-found behavior

- Add `not-found.tsx` and `app/page` redirects as needed to preserve old catch-all to `/`.

### D5. Validation gate

- Every CRA route has a matching Next route.
- URL paths remain unchanged.

---

## Phase E - Convert router-dependent components

This is the highest-risk phase. Convert every `react-router-dom` usage.

### E1. Replace primitives

| React Router | Next equivalent |
|---|---|
| `Link` (`to`) | `next/link` (`href`) |
| `useNavigate` | `useRouter` (`push`, `replace`) |
| `useLocation().pathname` | `usePathname()` |
| `Navigate` component | `redirect()` (server) or `router.replace()` (client) |
| `Outlet` | `children` in `layout.tsx` |

### E2. Priority files to patch first

- `components/auth/ProtectedRoute.jsx`
- `pages/dashboard/DashboardLayout.jsx`
- `components/dashboard/DashboardSidebar.jsx`
- `components/layout/Navbar.jsx`
- `components/layout/Footer.jsx`
- `pages/AuthCallback.jsx` (and remove duplicate `pages/auth/AuthCallback.jsx` in new app)
- `pages/admin/AdminDashboard.jsx`
- landing/tool components using `useNavigate`

### E3. Client component rule

Any component using state/effects/router hooks/event handlers must include:

```tsx
'use client';
```

### E4. Validation gate

- No imports from `react-router-dom` remain.
- Navigation/redirects preserve current behavior.

---

## Phase F - Access control and middleware

Use middleware to enforce route-level auth before page render.

### F1. Create middleware

Create `frontend-next/src/middleware.ts`:

- Build Supabase server client with request/response cookies.
- Protect `/dashboard/:path*`, `/checkout`, and `/admin/:path*`.
- Redirect unauthenticated users to `/` (or `/?login=true`).
- For `/admin`, validate lowercased user email against `NEXT_PUBLIC_ADMIN_EMAILS` list.

### F2. Keep in-component guard parity

- Preserve `ProtectedRoute` checks for dashboard subscription/beta gating.
- Middleware handles coarse auth/admin gate; component handles business-specific gate (`canAccessDashboard`).

### F3. Validation gate

- Logged-out user cannot access protected routes directly via URL.
- Non-admin authenticated user cannot access `/admin`.

---

## Phase G - Observability (Sentry) and production hardening

### G1. Install Next Sentry SDK

```bash
npx @sentry/wizard@latest -i nextjs
```

### G2. Wire env and sampling

- Use `NEXT_PUBLIC_SENTRY_DSN`.
- Port existing breadcrumb/user-context helpers from `frontend/src/lib/sentry.js`.
- Keep sensitive-data masking logic.

### G3. Remove CRA-only tooling from new app

Do not add CRA stack to `frontend-next`:

- `react-scripts`
- `@craco/craco`
- `cra-template`
- `react-router-dom`

### G4. Validation gate

- Error events appear in Sentry with environment/release tags.

---

## Phase H - Full verification checklist (must pass before cutover)

### Functional routes

- [ ] All public pages render.
- [ ] All tools pages render (including `invoice-health-calculator`).
- [ ] All preview routes render.
- [ ] All dashboard routes render for eligible users.
- [ ] `cashflow`, `ar-aging`, and `collections` dashboard routes are present and working.

### Auth and access

- [ ] Magic link flow reaches `/auth/callback` and signs in.
- [ ] Google OAuth flow reaches `/auth/callback` and signs in.
- [ ] `/checkout` blocks logged-out users.
- [ ] `/dashboard/*` blocks logged-out users.
- [ ] `/admin` blocks non-admin users silently.
- [ ] Dashboard subscription/beta checks still route correctly to pricing/checkout.

### Data/API

- [ ] `NEXT_PUBLIC_BACKEND_URL` is used everywhere (no `REACT_APP_BACKEND_URL` in Next app).
- [ ] Profile fetch, connectors, AI endpoints, and projection endpoints succeed.

### Quality

- [ ] `npm run lint` passes in `frontend-next`.
- [ ] `npm run build` passes in `frontend-next`.
- [ ] No console runtime errors on key flows.

---

## 5) Cutover plan

After Phase H passes:

1. Keep CRA app intact as rollback target.
2. Deploy Next app in parallel environment.
3. Run smoke tests against production backend.
4. Switch traffic to Next app.
5. Monitor Sentry and backend error rates for 24-48 hours.
6. Only then schedule CRA deprecation.

---

## 6) Common migration pitfalls to avoid

- Missing routes from old `App.js` (especially `invoice-health-calculator`, `cashflow`, `ar-aging`, `collections`).
- Leaving `react-router-dom` imports in migrated components.
- Mixing `REACT_APP_*` and `NEXT_PUBLIC_*`.
- Forgetting `'use client'` on interactive components.
- Breaking auth callback by migrating the legacy duplicate callback file instead of the active one.
- Using middleware alone for business gating (still keep dashboard entitlement checks in app logic).

---

## 7) Completion criteria

The migration is complete only when all are true:

- `frontend-next` fully reproduces current frontend routes and behavior.
- All protected/auth/admin flows match existing logic.
- No remaining CRA-specific runtime dependencies in Next app.
- Build, lint, and smoke checks pass.
- Team can remove `frontend` from active development without functional regression.

---

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Next.js Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Tailwind with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
