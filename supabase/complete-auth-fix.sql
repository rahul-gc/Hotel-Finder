-- COMPLETE AUTH FIX FOR HOTELFINDER
-- Run this entire file in Supabase SQL Editor

-- ============================================================================
-- 1. FIX USERS TABLE - Ensure all required columns exist
-- ============================================================================

-- Add missing columns to users table if they don't exist
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'hotel_owner', 'admin')),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure email column exists and is unique
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email TEXT NOT NULL UNIQUE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- 2. FIX RLS POLICIES FOR USERS TABLE
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for users" ON public.users;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Public can view user names" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- Policy 1: Allow authenticated users to insert their own profile
-- This is needed for the trigger to work via SECURITY DEFINER
CREATE POLICY "Allow users to insert own profile" 
  ON public.users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow service role to manage all users (bypasses RLS)
-- This helps the trigger function work properly
CREATE POLICY "Service role manages users" 
  ON public.users 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Policy 3: Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 5: Allow public to view limited user info (for hotel listings)
CREATE POLICY "Public can view user names" 
  ON public.users 
  FOR SELECT 
  TO anon 
  USING (true);

-- ============================================================================
-- 3. FIX DATABASE TRIGGER FOR NEW USER CREATION
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
  new_name TEXT;
  user_role TEXT;
BEGIN
  -- Generate username from email or metadata
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    SPLIT_PART(NEW.email, '@', 1),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );
  
  -- Make username unique if needed
  IF EXISTS (SELECT 1 FROM public.users WHERE username = new_username) THEN
    new_username := new_username || '_' || SUBSTRING(NEW.id::TEXT, 1, 4);
  END IF;
  
  -- Get name from metadata or email
  new_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(NEW.email, '@', 1),
    'User'
  );
  
  -- Get role from metadata or default to 'user'
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'user'
  );
  
  -- Insert the new user profile
  INSERT INTO public.users (
    id,
    email,
    username,
    name,
    role,
    is_verified,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    new_username,
    new_name,
    user_role,
    CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN true
      WHEN NEW.app_metadata->>'provider' = 'google' THEN true
      ELSE false
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    username = COALESCE(public.users.username, EXCLUDED.username),
    name = COALESCE(public.users.name, EXCLUDED.name),
    role = COALESCE(public.users.role, EXCLUDED.role),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. CREATE TRIGGER FOR USER UPDATES (sync email changes)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_update();

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    is_verified = CASE 
      WHEN NEW.email_confirmed_at IS NOT NULL THEN true
      ELSE is_verified
    END,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_user_update trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================================================
-- 5. VERIFY AND FIX EXISTING AUTH USERS (create profiles for any missing)
-- ============================================================================

-- Insert profiles for any auth users that don't have one
INSERT INTO public.users (id, email, username, name, role, is_verified, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'username',
    au.raw_user_meta_data->>'preferred_username',
    SPLIT_PART(au.email, '@', 1) || '_' || SUBSTRING(au.id::TEXT, 1, 4),
    'user_' || SUBSTRING(au.id::TEXT, 1, 8)
  ) as username,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1),
    'User'
  ) as name,
  COALESCE(au.raw_user_meta_data->>'role', 'user') as role,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN true
    WHEN au.raw_app_meta_data->>'provider' = 'google' THEN true
    ELSE false
  END as is_verified,
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================================================
-- 6. OTHER TABLE RLS POLICIES (for completeness)
-- ============================================================================

-- Hotels table policies
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view verified hotels" ON public.hotels;
CREATE POLICY "Anyone can view verified hotels" 
  ON public.hotels FOR SELECT USING (status = 'verified');

DROP POLICY IF EXISTS "Allow owners to update their hotels" ON public.hotels;
CREATE POLICY "Allow owners to update their hotels" 
  ON public.hotels FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Allow owners to delete their hotels" ON public.hotels;
CREATE POLICY "Allow owners to delete their hotels" 
  ON public.hotels FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Bookings table policies
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" 
  ON public.bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" 
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" 
  ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Hotel images policies
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hotel images" ON public.hotel_images;
CREATE POLICY "Public can view hotel images" 
  ON public.hotel_images FOR SELECT USING (true);

-- ============================================================================
-- 7. VERIFICATION QUERIES (run these to check everything is working)
-- ============================================================================

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check trigger exists
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');

-- Check users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count user profiles vs auth users (should match)
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count;

-- Show any auth users without profiles (should return 0 rows)
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

SELECT 'Auth fix completed successfully!' as status;
