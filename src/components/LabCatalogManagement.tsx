import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Layers, Upload, Download, Tag, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { useLabCategories } from '@/hooks/useLabCategories';
import { CategoryManagement } from '@/components/catalog/CategoryManagement';
import { LabelManagement } from '@/components/catalog/LabelManagement';
import { LabelMultiSelect } from '@/components/catalog/LabelMultiSelect';
import { useEntryLabels, useManageEntryLabels } from '@/hooks/useEntryLabels';
import { cn } from '@/lib/utils';
import { useLabLabels } from '@/hooks/useLabLabels';

interface CatalogEntry {
  id: string;
  category: string;
  name: string;
  description: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

interface FormData {
  category: string;
  name: string;
  description: string;
  is_published: boolean;
  display_order: number;
  labelIds: string[];
}

export const LabCatalogManagement = () => {
  const { categories, activeCategories, isLoading: categoriesLoading, getCategoryLabel } = useLabCategories();
  
  const initialFormData: FormData = {
    category: activeCategories[0]?.category_id || 'cloud',
    name: '',
    description: '',
    is_published: false,
    display_order: 0,
    labelIds: [],
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CatalogEntry | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [bulkImportData, setBulkImportData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Entry labels hooks
  const { data: entryLabels = [] } = useEntryLabels(editingEntry?.id || null);
  const { updateEntryLabels } = useManageEntryLabels();
  const { labels: allLabels } = useLabLabels();

  // Update form labelIds when entry labels load
  useEffect(() => {
    if (editingEntry && entryLabels.length > 0) {
      setFormData(prev => ({
        ...prev,
        labelIds: entryLabels.map(el => el.label_id),
      }));
    }
  }, [editingEntry, entryLabels]);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['lab-catalog-entries-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_catalog_entries')
        .select('*')
        .order('category')
        .order('display_order');
      
      if (error) throw error;
      return data as CatalogEntry[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase
        .from('lab_catalog_entries')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Lab template added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to add template: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<FormData, 'labelIds'> }) => {
      const { error } = await supabase
        .from('lab_catalog_entries')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Lab template updated successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update template: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lab_catalog_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Lab template deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete template: ' + error.message);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from('lab_catalog_entries')
        .update({ is_published })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Publish status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (entries: Omit<FormData, 'display_order'>[]) => {
      const toInsert = entries.map((e, i) => ({ ...e, display_order: i }));
      const { error } = await supabase
        .from('lab_catalog_entries')
        .insert(toInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Bulk import completed successfully');
      setBulkImportData('');
      setIsBulkDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Bulk import failed: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      category: activeCategories[0]?.category_id || 'cloud',
      name: '',
      description: '',
      is_published: false,
      display_order: 0,
      labelIds: [],
    });
    setEditingEntry(null);
    setIsDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBulkImportData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvAndImport = () => {
    const lines = bulkImportData.trim().split('\n');
    if (lines.length < 2) {
      toast.error('CSV must have a header row and at least one data row');
      return;
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const categoryIdx = header.indexOf('category');
    const nameIdx = header.indexOf('name');
    const descIdx = header.indexOf('description');
    const publishedIdx = header.indexOf('is_published');

    if (categoryIdx === -1 || nameIdx === -1 || descIdx === -1) {
      toast.error('CSV must have columns: category, name, description');
      return;
    }

    const validCategoryIds = categories.map(c => c.category_id);
    const entriesData: Omit<FormData, 'display_order'>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < 3) continue;
      
      const category = values[categoryIdx];
      if (!validCategoryIds.includes(category)) {
        toast.error(`Invalid category "${category}" on row ${i + 1}. Valid categories: ${validCategoryIds.join(', ')}`);
        return;
      }

      entriesData.push({
        category,
        name: values[nameIdx],
        description: values[descIdx],
        is_published: publishedIdx !== -1 ? values[publishedIdx]?.toLowerCase() === 'true' : false,
        labelIds: [],
      });
    }

    if (entriesData.length === 0) {
      toast.error('No valid entries found in CSV');
      return;
    }

    bulkImportMutation.mutate(entriesData);
  };

  const downloadCsvTemplate = () => {
    const categoryIds = categories.map(c => c.category_id).join(', ');
    const template = `category,name,description,is_published\ncloud,Example Lab,Description of the lab,false\n\n# Valid categories: ${categoryIds}`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab_catalog_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEdit = (entry: CatalogEntry) => {
    setEditingEntry(entry);
    setFormData({
      category: entry.category,
      name: entry.name,
      description: entry.description,
      is_published: entry.is_published,
      display_order: entry.display_order,
      labelIds: [], // Will be populated by useEffect when entry labels load
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { labelIds, ...entryData } = formData;
    
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: entryData }, {
        onSuccess: () => {
          // Update labels after entry is saved
          updateEntryLabels.mutate({ entryId: editingEntry.id, labelIds });
        }
      });
    } else {
      // For new entries, we need to create the entry first, then add labels
      const { data: newEntry, error } = await supabase
        .from('lab_catalog_entries')
        .insert(entryData)
        .select('id')
        .single();
      
      if (error) {
        toast.error('Failed to add template: ' + error.message);
        return;
      }
      
      if (newEntry && labelIds.length > 0) {
        updateEntryLabels.mutate({ entryId: newEntry.id, labelIds });
      }
      
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-public'] });
      toast.success('Lab template added successfully');
      resetForm();
    }
  };

  const filteredEntries = filterCategory === 'all' 
    ? entries 
    : entries.filter(e => e.category === filterCategory);

  return (
    <Tabs defaultValue="templates" className="space-y-4">
      <TabsList>
        <TabsTrigger value="templates" className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Lab Templates
        </TabsTrigger>
        <TabsTrigger value="categories" className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Categories
        </TabsTrigger>
        <TabsTrigger value="labels" className="flex items-center gap-2">
          <Tags className="w-4 h-4" />
          Labels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="templates">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Lab Templates ({entries.length})
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">
                      <Upload className="w-4 h-4 mr-1" />
                      Bulk Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Import Lab Templates</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Upload a CSV file with columns: <code>category, name, description, is_published</code>
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
                          <Download className="w-4 h-4 mr-1" />
                          Download Template
                        </Button>
                        <input
                          type="file"
                          accept=".csv"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-1" />
                          Upload CSV
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Or paste CSV content here..."
                        value={bulkImportData}
                        onChange={(e) => setBulkImportData(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Valid categories: {categories.map(c => c.category_id).join(', ')}
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={parseCsvAndImport} disabled={!bulkImportData.trim() || bulkImportMutation.isPending}>
                          Import Templates
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" onClick={() => { setEditingEntry(null); setFormData({...formData, category: activeCategories[0]?.category_id || 'cloud'}); }}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingEntry ? 'Edit Lab Template' : 'Add New Lab Template'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.category_id} value={cat.category_id}>
                                {cat.label}
                                {!cat.is_active && <span className="text-muted-foreground ml-2">(inactive)</span>}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input 
                          value={formData.name} 
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., AWS Solutions Architect Lab"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={formData.description} 
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe what this lab environment includes..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Labels</Label>
                        <LabelMultiSelect
                          selectedLabelIds={formData.labelIds}
                          onChange={(labelIds) => setFormData({ ...formData, labelIds })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Assign labels like AWS, Azure, Python etc. to this template
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input 
                          type="number" 
                          value={formData.display_order} 
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={formData.is_published} 
                          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                        />
                        <Label>Publish immediately</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                          {editingEntry ? 'Update' : 'Add'} Template
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.category_id} value={cat.category_id}>
                      {cat.label} {!cat.is_active && '(inactive)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading || categoriesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No lab templates found. Click "Add Template" to create one.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant="outline">{getCategoryLabel(entry.category)}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={entry.is_published}
                            onCheckedChange={(checked) => togglePublishMutation.mutate({ id: entry.id, is_published: checked })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(entry)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="categories">
        <CategoryManagement />
      </TabsContent>

      <TabsContent value="labels">
        <LabelManagement />
      </TabsContent>
    </Tabs>
  );
};
