import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, TrendingUp, IndianRupee, Activity, UserCog, Layers } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { UserManagement } from '@/components/UserManagement';
import { LabCatalogManagement } from '@/components/LabCatalogManagement';

interface AdminDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const AdminDashboard = ({ labRequests, deliveryRequests }: AdminDashboardProps) => {
  // Overall metrics
  const totalRevenue = labRequests.reduce((sum, r) => sum + r.totalAmountForTraining, 0);
  const totalUsers = labRequests.reduce((sum, r) => sum + r.userCount, 0);
  const avgMargin = labRequests.length > 0 
    ? labRequests.reduce((sum, r) => sum + r.margin, 0) / labRequests.length 
    : 0;

  // Status breakdown
  const pendingSolutions = labRequests.filter(r => r.status === 'Solution Pending').length;
  const pendingDeliveries = deliveryRequests.filter(r => r.labStatus === 'Pending').length;
  const inProgressDeliveries = deliveryRequests.filter(r => r.labStatus === 'In Progress').length;
  
  // Agent performance
  const agentPerformance = labRequests.reduce((acc, req) => {
    const agent = req.agentName || 'Unassigned';
    if (!acc[agent]) acc[agent] = { name: agent, requests: 0, revenue: 0, completed: 0 };
    acc[agent].requests++;
    acc[agent].revenue += req.totalAmountForTraining;
    if (req.status === 'Solution Sent') acc[agent].completed++;
    return acc;
  }, {} as Record<string, { name: string; requests: number; revenue: number; completed: number }>);

  const agentData = Object.values(agentPerformance).sort((a, b) => b.revenue - a.revenue);

  // Monthly trend
  const monthlyData = labRequests.reduce((acc, req) => {
    const month = req.month;
    if (!acc[month]) acc[month] = { month, solutions: 0, deliveries: 0, revenue: 0 };
    acc[month].solutions++;
    acc[month].revenue += req.totalAmountForTraining;
    return acc;
  }, {} as Record<string, { month: string; solutions: number; deliveries: number; revenue: number }>);

  deliveryRequests.forEach(req => {
    const month = req.month;
    if (!monthlyData[month]) monthlyData[month] = { month, solutions: 0, deliveries: 0, revenue: 0 };
    monthlyData[month].deliveries++;
    monthlyData[month].revenue += req.totalAmount;
  });

  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const trendData = monthOrder.filter(m => monthlyData[m]).map(m => monthlyData[m]);

  // Alerts/Exceptions
  const alerts = [
    pendingSolutions > 5 && { type: 'warning', message: `${pendingSolutions} solutions pending review` },
    pendingDeliveries > 3 && { type: 'warning', message: `${pendingDeliveries} deliveries pending` },
    avgMargin < 20 && { type: 'error', message: `Average margin below 20% (${formatPercentage(avgMargin)})` },
  ].filter(Boolean);

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex items-center gap-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Lab Catalog
            </TabsTrigger>
          </TabsList>
          <Badge variant="secondary" className="bg-red-100 text-red-800">Admin</Badge>
        </div>
      </div>
      
      <TabsContent value="overview" className="space-y-6">
        {/* System-wide KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="bg-primary text-primary-foreground py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{labRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-blue-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{deliveryRequests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-green-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <IndianRupee className="w-3 h-3" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-xl font-bold">{formatINR(totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-purple-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-yellow-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{pendingSolutions + pendingDeliveries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-teal-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Avg Margin
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{formatPercentage(avgMargin)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader className="bg-orange-500 text-white py-3 px-4 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alerts & Exceptions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {alerts.map((alert: any, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-md ${
                      alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {alert.message}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Performance */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
              <CardTitle className="text-base">Agent Performance (by Revenue)</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {agentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={agentData.slice(0, 6)} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                    <Tooltip formatter={(value: number) => formatINR(value)} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  No agent data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card>
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
              <CardTitle className="text-base">Monthly Activity Trend</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="solutions" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" name="Solutions" />
                    <Area type="monotone" dataKey="deliveries" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Deliveries" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-green-600">{labRequests.filter(r => r.status === 'Solution Sent').length}</div>
                <div className="text-sm text-muted-foreground">Solutions Sent</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{deliveryRequests.filter(r => r.labStatus === 'Completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed Deliveries</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{inProgressDeliveries}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{agentData.length}</div>
                <div className="text-sm text-muted-foreground">Active Agents</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="catalog">
        <LabCatalogManagement />
      </TabsContent>
    </Tabs>
  );
};
