import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortDirection } from '@/hooks/useSpreadsheetControls';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortField: string | null;
  currentSortDirection: SortDirection;
  onSort: (field: string) => void;
  align?: 'left' | 'center' | 'right';
}

export function SortableHeader({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = currentSortField === field;

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th
      className={cn(
        'spreadsheet-cell font-semibold cursor-pointer hover:bg-primary/80 transition-colors select-none',
        alignmentClass
      )}
      onClick={() => onSort(field)}
    >
      <div className={cn('flex items-center gap-1', align === 'right' && 'justify-end', align === 'center' && 'justify-center')}>
        <span>{label}</span>
        {isActive ? (
          currentSortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </div>
    </th>
  );
}
