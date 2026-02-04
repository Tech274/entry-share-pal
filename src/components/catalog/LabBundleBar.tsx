import { Button } from '@/components/ui/button';
import { Package, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabBundleBarProps {
  selectedCount: number;
  selectedLabs: { name: string; category: string }[];
  onClear: () => void;
  onRequestBundle: () => void;
}

const LabBundleBar = ({ selectedCount, selectedLabs, onClear, onRequestBundle }: LabBundleBarProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
      "bg-primary text-primary-foreground rounded-xl shadow-2xl",
      "px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-4",
      "border border-primary-foreground/20"
    )}>
      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/20 p-2 rounded-lg">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">
            {selectedCount} Lab{selectedCount > 1 ? 's' : ''} Selected
          </p>
          <p className="text-xs text-primary-foreground/70 max-w-xs truncate">
            {selectedLabs.slice(0, 3).map(l => l.name).join(', ')}
            {selectedLabs.length > 3 && ` +${selectedLabs.length - 3} more`}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClear}
          className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          size="sm"
          onClick={onRequestBundle}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Send className="h-4 w-4 mr-1" />
          Request Bundle
        </Button>
      </div>
    </div>
  );
};

export default LabBundleBar;
