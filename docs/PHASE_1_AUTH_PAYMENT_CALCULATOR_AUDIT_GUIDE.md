# Phase 1 Audit Guide (Read-only)

This guide captures the **Phase 1 — Audit (READ ONLY)** results for Centurion — 100Cr Engine, focused on auth, payments, calculator gating, dashboard free vs paid behavior, and onboarding.

It is intended to be a precise reference for what is implemented vs missing/broken today.

---

## AUDIT REPORT
============

1. AUTH FLOW STATUS
   - Current state (working / partially broken / broken)
     - Current state: **Partially broken**
   - redirectIntent: exists or not
     - redirectIntent: **Exists (but is not honored)**
   - Post-auth routing: where does every CTA land
     - On successful auth in `AuthCallback`, user always routes to **`/dashboard`**.
   - Specific broken lines with file + line number
     - `frontend/src/components/auth/ProtectedRoute.jsx`:
       - Lines **39-42**: stores attempted URL in `Navigate` state:
         - `Navigate to="/" state={{ from: location, authRequired: true }} replace`
     - `frontend/src/pages/AuthCallback.jsx`:
       - Lines **21-25**: dev-mode mock auth routes to `/dashboard`
       - Lines **40-44**: success route always `navigate('/dashboard')` (ignores intent)

2. PAYMENT FLOW STATUS
   - Razorpay integration: exists or not
     - Razorpay integration: **Not implemented**
   - Stripe integration: exists or not
     - Stripe integration: **Not implemented**
   - /checkout page: exists or not
     - /checkout page: **Does not exist**
   - Webhook endpoint: exists or not
     - Webhook endpoints: **Does not exist**
   - What happens when user clicks paid CTA today
     - User lands on `/pricing` and the Founder CTA placeholder does not start a payment flow.
   - Specific missing files and functions
     - Missing backend router(s): no `/api/payments/*` and no `/api/webhooks/*`
     - Missing frontend routes: no `/checkout`, no `/payment/success`, no `/payment/cancel`
     - Placeholder Founder's CTA click handler:
       - `frontend/src/components/landing/PricingSection.jsx`:
         - Lines **120-132**: `onClick={() => {/* Razorpay payment link will go here */}}`

3. CALCULATOR GATE STATUS
   - Post-result save CTA: exists or not
     - Post-result save CTA: **No (Share/Download are UI-only)**
   - Auth trigger from calculator: exists or not
     - Auth trigger from calculator: **Does not exist**
   - What a user can do after seeing their result
     - User can only view the milestone/cards and charts (local engine output).
     - Share/Download buttons don’t persist/share via backend.
   - Exact evidence
     - `frontend/src/pages/tools/HundredCrCalculator.jsx`:
       - Share projection button: Lines **427-440** (no handler)
       - Download PDF button: Lines **441-452** (no handler)

4. DASHBOARD FREE VS PAID STATUS
   - How free users are identified
     - Free vs paid is not enforced by the frontend route guard (dashboard is protected only by auth).
     - Subscription gating is enforced by backend `require_paid_subscription`, but UI upgrade prompting is incomplete.
   - What free users see vs paid users
     - Backend calls for paid endpoints fail for free users; `CommandCentre` falls back to `fallbackData`.
   - UpgradeModal trigger conditions
     - `UpgradeModal` triggers only when error status is `429` in `CommandCentre`.
   - isLoggedIn = true bug: confirmed or not
     - Confirmed:
       - `frontend/src/pages/dashboard/DashboardLayout.jsx`:
         - Line **32**: `const isLoggedIn = true;`

5. SETTINGS SAVE BUG
   - Exact confirmation of bug
     - No confirmed save bug in the current code after auditing `Settings.jsx`.
   - handleSaveProfile code (paste exact lines)
     - `frontend/src/pages/dashboard/Settings.jsx`:
       - Lines **661-684**:
         - `const handleSaveProfile = async (data) => {`
         - `  const profileData = {`
         - `    name: data.fullName || data.name,`
         - `    company: data.company,`
         - `    stage: data.stage,`
         - `  };`
         - `  const accessToken = getAccessToken();`
         - `  if (!accessToken) { throw new Error('Not authenticated'); }`
         - `  const result = await updateUserProfile(accessToken, profileData);`
         - `  if (refreshProfile) { await refreshProfile(); }`
         - `  return result;`
         - `};`
   - updateUserProfile: exists in dashboard.js or not
     - Yes:
       - `frontend/src/lib/api/dashboard.js`:
         - Lines **58-63**:
           - PUT `/api/user/profile` with JSON body `profileData`

6. ONBOARDING STATUS
   - First-login flow: exists or not
     - Backend endpoint exists, but frontend does not appear to call it automatically on first login.
   - Data collected: what is and is not gathered
     - Frontend does not gather business fields at first-login for calling `/api/user/onboarding`.
     - Frontend includes a dashboard UX walkthrough tour (`OnboardingTour`) driven by localStorage, not backend onboarding.
   - Evidence
     - Backend endpoint:
       - `backend/main.py` lines **220-250**: `@user_router.post("/onboarding")`
     - Frontend API method exists:
       - `frontend/src/lib/api/dashboard.js` lines **65-70**
     - Frontend search evidence:
       - No call sites found in `frontend/src` beyond the method definition.

7. COMPLETE BROKEN FLOW MAP
   Format as step-by-step journey showing exactly where each user path breaks today:

   FREE USER PATH:
   Step 1: Visit `/dashboard` while authenticated but NOT subscribed → **✓**
   Step 2: Command Centre loads dashboard overview → **✗**
   Step 3: User clicks “Monthly Check-in” → **✗** (backend write rejected due to paid subscription requirement)

   PAID INTENT PATH:
   Step 1: User clicks “Upgrade to Founder Plan” → routes to `/pricing` → **✓**
   Step 2: User clicks Founder CTA on `/pricing` → payment flow placeholder → **✗**

   CALCULATOR PATH:
   Step 1: User runs projection in HundredCrCalculator → **✓**
   Step 2: User clicks “Share projection” → **✗** (no handler, no backend share)
   Step 3: User clicks “Download PDF” → **✗** (no handler)

8. PRIORITISED FIX LIST
   List every fix needed, ordered by impact:
   Format: [CRITICAL/HIGH/MEDIUM] filename — what is broken — what the fix is

   [CRITICAL] `frontend/src/components/landing/PricingSection.jsx` — Founder CTA does not start any checkout/payment flow — wire CTA to real checkout (or route to auth + checkout).
   [CRITICAL] `backend/*` — No `/api/webhooks/*` registered and no `/api/payments/*` — implement checkout + webhook verification and connect to subscription activation.
   [HIGH] `frontend/src/pages/AuthCallback.jsx` — redirect intent state is ignored; always redirects to `/dashboard` — honor stored intended destination after auth.
   [HIGH] `frontend/src/pages/dashboard/CommandCentre.jsx` — UpgradeModal triggers only on 429, not on subscription-denied failures (e.g. 403) — show UpgradeModal on forbidden/subscription-required errors.
   [HIGH] `frontend/src/pages/tools/HundredCrCalculator.jsx` — Share/Download buttons have no handlers; no save/track CTA — implement share/save via backend or remove broken CTAs until ready.
   [MEDIUM] `frontend/src/pages/dashboard/DashboardLayout.jsx` — `isLoggedIn = true` bypasses real gating logic — remove placeholder and rely on AuthContext + ProtectedRoute.
   [MEDIUM] `frontend/src/lib/api/dashboard.js` + onboarding UX — backend onboarding endpoint exists but frontend doesn’t call it — add first-login onboarding UI or hook into first dashboard visit.

