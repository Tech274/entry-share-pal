import { Trash2, RefreshCw, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BulkAssignDialog } from '@/components/assignment/BulkAssignDialog';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  statusOptions: string[];
  requestType: 'solution' | 'delivery';
  onUpdateStatus: (status: string) => void;
  onDelete: () => void;
  onDeselectAll: () => void;
  onAssignmentComplete?: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  selectedIds,
  statusOptions,
  requestType,
  onUpdateStatus,
  onDelete,
  onDeselectAll,
  onAssignmentComplete,
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected records? This cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-primary/10 border-b border-primary/20 animate-in slide-in-from-top-2',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-primary">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
          className="h-7 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-muted-foreground" />
        <Select onValueChange={onUpdateStatus}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-4 w-px bg-border" />

      <BulkAssignDialog
        selectedIds={selectedIds}
        requestType={requestType}
        onComplete={() => {
          onAssignmentComplete?.();
          onDeselectAll();
        }}
        trigger={
          <Button variant="outline" size="sm" className="gap-1">
            <Users className="w-3.5 h-3.5" />
            Assign
          </Button>
        }
      />

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        className="gap-1"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </Button>
    </div>
  );
}
