import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface LabelInfo {
  label_id: string;
  name: string;
  color: string;
}

interface LabelFilterProps {
  labels: LabelInfo[];
  selectedLabels: string[];
  onToggleLabel: (labelId: string) => void;
  onClearAll: () => void;
}

export const LabelFilter = ({ labels, selectedLabels, onToggleLabel, onClearAll }: LabelFilterProps) => {
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 justify-center">
      {selectedLabels.length > 0 && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Clear filters
        </button>
      )}
      {labels.map((label) => {
        const isSelected = selectedLabels.includes(label.label_id);
        return (
          <button
            key={label.label_id}
            onClick={() => onToggleLabel(label.label_id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              isSelected
                ? `${label.color} text-white shadow-md scale-105`
                : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border hover:scale-[1.02]"
            )}
          >
            {label.name}
          </button>
        );
      })}
    </div>
  );
};
