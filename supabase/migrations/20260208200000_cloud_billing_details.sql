-- Public Cloud Billing Dashboard - Month on month invoiced, cloud spend vs sales, margins
-- Matches Excel structure: AWS, Azure, GCP sections with monthly breakdown

CREATE TABLE IF NOT EXISTS public.cloud_billing_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp')),
  vendor_name TEXT,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  overall_business NUMERIC DEFAULT 0,
  cloud_cost NUMERIC DEFAULT 0,
  invoiced_to_customer NUMERIC DEFAULT 0,
  yet_to_be_billed NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider, month, year)
);

CREATE INDEX IF NOT EXISTS idx_cloud_billing_provider ON public.cloud_billing_details(provider);
CREATE INDEX IF NOT EXISTS idx_cloud_billing_year_month ON public.cloud_billing_details(year, month);

ALTER TABLE public.cloud_billing_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read cloud_billing_details" ON public.cloud_billing_details;
CREATE POLICY "Allow read cloud_billing_details" ON public.cloud_billing_details FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow insert cloud_billing_details" ON public.cloud_billing_details;
CREATE POLICY "Allow insert cloud_billing_details" ON public.cloud_billing_details FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update cloud_billing_details" ON public.cloud_billing_details;
CREATE POLICY "Allow update cloud_billing_details" ON public.cloud_billing_details FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow delete cloud_billing_details" ON public.cloud_billing_details;
CREATE POLICY "Allow delete cloud_billing_details" ON public.cloud_billing_details FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_cloud_billing_details_updated_at ON public.cloud_billing_details;
CREATE TRIGGER update_cloud_billing_details_updated_at
  BEFORE UPDATE ON public.cloud_billing_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
