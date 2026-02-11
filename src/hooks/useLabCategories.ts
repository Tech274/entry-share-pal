import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LabCategory {
  id: string;
  category_id: string;
  label: string;
  display_order: number;
  is_active: boolean;
  icon_name: string;
  gradient_color: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  category_id: string;
  label: string;
  display_order: number;
  is_active: boolean;
  icon_name: string;
  gradient_color: string;
  is_featured: boolean;
}

export const useLabCategories = () => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['lab-catalog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as LabCategory[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase
        .from('lab_catalog_categories')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
      toast.success('Category added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add category: ' + error.message);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      const { error } = await supabase
        .from('lab_catalog_categories')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update category: ' + error.message);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_catalog_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
    },
  });

  const toggleCategoryActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('lab_catalog_categories')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
      toast.success('Category status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const reorderCategories = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each category with its new display_order
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('lab_catalog_categories')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      const results = await Promise.all(updates);
      const error = results.find(r => r.error)?.error;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-categories'] });
      toast.success('Category order updated');
    },
    onError: (error) => {
      toast.error('Failed to reorder: ' + error.message);
    },
  });

  // Helper to get active categories only
  const activeCategories = categories.filter(c => c.is_active);

  // Helper to get category label by ID
  const getCategoryLabel = (categoryId: string) => 
    categories.find(c => c.category_id === categoryId)?.label || categoryId;

  // Helper to get category by ID
  const getCategory = (categoryId: string) => 
    categories.find(c => c.category_id === categoryId);

  return {
    categories,
    activeCategories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    reorderCategories,
    getCategoryLabel,
    getCategory,
  };
};
