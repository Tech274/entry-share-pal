import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, AlertTriangle, TrendingUp, IndianRupee, Activity, UserCog, Layers, ClipboardList, Truck, Info, Wallet } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { UserManagement } from '@/components/UserManagement';
import { LabCatalogManagement } from '@/components/LabCatalogManagement';
import { QuickActionsPanel } from './QuickActionsPanel';
import { SLAAlertCard } from './SLAAlertCard';
import { MiniCalendarWidget } from './MiniCalendarWidget';
import { LearnersBreakdown } from './LearnersBreakdown';

interface AdminDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigate?: (tab: string, filter?: string) => void;
  onNavigateToCalendar?: () => void;
}

export const AdminDashboard = ({ labRequests, deliveryRequests, onNavigate, onNavigateToCalendar }: AdminDashboardProps) => {
  // Overall metrics
  const totalRevenue = labRequests.reduce((sum, r) => sum + r.totalAmountForTraining, 0);
  // Total learners from Solutions (userCount) + Deliveries (numberOfUsers)
  const solutionLearners = labRequests.reduce((sum, r) => sum + (r.userCount || 0), 0);
  const deliveryLearners = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
  const deliveryRevenue = deliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalLearners = deliveryLearners; // Use delivery learners as they represent actual trained users
  
  // Calculate average margin percentage (margin amount / total amount × 100)
  const avgMarginPercentage = labRequests.length > 0 
    ? labRequests.reduce((sum, r) => {
        if (r.totalAmountForTraining > 0) {
          return sum + (r.margin / r.totalAmountForTraining) * 100;
        }
        return sum;
      }, 0) / labRequests.filter(r => r.totalAmountForTraining > 0).length
    : 0;

  // Status breakdown
  const pendingSolutions = labRequests.filter(r => r.status === 'Solution Pending').length;
  const pendingDeliveries = deliveryRequests.filter(r => r.labStatus === 'Pending').length;
  const inProgressDeliveries = deliveryRequests.filter(r => r.labStatus === 'Delivery In-Progress').length;
  
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
    avgMarginPercentage < 20 && { type: 'error', message: `Average margin below 20% (${formatPercentage(avgMarginPercentage)})` },
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
        {/* Solutions Overview Section - Moved to Top */}
        <Card>
          <CardHeader className="bg-blue-500 text-white py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Solutions Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('solutions')}
              >
                <div className="text-3xl font-bold text-blue-600">{labRequests.length}</div>
                <div className="text-sm text-muted-foreground">Total Solutions</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('solutions', 'Solution Pending')}
              >
                <div className="text-3xl font-bold text-amber-600">{pendingSolutions}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('solutions', 'Solution Sent')}
              >
                <div className="text-3xl font-bold text-green-600">{labRequests.filter(r => r.status === 'Solution Sent').length}</div>
                <div className="text-sm text-muted-foreground">Sent</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('solutions')}
              >
                <div className="text-xl font-bold text-primary">{formatINR(totalRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Overview Section - Moved to Top */}
        <Card>
          <CardHeader className="bg-green-500 text-white py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Delivery Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery')}
              >
                <div className="text-3xl font-bold text-green-600">{deliveryRequests.length}</div>
                <div className="text-sm text-muted-foreground">Total Deliveries</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery', 'Pending')}
              >
                <div className="text-3xl font-bold text-amber-600">{pendingDeliveries}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery', 'Delivery In-Progress')}
              >
                <div className="text-3xl font-bold text-blue-600">{inProgressDeliveries}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery', 'Delivery Completed')}
              >
                <div className="text-3xl font-bold text-emerald-600">{deliveryRequests.filter(r => r.labStatus === 'Delivery Completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery')}
              >
                <div className="text-3xl font-bold text-purple-600">{totalLearners.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Learners</div>
              </div>
              <div 
                className="text-center p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => onNavigate?.('delivery')}
              >
                <div className="text-xl font-bold text-primary">{formatINR(deliveryRevenue)}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        {onNavigate && (
          <QuickActionsPanel 
            labRequests={labRequests} 
            deliveryRequests={deliveryRequests} 
            onNavigate={onNavigate} 
          />
        )}

        {/* SLA Alerts and MoM Comparison */}
        <SLAAlertCard labRequests={labRequests} deliveryRequests={deliveryRequests} />

        {/* Mini Calendar Widget */}
        <MiniCalendarWidget 
          labRequests={labRequests} 
          deliveryRequests={deliveryRequests}
          onNavigateToCalendar={onNavigateToCalendar}
        />

        {/* System-wide KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Combined Total Revenue */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.('solutions')}
          >
            <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Total Revenue
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Combined revenue from Solutions ({formatINR(totalRevenue)}) + Delivery ({formatINR(deliveryRevenue)})</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-xl font-bold">{formatINR(totalRevenue + deliveryRevenue)}</div>
              <p className="text-xs text-muted-foreground">Solutions + Delivery</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.('solutions')}
          >
            <CardHeader className="bg-primary text-primary-foreground py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  Solutions Revenue
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Sum of Total Amount for Training from all solution requests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-xl font-bold">{formatINR(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">From {labRequests.length} solutions</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.('delivery')}
          >
            <CardHeader className="bg-green-600 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  Delivery Revenue
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Sum of Total Amount from all delivery requests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-xl font-bold">{formatINR(deliveryRevenue)}</div>
              <p className="text-xs text-muted-foreground">From {deliveryRequests.length} deliveries</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.('delivery')}
          >
            <CardHeader className="bg-purple-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Total Learners
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Sum of Number of Users from all delivery requests. Click for detailed breakdown.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{totalLearners.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From deliveries</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onNavigate?.('solutions')}
          >
            <CardHeader className="bg-teal-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Avg Margin
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Average of (Margin ÷ Total Amount × 100) across all solutions with revenue</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{formatPercentage(avgMarginPercentage)}</div>
              <p className="text-xs text-muted-foreground">From solutions</p>
            </CardContent>
          </Card>

          <Card className="cursor-default">
            <CardHeader className="bg-yellow-500 text-white py-2 px-3 rounded-t-lg">
              <CardTitle className="text-xs font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Active Agents
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Info className="w-3 h-3 opacity-70 hover:opacity-100 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      <p>Count of unique agent names across all solution requests</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-2">
              <div className="text-2xl font-bold">{agentData.length}</div>
              <p className="text-xs text-muted-foreground">Unique agents</p>
            </CardContent>
          </Card>
        </div>

        {/* Learners Breakdown */}
        <LearnersBreakdown deliveryRequests={deliveryRequests} />

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
                    <RechartsTooltip formatter={(value: number) => formatINR(value)} />
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
                    <RechartsTooltip />
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

        {/* Alerts Section - Moved to Bottom */}
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
