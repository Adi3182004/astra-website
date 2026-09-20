-- Fix orders INSERT RLS policies to allow both guest and authenticated users
-- to place orders via Razorpay online payment

-- Drop all existing insert policies to start fresh
DROP POLICY IF EXISTS "insert order any" ON public.orders;
DROP POLICY IF EXISTS "guest can insert order" ON public.orders;
DROP POLICY IF EXISTS "user can insert own order" ON public.orders;

-- Allow anonymous (guest) users to insert orders where user_id IS NULL
CREATE POLICY "guest can insert order" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- Allow authenticated users to insert orders where user_id matches auth.uid() OR is NULL
-- This covers both logged-in and guest-at-checkout scenarios
CREATE POLICY "user can insert own order" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Ensure grants are in place
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
