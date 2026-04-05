-- Fix: Verify admin email in Supabase Auth
-- Run this to confirm the email so you can login immediately

-- Option 1: Mark email as confirmed in auth.users
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@new.com';

-- Option 2: Also update the public.users table
UPDATE public.users 
SET is_verified = true 
WHERE email = 'admin@new.com';

-- Verify
SELECT email, email_confirmed_at, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@new.com';
