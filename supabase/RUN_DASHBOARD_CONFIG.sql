-- Run this in Supabase Dashboard → SQL Editor (Phase 2: Configurable dashboards per role)
-- Requires update_updated_at_column() to exist (from earlier migrations). If missing, run RUN_PERSONNEL_MIGRATIONS.sql first or add the function below.

-- Optional: ensure timestamp helper exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Dashboard config table
CREATE TABLE IF NOT EXISTS public.dashboard_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  dashboard_slug TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, dashboard_slug)
);

DROP TRIGGER IF EXISTS update_dashboard_config_updated_at ON public.dashboard_config;
CREATE TRIGGER update_dashboard_config_updated_at
  BEFORE UPDATE ON public.dashboard_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dashboard_config_role ON public.dashboard_config(role);

ALTER TABLE public.dashboard_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read dashboard_config" ON public.dashboard_config;
CREATE POLICY "Allow read dashboard_config" ON public.dashboard_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert dashboard_config" ON public.dashboard_config;
CREATE POLICY "Allow insert dashboard_config" ON public.dashboard_config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update dashboard_config" ON public.dashboard_config;
CREATE POLICY "Allow update dashboard_config" ON public.dashboard_config FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete dashboard_config" ON public.dashboard_config;
CREATE POLICY "Allow delete dashboard_config" ON public.dashboard_config FOR DELETE USING (true);

-- Seed: all role×dashboard combinations
INSERT INTO public.dashboard_config (role, dashboard_slug, enabled, display_order) VALUES
  ('ops_engineer', 'ops', true, 0),
  ('ops_engineer', 'leadership', false, 1),
  ('ops_engineer', 'ops_lead', false, 2),
  ('ops_engineer', 'admin', false, 3),
  ('finance', 'ops', false, 0),
  ('finance', 'leadership', true, 1),
  ('finance', 'ops_lead', false, 2),
  ('finance', 'admin', false, 3),
  ('ops_lead', 'ops', false, 0),
  ('ops_lead', 'leadership', false, 1),
  ('ops_lead', 'ops_lead', true, 2),
  ('ops_lead', 'admin', false, 3),
  ('admin', 'ops', false, 0),
  ('admin', 'leadership', false, 1),
  ('admin', 'ops_lead', false, 2),
  ('admin', 'admin', true, 3)
ON CONFLICT (role, dashboard_slug) DO NOTHING;
