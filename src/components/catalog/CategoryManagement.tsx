import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Tag, GripVertical } from 'lucide-react';
import { useLabCategories, CategoryFormData } from '@/hooks/useLabCategories';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const initialFormData: CategoryFormData = {
  category_id: '',
  label: '',
  display_order: 0,
  is_active: true,
};

export const CategoryManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; data: CategoryFormData } | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    toggleCategoryActive 
  } = useLabCategories();

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: any) => {
    setEditingCategory({ id: category.id, data: category });
    setFormData({
      category_id: category.category_id,
      label: category.label,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert category_id to lowercase and replace spaces with hyphens
    const normalizedCategoryId = formData.category_id.toLowerCase().replace(/\s+/g, '-');
    const normalizedFormData = { ...formData, category_id: normalizedCategoryId };

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: normalizedFormData }, {
        onSuccess: () => resetForm(),
      });
    } else {
      createCategory.mutate(normalizedFormData, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteCategory.mutate(id);
  };

  return (
    <Card>
      <CardHeader className="bg-accent py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Category Management
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" onClick={() => { setEditingCategory(null); setFormData({...initialFormData, display_order: categories.length + 1}); }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category ID</Label>
                  <Input 
                    value={formData.category_id} 
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    placeholder="e.g., cloud-native (lowercase, hyphens for spaces)"
                    required
                    disabled={!!editingCategory}
                    className={editingCategory ? 'bg-muted' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier used internally. Cannot be changed after creation.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Display Label</Label>
                  <Input 
                    value={formData.label} 
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., Cloud Native"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Human-readable name shown to users.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input 
                    type="number" 
                    value={formData.display_order} 
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first in the list.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                  <span className="text-xs text-muted-foreground ml-2">
                    Inactive categories won't appear in filters
                  </span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                    {editingCategory ? 'Update' : 'Add'} Category
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No categories found. Click "Add Category" to create one.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Category ID</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead className="w-20">Active</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{category.category_id}</TableCell>
                    <TableCell className="font-medium">{category.label}</TableCell>
                    <TableCell>{category.display_order}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={category.is_active}
                        onCheckedChange={(checked) => toggleCategoryActive.mutate({ id: category.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(category)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the "{category.label}" category. 
                                Lab templates using this category will keep their category value but won't appear in filters.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(category.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {categories.length} categories • {categories.filter(c => c.is_active).length} active
        </p>
      </CardContent>
    </Card>
  );
};
