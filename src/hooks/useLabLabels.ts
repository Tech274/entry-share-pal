import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/external-supabase/client';
import { toast } from 'sonner';

export interface LabLabel {
  id: string;
  label_id: string;
  name: string;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabelFormData {
  label_id: string;
  name: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

export const useLabLabels = () => {
  const queryClient = useQueryClient();

  const { data: labels = [], isLoading } = useQuery({
    queryKey: ['lab-catalog-labels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_labels')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as LabLabel[];
    },
  });

  const createLabel = useMutation({
    mutationFn: async (data: LabelFormData) => {
      const { error } = await supabase
        .from('lab_catalog_labels')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-labels'] });
      toast.success('Label added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add label: ' + error.message);
    },
  });

  const updateLabel = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LabelFormData> }) => {
      const { error } = await supabase
        .from('lab_catalog_labels')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-labels'] });
      toast.success('Label updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update label: ' + error.message);
    },
  });

  const deleteLabel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_catalog_labels')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-labels'] });
      toast.success('Label deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete label: ' + error.message);
    },
  });

  const toggleLabelActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('lab_catalog_labels')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-labels'] });
      toast.success('Label status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const reorderLabels = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('lab_catalog_labels')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-labels'] });
      toast.success('Label order updated');
    },
    onError: (error) => {
      toast.error('Failed to reorder: ' + error.message);
    },
  });

  const activeLabels = labels.filter(l => l.is_active);

  const getLabelName = (labelId: string) => 
    labels.find(l => l.label_id === labelId)?.name || labelId;

  const getLabel = (labelId: string) => 
    labels.find(l => l.label_id === labelId);

  return {
    labels,
    activeLabels,
    isLoading,
    createLabel,
    updateLabel,
    deleteLabel,
    toggleLabelActive,
    reorderLabels,
    getLabelName,
    getLabel,
  };
};
