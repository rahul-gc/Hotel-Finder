-- Database Schema Updates for Authentication System
-- Run this in Supabase SQL Editor

-- 1. Add username field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- 2. Ensure hotels table has owner_id for linking
-- Check if owner_id column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.hotels ADD COLUMN owner_id UUID REFERENCES public.users(id);
  END IF;
END $$;

-- Create index for owner lookups
CREATE INDEX IF NOT EXISTS idx_hotels_owner ON public.hotels(owner_id);

-- 3. Update RLS policies for hotels to allow owners to edit their hotels
DROP POLICY IF EXISTS "Hotel owners can edit their hotels" ON public.hotels;
DROP POLICY IF EXISTS "Allow owners to update their hotels" ON public.hotels;

-- Allow hotel owners to update their own hotels
CREATE POLICY "Allow owners to update their hotels" ON public.hotels
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = owner_id);

-- Allow hotel owners to delete their own hotels
DROP POLICY IF EXISTS "Allow owners to delete their hotels" ON public.hotels;

CREATE POLICY "Allow owners to delete their hotels" ON public.hotels
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = owner_id);

-- 4. Update trigger to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NULL),
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, public.users.username),
    name = COALESCE(EXCLUDED.name, public.users.name),
    role = COALESCE(EXCLUDED.role, public.users.role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Verify the setup
SELECT 'Schema updated successfully!' as status;

-- Show current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current hotels table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hotels' AND table_schema = 'public'
ORDER BY ordinal_position;
