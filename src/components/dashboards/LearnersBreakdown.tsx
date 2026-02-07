import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Building2, ArrowRight } from 'lucide-react';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LearnersBreakdownProps {
  deliveryRequests: DeliveryRequest[];
  onNavigateToTab?: (tab: string, filter?: string) => void;
}

export const LearnersBreakdown = ({ deliveryRequests, onNavigateToTab }: LearnersBreakdownProps) => {
  const [activeTab, setActiveTab] = useState('month');
  const [animationKey, setAnimationKey] = useState(0);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Trigger animation on tab change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setActiveBarIndex(null);
  }, [activeTab]);

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
      fullName: m,
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
      fullName: c.client,
      learners: c.learners,
      deliveries: c.count
    }));

  const totalLearners = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);

  const handleBarClick = (data: any) => {
    if (onNavigateToTab && data) {
      // Navigate to delivery tab - could add month/client filter in future
      onNavigateToTab('delivery');
    }
  };

  return (
    <Card>
      <CardHeader className="bg-purple-500 text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          Learners Breakdown ({totalLearners.toLocaleString()} Total)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <BarChart 
                  key={`month-${animationKey}`}
                  data={monthlyData}
                  onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0]?.payload)}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toLocaleString(),
                      name === 'learners' ? 'Learners' : 'Deliveries'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="learners" 
                    name="Learners" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                  >
                    {monthlyData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeBarIndex === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'}
                        className="transition-all duration-200"
                        style={{ 
                          transform: activeBarIndex === index ? 'scaleY(1.02)' : 'scaleY(1)',
                          transformOrigin: 'bottom'
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No monthly data available
              </div>
            )}
            {monthlyData.length > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>Click bars to view deliveries</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="client">
            {clientData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  key={`client-${animationKey}`}
                  data={clientData} 
                  layout="vertical" 
                  margin={{ left: 60 }}
                  onClick={(data) => data?.activePayload && handleBarClick(data.activePayload[0]?.payload)}
                  className="cursor-pointer"
                >
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
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="learners" 
                    name="Learners" 
                    radius={[0, 4, 4, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                  >
                    {clientData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeBarIndex === index ? '#7c3aed' : '#8b5cf6'}
                        className="transition-all duration-200"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No client data available
              </div>
            )}
            {clientData.length > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>Click bars to view deliveries</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};