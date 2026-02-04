-- Add icon column to lab_catalog_categories
ALTER TABLE public.lab_catalog_categories 
ADD COLUMN icon_name text DEFAULT 'Layers';

-- Update existing categories with appropriate icons based on category_id
UPDATE public.lab_catalog_categories SET icon_name = CASE category_id
  WHEN 'combo' THEN 'Boxes'
  WHEN 'devops' THEN 'GitBranch'
  WHEN 'certification' THEN 'FlaskConical'
  WHEN 'gen-ai' THEN 'Brain'
  WHEN 'multicloud' THEN 'Cloud'
  WHEN 'aws' THEN 'Cloud'
  WHEN 'azure' THEN 'Cloud'
  WHEN 'gcp' THEN 'Cloud'
  WHEN 'sap' THEN 'Building2'
  WHEN 'oracle' THEN 'Database'
  WHEN 'enterprise' THEN 'Building'
  WHEN 'infrastructure' THEN 'Server'
  WHEN 'security' THEN 'Shield'
  WHEN 'virtualization' THEN 'Box'
  WHEN 'testing' THEN 'TestTube2'
  WHEN 'bigdata' THEN 'Database'
  WHEN 'datascience' THEN 'BarChart3'
  WHEN 'programming' THEN 'Code2'
  WHEN 'frontend' THEN 'Globe'
  WHEN 'backend' THEN 'Server'
  WHEN 'mobile' THEN 'Smartphone'
  WHEN 'database' THEN 'HardDrive'
  WHEN 'data' THEN 'Link2'
  WHEN 'networking' THEN 'Network'
  WHEN 'os' THEN 'Terminal'
  WHEN 'tools' THEN 'Wrench'
  WHEN 'bi' THEN 'BarChart3'
  WHEN 'cms' THEN 'Layers'
  WHEN 'cloud' THEN 'Cloud'
  WHEN 'agile' THEN 'Workflow'
  WHEN 'blockchain' THEN 'Link2'
  ELSE 'Layers'
END;