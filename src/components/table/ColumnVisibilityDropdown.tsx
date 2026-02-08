import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DataTableColumn } from './DataTable';

interface ColumnVisibilityDropdownProps<T> {
  columns: DataTableColumn<T>[];
  visibleColumns: Set<string>;
  onToggle: (columnId: string) => void;
}

export function ColumnVisibilityDropdown<T>({
  columns,
  visibleColumns,
  onToggle,
}: ColumnVisibilityDropdownProps<T>) {
  const essentialColumns = columns.filter(c => c.priority === 'essential');
  const optionalColumns = columns.filter(c => c.priority === 'optional' || !c.priority);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <Settings2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {essentialColumns.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Essential
            </DropdownMenuLabel>
            {essentialColumns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.has(column.id)}
                onCheckedChange={() => onToggle(column.id)}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {optionalColumns.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Optional
            </DropdownMenuLabel>
            {optionalColumns.map(column => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={visibleColumns.has(column.id)}
                onCheckedChange={() => onToggle(column.id)}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
