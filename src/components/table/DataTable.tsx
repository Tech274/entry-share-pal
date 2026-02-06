import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown';
import { UndoRedoToolbar } from '@/components/delivery/UndoRedoToolbar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useToast } from '@/hooks/use-toast';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  editType?: 'text' | 'number' | 'select' | 'date' | 'currency' | 'percentage';
  editOptions?: string[];
  hidden?: boolean;
  priority?: 'essential' | 'optional';
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<T>) => void;
  onRowClick?: (row: T) => void;
  storageKey?: string;
  showUndoRedo?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onUpdate,
  onRowClick,
  storageKey,
  showUndoRedo = false,
  emptyMessage = 'No records found',
  actions,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(`${storageKey}-columns`);
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {
          // Fall through to default
        }
      }
    }
    return new Set(columns.filter(c => !c.hidden).map(c => c.id));
  });

  const { canUndo, canRedo, recordEdit, undo, redo, undoStack, redoStack } = useUndoRedo();
  const { toast } = useToast();

  // Persist column visibility
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`${storageKey}-columns`, JSON.stringify([...visibleColumns]));
    }
  }, [visibleColumns, storageKey]);

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isRowSelected = (id: string) => selectedRows.has(id);

  const handleCellUpdate = useCallback((id: string, field: keyof T, oldValue: any, newValue: any) => {
    if (onUpdate) {
      if (showUndoRedo) {
        recordEdit(id, field as string, oldValue, newValue);
      }
      onUpdate(id, { [field]: newValue } as Partial<T>);
    }
  }, [onUpdate, showUndoRedo, recordEdit]);

  const handleUndo = useCallback(() => {
    const action = undo();
    if (action && onUpdate) {
      onUpdate(action.id, { [action.field]: action.oldValue } as Partial<T>);
      toast({
        title: 'Undone',
        description: `Reverted ${action.field} change`,
      });
    }
  }, [undo, onUpdate, toast]);

  const handleRedo = useCallback(() => {
    const action = redo();
    if (action && onUpdate) {
      onUpdate(action.id, { [action.field]: action.newValue } as Partial<T>);
      toast({
        title: 'Redone',
        description: `Reapplied ${action.field} change`,
      });
    }
  }, [redo, onUpdate, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!showUndoRedo) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, showUndoRedo]);

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const activeColumns = columns.filter(col => visibleColumns.has(col.id));

  const getCellValue = (row: T, column: DataTableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  if (data.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground">{data.length} records</span>
        <div className="flex items-center gap-2">
          {showUndoRedo && (
            <UndoRedoToolbar
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              undoCount={undoStack.length}
              redoCount={redoStack.length}
            />
          )}
          <ColumnVisibilityDropdown
            columns={columns}
            visibleColumns={visibleColumns}
            onToggle={toggleColumnVisibility}
          />
        </div>
      </div>

      <ScrollArea className="w-full h-[calc(100vh-350px)]">
        <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="font-semibold w-[40px] text-primary-foreground sticky left-0 bg-primary z-20">
                #
              </TableHead>
              {activeColumns.map(column => (
                <TableHead
                  key={column.id}
                  className={cn(
                    'font-semibold text-primary-foreground',
                    column.width,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="font-semibold w-[60px] text-primary-foreground text-center">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={row.id}
                className={cn(
                  'transition-colors',
                  isRowSelected(row.id)
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'hover:bg-muted/30'
                )}
              >
                <TableCell
                  className={cn(
                    'font-medium sticky left-0 z-10 border-r cursor-pointer',
                    isRowSelected(row.id)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-card'
                  )}
                  onClick={() => {
                    toggleRowSelection(row.id);
                    onRowClick?.(row);
                  }}
                >
                  {index + 1}
                </TableCell>
                {activeColumns.map(column => {
                  const value = getCellValue(row, column);
                  return (
                    <TableCell
                      key={column.id}
                      className={cn(
                        'text-sm truncate',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? column.render(value, row) : String(value ?? '-')}
                    </TableCell>
                  );
                })}
                {actions && (
                  <TableCell className="text-center">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
