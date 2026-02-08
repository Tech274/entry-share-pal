-- Add line_of_business column to delivery_requests table for consistency with lab_requests
ALTER TABLE public.delivery_requests ADD COLUMN line_of_business text;