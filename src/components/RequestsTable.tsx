import { useState } from 'react';
import { LabRequest } from '@/types/labRequest';
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
import { Trash2, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { getStatusColor, getCloudColor, getCloudTypeColor, getTPLabTypeColor, getLOBColor } from '@/lib/statusColors';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RequestsTableProps {
  requests: LabRequest[];
  onDelete: (id: string) => void;
  onConvertToDelivery?: (request: LabRequest) => Promise<void>;
}

export const RequestsTable = ({ requests, onDelete, onConvertToDelivery }: RequestsTableProps) => {
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
        <p className="text-muted-foreground">No requests yet. Submit your first lab request above!</p>
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
                <TableHead className="font-semibold">Ticket #</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Lab Name</TableHead>
                <TableHead className="font-semibold">Lab Type</TableHead>
                <TableHead className="font-semibold">Cloud Type</TableHead>
                <TableHead className="font-semibold">TP Lab Type</TableHead>
                <TableHead className="font-semibold">LOB</TableHead>
                <TableHead className="font-semibold">User Count</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Input Cost</TableHead>
                <TableHead className="font-semibold">Selling Cost</TableHead>
                <TableHead className="font-semibold">Total Amount</TableHead>
                <TableHead className="font-semibold">Margin</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold w-[120px]">Actions</TableHead>
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
                  <TableCell className="font-medium">{request.freshDeskTicketNumber || '-'}</TableCell>
                  <TableCell>{request.client || '-'}</TableCell>
                  <TableCell>{request.labName || '-'}</TableCell>
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
                  <TableCell>
                    {request.lineOfBusiness ? (
                      <Badge variant="outline" className={cn('text-xs', getLOBColor(request.lineOfBusiness))}>
                        {request.lineOfBusiness}
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{request.userCount || 0}</TableCell>
                  <TableCell>{request.durationInDays || 0} days</TableCell>
                  <TableCell>{formatINR(request.inputCostPerUser)}</TableCell>
                  <TableCell>{formatINR(request.sellingCostPerUser)}</TableCell>
                  <TableCell className="font-semibold">{formatINR(request.totalAmountForTraining)}</TableCell>
                  <TableCell>{formatPercentage(request.margin)}</TableCell>
                  <TableCell>
                    {request.status ? (
                      <Badge variant="outline" className={cn('text-xs', getStatusColor(request.status))}>
                        {request.status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
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
                                className="text-primary hover:text-primary hover:bg-primary/10"
                              >
                                <ArrowRight className="w-4 h-4" />
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
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
