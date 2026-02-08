-- Add cloud_type column to lab_requests table
ALTER TABLE public.lab_requests 
ADD COLUMN cloud_type text;

-- Add cloud_type column to delivery_requests table
ALTER TABLE public.delivery_requests 
ADD COLUMN cloud_type text;