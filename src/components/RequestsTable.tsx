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
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { getStatusColor, getCloudColor, getCloudTypeColor, getLOBColor } from '@/lib/statusColors';
import { cn } from '@/lib/utils';

interface RequestsTableProps {
  requests: LabRequest[];
  onDelete: (id: string) => void;
}

export const RequestsTable = ({ requests, onDelete }: RequestsTableProps) => {
  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No requests yet. Submit your first lab request above!</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      <ScrollArea className="w-full max-h-[calc(100vh-300px)]">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Ticket #</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Lab Name</TableHead>
                <TableHead className="font-semibold">Cloud</TableHead>
                <TableHead className="font-semibold">Cloud Type</TableHead>
                <TableHead className="font-semibold">LOB</TableHead>
                <TableHead className="font-semibold">User Count</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Input Cost</TableHead>
                <TableHead className="font-semibold">Selling Cost</TableHead>
                <TableHead className="font-semibold">Total Amount</TableHead>
                <TableHead className="font-semibold">Margin</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(request.id)}
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
      </ScrollArea>
    </div>
  );
};
