import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subDays, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subWeeks, parseISO, isWithinInterval } from 'date-fns';
import { CalendarIcon, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

type PresetKey = 'all-time' | 'today' | 'last-7-days' | 'last-30-days' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-quarter' | 'last-quarter' | 'this-year' | 'custom';

interface Preset {
  label: string;
  getRange: () => { from: Date | undefined; to: Date | undefined };
}

const presets: Record<Exclude<PresetKey, 'custom'>, Preset> = {
  'all-time': {
    label: 'All Time',
    getRange: () => ({
      from: undefined,
      to: undefined,
    }),
  },
  'today': {
    label: 'Today',
    getRange: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  'last-7-days': {
    label: 'Last 7 Days',
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  'last-30-days': {
    label: 'Last 30 Days',
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  'this-week': {
    label: 'This Week',
    getRange: () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = subDays(today, dayOfWeek);
      return { from: startOfWeek, to: today };
    },
  },
  'last-week': {
    label: 'Last Week',
    getRange: () => {
      const today = new Date();
      const endOfLastWeek = subDays(today, today.getDay() + 1);
      const startOfLastWeek = subDays(endOfLastWeek, 6);
      return { from: startOfLastWeek, to: endOfLastWeek };
    },
  },
  'this-month': {
    label: 'This Month',
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  'last-month': {
    label: 'Last Month',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
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

export function DateRangePickerFilter({ dateRange, onDateRangeChange, className }: DateRangePickerFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    if (value === 'custom') {
      setIsOpen(true);
      return;
    }
    
    const preset = presets[value as Exclude<PresetKey, 'custom'>];
    if (preset) {
      const { from, to } = preset.getRange();
      onDateRangeChange({ from, to });
    }
  };

  const handleClear = () => {
    onDateRangeChange({ from: undefined, to: undefined });
  };

  const getDisplayText = () => {
    if (dateRange.from && dateRange.to) {
      if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
        return format(dateRange.from, 'MMM dd, yyyy');
      }
      return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, 'MMM dd, yyyy')}`;
    }
    return 'Date Range';
  };

  const hasDateRange = dateRange.from || dateRange.to;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick Presets Dropdown */}
      <Select onValueChange={handlePresetChange}>
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
          <SelectItem value="custom">Custom Range...</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 justify-start text-left font-normal",
              !hasDateRange && "text-muted-foreground",
              hasDateRange && "border-primary bg-primary/5"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">{getDisplayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              onDateRangeChange({ from: range?.from, to: range?.to });
            }}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
          <div className="flex items-center justify-between p-3 border-t">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Utility function to check if a date string falls within a range
export function isDateInRange(
  dateString: string | null | undefined,
  range: DateRange
): boolean {
  if (!dateString || (!range.from && !range.to)) return true;
  
  try {
    const date = parseISO(dateString);
    if (range.from && range.to) {
      return isWithinInterval(date, { start: range.from, end: range.to });
    }
    if (range.from) {
      return date >= range.from;
    }
    if (range.to) {
      return date <= range.to;
    }
    return true;
  } catch {
    return true;
  }
}
