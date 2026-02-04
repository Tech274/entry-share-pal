import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const GRADIENT_PRESETS = [
  { label: 'Violet Purple', value: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { label: 'Orange Amber', value: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { label: 'Green Emerald', value: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { label: 'Pink Rose', value: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { label: 'Sky Indigo', value: 'bg-gradient-to-r from-sky-500 to-indigo-500' },
  { label: 'Amber Yellow', value: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
  { label: 'Blue Cyan', value: 'bg-gradient-to-r from-blue-500 to-cyan-400' },
  { label: 'Red Yellow', value: 'bg-gradient-to-r from-red-400 to-yellow-400' },
  { label: 'Blue Deep', value: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  { label: 'Red Deep', value: 'bg-gradient-to-r from-red-600 to-red-400' },
  { label: 'Slate', value: 'bg-gradient-to-r from-slate-600 to-slate-400' },
  { label: 'Cyan Teal', value: 'bg-gradient-to-r from-cyan-600 to-teal-500' },
  { label: 'Red Orange', value: 'bg-gradient-to-r from-red-500 to-orange-500' },
  { label: 'Indigo Purple', value: 'bg-gradient-to-r from-indigo-500 to-purple-400' },
  { label: 'Lime Green', value: 'bg-gradient-to-r from-lime-500 to-green-400' },
  { label: 'Purple Indigo', value: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
  { label: 'Emerald Teal', value: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
  { label: 'Rose Pink', value: 'bg-gradient-to-r from-rose-500 to-pink-400' },
  { label: 'Fuchsia Purple', value: 'bg-gradient-to-r from-fuchsia-500 to-purple-500' },
  { label: 'Teal Cyan', value: 'bg-gradient-to-r from-teal-500 to-cyan-400' },
  { label: 'Primary', value: 'bg-gradient-to-r from-primary to-primary/80' },
];

interface GradientPickerProps {
  value: string;
  onChange: (gradient: string) => void;
}

export const GradientPicker = ({ value, onChange }: GradientPickerProps) => {
  const [open, setOpen] = useState(false);
  const selectedPreset = GRADIENT_PRESETS.find(g => g.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <div className={cn("w-6 h-6 rounded", value)} />
          <span className="truncate">{selectedPreset?.label || 'Custom gradient'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <ScrollArea className="h-64">
          <div className="grid grid-cols-3 gap-2 p-1">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:scale-105",
                  value === preset.value 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent hover:border-muted-foreground/30"
                )}
                onClick={() => {
                  onChange(preset.value);
                  setOpen(false);
                }}
              >
                <div className={cn("w-full h-8 rounded", preset.value)} />
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export { GRADIENT_PRESETS };
