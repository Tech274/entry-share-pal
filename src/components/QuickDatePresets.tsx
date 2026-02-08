import { format, startOfMonth, endOfMonth, subDays, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { CalendarRange } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickDatePresetsProps {
  onSelect: (from: string, to: string) => void;
}

type PresetKey = 'this-month' | 'last-30-days' | 'this-quarter' | 'last-quarter' | 'this-year' | 'custom';

interface Preset {
  label: string;
  getRange: () => { from: Date; to: Date };
}

const presets: Record<Exclude<PresetKey, 'custom'>, Preset> = {
  'this-month': {
    label: 'This Month',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  'last-30-days': {
    label: 'Last 30 Days',
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  'this-quarter': {
    label: 'This Quarter',
    getRange: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  'last-quarter': {
    label: 'Last Quarter',
    getRange: () => {
      const lastQuarterEnd = subDays(startOfQuarter(new Date()), 1);
      return {
        from: startOfQuarter(lastQuarterEnd),
        to: lastQuarterEnd,
      };
    },
  },
  'this-year': {
    label: 'This Year',
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
};

export function QuickDatePresets({ onSelect }: QuickDatePresetsProps) {
  const handleChange = (value: string) => {
    if (value === 'custom' || !presets[value as Exclude<PresetKey, 'custom'>]) return;
    
    const preset = presets[value as Exclude<PresetKey, 'custom'>];
    const { from, to } = preset.getRange();
    onSelect(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd'));
  };

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-36">
        <CalendarRange className="w-3.5 h-3.5 mr-1.5" />
        <SelectValue placeholder="Quick Date" />
      </SelectTrigger>
      <SelectContent className="bg-popover">
        {Object.entries(presets).map(([key, preset]) => (
          <SelectItem key={key} value={key}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
