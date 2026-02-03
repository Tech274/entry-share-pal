-- Add tp_lab_type column to lab_requests table
ALTER TABLE public.lab_requests 
ADD COLUMN IF NOT EXISTS tp_lab_type text;

-- Add tp_lab_type column to delivery_requests table
ALTER TABLE public.delivery_requests 
ADD COLUMN IF NOT EXISTS tp_lab_type text;