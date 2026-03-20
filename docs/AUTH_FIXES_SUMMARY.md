# Authentication Fixes - Summary

## Fixes Applied (March 2026)

### 1. JWKS SSL Handling + ES256 Support (HIGH PRIORITY)
**File:** `backend/services/auth.py`

**Changes:**
- Added SSL context bypass for JWKS client when `SKIP_SSL_VERIFY=true`
- Added support for ALL asymmetric algorithms (ES256, ES384, ES512, RS256, RS384, RS512, PS256, PS384, PS512)
- Removed invalid HS256 fallback for asymmetric tokens (would never work)
- Added proper error handling with clear error messages
- Added debug logging for token algorithm detection

**Why:** Supabase may use ES256 (not just RS256) for JWT signing. Corporate proxies can block SSL verification to Supabase's JWKS endpoint.

### 2. Auto-Create Profile on First Login (HIGH PRIORITY)
**File:** `backend/main.py` - GET `/api/user/profile` endpoint

**Changes:**
- If profile doesn't exist for authenticated user, automatically creates one
- Sets default values: `onboarding_completed=False`, `plan_tier='FREE'`
- Logs profile creation for debugging
- Returns minimal profile even if database write fails

**Why:** There's no database trigger to create profiles when users sign up via auth.users. This caused authenticated users to have null profile data.

### 3. Frontend 401 Handling (HIGH PRIORITY)
**File:** `frontend/src/context/AuthContext.jsx`

**Changes:**
- When `/api/user/profile` returns 401, frontend now:
  - Clears profile and subscription state
  - Signs out from Supabase
  - Clears user context in Sentry
- Added breadcrumbs for debugging auth issues
- Distinguishes between 401 (sign out) vs 5xx (log but don't sign out)

**Why:** Previously, 401 responses were silently ignored, leaving users in a broken state where they appeared authenticated but had no profile.

### 4. PKCE Flow Support in AuthCallback (MEDIUM PRIORITY)
**File:** `frontend/src/pages/AuthCallback.jsx`

**Changes:**
- Detects `code` parameter in URL (indicates PKCE flow)
- Calls `exchangeCodeForSession(code)` for OAuth flows
- Falls back to `getSession()` for implicit/magic link flows
- Added logging for debugging auth callback issues

**Why:** Modern Supabase uses PKCE by default for OAuth. The old code only used `getSession()` which doesn't exchange PKCE codes.

### 5. Fixed Variable Shadowing Bug
**File:** `backend/main.py`

**Changes:**
- Renamed `status` variable to `benchmark_status` in quiz submission endpoint
- This prevented shadowing of `fastapi.status` import

**Why:** Pre-existing bug that could cause runtime errors.

---

## SQL Scripts to Run in Supabase

### Script 1: Profile Auto-Creation Trigger
**File:** `backend/migrations/profile_auto_creation_trigger.sql`

This creates a database trigger that automatically creates a profile row whenever a new user signs up. Run this to prevent future profile-missing issues.

```sql
-- Run in Supabase Dashboard -> SQL Editor
-- See: backend/migrations/profile_auto_creation_trigger.sql
```

### Script 2: Grant Beta Access
**File:** `backend/migrations/grant_beta_access.sql`

This grants beta access to specific users. Edit the email address before running.

```sql
-- Run in Supabase Dashboard -> SQL Editor
-- See: backend/migrations/grant_beta_access.sql

-- Quick version:
UPDATE public.profiles
SET 
  beta_status = 'active',
  beta_expires_at = NOW() + INTERVAL '60 days',
  updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';
```

---

## Environment Variables Required

### Backend `.env`
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret  # From Supabase Dashboard -> Settings -> API -> JWT Settings

# For local development behind corporate proxy:
SKIP_SSL_VERIFY=true

CORS_ORIGINS=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Supabase Dashboard Settings to Verify

1. **Authentication -> URL Configuration -> Site URL**
   - Must match your frontend URL exactly (including protocol, no trailing slash)
   - Example: `http://localhost:3000`

2. **Authentication -> URL Configuration -> Redirect URLs**
   - Must include: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`

3. **Authentication -> Providers -> Google** (if using Google OAuth)
   - Client ID and Secret from Google Cloud Console
   - Authorized redirect URI in Google: Your Supabase callback URL

---

## Testing the Fixes

1. **Start backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8001
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

3. **Test auth flow:**
   - Go to http://localhost:3000
   - Click Sign In
   - Enter email for magic link (or use Google OAuth)
   - Check browser console for auth logs
   - Check backend logs for JWT verification logs

4. **Verify profile creation:**
   - After successful login, check Supabase Dashboard -> Table Editor -> profiles
   - New user should have a profile row automatically created
