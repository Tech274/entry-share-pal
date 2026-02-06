import { useState, useEffect, useCallback } from 'react';
import { DeliveryRequest, LAB_STATUS_OPTIONS, CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS, LINE_OF_BUSINESS_OPTIONS, LAB_TYPE_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS } from '@/types/deliveryRequest';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { QuickStatusActions } from '@/components/delivery/QuickStatusActions';
import { EditableCell } from '@/components/EditableCell';
import { UndoRedoToolbar } from '@/components/delivery/UndoRedoToolbar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useToast } from '@/hooks/use-toast';

interface DeliveryTableProps {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
}

export const DeliveryTable = ({ requests, onDelete, onStatusChange, onUpdate }: DeliveryTableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const { canUndo, canRedo, recordEdit, undo, redo, undoStack, redoStack } = useUndoRedo();
  const { toast } = useToast();

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

  const handleCellUpdate = (id: string, field: keyof DeliveryRequest, value: string | number) => {
    if (onUpdate) {
      // Find the old value
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

  // Keyboard shortcuts for undo/redo
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
        <p className="text-muted-foreground">No delivery requests yet. Submit your first delivery request!</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      {/* Undo/Redo Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground">{requests.length} records</span>
        <UndoRedoToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          undoCount={undoStack.length}
          redoCount={redoStack.length}
        />
      </div>
      <ScrollArea className="w-full h-[calc(100vh-350px)]">
        <Table className="w-full table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-[40px] sticky left-0 bg-muted z-20">#</TableHead>
              <TableHead className="font-semibold w-[80px]">LOB</TableHead>
              <TableHead className="font-semibold w-[100px]">Potential ID</TableHead>
              <TableHead className="font-semibold w-[80px]">Ticket #</TableHead>
              <TableHead className="font-semibold w-[140px]">Training Name</TableHead>
              <TableHead className="font-semibold w-[100px]">Client</TableHead>
              <TableHead className="font-semibold w-[80px]">Lab Type</TableHead>
              <TableHead className="font-semibold w-[70px]">Cloud Type</TableHead>
              <TableHead className="font-semibold w-[70px]">TP Lab Type</TableHead>
              <TableHead className="font-semibold w-[50px]">Users</TableHead>
              <TableHead className="font-semibold w-[130px]">Lab Status</TableHead>
              <TableHead className="font-semibold w-[80px]">Category</TableHead>
              <TableHead className="font-semibold w-[90px]">Start Date</TableHead>
              <TableHead className="font-semibold w-[90px]">End Date</TableHead>
              <TableHead className="font-semibold w-[80px]">Month</TableHead>
              <TableHead className="font-semibold w-[60px]">Year</TableHead>
              <TableHead className="font-semibold w-[90px]">Input Cost</TableHead>
              <TableHead className="font-semibold w-[90px]">Selling Cost</TableHead>
              <TableHead className="font-semibold w-[90px]">Total Amount</TableHead>
              <TableHead className="font-semibold w-[100px]">Invoice Details</TableHead>
              <TableHead className="font-semibold w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow 
                  key={request.id} 
                  className={cn(
                    "transition-colors",
                    isRowSelected(request.id) 
                      ? "bg-primary/10 hover:bg-primary/15" 
                      : "hover:bg-muted/30"
                  )}
                >
                  <TableCell 
                    className={cn(
                      "font-medium sticky left-0 z-10 border-r cursor-pointer",
                      isRowSelected(request.id) 
                        ? "bg-primary/20 text-primary" 
                        : "bg-card"
                    )}
                    onClick={() => toggleRowSelection(request.id)}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.lineOfBusiness || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'lineOfBusiness', v)}
                      type="select"
                      options={LINE_OF_BUSINESS_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.potentialId || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'potentialId', v)}
                      type="text"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.freshDeskTicketNumber || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'freshDeskTicketNumber', v)}
                      type="text"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.trainingName || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'trainingName', v)}
                      type="text"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.client || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'client', v)}
                      type="text"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.cloud || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'cloud', v)}
                      type="select"
                      options={CLOUD_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.cloudType || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'cloudType', v)}
                      type="select"
                      options={CLOUD_TYPE_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.tpLabType || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'tpLabType', v)}
                      type="select"
                      options={TP_LAB_TYPE_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.numberOfUsers || 0}
                      onSave={(v) => handleCellUpdate(request.id, 'numberOfUsers', v)}
                      type="number"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={request.labStatus || 'Pending'}
                        onSave={(v) => {
                          handleCellUpdate(request.id, 'labStatus', v);
                          if (onStatusChange) onStatusChange(request.id, String(v));
                        }}
                        type="select"
                        options={LAB_STATUS_OPTIONS}
                      />
                      {onStatusChange && (
                        <QuickStatusActions
                          currentStatus={request.labStatus || 'Pending'}
                          onStatusChange={(newStatus) => onStatusChange(request.id, newStatus)}
                          compact
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.labType || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'labType', v)}
                      type="select"
                      options={LAB_TYPE_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.startDate || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'startDate', v)}
                      type="date"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.endDate || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'endDate', v)}
                      type="date"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.month || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'month', v)}
                      type="select"
                      options={MONTH_OPTIONS}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.year || new Date().getFullYear()}
                      onSave={(v) => handleCellUpdate(request.id, 'year', v)}
                      type="select"
                      options={YEAR_OPTIONS.map(String)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.inputCostPerUser || 0}
                      onSave={(v) => handleCellUpdate(request.id, 'inputCostPerUser', v)}
                      type="currency"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.sellingCostPerUser || 0}
                      onSave={(v) => handleCellUpdate(request.id, 'sellingCostPerUser', v)}
                      type="currency"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.totalAmount || 0}
                      onSave={(v) => handleCellUpdate(request.id, 'totalAmount', v)}
                      type="currency"
                      className="font-semibold"
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={request.invoiceDetails || ''}
                      onSave={(v) => handleCellUpdate(request.id, 'invoiceDetails', v)}
                      type="text"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(request.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
