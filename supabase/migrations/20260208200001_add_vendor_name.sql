-- Add vendor_name column to cloud_billing_details (for existing installations)

ALTER TABLE public.cloud_billing_details ADD COLUMN IF NOT EXISTS vendor_name TEXT;
