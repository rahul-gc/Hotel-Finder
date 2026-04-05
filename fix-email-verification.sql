-- FIX: Email verification not sending - Auto-confirm users for development
-- Run this in Supabase SQL Editor

-- Option 1: Auto-confirm all new users (for development only)
-- This bypasses email verification

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_name TEXT;
  v_role TEXT;
BEGIN
  -- Extract metadata with fallbacks
  v_username := COALESCE(NEW.raw_user_meta_data->>'username', NULL);
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email, 'User');
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  
  -- Auto-confirm the email immediately
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE id = NEW.id;
  
  -- Insert or update user profile with verified status
  INSERT INTO public.users (id, email, username, name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_name,
    v_role,
    true  -- Auto-verify
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.users.username),
    name = COALESCE(EXCLUDED.name, public.users.name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    is_verified = true,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Option 2: Manually confirm existing unverified users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

UPDATE public.users 
SET is_verified = true 
WHERE is_verified = false;

-- Verify the fix
SELECT 'Auto-confirmation enabled!' as status;

-- Show unverified users count (should be 0)
SELECT 'Unverified users: ' || COUNT(*)::text as result 
FROM public.users 
WHERE is_verified = false;
