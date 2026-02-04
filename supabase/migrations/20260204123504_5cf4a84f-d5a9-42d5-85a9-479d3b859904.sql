-- Add invoice_details column to both tables
ALTER TABLE public.lab_requests 
ADD COLUMN IF NOT EXISTS invoice_details text;

ALTER TABLE public.delivery_requests 
ADD COLUMN IF NOT EXISTS invoice_details text;