-- SQL Migration to add Razorpay Payment columns to orders table in Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/oriibywxhetfpcpstdyk/sql

ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Comment for clarity
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (razorpay or cod)';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status (pending, paid, failed, refunded)';
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay Order ID (order_xxx)';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay Payment ID (pay_xxx)';
