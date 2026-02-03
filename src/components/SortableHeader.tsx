import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortDirection } from '@/hooks/useSpreadsheetControls';
import { LabRequest } from '@/types/labRequest';

interface SortableHeaderProps {
  label: string;
  field?: keyof LabRequest;
  sortable?: boolean;
  currentSortField: keyof LabRequest | null;
  currentSortDirection: SortDirection;
  onSort?: (field: keyof LabRequest) => void;
  align?: 'left' | 'center' | 'right';
}

export function SortableHeader({
  label,
  field,
  sortable = true,
  currentSortField,
  currentSortDirection,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = field && currentSortField === field;
  
  const handleClick = () => {
    if (sortable && field && onSort) {
      onSort(field);
    }
  };

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <th
      className={cn(
        'spreadsheet-cell font-semibold',
        alignClass,
        sortable && field && 'cursor-pointer hover:bg-primary/80 select-none transition-colors'
      )}
      onClick={handleClick}
    >
      <div className={cn(
        'flex items-center gap-1',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}>
        <span>{label}</span>
        {sortable && field && (
          <span className="inline-flex">
            {!isActive && (
              <ArrowUpDown className="w-3 h-3 opacity-40" />
            )}
            {isActive && currentSortDirection === 'asc' && (
              <ArrowUp className="w-3 h-3" />
            )}
            {isActive && currentSortDirection === 'desc' && (
              <ArrowDown className="w-3 h-3" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}
