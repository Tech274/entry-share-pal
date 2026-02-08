-- Create a table to store lab catalog categories
CREATE TABLE public.lab_catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL UNIQUE,
  label text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_catalog_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.lab_catalog_categories
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.lab_catalog_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_lab_catalog_categories_updated_at
BEFORE UPDATE ON public.lab_catalog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all existing categories from the database
INSERT INTO public.lab_catalog_categories (category_id, label, display_order, is_active) VALUES
  ('agile', 'Agile', 1, true),
  ('ai-combo', 'AI Combo', 2, true),
  ('aws', 'AWS', 3, true),
  ('azure', 'Azure', 4, true),
  ('backend', 'Backend', 5, true),
  ('bi', 'Business Intelligence', 6, true),
  ('big-data', 'Big Data', 7, true),
  ('bigdata', 'BigData', 8, true),
  ('blockchain', 'Blockchain', 9, true),
  ('certification', 'Certification', 10, true),
  ('cloud', 'Cloud Labs', 11, true),
  ('cloud-combo', 'Cloud Combo', 12, true),
  ('cms', 'CMS', 13, true),
  ('combo', 'Combo', 14, true),
  ('data', 'Data', 15, true),
  ('data-combo', 'Data Combo', 16, true),
  ('database', 'Database', 17, true),
  ('datascience', 'Data Science', 18, true),
  ('devops', 'DevOps', 19, true),
  ('devops-combo', 'DevOps Combo', 20, true),
  ('enterprise', 'Enterprise', 21, true),
  ('frontend', 'Frontend', 22, true),
  ('fullstack', 'Full Stack', 23, true),
  ('gcp', 'GCP', 24, true),
  ('gen-ai', 'Gen AI', 25, true),
  ('infrastructure', 'Infrastructure', 26, true),
  ('mobile', 'Mobile', 27, true),
  ('multicloud', 'Multi Cloud', 28, true),
  ('networking', 'Networking', 29, true),
  ('oracle', 'Oracle & OEM', 30, true),
  ('os', 'Operating Systems', 31, true),
  ('programming', 'Programming', 32, true),
  ('sap', 'SAP Labs', 33, true),
  ('security', 'Security', 34, true),
  ('testing', 'Testing', 35, true),
  ('testing-combo', 'Testing Combo', 36, true),
  ('tools', 'Tools', 37, true),
  ('virtualization', 'Virtualization', 38, true)
ON CONFLICT (category_id) DO NOTHING;