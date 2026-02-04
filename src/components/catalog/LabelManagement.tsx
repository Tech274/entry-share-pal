import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Tags, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useLabLabels, LabelFormData, LabLabel } from '@/hooks/useLabLabels';
import { GradientPicker } from './GradientPicker';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

const initialFormData: LabelFormData = {
  label_id: '',
  name: '',
  color: 'bg-gradient-to-r from-blue-500 to-cyan-400',
  display_order: 0,
  is_active: true,
};

interface SortableLabelRowProps {
  label: LabLabel;
  onEdit: (label: LabLabel) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, is_active: boolean) => void;
}

const SortableLabelRow = ({ label, onEdit, onDelete, onToggleActive }: SortableLabelRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={cn(isDragging && "opacity-50 bg-muted")}
    >
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell>
        <div className={cn("w-16 h-6 rounded", label.color)} />
      </TableCell>
      <TableCell className="font-medium">{label.label_id}</TableCell>
      <TableCell>{label.name}</TableCell>
      <TableCell>
        <Switch 
          checked={label.is_active} 
          onCheckedChange={(checked) => onToggleActive(label.id, checked)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(label)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(label.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const LabelManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<{ id: string; data: LabelFormData } | null>(null);
  const [formData, setFormData] = useState<LabelFormData>(initialFormData);

  const { 
    labels, 
    isLoading, 
    createLabel, 
    updateLabel, 
    deleteLabel,
    toggleLabelActive,
    reorderLabels,
  } = useLabLabels();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingLabel(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (label: LabLabel) => {
    setEditingLabel({ id: label.id, data: label });
    setFormData({
      label_id: label.label_id,
      name: label.name,
      color: label.color,
      display_order: label.display_order,
      is_active: label.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedLabelId = formData.label_id.toLowerCase().replace(/\s+/g, '-');
    const normalizedFormData = { ...formData, label_id: normalizedLabelId };

    if (editingLabel) {
      updateLabel.mutate({ id: editingLabel.id, data: normalizedFormData }, {
        onSuccess: () => resetForm(),
      });
    } else {
      createLabel.mutate(normalizedFormData, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteLabel.mutate(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = labels.findIndex((l) => l.id === active.id);
      const newIndex = labels.findIndex((l) => l.id === over.id);
      
      const newOrder = arrayMove(labels, oldIndex, newIndex);
      const orderedIds = newOrder.map(l => l.id);
      
      reorderLabels.mutate(orderedIds);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-accent py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags className="w-4 h-4" />
            Label Management
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="secondary" onClick={() => { 
                setEditingLabel(null); 
                setFormData({...initialFormData, display_order: labels.length + 1}); 
              }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Label
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLabel ? 'Edit Label' : 'Add New Label'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Live Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm",
                      formData.color
                    )}>
                      {formData.name || 'Label Preview'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Label ID</Label>
                  <Input 
                    value={formData.label_id} 
                    onChange={(e) => setFormData({ ...formData, label_id: e.target.value })}
                    placeholder="e.g., aws (lowercase, hyphens for spaces)"
                    required
                    disabled={!!editingLabel}
                    className={editingLabel ? 'bg-muted' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier. Cannot be changed after creation.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AWS"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <GradientPicker 
                    value={formData.color} 
                    onChange={(color) => setFormData({ ...formData, color })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                  <span className="text-xs text-muted-foreground ml-2">
                    Inactive labels won't be available for selection
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={createLabel.isPending || updateLabel.isPending}>
                    {editingLabel ? 'Update' : 'Add'} Label
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Labels are independent tags (AWS, Azure, Python, etc.) that can be assigned to lab templates for additional categorization.
        </p>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading labels...</div>
        ) : labels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No labels found. Click "Add Label" to create one.
          </div>
        ) : (
          <div className="rounded-md border">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-20">Color</TableHead>
                    <TableHead>Label ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-20">Active</TableHead>
                    <TableHead className="text-right w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={labels.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {labels.map((label) => (
                      <SortableLabelRow
                        key={label.id}
                        label={label}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={(id, is_active) => toggleLabelActive.mutate({ id, is_active })}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          {labels.length} labels • {labels.filter(l => l.is_active).length} active • Drag rows to reorder
        </p>
      </CardContent>
    </Card>
  );
};
