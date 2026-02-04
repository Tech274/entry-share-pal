import { useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangeFilterProps {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
    return isValid(parsed) ? parsed : undefined;
  };

  const formatDate = (date: Date | undefined): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const fromDate = parseDate(fromValue);
  const toDate = parseDate(toValue);

  const hasValue = fromValue || toValue;

  const clearDates = () => {
    onFromChange('');
    onToChange('');
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}:</span>
      
      <Popover open={fromOpen} onOpenChange={setFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-28 justify-start text-left font-normal px-2",
              !fromDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {fromDate ? format(fromDate, 'dd MMM yy') : <span className="text-xs">From</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={(date) => {
              onFromChange(formatDate(date));
              setFromOpen(false);
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <span className="text-xs text-muted-foreground">–</span>

      <Popover open={toOpen} onOpenChange={setToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-28 justify-start text-left font-normal px-2",
              !toDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-3 w-3" />
            {toDate ? format(toDate, 'dd MMM yy') : <span className="text-xs">To</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={(date) => {
              onToChange(formatDate(date));
              setToOpen(false);
            }}
            disabled={(date) => fromDate ? date < fromDate : false}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {hasValue && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={clearDates}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
