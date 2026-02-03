-- Activity log table for audit trail
CREATE TABLE public.request_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('solution', 'delivery')),
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Engineer settings for capacity and expertise
CREATE TABLE public.engineer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_active_requests INTEGER NOT NULL DEFAULT 10,
  expertise JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.request_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for request_activity_log (append-only for most users)
CREATE POLICY "Authenticated users can view activity logs"
ON public.request_activity_log
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert activity logs"
ON public.request_activity_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- No update/delete policies - activity log is append-only

-- RLS Policies for engineer_settings
CREATE POLICY "Anyone can view engineer settings"
ON public.engineer_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert engineer settings"
ON public.engineer_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update engineer settings"
ON public.engineer_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete engineer settings"
ON public.engineer_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to get engineer workload (count of active requests)
CREATE OR REPLACE FUNCTION public.get_engineer_workload(engineer_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*)::INTEGER FROM lab_requests 
     WHERE assigned_to = engineer_id 
     AND status IN ('Solution Pending', 'In Progress'))
    +
    (SELECT COUNT(*)::INTEGER FROM delivery_requests 
     WHERE assigned_to = engineer_id 
     AND lab_status IN ('Pending', 'In Progress'))
  , 0)
$$;

-- Trigger for updated_at on engineer_settings
CREATE TRIGGER update_engineer_settings_updated_at
BEFORE UPDATE ON public.engineer_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();