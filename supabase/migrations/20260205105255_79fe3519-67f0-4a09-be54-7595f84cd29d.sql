-- Create table for tracking shared catalog emails
CREATE TABLE public.catalog_share_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL UNIQUE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  share_type TEXT NOT NULL DEFAULT 'catalog', -- 'catalog', 'template', 'bundle'
  shared_items JSONB, -- For templates/bundles: array of {id, name, category}
  personal_message TEXT,
  sender_email TEXT,
  catalog_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  first_opened_at TIMESTAMP WITH TIME ZONE,
  last_opened_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER NOT NULL DEFAULT 0,
  link_clicked_at TIMESTAMP WITH TIME ZONE,
  link_click_count INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster lookups
CREATE INDEX idx_catalog_share_tracking_share_id ON public.catalog_share_tracking(share_id);
CREATE INDEX idx_catalog_share_tracking_created_at ON public.catalog_share_tracking(created_at DESC);
CREATE INDEX idx_catalog_share_tracking_recipient ON public.catalog_share_tracking(recipient_email);

-- Enable RLS
ALTER TABLE public.catalog_share_tracking ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view tracking data
CREATE POLICY "Authenticated users can view share tracking" 
ON public.catalog_share_tracking 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert share records
CREATE POLICY "Authenticated users can create share records" 
ON public.catalog_share_tracking 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow service role to update tracking (for open/click tracking)
CREATE POLICY "Service role can update tracking" 
ON public.catalog_share_tracking 
FOR UPDATE 
USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.catalog_share_tracking IS 'Tracks catalog/template shares sent via email with open and click analytics';