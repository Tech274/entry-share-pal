-- Run in Supabase Dashboard → SQL Editor
-- Configurable report visibility by role

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE IF NOT EXISTS public.report_access_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  report_slug TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, report_slug)
);

DROP TRIGGER IF EXISTS update_report_access_config_updated_at ON public.report_access_config;
CREATE TRIGGER update_report_access_config_updated_at
  BEFORE UPDATE ON public.report_access_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_report_access_config_role ON public.report_access_config(role);

ALTER TABLE public.report_access_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read report_access_config" ON public.report_access_config;
CREATE POLICY "Allow read report_access_config" ON public.report_access_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert report_access_config" ON public.report_access_config;
CREATE POLICY "Allow insert report_access_config" ON public.report_access_config FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update report_access_config" ON public.report_access_config;
CREATE POLICY "Allow update report_access_config" ON public.report_access_config FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete report_access_config" ON public.report_access_config;
CREATE POLICY "Allow delete report_access_config" ON public.report_access_config FOR DELETE USING (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_access_config TO anon, authenticated;

INSERT INTO public.report_access_config (role, report_slug, enabled, display_order) VALUES
  ('admin', 'revenue', true, 0),
  ('admin', 'labType', true, 1),
  ('admin', 'learners', true, 2),
  ('admin', 'summary', true, 3),
  ('admin', 'cloudBilling', true, 4),
  ('finance', 'revenue', true, 0),
  ('finance', 'labType', true, 1),
  ('finance', 'learners', true, 2),
  ('finance', 'summary', false, 3),
  ('finance', 'cloudBilling', true, 4),
  ('ops_lead', 'revenue', true, 0),
  ('ops_lead', 'labType', true, 1),
  ('ops_lead', 'learners', true, 2),
  ('ops_lead', 'summary', true, 3),
  ('ops_lead', 'cloudBilling', true, 4),
  ('ops_engineer', 'revenue', false, 0),
  ('ops_engineer', 'labType', false, 1),
  ('ops_engineer', 'learners', false, 2),
  ('ops_engineer', 'summary', false, 3),
  ('ops_engineer', 'cloudBilling', false, 4)
ON CONFLICT (role, report_slug) DO NOTHING;
