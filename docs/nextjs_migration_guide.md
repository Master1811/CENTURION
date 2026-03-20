# 100Cr Engine - Next.js Migration Guide

**Last Updated:** March 20, 2026  
**Current State:** React 18 CRA + Craco  
**Target State:** Next.js 14+ App Router

---

## Current State (as of this guide)

- **Frontend**: Create React App (CRA) with **CRACO** (`craco start` / `craco build`), not plain `react-scripts`.
- **Routing**: React Router v7 (`react-router-dom`); no Next.js exists in the repo.
- **Auth**: Supabase (Magic Link + Google OAuth); session in memory + `AuthContext`; API client uses `localStorage.getItem('auth_token')`.
- **Styling**: Tailwind + `src/index.css` (fonts, Tailwind, `@import './styles/tokens.css'`); `App.css` is effectively empty.
- **Path alias**: `@/` -> `src/` via `jsconfig.json`.
- **Backend**: FastAPI at `REACT_APP_BACKEND_URL`; all API calls go to `${BACKEND_URL}/api/...`. Keep backend separate; do not move engine logic into Next.js API routes for this migration.

### Exact route map (from `frontend/src/App.js`)

| Route | Page/Component | Auth |
|-------|----------------|------|
| `/` | `LandingPage` | Public |
| `/pricing` | `PricingPage` | Public |
| `/privacy` | `PrivacyPage` | Public (NEW) |
| `/auth/callback` | `AuthCallback` | Public |
| `/tools` | Redirect -> `/tools/100cr-calculator` | Public |
| `/tools/100cr-calculator` | `HundredCrCalculator` | Public |
| `/tools/arr-calculator` | `ARRCalculator` | Public |
| `/tools/runway-calculator` | `RunwayCalculator` | Public |
| `/tools/growth-calculator` | `GrowthCalculator` | Public |
| `/preview/*` | `PreviewPages` exports | Public (screenshots) |
| `/checkout` | `CheckoutPage` | Auth Only |
| `/admin` | `AdminDashboard` | Admin Only (NEW) |
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
| `*` | Redirect -> `/` | - |

### Environment variables (current -> Next.js)

| Current (CRA) | Next.js | Used in |
|---------------|---------|--------|
| `REACT_APP_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.js` |
| `REACT_APP_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/client.js` |
| `REACT_APP_BACKEND_URL` | `NEXT_PUBLIC_BACKEND_URL` | `lib/api/client.js`, `lib/api/dashboard.js`, `context/AuthContext.jsx` |
| `REACT_APP_ADMIN_EMAILS` | `NEXT_PUBLIC_ADMIN_EMAILS` | `components/auth/ProtectedRoute.jsx` (NEW) |
| `REACT_APP_SENTRY_DSN` | `NEXT_PUBLIC_SENTRY_DSN` | `lib/sentry.js` (NEW) |

### Files that use React Router (must switch to Next.js navigation)

- `App.js` - remove; replaced by `app/` routes and layout.
- `pages/dashboard/DashboardLayout.jsx` - `Outlet`, `Link`, `useLocation`, `Navigate`.
- `components/dashboard/DashboardSidebar.jsx` - `Link`, `useLocation`.
- `components/auth/ProtectedRoute.jsx` - `Navigate`, `useLocation`, `useMemo` for admin check.
- `components/layout/Navbar.jsx` - `Link`, `useNavigate`, `useLocation`.
- `components/layout/Footer.jsx` - `Link`.
- `components/landing/*.jsx` - Various `useNavigate` usage.
- `pages/AuthCallback.jsx` - `useNavigate`, `useSearchParams`.
- `pages/admin/AdminDashboard.jsx` - `useNavigate` (NEW).

---

## Migration strategy

- Create a **new** Next.js app (e.g. `frontend-next`) beside `frontend`. Migrate in phases; keep CRA running until the new app is verified.
- Use **App Router** and **TypeScript** for new code; existing JSX can stay as `.jsx` until you opt to convert.
- Keep the **FastAPI backend** as-is; only the frontend and env var names change.

---

## Phase 1: Next.js project setup

**1.1 Create the app (from repo root)**

```bash
npx create-next-app@latest frontend-next --typescript --tailwind --eslint --app --src-dir
```

When prompted for the import alias, choose `@/*` -> `./src/*` so it matches the current `frontend` setup.

**1.2 Environment variables**

Create `frontend-next/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=<same value as REACT_APP_SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same value as REACT_APP_SUPABASE_ANON_KEY>
NEXT_PUBLIC_BACKEND_URL=<same value as REACT_APP_BACKEND_URL>
NEXT_PUBLIC_ADMIN_EMAILS=<same value as REACT_APP_ADMIN_EMAILS>
NEXT_PUBLIC_SENTRY_DSN=<same value as REACT_APP_SENTRY_DSN>
```

Do not use `REACT_APP_*` in the Next app.

**1.3 Path alias**

Ensure `frontend-next/tsconfig.json` has:

```json
"paths": {
  "@/*": ["./src/*"]
}
```

---

## Phase 2: Global styles and tokens

**2.1 Copy global CSS**

- Copy `frontend/src/index.css` -> `frontend-next/src/app/globals.css`
- Copy `frontend/src/styles/tokens.css` -> `frontend-next/src/styles/tokens.css`
- Update import paths as needed

**2.2 Fonts**

Current `index.css` uses Google Fonts (Manrope, Inter, JetBrains Mono). For Next.js, prefer `next/font`:

```tsx
// app/layout.tsx
import { Inter, Manrope } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
```

---

## Phase 3: Root layout and providers

**3.1 Root layout (`app/layout.tsx`)**

```tsx
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: '100Cr Engine - When Will You Reach 100 Crore?',
  description: 'Revenue milestone prediction for Indian founders',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
```

**3.2 AuthProvider and Supabase client**

- Copy `frontend/src/context/AuthContext.jsx` to `frontend-next/src/context/AuthContext.jsx`
- Replace `process.env.REACT_APP_*` with `process.env.NEXT_PUBLIC_*`
- For Next.js, prefer `@supabase/ssr` and create a **browser** client for client components
- Install: `npm i @supabase/ssr`

---

## Phase 4: File-based routes (App Router)

Create the following **pages** so URLs match the current app:

**4.1 Public pages**

- `app/page.tsx` -> `<LandingPage />`
- `app/pricing/page.tsx` -> `<PricingPage />`
- `app/privacy/page.tsx` -> `<PrivacyPage />` (NEW)
- `app/auth/callback/page.tsx` -> `<AuthCallback />`

**4.2 Tools (public)**

- `app/tools/page.tsx` - redirect to `/tools/100cr-calculator`
- `app/tools/100cr-calculator/page.tsx` -> `<HundredCrCalculator />`
- `app/tools/arr-calculator/page.tsx` -> `<ARRCalculator />`
- `app/tools/runway-calculator/page.tsx` -> `<RunwayCalculator />`
- `app/tools/growth-calculator/page.tsx` -> `<GrowthCalculator />`

**4.3 Admin (protected - NEW)**

- `app/admin/page.tsx` -> `<AdminDashboard />`

**4.4 Dashboard (protected)**

- `app/dashboard/layout.tsx` - layout with `<DashboardSidebar />` and main content area
- `app/dashboard/page.tsx` -> `<CommandCentre />`
- `app/dashboard/revenue/page.tsx` -> `<RevenueIntelligence />`
- `app/dashboard/forecasting/page.tsx` -> `<ForecastingEngine />`
- `app/dashboard/benchmarks/page.tsx` -> `<BenchmarkIntelligence />`
- `app/dashboard/reports/page.tsx` -> `<ReportingEngine />`
- `app/dashboard/coach/page.tsx` -> `<AIGrowthCoach />`
- `app/dashboard/goals/page.tsx` -> `<GoalArchitecture />`
- `app/dashboard/investors/page.tsx` -> `<InvestorRelations />`
- `app/dashboard/connectors/page.tsx` -> `<Connectors />`
- `app/dashboard/settings/page.tsx` -> `<Settings />`

**4.5 Checkout (auth-only)**

- `app/checkout/page.tsx` -> `<CheckoutPage />`

---

## Phase 5: Component and API client updates

**5.1 API and env renames**

- Copy `frontend/src/lib/api/client.js` and `frontend/src/lib/api/dashboard.js`
- Replace `REACT_APP_BACKEND_URL` with `NEXT_PUBLIC_BACKEND_URL`

**5.2 Supabase client**

- Copy `frontend/src/lib/supabase/client.js`
- Replace env vars with `NEXT_PUBLIC_*` versions
- Use `@supabase/ssr` `createBrowserClient`

**5.3 React Router -> Next.js navigation**

| Current | Next.js |
|---------|---------|
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `const navigate = useNavigate(); navigate('/path')` | `const router = useRouter(); router.push('/path')` |
| `import { Link, useLocation } from 'react-router-dom'` | `import Link from 'next/link'; import { usePathname } from 'next/navigation'` |
| `<Link to="/path">` | `<Link href="/path">` |
| `useLocation().pathname` | `usePathname()` |
| `useLocation().state` | Use searchParams or context |
| `<Navigate to="/" replace />` | `redirect()` (server) or `router.replace('/')` (client) |

**5.4 Client components**

Any component that uses `useState`, `useEffect`, `useRouter`, `usePathname`, or event handlers must be a Client Component. Add at top:

```tsx
'use client';
```

**5.5 ProtectedRoute behavior**

- Remove dependency on React Router's `Navigate` and `useLocation`
- Use `useAuth()` and `useRouter()` for redirects
- Admin check: Compare user email against `NEXT_PUBLIC_ADMIN_EMAILS`
- Silent redirect for non-admins (security through obscurity)

**5.6 Dashboard layout**

- Replace `<Outlet />` with `{children}` in `app/dashboard/layout.tsx`
- Use `usePathname()` instead of `useLocation().pathname`

---

## Phase 6: Middleware (protected routes)

Create `frontend-next/src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => response.cookies.set({ name, value, ...options }),
        remove: (name, options) => response.cookies.set({ name, value: '', ...options }),
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/?login=true', request.url));
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email?.toLowerCase() || '')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/checkout'],
};
```

---

## Phase 7: Copy and wire the rest of the UI

**7.1 Copy in order**

1. **lib**: `lib/utils.js`, `lib/copy.js`, `lib/engine/*`, `lib/sentry.js`
2. **context**: `AuthContext.jsx`
3. **components**: All folders - update router/link/pathname and add `'use client'`
4. **pages**: Map to `app/*` structure

**7.2 New components to migrate**

| Component | Purpose | Notes |
|-----------|---------|-------|
| `CookieConsentBanner.jsx` | DPDP compliance | Client component |
| `WaitlistSection.jsx` | Beta waitlist | Client component |
| `AdminDashboard.jsx` | Super admin panel | Client component, admin-only |
| `PrivacyPage.jsx` | Privacy policy | Can be server component |

**7.3 Dependencies**

- Install: Radix, Framer Motion, Lucide, Recharts, `@supabase/ssr`, `@sentry/nextjs`
- Remove: `react-router-dom`, `react-scripts`, `craco`, `cra-template`

---

## Phase 8: Sentry Integration

**8.1 Install**

```bash
npx @sentry/wizard@latest -i nextjs
```

**8.2 Configure**

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
});
```

---

## Phase 9: Build and test

```bash
cd frontend-next
npm run build
npm run start
```

**Test checklist:**
- [ ] `/` - Landing page loads
- [ ] `/pricing` - Pricing page loads
- [ ] `/privacy` - Privacy page loads (NEW)
- [ ] `/auth/callback` - Magic link works
- [ ] `/tools/100cr-calculator` - Calculator works
- [ ] `/checkout` - Redirects when logged out
- [ ] `/admin` - Redirects non-admins (NEW)
- [ ] `/dashboard` - Redirects when logged out, loads when logged in
- [ ] All dashboard sub-routes work
- [ ] Cookie consent banner appears
- [ ] DPDP consent checkbox required in auth modal

---

## Breaking changes summary

| Area | CRA / React Router | Next.js |
|------|--------------------|---------|
| Env | `REACT_APP_*` | `NEXT_PUBLIC_*` (client-visible) |
| Routing | `<Routes>`, `<Link to="">`, `useNavigate`, `useLocation` | File-based under `app/`, `<Link href="">`, `useRouter`, `usePathname` |
| Auth redirect | `<Navigate to="/" />` | `redirect()` (server) or `router.replace('/')` (client); middleware for protected routes |
| Entry | `index.js` + `App.js` | `app/layout.tsx` + `app/**/page.tsx` |
| Styles | Single `index.css` + Tailwind | Import in `app/layout.tsx` |
| Supabase | `@supabase/supabase-js` only | Prefer `@supabase/ssr` |
| Error tracking | Manual Sentry init | `@sentry/nextjs` with auto-instrumentation |

---

## New routes to add (March 2026 updates)

| Route | Component | Protection | Purpose |
|-------|-----------|------------|---------|
| `/privacy` | `PrivacyPage` | Public | DPDP compliance |
| `/admin` | `AdminDashboard` | Admin-only | System monitoring |

---

## Checklist (implementation order)

- [ ] Phase 1: Create `frontend-next`, `.env.local` with `NEXT_PUBLIC_*`, path alias
- [ ] Phase 2: Copy and adapt `globals.css` and `styles/tokens.css`; `next/font` for Inter/Manrope
- [ ] Phase 3: Root layout with `AuthProvider`; copy and update `AuthContext` and Supabase client
- [ ] Phase 4: Add all `app/**/page.tsx` including `/privacy` and `/admin`
- [ ] Phase 5: API client env renames; Supabase client; replace React Router; add `'use client'`
- [ ] Phase 6: Middleware for `/dashboard` and `/admin` protection
- [ ] Phase 7: Copy all components including `CookieConsentBanner`, `WaitlistSection`, `AdminDashboard`
- [ ] Phase 8: Configure Sentry with `@sentry/nextjs`
- [ ] Phase 9: Build, fix errors, and test all routes and auth flow

---

## Estimated effort

| Phase | Focus | Estimate |
|-------|-------|----------|
| 1-2 | Setup + styles | 0.5 day |
| 3-4 | Layout + routes skeleton | 0.5 day |
| 5 | API, auth, router replacement | 1-2 days |
| 6 | Middleware | 0.25 day |
| 7 | Components and pages | 2-3 days |
| 8 | Sentry | 0.25 day |
| 9 | Build and test | 1 day |
| **Total** | | **5-8 days** |

---

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth with Next.js (SSR)](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Tailwind](https://tailwindcss.com/docs/guides/nextjs)
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

*Last updated: March 20, 2026*
