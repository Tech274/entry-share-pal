-- Add line_of_business column to lab_requests table
ALTER TABLE public.lab_requests 
ADD COLUMN line_of_business text;

-- Add comment for documentation
COMMENT ON COLUMN public.lab_requests.line_of_business IS 'Line of Business: Standalone, VILT, or Blended';