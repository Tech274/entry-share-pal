import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Building2 } from 'lucide-react';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LearnersBreakdownProps {
  deliveryRequests: DeliveryRequest[];
}

export const LearnersBreakdown = ({ deliveryRequests }: LearnersBreakdownProps) => {
  // Learners by month
  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const learnersByMonth = deliveryRequests.reduce((acc, req) => {
    const month = req.month;
    if (!acc[month]) acc[month] = { month, learners: 0, count: 0 };
    acc[month].learners += req.numberOfUsers || 0;
    acc[month].count++;
    return acc;
  }, {} as Record<string, { month: string; learners: number; count: number }>);

  const monthlyData = monthOrder
    .filter(m => learnersByMonth[m])
    .map(m => ({
      name: m.substring(0, 3),
      learners: learnersByMonth[m].learners,
      deliveries: learnersByMonth[m].count
    }));

  // Learners by client (top 8)
  const learnersByClient = deliveryRequests.reduce((acc, req) => {
    const client = req.client || 'Unknown';
    if (!acc[client]) acc[client] = { client, learners: 0, count: 0 };
    acc[client].learners += req.numberOfUsers || 0;
    acc[client].count++;
    return acc;
  }, {} as Record<string, { client: string; learners: number; count: number }>);

  const clientData = Object.values(learnersByClient)
    .sort((a, b) => b.learners - a.learners)
    .slice(0, 8)
    .map(c => ({
      name: c.client.length > 15 ? c.client.substring(0, 15) + '...' : c.client,
      learners: c.learners,
      deliveries: c.count
    }));

  const totalLearners = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);

  return (
    <Card>
      <CardHeader className="bg-purple-500 text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Learners Breakdown ({totalLearners.toLocaleString()} Total)
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
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'learners' ? 'Learners' : 'Deliveries'
                    ]}
                  />
                  <Bar dataKey="learners" fill="hsl(var(--primary))" name="Learners" radius={[4, 4, 0, 0]} />
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
                <BarChart data={clientData} layout="vertical" margin={{ left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 9 }} 
                    width={55}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'learners' ? 'Learners' : 'Deliveries'
                    ]}
                  />
                  <Bar dataKey="learners" fill="#8b5cf6" name="Learners" radius={[0, 4, 4, 0]} />
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
