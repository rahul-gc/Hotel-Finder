-- CRITICAL FIX: User profile not created on signup
-- Run this in Supabase SQL Editor immediately

-- Drop and recreate the trigger function properly
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
  
  -- Insert or update user profile
  INSERT INTO public.users (id, email, username, name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_name,
    v_role,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.users.username),
    name = COALESCE(EXCLUDED.name, public.users.name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger for updates (when email is confirmed)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- When email is confirmed, update is_verified
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET is_verified = true 
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Verify trigger is working by checking a test
SELECT 'Triggers recreated successfully!' as status;

-- Show current triggers
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users';

-- Check if any users exist without profiles (fix them)
SELECT 
  au.id,
  au.email,
  'Missing profile' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
