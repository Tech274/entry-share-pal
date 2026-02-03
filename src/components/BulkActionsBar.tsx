import { Trash2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  statusOptions: string[];
  onUpdateStatus: (status: string) => void;
  onDelete: () => void;
  onDeselectAll: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  statusOptions,
  onUpdateStatus,
  onDelete,
  onDeselectAll,
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
