-- Sample data for Cloud Billing Dashboard (run after RUN_CLOUD_BILLING.sql)
-- Matches the Public Cloud Billing - Details Excel: AWS, Azure, GCP Apr–Jun 2025

INSERT INTO public.cloud_billing_details (provider, vendor_name, month, year, overall_business, cloud_cost, invoiced_to_customer, yet_to_be_billed)
VALUES
  ('aws', 'Amazon Web Services', 'April', 2025, 2241051, 253075, 1162266, 1078785),
  ('aws', 'Amazon Web Services', 'May', 2025, 1250000, 1100000, 850000, 400000),
  ('aws', 'Amazon Web Services', 'June', 2025, 1270097, 1372212, 677079, 592998),
  ('azure', 'Microsoft Azure', 'April', 2025, 2612794, 293507, 2078545, 534249),
  ('azure', 'Microsoft Azure', 'May', 2025, 1680000, 156594, 1187000, 17000),
  ('azure', 'Microsoft Azure', 'June', 2025, 1701186, 156500, 1195208, 50660),
  ('gcp', 'Google Cloud Platform', 'April', 2025, 161644, 54819, 161644, 0),
  ('gcp', 'Google Cloud Platform', 'May', 2025, 145823, 56643, 40287, 0),
  ('gcp', 'Google Cloud Platform', 'June', 2025, 145824, 56643, 0, 251360)
ON CONFLICT (provider, month, year) DO UPDATE SET
  vendor_name = EXCLUDED.vendor_name,
  overall_business = EXCLUDED.overall_business,
  cloud_cost = EXCLUDED.cloud_cost,
  invoiced_to_customer = EXCLUDED.invoiced_to_customer,
  yet_to_be_billed = EXCLUDED.yet_to_be_billed,
  updated_at = now();
