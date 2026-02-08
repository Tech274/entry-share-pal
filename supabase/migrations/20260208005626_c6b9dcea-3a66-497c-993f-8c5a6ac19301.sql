-- Create rate limit tracking table for submit-request endpoint
CREATE TABLE public.rate_limit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limit_log_lookup 
ON public.rate_limit_log (ip_address, endpoint, created_at DESC);

-- Enable RLS but allow public inserts (for tracking) and restrict reads
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (edge functions use service role)
CREATE POLICY "Service role has full access to rate_limit_log"
ON public.rate_limit_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Auto-cleanup old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_log
  WHERE created_at < now() - interval '1 hour';
$$;