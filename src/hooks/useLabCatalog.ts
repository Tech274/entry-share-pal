import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LabCatalogEntry {
  id: string;
  category: string;
  name: string;
  description: string;
  display_order: number;
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

export const groupByCategory = (entries: LabCatalogEntry[]) => {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push({ name: entry.name, description: entry.description });
    return acc;
  }, {} as Record<string, { name: string; description: string }[]>);
};
