import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getStatusColor, getCloudColor, getCloudTypeColor, getTPLabTypeColor, getLOBColor, getLabTypeColor } from '@/lib/statusColors';
import { cn } from '@/lib/utils';
import { QuickStatusActions } from '@/components/delivery/QuickStatusActions';
import { EditableCell } from '@/components/EditableCell';

interface DeliveryTableProps {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
}

export const DeliveryTable = ({ requests, onDelete, onStatusChange, onUpdate }: DeliveryTableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

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
      onUpdate(id, { [field]: value });
    }
  };

  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No delivery requests yet. Submit your first delivery request!</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      <ScrollArea className="w-full h-[calc(100vh-300px)]">
        <div className="min-w-[2200px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold w-[50px] sticky left-0 bg-muted z-20">#</TableHead>
                <TableHead className="font-semibold min-w-[100px]">LOB</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Potential ID</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Ticket #</TableHead>
                <TableHead className="font-semibold min-w-[180px]">Training Name</TableHead>
                <TableHead className="font-semibold min-w-[150px]">Client</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Lab Type</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Cloud Type</TableHead>
                <TableHead className="font-semibold min-w-[100px]">TP Lab Type</TableHead>
                <TableHead className="font-semibold min-w-[80px]">Users</TableHead>
                <TableHead className="font-semibold min-w-[160px]">Lab Status</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Category</TableHead>
                <TableHead className="font-semibold min-w-[110px]">Start Date</TableHead>
                <TableHead className="font-semibold min-w-[110px]">End Date</TableHead>
                <TableHead className="font-semibold min-w-[100px]">Month</TableHead>
                <TableHead className="font-semibold min-w-[80px]">Year</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Input Cost</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Selling Cost</TableHead>
                <TableHead className="font-semibold min-w-[120px]">Total Amount</TableHead>
                <TableHead className="font-semibold min-w-[150px]">Invoice Details</TableHead>
                <TableHead className="font-semibold w-[80px]">Actions</TableHead>
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
        </div>
        <ScrollBar orientation="horizontal" />
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
