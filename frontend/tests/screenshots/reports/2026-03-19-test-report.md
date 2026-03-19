# Test Report — Centurion Auth & Intent

**Date:** 2026-03-19  
**Environment:** localhost:3000  

## Task A — Auth callback intent routing

### Step 1 — Intent routing code (AuthCallback)

- **File:** `src/pages/AuthCallback.jsx`
- **Code that reads intent and navigates:** Uses `getRedirectPathAfterAuth()` from `@/lib/auth/intent` (after refactor). Original logic was:
  - **Mock path (lines 21–26):** `readAuthIntent()`, `clearAuthIntent()`, `redirectTo = intent?.redirectTo || '/dashboard'`, `setTimeout(() => navigate(redirectTo), 1500)`.
  - **Session success path (lines 43–48):** Same: `readAuthIntent()`, `clearAuthIntent()`, `redirectTo = intent?.redirectTo || '/dashboard'`, `setTimeout(() => navigate(redirectTo), 1500)`.
- **Refactor:** Logic moved to `getRedirectPathAfterAuth()` in `src/lib/auth/intent.js`. AuthCallback now calls `getRedirectPathAfterAuth()` and `navigate(redirectTo)`.

### Step 2 — Unit tests

- **File:** `src/lib/auth/__tests__/auth-intent-routing.test.js` (and mirror `tests/unit/auth-intent-routing.test.js`).
- **Test cases:** 4 (signin → /dashboard, upgrade → /checkout, no intent → /dashboard, expired intent → /dashboard and cleared).

### Step 4 — Unit test results

```
PASS src/lib/auth/__tests__/auth-intent-routing.test.js
  auth intent routing
    TEST CASE 1: signin intent routes to /dashboard
      ✓ returns /dashboard and clears localStorage when intent is signin
    TEST CASE 2: upgrade intent routes to /checkout
      ✓ returns /checkout and clears localStorage when intent is upgrade
    TEST CASE 3: no intent stored → default /dashboard
      ✓ returns /dashboard when localStorage has no intent
    TEST CASE 4: expired intent (>30 minutes old) → default /dashboard
      ✓ returns /dashboard and clears expired intent from localStorage

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

**Result:** All 4 test cases pass.

---

## Task B — Copy and AuthModal headline

- **Navbar CTA:** Uses `copy.nav.ctaButton` (added as `"Start free"` in `copy.js`). Replaced `copy.nav.getStarted` for the CTA button in Navbar (desktop and mobile).
- **AuthModal headline:** Accepts optional `headline` prop. When not provided, derives from `readAuthIntent()`: if `intent === 'upgrade'` then `"Create your account to continue"`, else `"Sign in to Centurion"`. No callers pass `headline`; Navbar is the only caller and derivation covers both “Start free” and Founder CTA flows.

---

## Screenshot folder structure

- `tests/screenshots/auth-flow/test1-start-free/`
- `tests/screenshots/auth-flow/test2-founder-cta/`
- `tests/screenshots/auth-flow/test3-callback/`
- `tests/screenshots/auth-flow/test4-mobile/`
- `tests/screenshots/auth-flow/test5-regression/`
- `tests/screenshots/unit/`
- `tests/screenshots/reports/`
- `tests/screenshots/` added to `.gitignore`.

---

## Task B — Playwright verification (localhost:3000)

1. **Navbar CTA label:** Button text = **"Start free"**. Expected: "Start free". **PASS**
2. **Auth modal (Start free flow):** Headline = **"Sign in to Centurion"**. Expected: "Sign in to Centurion". **PASS**
3. **Founder CTA:** Clicked; modal opened.
4. **Auth modal (Founder flow):** Headline = **"Create your account to continue"**. Expected: "Create your account to continue". **PASS**
5. **Summary:** All Task B checks **PASS**. No linter errors on touched files. Animations/layouts unchanged.
