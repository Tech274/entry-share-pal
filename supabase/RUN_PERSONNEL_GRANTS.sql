-- Apply grants needed for Personnel tables (run in Supabase SQL Editor)
-- Use when you see "permission denied" or RLS errors while adding clients/personnel.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_managers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_managers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_managers TO anon, authenticated;
