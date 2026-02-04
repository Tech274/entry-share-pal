-- Add gradient_color and is_featured columns to lab_catalog_categories
ALTER TABLE public.lab_catalog_categories 
ADD COLUMN gradient_color text DEFAULT 'bg-gradient-to-r from-primary to-primary/80',
ADD COLUMN is_featured boolean DEFAULT false;

-- Update existing categories with appropriate gradient colors and featured status
UPDATE public.lab_catalog_categories SET 
  is_featured = true,
  gradient_color = CASE category_id
    WHEN 'combo' THEN 'bg-gradient-to-r from-violet-500 to-purple-500'
    WHEN 'devops' THEN 'bg-gradient-to-r from-orange-500 to-amber-500'
    WHEN 'certification' THEN 'bg-gradient-to-r from-green-500 to-emerald-500'
    WHEN 'gen-ai' THEN 'bg-gradient-to-r from-pink-500 to-rose-500'
    WHEN 'multicloud' THEN 'bg-gradient-to-r from-sky-500 to-indigo-500'
    WHEN 'aws' THEN 'bg-gradient-to-r from-amber-500 to-yellow-400'
    WHEN 'azure' THEN 'bg-gradient-to-r from-blue-500 to-cyan-400'
    WHEN 'gcp' THEN 'bg-gradient-to-r from-red-400 to-yellow-400'
    WHEN 'sap' THEN 'bg-gradient-to-r from-blue-600 to-blue-400'
    WHEN 'oracle' THEN 'bg-gradient-to-r from-red-600 to-red-400'
    WHEN 'enterprise' THEN 'bg-gradient-to-r from-slate-600 to-slate-400'
    WHEN 'infrastructure' THEN 'bg-gradient-to-r from-cyan-600 to-teal-500'
    WHEN 'security' THEN 'bg-gradient-to-r from-red-500 to-orange-500'
    WHEN 'virtualization' THEN 'bg-gradient-to-r from-indigo-500 to-purple-400'
    WHEN 'testing' THEN 'bg-gradient-to-r from-lime-500 to-green-400'
    WHEN 'bigdata' THEN 'bg-gradient-to-r from-purple-500 to-indigo-500'
    WHEN 'datascience' THEN 'bg-gradient-to-r from-emerald-500 to-teal-400'
    ELSE 'bg-gradient-to-r from-primary to-primary/80'
  END
WHERE category_id IN ('combo', 'devops', 'certification', 'gen-ai', 'multicloud', 'aws', 'azure', 'gcp', 'sap', 'oracle', 'enterprise', 'infrastructure', 'security', 'virtualization', 'testing', 'bigdata', 'datascience');