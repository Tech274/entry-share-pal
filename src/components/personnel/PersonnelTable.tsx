import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PersonnelEntry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  account_manager_id?: string;
}

interface PersonnelTableProps {
  title: string;
  data: PersonnelEntry[];
  loading: boolean;
  onAdd: (entry: Omit<PersonnelEntry, 'id'>) => Promise<void>;
  onUpdate: (id: string, entry: Partial<PersonnelEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  
  accountManagers?: PersonnelEntry[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  account_manager_id: string;
}

const defaultFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  is_active: true,
  account_manager_id: '',
};

export const PersonnelTable = ({
  title,
  data,
  loading,
  onAdd,
  onUpdate,
  onDelete,
  accountManagers,
}: PersonnelTableProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PersonnelEntry | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isClientTable = title === 'Clients';

  const handleOpenDialog = (entry?: PersonnelEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        name: entry.name,
        email: entry.email || '',
        phone: entry.phone || '',
        is_active: entry.is_active,
        account_manager_id: entry.account_manager_id || '',
      });
    } else {
      setEditingEntry(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const entryData: any = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        is_active: formData.is_active,
      };

      if (isClientTable && formData.account_manager_id) {
        entryData.account_manager_id = formData.account_manager_id;
      }

      if (editingEntry) {
        await onUpdate(editingEntry.id, entryData);
        toast({ title: 'Updated', description: `${title.slice(0, -1)} updated successfully` });
      } else {
        await onAdd(entryData);
        toast({ title: 'Added', description: `${title.slice(0, -1)} added successfully` });
      }
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingEntry(null);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save entry', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}?`)) return;
    
    try {
      await onDelete(id);
      toast({ title: 'Deleted', description: `${title.slice(0, -1)} deleted` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  const getAccountManagerName = (amId?: string) => {
    if (!amId || !accountManagers) return '-';
    const am = accountManagers.find(a => a.id === amId);
    return am?.name || '-';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDialog()}
            className="h-7"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add {title.slice(0, -1)}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-0">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {title.toLowerCase()} yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                {isClientTable && <TableHead>Account Manager</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>{entry.email || '-'}</TableCell>
                  <TableCell>{entry.phone || '-'}</TableCell>
                  {isClientTable && (
                    <TableCell>{getAccountManagerName(entry.account_manager_id)}</TableCell>
                  )}
                  <TableCell>
                    <Badge variant={entry.is_active ? 'default' : 'secondary'}>
                      {entry.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDialog(entry)}
                        className="h-8 w-8"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit' : 'Add'} {title.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone"
              />
            </div>

            {isClientTable && accountManagers && (
              <div className="grid gap-2">
                <Label htmlFor="account_manager">Account Manager</Label>
                <Select
                  value={formData.account_manager_id}
                  onValueChange={(value) => setFormData({ ...formData, account_manager_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {accountManagers.filter(am => am.is_active).map((am) => (
                      <SelectItem key={am.id} value={am.id}>{am.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingEntry ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
