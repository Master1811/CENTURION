# 100Cr Engine – Next.js Migration Guide

## Current State (as of this guide)

- **Frontend**: Create React App (CRA) with **CRACO** (`craco start` / `craco build`), not plain `react-scripts`.
- **Routing**: React Router v7 (`react-router-dom`); no Next.js exists in the repo.
- **Auth**: Supabase (magic link); session in memory + `AuthContext`; API client uses `localStorage.getItem('auth_token')` (not currently set by AuthContext — fix during migration).
- **Styling**: Tailwind + `src/index.css` (fonts, Tailwind, `@import './styles/tokens.css'`); `App.css` is effectively empty.
- **Path alias**: `@/` → `src/` via `jsconfig.json`.
- **Backend**: FastAPI at `REACT_APP_BACKEND_URL`; all API calls go to `${BACKEND_URL}/api/...`. Keep backend separate; do not move engine logic into Next.js API routes for this migration.

### Exact route map (from `frontend/src/App.js`)

| Route | Page/Component | Auth |
|-------|----------------|------|
| `/` | `LandingPage` | Public |
| `/pricing` | `PricingPage` | Public |
| `/auth/callback` | `AuthCallback` (from `@/pages/AuthCallback`) | Public |
| `/tools` | Redirect → `/tools/100cr-calculator` | Public |
| `/tools/100cr-calculator` | `HundredCrCalculator` | Public |
| `/tools/arr-calculator` | `ARRCalculator` | Public |
| `/tools/runway-calculator` | `RunwayCalculator` | Public |
| `/tools/growth-calculator` | `GrowthCalculator` | Public |
| `/preview/command-centre` … `/preview/settings` | `PreviewPages` exports | Public (screenshots) |
| `/dashboard` | `DashboardLayout` + `CommandCentre` (index) | Protected |
| `/dashboard/revenue` | `RevenueIntelligence` | Protected |
| `/dashboard/forecasting` | `ForecastingEngine` | Protected |
| `/dashboard/benchmarks` | `BenchmarkIntelligence` | Protected |
| `/dashboard/reports` | `ReportingEngine` | Protected |
| `/dashboard/coach` | `AIGrowthCoach` | Protected |
| `/dashboard/goals` | `GoalArchitecture` | Protected |
| `/dashboard/investors` | `InvestorRelations` | Protected |
| `/dashboard/connectors` | `Connectors` | Protected |
| `/dashboard/settings` | `Settings` | Protected |
| `*` | Redirect → `/` | — |

### Environment variables (current → Next.js)

| Current (CRA) | Next.js | Used in |
|---------------|---------|--------|
| `REACT_APP_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.js` |
| `REACT_APP_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.js` |
| `REACT_APP_BACKEND_URL` | `NEXT_PUBLIC_BACKEND_URL` | `lib/api/client.js`, `lib/api/dashboard.js`, `context/AuthContext.jsx`, `pages/auth/AuthCallback.jsx` |

### Files that use React Router (must switch to Next.js navigation)

- `App.js` – remove; replaced by `app/` routes and layout.
- `pages/dashboard/DashboardLayout.jsx` – `Outlet`, `Link`, `useLocation`, `Navigate`.
- `components/dashboard/DashboardSidebar.jsx` – `Link`, `useLocation`.
- `components/auth/ProtectedRoute.jsx` – `Navigate`, `useLocation`.
- `components/layout/Navbar.jsx` – `Link`, `useNavigate`, `useLocation`.
- `components/layout/Footer.jsx` – `Link`.
- `components/landing/TeaserLockedSection.jsx`, `PricingSection.jsx`, `HeroSection.jsx`, `HeroSectionNew.jsx`, `CTASection.jsx`, `CTASectionNew.jsx`, `UpgradeModal.jsx` – `useNavigate`.
- `pages/AuthCallback.jsx`, `pages/auth/AuthCallback.jsx` – `useNavigate`, `useSearchParams`.
- `pages/tools/HundredCrCalculator.jsx` – `useNavigate`.

---

## Migration strategy

- Create a **new** Next.js app (e.g. `frontend-next`) beside `frontend`. Migrate in phases; keep CRA running until the new app is verified.
- Use **App Router** and **TypeScript** for new code; existing JSX can stay as `.jsx` until you opt to convert.
- Keep the **FastAPI backend** as-is; only the frontend and env var names change.

---

## Phase 1: Next.js project setup

**1.1 Create the app (from repo root)**

```bash
cd "c:\Users\shresth_agarwal\Documents\devforge\New folder\CENTURION"
npx create-next-app@latest frontend-next --typescript --tailwind --eslint --app --src-dir
```

When prompted for the import alias, choose `@/*` → `./src/*` so it matches the current `frontend` setup.

**1.2 Environment variables**

Create `frontend-next/.env.local` and copy from `frontend/.env` (or `.env.local`), then rename keys:

```env
NEXT_PUBLIC_SUPABASE_URL=<same value as REACT_APP_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same value as REACT_APP_SUPABASE_ANON_KEY>
NEXT_PUBLIC_BACKEND_URL=<same value as REACT_APP_BACKEND_URL>
```

Do not use `REACT_APP_*` in the Next app.

**1.3 Path alias**

Ensure `frontend-next/tsconfig.json` has:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

`jsconfig.json` is not used by Next/TypeScript; path alias is in `tsconfig.json`.

---

## Phase 2: Global styles and tokens

**2.1 Copy global CSS**

- Copy `frontend/src/index.css` → `frontend-next/src/app/globals.css` (or merge into the existing `globals.css`).
- Copy `frontend/src/styles/tokens.css` → `frontend-next/src/styles/tokens.css`.
- In `globals.css`, keep the `@import './styles/tokens.css'` (or equivalent path from `src/app`). Use `@tailwind base; components; utilities;` as in the current file; remove any CRA-specific imports.

**2.2 Fonts**

Current `index.css` uses Google Fonts (Manrope, Inter, JetBrains Mono) via `@import url('https://fonts.googleapis.com/...')`. For Next.js, prefer `next/font` in the root layout:

In `app/layout.tsx`:

```tsx
import { Inter, Manrope } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
```

Then in `globals.css`, use `var(--font-inter)` and `var(--font-manrope)` where you currently use `'Inter'` and `'Manrope'`. You can do this incrementally and keep the Google `@import` until fonts are switched.

---

## Phase 3: Root layout and providers

**3.1 Root layout (`app/layout.tsx`)**

- Import `globals.css` in the layout (e.g. `import '../globals.css'` or the path that matches your `src/app` setup).
- Wrap children with `AuthProvider` (from `@/context/AuthContext`) so the whole app has auth state.
- Add metadata (title, description) for SEO.

Example structure:

```tsx
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: '100Cr Engine - When Will You Reach ₹100 Crore?',
  description: 'Revenue milestone prediction for Indian founders',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**3.2 AuthProvider and Supabase client**

- Copy `frontend/src/context/AuthContext.jsx` to `frontend-next/src/context/AuthContext.jsx`.
- Replace every `process.env.REACT_APP_BACKEND_URL` with `process.env.NEXT_PUBLIC_BACKEND_URL`.
- Replace every `process.env.REACT_APP_SUPABASE_*` with `process.env.NEXT_PUBLIC_SUPABASE_*`.
- For Next.js, prefer `@supabase/ssr` and create a **browser** client for client components (used by AuthContext). Keep the existing auth flow (getSession, onAuthStateChange, fetchUserData) the same; only the Supabase client creation should use the SSR package’s `createBrowserClient` with `NEXT_PUBLIC_*` env vars. Install: `npm i @supabase/ssr`.
- Ensure the API client (see Phase 5) sends the Supabase access token (from AuthContext) on requests and, if you currently rely on `localStorage.getItem('auth_token')`, either set `auth_token` from `session.access_token` in AuthContext when session exists or stop using `auth_token` and pass the token from context into the API client.

---

## Phase 4: File-based routes (App Router)

Create the following **pages** so URLs match the current app. Use the existing page components once they are migrated (Link/router, env).

**4.1 Public pages**

- `app/page.tsx` → render `<LandingPage />` (or inline the current `LandingPage` content).
- `app/pricing/page.tsx` → `<PricingPage />`.
- `app/auth/callback/page.tsx` → `<AuthCallback />` (use the callback that creates profile on first login, i.e. logic from `pages/auth/AuthCallback.jsx`; unify if you have two callbacks).

**4.2 Tools (public)**

- `app/tools/page.tsx` – redirect to `/tools/100cr-calculator` (e.g. `redirect()` from `next/navigation`).
- `app/tools/100cr-calculator/page.tsx` → `<HundredCrCalculator />`.
- `app/tools/arr-calculator/page.tsx` → `<ARRCalculator />`.
- `app/tools/runway-calculator/page.tsx` → `<RunwayCalculator />`.
- `app/tools/growth-calculator/page.tsx` → `<GrowthCalculator />`.

**4.3 Preview (public)**

- `app/preview/command-centre/page.tsx` → `<PreviewCommandCentre />`.
- Same for: `revenue`, `forecasting`, `coach`, `reports`, `benchmarks`, `connectors`, `settings` (match `PreviewPages` exports).

**4.4 Dashboard (protected)**

- `app/dashboard/layout.tsx` – layout with `<DashboardSidebar />` and main content area; render `children`. Do not put auth redirect here if you use middleware (see Phase 6).
- `app/dashboard/page.tsx` → `<CommandCentre />`.
- `app/dashboard/revenue/page.tsx` → `<RevenueIntelligence />`.
- `app/dashboard/forecasting/page.tsx` → `<ForecastingEngine />`.
- `app/dashboard/benchmarks/page.tsx` → `<BenchmarkIntelligence />`.
- `app/dashboard/reports/page.tsx` → `<ReportingEngine />`.
- `app/dashboard/coach/page.tsx` → `<AIGrowthCoach />`.
- `app/dashboard/goals/page.tsx` → `<GoalArchitecture />`.
- `app/dashboard/investors/page.tsx` → `<InvestorRelations />`.
- `app/dashboard/connectors/page.tsx` → `<Connectors />`.
- `app/dashboard/settings/page.tsx` → `<Settings />`.

**4.5 Catch-all**

- In a suitable place (e.g. a not-found route or middleware), redirect unknown paths to `/`. Next.js 13+ uses `app/not-found.tsx` for 404; for “any other path → /” you can do `redirect('/')` inside a page that matches a dynamic catch-all or handle in middleware.

---

## Phase 5: Component and API client updates

**5.1 API and env renames**

- Copy `frontend/src/lib/api/client.js` and `frontend/src/lib/api/dashboard.js` into `frontend-next/src/lib/api/`.
- Replace `REACT_APP_BACKEND_URL` with `NEXT_PUBLIC_BACKEND_URL` and use it for the base URL.
- Ensure the client sends the Supabase access token: either get it from `AuthContext.getAccessToken()` and set it on the axios instance (or fetch headers) when making requests, or sync `session.access_token` to a place the client reads (e.g. set `localStorage.setItem('auth_token', token)` in AuthContext when session is set, and keep using the interceptor). Prefer passing token from context to avoid localStorage if you use middleware/SSR later.

**5.2 Supabase client**

- Copy `frontend/src/lib/supabase/client.js` → `frontend-next/src/lib/supabase/client.js`.
- Replace `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- For App Router, use `@supabase/ssr` and in client components use `createBrowserClient` from it (with the same env vars). Replace the current `createClient` from `@supabase/supabase-js` with that browser client so cookies can be used later if you add server components or middleware that need the session.

**5.3 React Router → Next.js navigation**

Update these in place in the copied components:

| Current | Next.js |
|---------|---------|
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `const navigate = useNavigate(); navigate('/path')` | `const router = useRouter(); router.push('/path')` |
| `import { Link, useLocation } from 'react-router-dom'` | `import Link from 'next/link'; import { usePathname } from 'next/navigation'` |
| `<Link to="/path">` | `<Link href="/path">` |
| `useLocation().pathname` | `usePathname()` |
| `useLocation().state` | Use searchParams or context; Next.js Link does not support `state` — pass query params or store in sessionStorage if needed |
| `import { Navigate } from 'react-router-dom'; return <Navigate to="/" replace />` | `import { redirect } from 'next/navigation'` in server components, or `router.replace('/')` in client components |

**5.4 Client components**

Any component that uses `useState`, `useEffect`, `useRouter`, `usePathname`, or event handlers must be a Client Component. Add at the top of the file:

```tsx
'use client';
```

Apply to: `AuthContext` (and its consumer components), `Navbar`, `Footer`, `DashboardSidebar`, `ProtectedRoute`, `AuthCallback`, all landing sections that use `useNavigate`, all dashboard pages, tools pages, and any component using hooks or browser APIs.

**5.5 ProtectedRoute behavior**

- Remove dependency on React Router’s `Navigate` and `useLocation`.
- In the dashboard layout (or a wrapper component), use `useAuth()` and `useRouter()`: if `!isAuthenticated && !loading`, call `router.replace('/')` (and optionally set a query like `?login=true` for the landing page to open the auth modal). If `requirePaid && !hasPaidSubscription()`, `router.replace('/pricing')`.
- Alternatively, protect routes in **middleware** (Phase 6) and keep a minimal client-side guard only where needed (e.g. subscription gate).

**5.6 Dashboard layout**

- Replace `<Outlet />` with `{children}` in `app/dashboard/layout.tsx`.
- Use `usePathname()` instead of `useLocation().pathname` in `DashboardSidebar` for active link styling.
- Sidebar links: use `<Link href={item.href}>` and the same `href` list as today (`/dashboard`, `/dashboard/revenue`, …).

**5.7 Auth callback**

- Use a single auth callback page at `app/auth/callback/page.tsx`. Prefer the logic from `pages/auth/AuthCallback.jsx` (profile creation with backend, `exchangeCodeForSession`). Use `useSearchParams()` from `next/navigation` and `useRouter()` for `router.replace('/dashboard')` or `router.push('/')` on error.
- Magic link redirect URL in Supabase and in `signInWithMagicLink` must stay `{origin}/auth/callback`.

---

## Phase 6: Middleware (protected routes)

Create `frontend-next/src/middleware.ts` (or `middleware.ts` at project root if not using `src`).

- Use `@supabase/ssr`: create a response and get the session (e.g. `createServerClient` and `getSession`).
- If the request path is under `/dashboard` and there is no session, redirect to `/?login=true` (or `/`) with `NextResponse.redirect`.
- Export a `config` with `matcher: ['/dashboard/:path*']` so only dashboard routes are checked.

This keeps protection consistent and avoids flashing dashboard content before client-side redirect.

---

## Phase 7: Copy and wire the rest of the UI

**7.1 Copy in order**

1. **lib**: `lib/utils.js`, `lib/copy.js`, `lib/engine/*` (constants, projection, benchmarks), then `lib/api/*` and `lib/supabase/*` (already updated in Phase 5).
2. **context**: `AuthContext.jsx` (already updated in Phase 3).
3. **components**: Copy `components/layout`, `components/landing`, `components/dashboard`, `components/auth`, `components/ui`, `components/upgrade`, `components/tour` — then apply router/link/pathname and `'use client'` where needed.
4. **pages**: Already mapped to `app/*` in Phase 4; copy page components into `src` (e.g. `src/pages/` or colocate under `app/...` and import) and fix imports and client directives.

**7.2 Dependencies**

- Install the same Radix, Framer Motion, Lucide, Recharts, etc. as in `frontend/package.json`. Remove `react-router-dom`, `react-scripts`, `craco`, `cra-template`. Add `next`, `@supabase/ssr`.
- `next-themes` is already in the project; you can keep it for a future theme toggle.

**7.3 Health check / CRACO**

- The current app uses a custom health check plugin and CRACO. Next.js does not use CRACO. Omit the health check plugin in the Next app unless you reimplement it as a Next API route or separate endpoint.

---

## Phase 8: Build and test

```bash
cd frontend-next
npm run build
npm run start
```

- Fix any missing imports, wrong paths, or server/client boundary issues (e.g. using `window` or `useRouter` in a file without `'use client'`).
- Test: `/`, `/pricing`, `/auth/callback` (magic link), `/tools/100cr-calculator`, `/dashboard` (redirect when logged out, load when logged in), and each dashboard sub-route. Verify API calls use `NEXT_PUBLIC_BACKEND_URL` and the backend receives the correct `Authorization` header.

---

## Breaking changes summary

| Area | CRA / React Router | Next.js |
|------|--------------------|---------|
| Env | `REACT_APP_*` | `NEXT_PUBLIC_*` (client-visible) |
| Routing | `<Routes>`, `<Link to="">`, `useNavigate`, `useLocation` | File-based under `app/`, `<Link href="">`, `useRouter`, `usePathname` |
| Auth redirect | `<Navigate to="/" />` | `redirect()` (server) or `router.replace('/')` (client); middleware for /dashboard |
| Entry | `index.js` + `App.js` | `app/layout.tsx` + `app/**/page.tsx` |
| Styles | Single `index.css` + Tailwind | Import in `app/layout.tsx`; Tailwind in `tailwind.config` |
| Supabase | `@supabase/supabase-js` only | Prefer `@supabase/ssr` + `createBrowserClient` for client, `createServerClient` in middleware |

---

## Checklist (implementation order)

- [ ] Phase 1: Create `frontend-next`, `.env.local` with `NEXT_PUBLIC_*`, path alias.
- [ ] Phase 2: Copy and adapt `globals.css` and `styles/tokens.css`; optional `next/font` for Inter/Manrope.
- [ ] Phase 3: Root layout with `AuthProvider`; copy and update `AuthContext` and Supabase client (env + `@supabase/ssr`).
- [ ] Phase 4: Add all `app/**/page.tsx` and `app/dashboard/layout.tsx` (structure only; components can be stubs initially).
- [ ] Phase 5: API client and dashboard API env renames; Supabase client; replace React Router with Next navigation and add `'use client'` where needed; update `ProtectedRoute` and auth callback.
- [ ] Phase 6: Middleware for `/dashboard` protection using Supabase session.
- [ ] Phase 7: Copy all components and pages; fix imports and client boundaries; install/remove deps.
- [ ] Phase 8: Build, fix errors, and test all routes and auth flow.

---

## Timeline (estimate)

| Phase | Focus | Estimate |
|-------|--------|----------|
| 1–2 | Setup + styles | 0.5 day |
| 3–4 | Layout + routes skeleton | 0.5 day |
| 5 | API, auth, router replacement | 1–2 days |
| 6 | Middleware | 0.25 day |
| 7 | Components and pages | 2–3 days |
| 8 | Build and test | 1 day |
| **Total** | | **5–8 days** |

---

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth with Next.js (SSR)](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Tailwind](https://tailwindcss.com/docs/guides/nextjs)
