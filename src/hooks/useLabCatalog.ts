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

export interface EntryLabelInfo {
  entry_id: string;
  label_id: string;
  name: string;
  color: string;
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
        .eq('is_featured', true)
        .order('display_order');
      
      if (error) throw error;
      return data as LabCatalogCategory[];
    },
  });
};

export const useLabCatalogEntryLabels = () => {
  return useQuery({
    queryKey: ['lab-catalog-entry-labels-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_entry_labels')
        .select(`
          entry_id,
          lab_catalog_labels!inner (
            label_id,
            name,
            color,
            is_active
          )
        `)
        .eq('lab_catalog_labels.is_active', true);
      
      if (error) throw error;
      
      // Transform the data to a more usable format
      return (data || []).map((item: any) => ({
        entry_id: item.entry_id,
        label_id: item.lab_catalog_labels.label_id,
        name: item.lab_catalog_labels.name,
        color: item.lab_catalog_labels.color,
      })) as EntryLabelInfo[];
    },
  });
};

export const groupByCategory = (entries: LabCatalogEntry[]) => {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push({ id: entry.id, name: entry.name, description: entry.description });
    return acc;
  }, {} as Record<string, { id: string; name: string; description: string }[]>);
};
