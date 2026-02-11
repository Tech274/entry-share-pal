import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLabLabels, LabLabel } from '@/hooks/useLabLabels';

interface LabelMultiSelectProps {
  selectedLabelIds: string[];
  onChange: (labelIds: string[]) => void;
}

export const LabelMultiSelect = ({ selectedLabelIds, onChange }: LabelMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const { activeLabels } = useLabLabels();

  const toggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onChange([...selectedLabelIds, labelId]);
    }
  };

  const removeLabel = (labelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedLabelIds.filter(id => id !== labelId));
  };

  const selectedLabels = activeLabels.filter(l => selectedLabelIds.includes(l.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedLabels.length === 0 ? (
              <span className="text-muted-foreground">Select labels...</span>
            ) : (
              selectedLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className={cn("text-white text-xs", label.color)}
                >
                  {label.name}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => removeLabel(label.id, e)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search labels..." />
          <CommandList>
            <CommandEmpty>No labels found.</CommandEmpty>
            <CommandGroup>
              {activeLabels.map((label) => (
                <CommandItem
                  key={label.id}
                  value={label.name}
                  onSelect={() => toggleLabel(label.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLabelIds.includes(label.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className={cn("w-4 h-4 rounded mr-2", label.color)} />
                  {label.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
