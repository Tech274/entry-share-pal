import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndianRupee, Calendar, Building2 } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RevenueBreakdownProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const RevenueBreakdown = ({ labRequests, deliveryRequests }: RevenueBreakdownProps) => {
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Revenue by month (combined from solutions + delivery)
  const revenueByMonth = [...labRequests, ...deliveryRequests].reduce((acc, req) => {
    const month = req.month;
    if (!acc[month]) acc[month] = { month, solutions: 0, delivery: 0 };
    if ('totalAmountForTraining' in req) {
      acc[month].solutions += req.totalAmountForTraining || 0;
    } else {
      acc[month].delivery += req.totalAmount || 0;
    }
    return acc;
  }, {} as Record<string, { month: string; solutions: number; delivery: number }>);

  const monthlyData = monthOrder
    .filter(m => revenueByMonth[m])
    .map(m => ({
      name: m.substring(0, 3),
      solutions: revenueByMonth[m].solutions,
      delivery: revenueByMonth[m].delivery,
      total: revenueByMonth[m].solutions + revenueByMonth[m].delivery
    }));

  // Revenue by client (top 8)
  const revenueByClient: Record<string, { client: string; solutions: number; delivery: number }> = {};
  
  labRequests.forEach(req => {
    const client = req.client || 'Unknown';
    if (!revenueByClient[client]) revenueByClient[client] = { client, solutions: 0, delivery: 0 };
    revenueByClient[client].solutions += req.totalAmountForTraining || 0;
  });

  deliveryRequests.forEach(req => {
    const client = req.client || 'Unknown';
    if (!revenueByClient[client]) revenueByClient[client] = { client, solutions: 0, delivery: 0 };
    revenueByClient[client].delivery += req.totalAmount || 0;
  });

  const clientData = Object.values(revenueByClient)
    .sort((a, b) => (b.solutions + b.delivery) - (a.solutions + a.delivery))
    .slice(0, 8)
    .map(c => ({
      name: c.client.length > 12 ? c.client.substring(0, 12) + '...' : c.client,
      solutions: c.solutions,
      delivery: c.delivery,
      total: c.solutions + c.delivery
    }));

  const totalRevenue = labRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0) + 
                       deliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary to-green-600 text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="w-4 h-4" />
          Revenue Breakdown ({formatINR(totalRevenue)})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="month" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="month" className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              By Month
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-1 text-xs">
              <Building2 className="w-3 h-3" />
              By Client
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="month">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatINR(value),
                      name === 'solutions' ? 'Solutions' : 'Delivery'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="solutions" stackId="a" fill="hsl(var(--primary))" name="Solutions" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="delivery" stackId="a" fill="#22c55e" name="Delivery" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No monthly data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="client">
            {clientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={clientData} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 9 }} 
                    width={45}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatINR(value),
                      name === 'solutions' ? 'Solutions' : 'Delivery'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="solutions" stackId="a" fill="hsl(var(--primary))" name="Solutions" />
                  <Bar dataKey="delivery" stackId="a" fill="#22c55e" name="Delivery" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No client data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
