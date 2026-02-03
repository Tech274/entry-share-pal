import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Columns, Filter, X, RotateCcw } from 'lucide-react';
import { ColumnConfig, Filters } from '@/hooks/useSpreadsheetControls';
import { STATUS_OPTIONS, MONTH_OPTIONS, LOB_OPTIONS, CLOUD_OPTIONS } from '@/types/labRequest';
import { LAB_STATUS_OPTIONS } from '@/types/deliveryRequest';

interface SpreadsheetToolbarProps {
  columns: ColumnConfig[];
  filters: Filters;
  activeFilterCount: number;
  hiddenColumnCount: number;
  onToggleColumn: (columnId: string) => void;
  onUpdateFilter: (key: keyof Filters, value: string) => void;
  onClearFilters: () => void;
  onResetColumns: () => void;
  type?: 'solutions' | 'delivery';
}

export function SpreadsheetToolbar({
  columns,
  filters,
  activeFilterCount,
  hiddenColumnCount,
  onToggleColumn,
  onUpdateFilter,
  onClearFilters,
  onResetColumns,
  type = 'solutions',
}: SpreadsheetToolbarProps) {
  const statusOptions = type === 'delivery' ? LAB_STATUS_OPTIONS : STATUS_OPTIONS;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border-b">
      {/* Column Visibility */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Columns className="w-4 h-4" />
            Columns
            {hiddenColumnCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                {hiddenColumnCount} hidden
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto bg-popover">
          <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns
            .filter(col => col.id !== 'index' && col.id !== 'actions')
            .map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.visible}
                onCheckedChange={() => onToggleColumn(column.id)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={onResetColumns}
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset to default
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        
        <Input
          placeholder="Filter by client..."
          value={filters.client}
          onChange={(e) => onUpdateFilter('client', e.target.value)}
          className="h-8 w-40"
        />

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => onUpdateFilter('status', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.month || 'all'}
          onValueChange={(v) => onUpdateFilter('month', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Months</SelectItem>
            {MONTH_OPTIONS.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.cloud || 'all'}
          onValueChange={(v) => onUpdateFilter('cloud', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Lab Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Lab Types</SelectItem>
            {CLOUD_OPTIONS.map((cloud) => (
              <SelectItem key={cloud} value={cloud}>
                {cloud}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.lineOfBusiness || 'all'}
          onValueChange={(v) => onUpdateFilter('lineOfBusiness', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="h-8 w-28">
            <SelectValue placeholder="LOB" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All LOB</SelectItem>
            {LOB_OPTIONS.map((lob) => (
              <SelectItem key={lob} value={lob}>
                {lob}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}
