-- Fix: Ensure all authenticated users can view hotels and create bookings
-- Run this in Supabase SQL Editor

-- 1. Fix hotels table RLS - allow public to view verified hotels
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified hotels" ON public.hotels;
DROP POLICY IF EXISTS "Anyone can view verified hotels" ON public.hotels;

CREATE POLICY "Anyone can view verified hotels" ON public.hotels
  FOR SELECT USING (status = 'verified');

-- 2. Fix bookings table RLS - allow users to view own bookings and create new ones
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create bookings (for themselves)
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can cancel their own bookings
CREATE POLICY "Users can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. Fix hotel_images RLS - allow public to view
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hotel images" ON public.hotel_images;

CREATE POLICY "Public can view hotel images" ON public.hotel_images
  FOR SELECT USING (true);

-- 4. Fix users table RLS for new signups
-- Make sure the trigger can create user profiles
DROP POLICY IF EXISTS "Enable insert for users" ON public.users;
DROP POLICY IF EXISTS "Allow insert for new users" ON public.users;

-- Allow insert for authenticated users (during signup)
CREATE POLICY "Allow insert for new users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify all policies are correct
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('hotels', 'bookings', 'hotel_images', 'users')
ORDER BY tablename, policyname;

-- Test: Show count of accessible hotels
SELECT 'Verified hotels accessible to all: ' || COUNT(*)::text as result 
FROM public.hotels 
WHERE status = 'verified';
