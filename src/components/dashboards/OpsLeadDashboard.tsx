import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { TeamWorkloadPanel } from '@/components/assignment/TeamWorkloadPanel';
import { ActivityTimeline } from '@/components/activity/ActivityTimeline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OpsLeadDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const OpsLeadDashboard = ({ labRequests, deliveryRequests }: OpsLeadDashboardProps) => {
  // Team workload by agent
  const agentWorkload = labRequests.reduce((acc, req) => {
    const agent = req.agentName || 'Unassigned';
    if (!acc[agent]) acc[agent] = { name: agent, count: 0, pending: 0 };
    acc[agent].count++;
    if (req.status === 'Solution Pending') acc[agent].pending++;
    return acc;
  }, {} as Record<string, { name: string; count: number; pending: number }>);

  const workloadData = Object.values(agentWorkload);
  
  // Pending approvals
  const pendingRequests = labRequests.filter(r => r.status === 'Solution Pending');
  
  // Status distribution
  const statusData = [
    { name: 'Pending', value: labRequests.filter(r => r.status === 'Solution Pending').length, color: '#f59e0b' },
    { name: 'Sent', value: labRequests.filter(r => r.status === 'Solution Sent').length, color: '#22c55e' },
  ];

  const deliveryStatusData = [
    { name: 'Pending', value: deliveryRequests.filter(r => r.labStatus === 'Pending').length, color: '#f59e0b' },
    { name: 'In Progress', value: deliveryRequests.filter(r => r.labStatus === 'In Progress').length, color: '#3b82f6' },
    { name: 'Ready', value: deliveryRequests.filter(r => r.labStatus === 'Ready').length, color: '#22c55e' },
    { name: 'Completed', value: deliveryRequests.filter(r => r.labStatus === 'Completed').length, color: '#6b7280' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Dashboard</h2>
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">Ops Lead</Badge>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{Object.keys(agentWorkload).length}</div>
            <p className="text-xs text-muted-foreground">Active agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-yellow-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Total Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{labRequests.length}</div>
            <p className="text-xs text-muted-foreground">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{deliveryRequests.length}</div>
            <p className="text-xs text-muted-foreground">All deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Workload Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base">Team Workload Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {workloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No workload data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base">Delivery Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {deliveryRequests.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deliveryStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {deliveryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No delivery data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Workload and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamWorkloadPanel />
        <ActivityTimeline maxItems={10} />
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader className="bg-yellow-500 text-white py-3 px-4 rounded-t-lg">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No pending approvals
            </div>
          ) : (
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">Lab Name</th>
                    <th className="text-left p-3 font-medium">Agent</th>
                    <th className="text-left p-3 font-medium">Total Amount</th>
                    <th className="text-left p-3 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{request.client}</td>
                      <td className="p-3">{request.labName || '-'}</td>
                      <td className="p-3">{request.agentName || '-'}</td>
                      <td className="p-3">{formatINR(request.totalAmountForTraining)}</td>
                      <td className="p-3">{request.receivedOn || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
