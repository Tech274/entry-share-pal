import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { ClipboardList, Truck } from 'lucide-react';

interface ReportsSummaryProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const ReportsSummary = ({ labRequests, deliveryRequests }: ReportsSummaryProps) => {
  // Solutions summary
  const solutionsTotals = {
    total: labRequests.length,
    pending: labRequests.filter(r => r.status === 'Solution Pending').length,
    sent: labRequests.filter(r => r.status === 'Solution Sent').length,
    pocInProgress: labRequests.filter(r => r.status === 'POC In-Progress').length,
    lostClosed: labRequests.filter(r => r.status === 'Lost/Closed').length,
    totalRevenue: labRequests.reduce((sum, r) => sum + r.totalAmountForTraining, 0),
    totalUsers: labRequests.reduce((sum, r) => sum + r.userCount, 0),
  };

  // Delivery summary
  const deliveryTotals = {
    total: deliveryRequests.length,
    pending: deliveryRequests.filter(r => r.labStatus === 'Pending').length,
    workInProgress: deliveryRequests.filter(r => r.labStatus === 'Work-in-Progress').length,
    testCredsShared: deliveryRequests.filter(r => r.labStatus === 'Test Credentials Shared').length,
    deliveryInProgress: deliveryRequests.filter(r => r.labStatus === 'Delivery In-Progress').length,
    completed: deliveryRequests.filter(r => r.labStatus === 'Delivery Completed').length,
    cancelled: deliveryRequests.filter(r => r.labStatus === 'Cancelled').length,
    totalRevenue: deliveryRequests.reduce((sum, r) => sum + r.totalAmount, 0),
    totalUsers: deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Solutions Summary */}
      <Card>
        <CardHeader className="bg-blue-500 text-white py-3 px-4 rounded-t-lg">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Solutions Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{solutionsTotals.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{solutionsTotals.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{solutionsTotals.sent}</div>
              <div className="text-sm text-muted-foreground">Sent</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{solutionsTotals.pocInProgress}</div>
              <div className="text-sm text-muted-foreground">POC In-Progress</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{solutionsTotals.lostClosed}</div>
              <div className="text-sm text-muted-foreground">Lost/Closed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{solutionsTotals.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{formatINR(solutionsTotals.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Summary */}
      <Card>
        <CardHeader className="bg-green-500 text-white py-3 px-4 rounded-t-lg">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Delivery Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{deliveryTotals.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{deliveryTotals.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{deliveryTotals.workInProgress}</div>
              <div className="text-sm text-muted-foreground">Work-in-Progress</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-cyan-600">{deliveryTotals.testCredsShared}</div>
              <div className="text-sm text-muted-foreground">Test Creds Shared</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{deliveryTotals.deliveryInProgress}</div>
              <div className="text-sm text-muted-foreground">Delivery In-Progress</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{deliveryTotals.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">{deliveryTotals.cancelled}</div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{deliveryTotals.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Learners</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-xl font-bold text-primary">{formatINR(deliveryTotals.totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
