import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface FinanceDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigate?: (tab: string, filter?: string) => void;
}

export const FinanceDashboard = ({ labRequests, deliveryRequests, onNavigate }: FinanceDashboardProps) => {
  // Calculate total financial metrics
  const totalRevenue = labRequests.reduce((sum, r) => sum + r.totalAmountForTraining, 0);
  const totalInputCost = labRequests.reduce((sum, r) => sum + (r.inputCostPerUser * r.userCount * r.durationInDays), 0);
  const averageMargin = labRequests.length > 0 
    ? labRequests.reduce((sum, r) => sum + r.margin, 0) / labRequests.length 
    : 0;

  const deliveryRevenue = deliveryRequests.reduce((sum, r) => {
    const users = r.numberOfUsers || 0;
    return sum + ((r.sellingCostPerUser || 0) * users) - ((r.inputCostPerUser || 0) * users);
  }, 0);
  const combinedRevenue = totalRevenue + deliveryRevenue;

  // Cost by client
  const costByClient = labRequests.reduce((acc, req) => {
    if (!acc[req.client]) acc[req.client] = { name: req.client, revenue: 0, cost: 0 };
    acc[req.client].revenue += req.totalAmountForTraining;
    acc[req.client].cost += req.inputCostPerUser * req.userCount * req.durationInDays;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; cost: number }>);

  const clientData = Object.values(costByClient).slice(0, 8);

  // Cost by Line of Business
  const costByLOB = labRequests.reduce((acc, req) => {
    const lob = req.lineOfBusiness || 'Other';
    if (!acc[lob]) acc[lob] = { name: lob, revenue: 0, cost: 0, count: 0 };
    acc[lob].revenue += req.totalAmountForTraining;
    acc[lob].cost += req.inputCostPerUser * req.userCount * req.durationInDays;
    acc[lob].count++;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; cost: number; count: number }>);

  const lobData = Object.values(costByLOB);
  const lobColors = ['hsl(var(--primary))', '#22c55e', '#f59e0b', '#6b7280'];

  // Monthly revenue trend
  const monthlyData = labRequests.reduce((acc, req) => {
    const month = req.month;
    if (!acc[month]) acc[month] = { month, revenue: 0, cost: 0 };
    acc[month].revenue += req.totalAmountForTraining;
    acc[month].cost += req.inputCostPerUser * req.userCount * req.durationInDays;
    return acc;
  }, {} as Record<string, { month: string; revenue: number; cost: number }>);

  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const trendData = monthOrder
    .filter(m => monthlyData[m])
    .map(m => monthlyData[m]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Dashboard</h2>
        <Badge variant="secondary" className="bg-green-100 text-green-800">Finance</Badge>
      </div>
      
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.('solutions')}
        >
          <CardHeader className="bg-green-600 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatINR(combinedRevenue)}</div>
            <p className="text-xs text-muted-foreground">Combined solutions & delivery</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.('solutions')}
        >
          <CardHeader className="bg-red-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Total Input Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatINR(totalInputCost)}</div>
            <p className="text-xs text-muted-foreground">Solutions only</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.('solutions')}
        >
          <CardHeader className="bg-blue-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatINR(totalRevenue - totalInputCost)}</div>
            <p className="text-xs text-muted-foreground">Revenue - Cost</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onNavigate?.('solutions')}
        >
          <CardHeader className="bg-purple-500 text-white py-2 px-4 rounded-t-lg">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              Average Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatPercentage(averageMargin)}</div>
            <p className="text-xs text-muted-foreground">Across all solutions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Client */}
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base">Revenue by Client</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {clientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={clientData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                  <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No client data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by LOB */}
        <Card>
          <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
            <CardTitle className="text-base">Revenue by Line of Business</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {lobData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={lobData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="revenue"
                    label={({ name, value }) => `${name}: ₹${(value/1000).toFixed(0)}k`}
                  >
                    {lobData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={lobColors[index % lobColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatINR(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No LOB data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
          <CardTitle className="text-base">Monthly Revenue vs Cost Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatINR(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No monthly data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
