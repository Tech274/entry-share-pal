-- Create lab_catalog_labels table for independent label system
CREATE TABLE public.lab_catalog_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_catalog_labels ENABLE ROW LEVEL SECURITY;

-- Admins can manage labels
CREATE POLICY "Admins can manage labels" 
ON public.lab_catalog_labels 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can view active labels
CREATE POLICY "Anyone can view active labels" 
ON public.lab_catalog_labels 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Create junction table for lab entries to labels (many-to-many)
CREATE TABLE public.lab_catalog_entry_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.lab_catalog_entries(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.lab_catalog_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(entry_id, label_id)
);

-- Enable RLS
ALTER TABLE public.lab_catalog_entry_labels ENABLE ROW LEVEL SECURITY;

-- Admins can manage entry labels
CREATE POLICY "Admins can manage entry labels" 
ON public.lab_catalog_entry_labels 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Anyone can view entry labels
CREATE POLICY "Anyone can view entry labels" 
ON public.lab_catalog_entry_labels 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_lab_catalog_labels_updated_at
BEFORE UPDATE ON public.lab_catalog_labels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with initial labels based on common technologies
INSERT INTO public.lab_catalog_labels (label_id, name, color, display_order) VALUES
('aws', 'AWS', 'bg-gradient-to-r from-orange-500 to-amber-500', 1),
('azure', 'Azure', 'bg-gradient-to-r from-blue-500 to-cyan-400', 2),
('gcp', 'GCP', 'bg-gradient-to-r from-red-500 to-yellow-500', 3),
('combo', 'Combo', 'bg-gradient-to-r from-purple-500 to-pink-500', 4),
('data-science', 'Data Science', 'bg-gradient-to-r from-green-500 to-emerald-500', 5),
('devops', 'DevOps', 'bg-gradient-to-r from-indigo-500 to-purple-400', 6),
('kubernetes', 'Kubernetes', 'bg-gradient-to-r from-sky-500 to-blue-600', 7),
('docker', 'Docker', 'bg-gradient-to-r from-cyan-600 to-blue-500', 8),
('terraform', 'Terraform', 'bg-gradient-to-r from-violet-500 to-purple-500', 9),
('python', 'Python', 'bg-gradient-to-r from-yellow-400 to-blue-500', 10),
('java', 'Java', 'bg-gradient-to-r from-red-600 to-orange-500', 11),
('genai', 'GenAI', 'bg-gradient-to-r from-fuchsia-500 to-purple-500', 12);