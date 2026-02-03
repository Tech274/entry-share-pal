-- Create lab_catalog_entries table for admin-managed lab templates
CREATE TABLE public.lab_catalog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.lab_catalog_entries ENABLE ROW LEVEL SECURITY;

-- Public can view published entries
CREATE POLICY "Anyone can view published catalog entries"
ON public.lab_catalog_entries
FOR SELECT
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all catalog entries"
ON public.lab_catalog_entries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_lab_catalog_entries_updated_at
BEFORE UPDATE ON public.lab_catalog_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();