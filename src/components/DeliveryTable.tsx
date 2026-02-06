import { useState } from 'react';
import { DeliveryRequest } from '@/types/deliveryRequest';
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
import { formatINR } from '@/lib/formatUtils';
import { getStatusColor, getCloudColor, getCloudTypeColor, getTPLabTypeColor, getLOBColor, getLabTypeColor } from '@/lib/statusColors';
import { cn } from '@/lib/utils';
import { QuickStatusActions } from '@/components/delivery/QuickStatusActions';

interface DeliveryTableProps {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const DeliveryTable = ({ requests, onDelete, onStatusChange }: DeliveryTableProps) => {
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
        <div className="min-w-[1500px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold w-[50px] sticky left-0 bg-muted z-20">#</TableHead>
                <TableHead className="font-semibold">LOB</TableHead>
                <TableHead className="font-semibold">Potential ID</TableHead>
                <TableHead className="font-semibold">Ticket #</TableHead>
                <TableHead className="font-semibold">Training Name</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Lab Type</TableHead>
                <TableHead className="font-semibold">Cloud Type</TableHead>
                <TableHead className="font-semibold">TP Lab Type</TableHead>
                <TableHead className="font-semibold">Users</TableHead>
                <TableHead className="font-semibold">Lab Status</TableHead>
                <TableHead className="font-semibold">Lab Type</TableHead>
                <TableHead className="font-semibold">Start Date</TableHead>
                <TableHead className="font-semibold">End Date</TableHead>
                <TableHead className="font-semibold">Input Cost</TableHead>
                <TableHead className="font-semibold">Selling Cost</TableHead>
                <TableHead className="font-semibold">Total Amount</TableHead>
                <TableHead className="font-semibold w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow 
                  key={request.id} 
                  className={cn(
                    "transition-colors cursor-pointer",
                    isRowSelected(request.id) 
                      ? "bg-primary/10 hover:bg-primary/15" 
                      : "hover:bg-muted/30"
                  )}
                  onClick={() => toggleRowSelection(request.id)}
                >
                  <TableCell 
                    className={cn(
                      "font-medium sticky left-0 z-10 border-r",
                      isRowSelected(request.id) 
                        ? "bg-primary/20 text-primary" 
                        : "bg-card"
                    )}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    {request.lineOfBusiness ? (
                      <Badge variant="outline" className={cn('text-xs', getLOBColor(request.lineOfBusiness))}>
                        {request.lineOfBusiness}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="font-medium">{request.potentialId || '-'}</TableCell>
                  <TableCell>{request.freshDeskTicketNumber || '-'}</TableCell>
                  <TableCell>{request.trainingName || '-'}</TableCell>
                  <TableCell>{request.client || '-'}</TableCell>
                  <TableCell>
                    {request.cloud ? (
                      <Badge variant="outline" className={cn('text-xs', getCloudColor(request.cloud))}>
                        {request.cloud}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {request.cloudType ? (
                      <Badge variant="outline" className={cn('text-xs', getCloudTypeColor(request.cloudType))}>
                        {request.cloudType}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {request.tpLabType ? (
                      <Badge variant="outline" className={cn('text-xs', getTPLabTypeColor(request.tpLabType))}>
                        {request.tpLabType}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{request.numberOfUsers || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.labStatus ? (
                        <Badge variant="outline" className={cn('text-xs', getStatusColor(request.labStatus))}>
                          {request.labStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                    {request.labType ? (
                      <Badge variant="outline" className={cn('text-xs', getLabTypeColor(request.labType))}>
                        {request.labType}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{request.startDate || '-'}</TableCell>
                  <TableCell>{request.endDate || '-'}</TableCell>
                  <TableCell>{formatINR(request.inputCostPerUser)}</TableCell>
                  <TableCell>{formatINR(request.sellingCostPerUser)}</TableCell>
                  <TableCell className="font-semibold">{formatINR(request.totalAmount)}</TableCell>
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
