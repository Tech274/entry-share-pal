import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLabLabels } from '@/hooks/useLabLabels';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tags, Plus, Minus } from 'lucide-react';

interface BulkLabelAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEntryIds: string[];
  onComplete: () => void;
}

type AssignMode = 'add' | 'remove' | 'set';

export const BulkLabelAssignDialog = ({
  open,
  onOpenChange,
  selectedEntryIds,
  onComplete,
}: BulkLabelAssignDialogProps) => {
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [mode, setMode] = useState<AssignMode>('add');
  const { activeLabels } = useLabLabels();
  const queryClient = useQueryClient();

  const bulkAssignMutation = useMutation({
    mutationFn: async ({ entryIds, labelIds, mode }: { entryIds: string[]; labelIds: string[]; mode: AssignMode }) => {
      if (mode === 'set') {
        // Delete all existing labels for these entries
        const { error: deleteError } = await supabase
          .from('lab_catalog_entry_labels')
          .delete()
          .in('entry_id', entryIds);
        
        if (deleteError) throw deleteError;
        
        // Insert new labels
        if (labelIds.length > 0) {
          const insertData = entryIds.flatMap(entryId => 
            labelIds.map(labelId => ({ entry_id: entryId, label_id: labelId }))
          );
          
          const { error: insertError } = await supabase
            .from('lab_catalog_entry_labels')
            .insert(insertData);
          
          if (insertError) throw insertError;
        }
      } else if (mode === 'add') {
        // Add labels (ignore duplicates)
        const insertData = entryIds.flatMap(entryId => 
          labelIds.map(labelId => ({ entry_id: entryId, label_id: labelId }))
        );
        
        const { error } = await supabase
          .from('lab_catalog_entry_labels')
          .upsert(insertData, { onConflict: 'entry_id,label_id', ignoreDuplicates: true });
        
        if (error) throw error;
      } else if (mode === 'remove') {
        // Remove specified labels
        for (const labelId of labelIds) {
          const { error } = await supabase
            .from('lab_catalog_entry_labels')
            .delete()
            .in('entry_id', entryIds)
            .eq('label_id', labelId);
          
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entry-labels'] });
      queryClient.invalidateQueries({ queryKey: ['all-entry-labels'] });
      queryClient.invalidateQueries({ queryKey: ['lab-catalog-entry-labels-public'] });
      toast.success(`Labels ${mode === 'add' ? 'added to' : mode === 'remove' ? 'removed from' : 'set for'} ${selectedEntryIds.length} templates`);
      handleClose();
      onComplete();
    },
    onError: (error) => {
      toast.error('Failed to update labels: ' + error.message);
    },
  });

  const handleClose = () => {
    setSelectedLabelIds([]);
    setMode('add');
    onOpenChange(false);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleSubmit = () => {
    if (selectedLabelIds.length === 0 && mode !== 'set') {
      toast.error('Please select at least one label');
      return;
    }
    
    bulkAssignMutation.mutate({
      entryIds: selectedEntryIds,
      labelIds: selectedLabelIds,
      mode,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Bulk Label Assignment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assign labels to {selectedEntryIds.length} selected template{selectedEntryIds.length !== 1 ? 's' : ''}.
          </p>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === 'add' ? 'default' : 'outline'}
                onClick={() => setMode('add')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Labels
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'remove' ? 'default' : 'outline'}
                onClick={() => setMode('remove')}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-1" />
                Remove Labels
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'set' ? 'default' : 'outline'}
                onClick={() => setMode('set')}
                className="flex-1"
              >
                Set Exactly
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === 'add' && 'Add selected labels to templates (keeps existing labels)'}
              {mode === 'remove' && 'Remove selected labels from templates'}
              {mode === 'set' && 'Replace all labels with selected ones'}
            </p>
          </div>

          {/* Label Selection */}
          <div className="space-y-2">
            <Label>Select Labels</Label>
            {activeLabels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active labels available.</p>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                {activeLabels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                        isSelected
                          ? `${label.color} text-white shadow-md ring-2 ring-offset-2 ring-primary`
                          : "bg-background text-foreground border hover:bg-muted"
                      )}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Labels Preview */}
          {selectedLabelIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Selected: {selectedLabelIds.length} label{selectedLabelIds.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={bulkAssignMutation.isPending || (selectedLabelIds.length === 0 && mode !== 'set')}
            >
              {bulkAssignMutation.isPending ? 'Applying...' : 'Apply to Templates'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
