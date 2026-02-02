import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { formatINR } from '@/lib/formatUtils';
import { differenceInDays, parseISO } from 'date-fns';

interface OpsEngineerDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const OpsEngineerDashboard = ({ labRequests, deliveryRequests }: OpsEngineerDashboardProps) => {
  const { user } = useAuth();
  
  // Filter to show only assigned requests (or all if no assignment system yet)
  const myLabRequests = labRequests;
  const myDeliveryRequests = deliveryRequests;
  
  const pendingLabs = myLabRequests.filter(r => r.status === 'Solution Pending');
  const readyLabs = myDeliveryRequests.filter(r => r.labStatus === 'Ready');
  
  // Labs expiring soon (within 7 days)
  const today = new Date();
  const expiringSoon = myDeliveryRequests.filter(r => {
    if (!r.endDate) return false;
    try {
      const endDate = parseISO(r.endDate);
      const daysUntilExpiry = differenceInDays(endDate, today);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
    } catch {
      return false;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Dashboard</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ops Engineer</Badge>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{myLabRequests.length}</div>
            <p className="text-xs text-muted-foreground">Assigned to me</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-yellow-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{pendingLabs.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{readyLabs.length}</div>
            <p className="text-xs text-muted-foreground">Labs ready</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-orange-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Requests */}
      <Card>
        <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
          <CardTitle className="text-base">My Assigned Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {myLabRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No requests assigned to you yet
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">Lab Name</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {myLabRequests.slice(0, 5).map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{request.client}</td>
                      <td className="p-3">{request.labName || '-'}</td>
                      <td className="p-3">
                        <Badge 
                          variant="outline" 
                          className={request.status === 'Solution Pending' 
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                            : 'bg-green-50 text-green-700 border-green-200'}
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-3">{request.labEndDate || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labs Expiring Soon */}
      {expiringSoon.length > 0 && (
        <Card>
          <CardHeader className="bg-orange-500 text-white py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Labs Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Training</th>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">End Date</th>
                    <th className="text-left p-3 font-medium">Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.map((request) => {
                    const daysLeft = request.endDate 
                      ? differenceInDays(parseISO(request.endDate), today)
                      : 0;
                    return (
                      <tr key={request.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">{request.trainingName || '-'}</td>
                        <td className="p-3">{request.client}</td>
                        <td className="p-3">{request.endDate}</td>
                        <td className="p-3">
                          <Badge 
                            variant="outline" 
                            className={daysLeft <= 2 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-orange-50 text-orange-700 border-orange-200'}
                          >
                            {daysLeft} days
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
