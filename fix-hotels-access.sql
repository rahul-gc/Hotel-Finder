-- URGENT FIX: New users can't access hotels - Fix RLS policies
-- Run this in Supabase SQL Editor immediately

-- ==================== HOTELS TABLE ====================
-- Enable RLS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on hotels
DROP POLICY IF EXISTS "Public can view verified hotels" ON public.hotels;
DROP POLICY IF EXISTS "Anyone can view verified hotels" ON public.hotels;
DROP POLICY IF EXISTS "Public read access" ON public.hotels;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.hotels;
DROP POLICY IF EXISTS "Allow public read access" ON public.hotels;

-- Create policy: Allow EVERYONE (including anonymous) to read verified hotels
CREATE POLICY "Allow public read access" ON public.hotels
  FOR SELECT 
  TO PUBLIC
  USING (status = 'verified');

-- ==================== HOTEL_IMAGES TABLE ====================
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view hotel images" ON public.hotel_images;
DROP POLICY IF EXISTS "Allow public read access" ON public.hotel_images;

-- Allow everyone to view hotel images
CREATE POLICY "Allow public read access" ON public.hotel_images
  FOR SELECT 
  TO PUBLIC
  USING (true);

-- ==================== BOOKINGS TABLE ====================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

-- Drop existing policies with exact names
DROP POLICY IF EXISTS "Allow users to view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow users to create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow users to update own bookings" ON public.bookings;

-- Allow authenticated users to view their own bookings
CREATE POLICY "Allow users to view own bookings" ON public.bookings
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to create bookings
CREATE POLICY "Allow users to create bookings" ON public.bookings
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update (cancel) their own bookings
CREATE POLICY "Allow users to update own bookings" ON public.bookings
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== USERS TABLE ====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies with exact names
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to create profile" ON public.users;

-- Allow users to view their own profile
CREATE POLICY "Allow users to view own profile" ON public.users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- Allow insert during signup (trigger uses security definer)
CREATE POLICY "Allow trigger to create profile" ON public.users
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- ==================== VERIFY FIX ====================
SELECT 'RLS Policies Fixed!' as status;

-- Show all current policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('hotels', 'bookings', 'hotel_images', 'users')
ORDER BY tablename, policyname;

-- Test: Count hotels visible to public
SELECT 'Hotels visible: ' || COUNT(*)::text as result 
FROM public.hotels 
WHERE status = 'verified';
