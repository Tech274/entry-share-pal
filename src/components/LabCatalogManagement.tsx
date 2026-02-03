import { useState, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Layers, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { id: 'cloud', label: 'Cloud Labs' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'data-ai', label: 'Data & AI' },
  { id: 'security', label: 'Security' },
  { id: 'devops', label: 'DevOps' },
  { id: 'gen-ai', label: 'Gen AI' },
  { id: 'sap', label: 'SAP Labs' },
  { id: 'oracle', label: 'Oracle & OEM' },
];

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
}

const initialFormData: FormData = {
  category: 'cloud',
  name: '',
  description: '',
  is_published: false,
  display_order: 0,
};

export const LabCatalogManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CatalogEntry | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [bulkImportData, setBulkImportData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

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
      toast.success('Lab template added successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to add template: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const { error } = await supabase
        .from('lab_catalog_entries')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entries-admin'] });
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
    setFormData(initialFormData);
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

    const entries: Omit<FormData, 'display_order'>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      if (values.length < 3) continue;
      
      const category = values[categoryIdx];
      if (!CATEGORIES.find(c => c.id === category)) {
        toast.error(`Invalid category "${category}" on row ${i + 1}`);
        return;
      }

      entries.push({
        category,
        name: values[nameIdx],
        description: values[descIdx],
        is_published: publishedIdx !== -1 ? values[publishedIdx]?.toLowerCase() === 'true' : false,
      });
    }

    if (entries.length === 0) {
      toast.error('No valid entries found in CSV');
      return;
    }

    bulkImportMutation.mutate(entries);
  };

  const downloadCsvTemplate = () => {
    const template = 'category,name,description,is_published\ncloud,Example Lab,Description of the lab,false';
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
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredEntries = filterCategory === 'all' 
    ? entries 
    : entries.filter(e => e.category === filterCategory);

  const getCategoryLabel = (categoryId: string) => 
    CATEGORIES.find(c => c.id === categoryId)?.label || categoryId;

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Lab Catalog Management
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
                    Valid categories: {CATEGORIES.map(c => c.id).join(', ')}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                    <Button onClick={parseCsvAndImport} disabled={!bulkImportData.trim()}>
                      Import Templates
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" onClick={() => { setEditingEntry(null); setFormData(initialFormData); }}>
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
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
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
                  <Button type="submit">{editingEntry ? 'Update' : 'Add'} Template</Button>
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
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No lab templates found. Click "Add Template" to create one.
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
