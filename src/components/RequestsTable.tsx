import { useState, useEffect, useCallback } from 'react';
import { LabRequest, CLOUD_OPTIONS, STATUS_OPTIONS, LOB_OPTIONS } from '@/types/labRequest';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight, Settings2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';
import { EditableCell } from '@/components/EditableCell';
import { UndoRedoToolbar } from '@/components/delivery/UndoRedoToolbar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RequestsTableProps {
  requests: LabRequest[];
  onDelete: (id: string) => void;
  onConvertToDelivery?: (request: LabRequest) => Promise<void>;
  onUpdate?: (id: string, data: Partial<LabRequest>) => void;
}

type ColumnConfig = {
  id: string;
  header: string;
  priority: 'essential' | 'optional';
  hidden?: boolean;
};

const ALL_COLUMNS: ColumnConfig[] = [
  { id: 'freshDeskTicketNumber', header: 'Ticket #', priority: 'essential' },
  { id: 'client', header: 'Client', priority: 'essential' },
  { id: 'labName', header: 'Lab Name', priority: 'essential' },
  { id: 'cloud', header: 'Lab Type', priority: 'essential' },
  { id: 'userCount', header: 'Users', priority: 'essential' },
  { id: 'durationInDays', header: 'Duration', priority: 'essential' },
  { id: 'totalAmountForTraining', header: 'Total Amount', priority: 'essential' },
  { id: 'margin', header: 'Margin', priority: 'essential' },
  { id: 'status', header: 'Status', priority: 'essential' },
  { id: 'lineOfBusiness', header: 'LOB', priority: 'optional', hidden: true },
  { id: 'potentialId', header: 'Potential ID', priority: 'optional', hidden: true },
  { id: 'cloudType', header: 'Cloud Type', priority: 'optional', hidden: true },
  { id: 'tpLabType', header: 'TP Lab Type', priority: 'optional', hidden: true },
  { id: 'inputCostPerUser', header: 'Input Cost', priority: 'optional', hidden: true },
  { id: 'sellingCostPerUser', header: 'Selling Cost', priority: 'optional', hidden: true },
  { id: 'invoiceDetails', header: 'Invoice Details', priority: 'optional', hidden: true },
];

const STORAGE_KEY = 'requests-table-columns';

export const RequestsTable = ({ requests, onDelete, onConvertToDelivery, onUpdate }: RequestsTableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { canUndo, canRedo, recordEdit, undo, redo, undoStack, redoStack } = useUndoRedo();
  const { toast } = useToast();

  // Column visibility state with localStorage persistence
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        // Fall through
      }
    }
    return new Set(ALL_COLUMNS.filter(c => !c.hidden).map(c => c.id));
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visibleColumns]));
  }, [visibleColumns]);

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

  const handleCellUpdate = (id: string, field: keyof LabRequest, value: string | number) => {
    if (onUpdate) {
      const request = requests.find(r => r.id === id);
      if (request) {
        const oldValue = request[field] as string | number;
        recordEdit(id, field, oldValue, value);
      }
      onUpdate(id, { [field]: value });
    }
  };

  const handleUndo = useCallback(() => {
    const action = undo();
    if (action && onUpdate) {
      onUpdate(action.id, { [action.field]: action.oldValue });
      toast({
        title: 'Undone',
        description: `Reverted ${action.field} change`,
      });
    }
  }, [undo, onUpdate, toast]);

  const handleRedo = useCallback(() => {
    const action = redo();
    if (action && onUpdate) {
      onUpdate(action.id, { [action.field]: action.newValue });
      toast({
        title: 'Redone',
        description: `Reapplied ${action.field} change`,
      });
    }
  }, [redo, onUpdate, toast]);

  useEffect(() => {
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
  }, [handleUndo, handleRedo]);

  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No requests yet. Submit your first lab request above!</p>
      </div>
    );
  }

  const activeColumns = ALL_COLUMNS.filter(c => visibleColumns.has(c.id));

  const renderCell = (request: LabRequest, columnId: string) => {
    switch (columnId) {
      case 'freshDeskTicketNumber':
        return (
          <EditableCell
            value={request.freshDeskTicketNumber || ''}
            onSave={(v) => handleCellUpdate(request.id, 'freshDeskTicketNumber', v)}
            type="text"
          />
        );
      case 'client':
        return (
          <EditableCell
            value={request.client || ''}
            onSave={(v) => handleCellUpdate(request.id, 'client', v)}
            type="text"
          />
        );
      case 'labName':
        return (
          <EditableCell
            value={request.labName || ''}
            onSave={(v) => handleCellUpdate(request.id, 'labName', v)}
            type="text"
          />
        );
      case 'cloud':
        return (
          <EditableCell
            value={request.cloud || ''}
            onSave={(v) => handleCellUpdate(request.id, 'cloud', v)}
            type="select"
            options={CLOUD_OPTIONS}
          />
        );
      case 'userCount':
        return (
          <EditableCell
            value={request.userCount || 0}
            onSave={(v) => handleCellUpdate(request.id, 'userCount', v)}
            type="number"
            align="center"
          />
        );
      case 'durationInDays':
        return (
          <EditableCell
            value={request.durationInDays || 0}
            onSave={(v) => handleCellUpdate(request.id, 'durationInDays', v)}
            type="number"
            align="center"
            suffix=" days"
          />
        );
      case 'totalAmountForTraining':
        return (
          <EditableCell
            value={request.totalAmountForTraining || 0}
            onSave={(v) => handleCellUpdate(request.id, 'totalAmountForTraining', v)}
            type="currency"
            align="right"
            className="font-semibold"
          />
        );
      case 'margin':
        return (
          <EditableCell
            value={request.margin || 0}
            onSave={(v) => handleCellUpdate(request.id, 'margin', v)}
            type="percentage"
            align="right"
          />
        );
      case 'status':
        return (
          <EditableCell
            value={request.status || ''}
            onSave={(v) => handleCellUpdate(request.id, 'status', v)}
            type="select"
            options={STATUS_OPTIONS}
          />
        );
      case 'lineOfBusiness':
        return (
          <EditableCell
            value={request.lineOfBusiness || ''}
            onSave={(v) => handleCellUpdate(request.id, 'lineOfBusiness', v)}
            type="select"
            options={LOB_OPTIONS}
          />
        );
      case 'potentialId':
        return (
          <EditableCell
            value={request.potentialId || ''}
            onSave={(v) => handleCellUpdate(request.id, 'potentialId', v)}
            type="text"
          />
        );
      case 'cloudType':
        return <span className="text-sm">{request.cloudType || '-'}</span>;
      case 'tpLabType':
        return <span className="text-sm">{request.tpLabType || '-'}</span>;
      case 'inputCostPerUser':
        return (
          <EditableCell
            value={request.inputCostPerUser || 0}
            onSave={(v) => handleCellUpdate(request.id, 'inputCostPerUser', v)}
            type="currency"
            align="right"
          />
        );
      case 'sellingCostPerUser':
        return (
          <EditableCell
            value={request.sellingCostPerUser || 0}
            onSave={(v) => handleCellUpdate(request.id, 'sellingCostPerUser', v)}
            type="currency"
            align="right"
          />
        );
      case 'invoiceDetails':
        return (
          <EditableCell
            value={request.invoiceDetails || ''}
            onSave={(v) => handleCellUpdate(request.id, 'invoiceDetails', v)}
            type="text"
          />
        );
      default:
        return '-';
    }
  };

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground">{requests.length} records</span>
        <div className="flex items-center gap-2">
          {onUpdate && (
            <UndoRedoToolbar
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
              undoCount={undoStack.length}
              redoCount={redoStack.length}
            />
          )}
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
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Essential
              </DropdownMenuLabel>
              {ALL_COLUMNS.filter(c => c.priority === 'essential').map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.has(column.id)}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                Optional
              </DropdownMenuLabel>
              {ALL_COLUMNS.filter(c => c.priority === 'optional').map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.has(column.id)}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                  className="font-semibold text-primary-foreground"
                >
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="font-semibold w-[80px] text-primary-foreground text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request, index) => (
              <TableRow
                key={request.id}
                className={cn(
                  'transition-colors',
                  isRowSelected(request.id)
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'hover:bg-muted/30'
                )}
              >
                <TableCell
                  className={cn(
                    'font-medium sticky left-0 z-10 border-r cursor-pointer',
                    isRowSelected(request.id)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-card'
                  )}
                  onClick={() => toggleRowSelection(request.id)}
                >
                  {index + 1}
                </TableCell>
                {activeColumns.map(column => (
                  <TableCell key={column.id} className="p-2 truncate">
                    {renderCell(request, column.id)}
                  </TableCell>
                ))}
                <TableCell className="p-2">
                  <div className="flex items-center justify-center gap-1">
                    {onConvertToDelivery && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onConvertToDelivery(request);
                              }}
                              className="text-primary hover:text-primary hover:bg-primary/10 h-7 w-7"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Convert to Delivery</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(request.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
