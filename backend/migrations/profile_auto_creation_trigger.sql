-- ============================================================================
-- Profile Auto-Creation Trigger
-- ============================================================================
-- This trigger automatically creates a profile row when a new user signs up
-- in auth.users. This ensures users always have a profile, preventing 
-- authentication issues where a valid session exists but no profile data.
--
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- ============================================================================

-- Step 1: Create the function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    onboarding_completed,
    plan_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,
    'FREE',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Avoid errors if profile somehow exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, onboarding_completed, plan_tier, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  FALSE,
  'FREE',
  COALESCE(u.created_at, NOW()),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Verification query (run separately to check)
-- SELECT COUNT(*) as users_without_profiles 
-- FROM auth.users u 
-- LEFT JOIN public.profiles p ON p.id = u.id 
-- WHERE p.id IS NULL;

-- ============================================================================
-- Grant Permissions (if needed)
-- ============================================================================
-- Ensure the trigger function can insert into profiles
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
