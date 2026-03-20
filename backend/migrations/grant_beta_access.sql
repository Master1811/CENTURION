-- ============================================================================
-- Grant Beta Access to User
-- ============================================================================
-- Run this SQL to grant beta access to a specific user.
-- Replace 'your-user-email@example.com' with the actual email address.
--
-- Run in Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- ============================================================================

-- Option 1: Grant beta access by email (RECOMMENDED)
-- Replace the email address below with your actual email
UPDATE public.profiles
SET 
  beta_status = 'active',
  beta_expires_at = NOW() + INTERVAL '60 days',
  updated_at = NOW()
WHERE email = 'your-user-email@example.com';

-- Verify the update worked
SELECT id, email, beta_status, beta_expires_at 
FROM public.profiles 
WHERE email = 'your-user-email@example.com';


-- ============================================================================
-- Option 2: Grant beta access by user ID
-- ============================================================================
-- If you have the user's UUID from auth.users:
-- 
-- UPDATE public.profiles
-- SET 
--   beta_status = 'active',
--   beta_expires_at = NOW() + INTERVAL '60 days',
--   updated_at = NOW()
-- WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';


-- ============================================================================
-- Option 3: Grant beta to ALL existing users (bulk beta launch)
-- ============================================================================
-- WARNING: This grants beta to everyone - use carefully!
--
-- UPDATE public.profiles
-- SET 
--   beta_status = 'active',
--   beta_expires_at = NOW() + INTERVAL '60 days',
--   updated_at = NOW()
-- WHERE beta_status IS NULL OR beta_status = 'inactive';


-- ============================================================================
-- Useful queries for debugging
-- ============================================================================

-- List all users with their beta status:
-- SELECT id, email, beta_status, beta_expires_at, created_at
-- FROM public.profiles
-- ORDER BY created_at DESC;

-- Find users whose beta has expired:
-- SELECT id, email, beta_status, beta_expires_at
-- FROM public.profiles
-- WHERE beta_status = 'active' 
--   AND beta_expires_at < NOW();

-- Check if a specific user exists in profiles:
-- SELECT EXISTS(
--   SELECT 1 FROM public.profiles WHERE email = 'test@example.com'
-- ) as profile_exists;
