import { useState } from 'react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { RequestsTable } from '@/components/RequestsTable';
import { DeliveryTable } from '@/components/DeliveryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { Users, IndianRupee, TrendingUp, ClipboardList, Truck } from 'lucide-react';

interface CloudTabContentProps {
  title: string;
  icon: React.ReactNode;
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
}

export const CloudTabContent = ({
  title,
  icon,
  labRequests,
  deliveryRequests,
  onLabDelete,
  onDeliveryDelete,
}: CloudTabContentProps) => {
  const [showCombined, setShowCombined] = useState(true);

  // Calculate statistics
  const totalLabRevenue = labRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0);
  const totalDeliveryRevenue = deliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalRevenue = totalLabRevenue + totalDeliveryRevenue;

  const totalLabUsers = labRequests.reduce((sum, r) => sum + (r.userCount || 0), 0);
  const totalDeliveryUsers = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
  const totalUsers = totalLabUsers + totalDeliveryUsers;

  const avgMargin = labRequests.length > 0
    ? labRequests.reduce((sum, r) => sum + (r.margin || 0), 0) / labRequests.length
    : 0;

  const totalRequests = labRequests.length + deliveryRequests.length;

  // Combine and sort all requests for combined view
  const combinedRequests = [
    ...labRequests.map(r => ({ ...r, type: 'solution' as const, date: r.labStartDate || r.receivedOn })),
    ...deliveryRequests.map(r => ({ ...r, type: 'delivery' as const, date: r.startDate || r.receivedOn })),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {formatINR(totalLabRevenue)} | Delivery: {formatINR(totalDeliveryRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {totalLabUsers} | Delivery: {totalDeliveryUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {labRequests.length} solutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {labRequests.length} | Delivery: {deliveryRequests.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
            Separate Tables
          </Label>
          <Switch
            id="view-toggle"
            checked={showCombined}
            onCheckedChange={setShowCombined}
          />
          <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
            Combined View
          </Label>
        </div>
      </div>

      {/* Tables */}
      {showCombined ? (
        <CombinedTable
          requests={combinedRequests}
          onLabDelete={onLabDelete}
          onDeliveryDelete={onDeliveryDelete}
        />
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Solutions ({labRequests.length})
            </h4>
            <RequestsTable requests={labRequests} onDelete={onLabDelete} />
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Delivery ({deliveryRequests.length})
            </h4>
            <DeliveryTable requests={deliveryRequests} onDelete={onDeliveryDelete} />
          </div>
        </div>
      )}
    </div>
  );
};

// Combined table component
interface CombinedRequest {
  id: string;
  type: 'solution' | 'delivery';
  client: string;
  labName?: string | null;
  trainingName?: string;
  cloud?: string | null;
  cloudType?: string | null;
  status?: string | null;
  labStatus?: string;
  userCount?: number;
  numberOfUsers?: number;
  totalAmountForTraining?: number;
  totalAmount?: number;
  margin?: number;
  date?: string | null;
}

const CombinedTable = ({
  requests,
  onLabDelete,
  onDeliveryDelete,
}: {
  requests: CombinedRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
}) => {
  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No requests found for this cloud type.</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-left p-3 font-semibold">Client</th>
              <th className="text-left p-3 font-semibold">Lab/Training Name</th>
              <th className="text-left p-3 font-semibold">Cloud Type</th>
              <th className="text-left p-3 font-semibold">Users</th>
              <th className="text-left p-3 font-semibold">Amount</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={`${request.type}-${request.id}`} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    request.type === 'solution' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {request.type === 'solution' ? (
                      <><ClipboardList className="w-3 h-3" /> Solution</>
                    ) : (
                      <><Truck className="w-3 h-3" /> Delivery</>
                    )}
                  </span>
                </td>
                <td className="p-3">{request.client || '-'}</td>
                <td className="p-3">{request.labName || request.trainingName || '-'}</td>
                <td className="p-3">{request.cloudType || '-'}</td>
                <td className="p-3">{request.userCount || request.numberOfUsers || 0}</td>
                <td className="p-3 font-semibold">
                  {formatINR(request.totalAmountForTraining || request.totalAmount || 0)}
                </td>
                <td className="p-3">
                  <span className="text-xs">
                    {request.status || request.labStatus || '-'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => request.type === 'solution' ? onLabDelete(request.id) : onDeliveryDelete(request.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
