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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatINR } from '@/lib/formatUtils';

interface DeliveryTableProps {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'ready':
      return 'default';
    case 'in progress':
      return 'secondary';
    case 'pending':
      return 'outline';
    default:
      return 'outline';
  }
};

export const DeliveryTable = ({ requests, onDelete }: DeliveryTableProps) => {
  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No delivery requests yet. Submit your first delivery request!</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">LOB</TableHead>
                <TableHead className="font-semibold">Potential ID</TableHead>
                <TableHead className="font-semibold">Ticket #</TableHead>
                <TableHead className="font-semibold">Training Name</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Cloud</TableHead>
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
              {requests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>{request.lineOfBusiness || '-'}</TableCell>
                  <TableCell className="font-medium">{request.potentialId || '-'}</TableCell>
                  <TableCell>{request.freshDeskTicketNumber || '-'}</TableCell>
                  <TableCell>{request.trainingName || '-'}</TableCell>
                  <TableCell>{request.client || '-'}</TableCell>
                  <TableCell>{request.cloud || '-'}</TableCell>
                  <TableCell>{request.numberOfUsers || 0}</TableCell>
                  <TableCell>
                    {request.labStatus ? (
                      <Badge variant={getStatusVariant(request.labStatus)}>{request.labStatus}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{request.labType || '-'}</TableCell>
                  <TableCell>{request.startDate || '-'}</TableCell>
                  <TableCell>{request.endDate || '-'}</TableCell>
                  <TableCell>{formatINR(request.inputCostPerUser)}</TableCell>
                  <TableCell>{formatINR(request.sellingCostPerUser)}</TableCell>
                  <TableCell className="font-semibold">{formatINR(request.totalAmount)}</TableCell>
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
