-- Fix overly permissive RLS policy - remove the UPDATE policy since 
-- tracking updates will be done via edge function with service role key
DROP POLICY IF EXISTS "Service role can update tracking" ON public.catalog_share_tracking;