import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LabCatalogEntry {
  id: string;
  category: string;
  name: string;
  description: string;
  display_order: number;
}

export interface LabCatalogCategory {
  id: string;
  category_id: string;
  label: string;
  display_order: number;
  is_active: boolean;
  icon_name: string;
  gradient_color: string;
  is_featured: boolean;
}

export const useLabCatalog = () => {
  return useQuery({
    queryKey: ['lab-catalog-entries-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_entries')
        .select('id, category, name, description, display_order')
        .eq('is_published', true)
        .order('category')
        .order('display_order');
      
      if (error) throw error;
      return data as LabCatalogEntry[];
    },
  });
};

export const useLabCatalogCategories = () => {
  return useQuery({
    queryKey: ['lab-catalog-categories-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_categories')
        .select('id, category_id, label, display_order, is_active, icon_name, gradient_color, is_featured')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as LabCatalogCategory[];
    },
  });
};

export const groupByCategory = (entries: LabCatalogEntry[]) => {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push({ name: entry.name, description: entry.description });
    return acc;
  }, {} as Record<string, { name: string; description: string }[]>);
};
