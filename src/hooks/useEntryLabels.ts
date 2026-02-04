import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EntryLabel {
  id: string;
  entry_id: string;
  label_id: string;
}

// Fetch labels assigned to a specific entry
export const useEntryLabels = (entryId: string | null) => {
  return useQuery({
    queryKey: ['entry-labels', entryId],
    queryFn: async () => {
      if (!entryId) return [];
      const { data, error } = await supabase
        .from('lab_catalog_entry_labels')
        .select('id, entry_id, label_id')
        .eq('entry_id', entryId);
      
      if (error) throw error;
      return data as EntryLabel[];
    },
    enabled: !!entryId,
  });
};

// Fetch all entry-label mappings for public catalog
export const useAllEntryLabels = () => {
  return useQuery({
    queryKey: ['all-entry-labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_entry_labels')
        .select(`
          id,
          entry_id,
          label_id,
          lab_catalog_labels (
            id,
            label_id,
            name,
            color,
            is_active
          )
        `);
      
      if (error) throw error;
      return data as (EntryLabel & { 
        lab_catalog_labels: { 
          id: string; 
          label_id: string; 
          name: string; 
          color: string; 
          is_active: boolean;
        } 
      })[];
    },
  });
};

// Hook for managing entry labels
export const useManageEntryLabels = () => {
  const queryClient = useQueryClient();

  const updateEntryLabels = useMutation({
    mutationFn: async ({ entryId, labelIds }: { entryId: string; labelIds: string[] }) => {
      // First, delete all existing labels for this entry
      const { error: deleteError } = await supabase
        .from('lab_catalog_entry_labels')
        .delete()
        .eq('entry_id', entryId);
      
      if (deleteError) throw deleteError;

      // Then insert new labels
      if (labelIds.length > 0) {
        const insertData = labelIds.map(labelId => ({
          entry_id: entryId,
          label_id: labelId,
        }));

        const { error: insertError } = await supabase
          .from('lab_catalog_entry_labels')
          .insert(insertData);
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry-labels'] });
      queryClient.invalidateQueries({ queryKey: ['all-entry-labels'] });
    },
    onError: (error) => {
      toast.error('Failed to update labels: ' + error.message);
    },
  });

  return { updateEntryLabels };
};
