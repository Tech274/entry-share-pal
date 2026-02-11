import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndianRupee, Calendar, Building2, ArrowRight, Briefcase, Layers } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface RevenueBreakdownProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigateToTab?: (tab: string, filter?: string) => void;
}

export const RevenueBreakdown = ({ labRequests, deliveryRequests, onNavigateToTab }: RevenueBreakdownProps) => {
  const [activeTab, setActiveTab] = useState('month');
  const [animationKey, setAnimationKey] = useState(0);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setActiveBarIndex(null);
  }, [activeTab]);

  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const addRevenue = (acc: Record<string, { solutions: number; delivery: number }>, req: LabRequest | DeliveryRequest, key: string) => {
    if (!acc[key]) acc[key] = { solutions: 0, delivery: 0 };
    if ('totalAmountForTraining' in req) {
      acc[key].solutions += req.totalAmountForTraining || 0;
    } else {
      acc[key].delivery += req.totalAmount || 0;
    }
    return acc;
  };

  // Revenue by month
  const revenueByMonth = [...labRequests, ...deliveryRequests].reduce((acc, req) => {
    addRevenue(acc, req, req.month);
    return acc;
  }, {} as Record<string, { solutions: number; delivery: number }>);

  const monthlyData = monthOrder
    .filter(m => revenueByMonth[m])
    .map(m => ({
      name: m.substring(0, 3),
      fullName: m,
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
      fullName: c.client,
      solutions: c.solutions,
      delivery: c.delivery,
      total: c.solutions + c.delivery
    }));

  // Revenue by LOB (Line of Business)
  const revenueByLOB: Record<string, { solutions: number; delivery: number }> = {};
  labRequests.forEach(req => addRevenue(revenueByLOB, req, req.lineOfBusiness || 'Other'));
  deliveryRequests.forEach(req => addRevenue(revenueByLOB, req, req.lineOfBusiness || 'Other'));

  const lobData = Object.entries(revenueByLOB)
    .map(([name, data]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      solutions: data.solutions,
      delivery: data.delivery,
      total: data.solutions + data.delivery
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Revenue by Lab Type (cloud)
  const revenueByLabType: Record<string, { solutions: number; delivery: number }> = {};
  labRequests.forEach(req => addRevenue(revenueByLabType, req, req.cloud || 'Other'));
  deliveryRequests.forEach(req => addRevenue(revenueByLabType, req, req.cloud || 'Other'));

  const labTypeData = Object.entries(revenueByLabType)
    .map(([name, data]) => ({
      name: name.length > 12 ? name.substring(0, 12) + '...' : name,
      fullName: name,
      solutions: data.solutions,
      delivery: data.delivery,
      total: data.solutions + data.delivery
    }))
    .sort((a, b) => b.total - a.total);

  const deliveryMargin = deliveryRequests.reduce((sum, r) => {
    const users = r.numberOfUsers || 0;
    return sum + ((r.sellingCostPerUser || 0) * users) - ((r.inputCostPerUser || 0) * users);
  }, 0);
  const totalRevenue = labRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0) + deliveryMargin;

  const handleBarClick = (data: any, type: 'solutions' | 'delivery' | 'both') => {
    if (onNavigateToTab && data) {
      // Navigate based on which segment was clicked
      if (type === 'solutions') {
        onNavigateToTab('solutions');
      } else if (type === 'delivery') {
        onNavigateToTab('delivery');
      } else {
        onNavigateToTab('solutions');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary to-green-600 text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <IndianRupee className="w-4 h-4" />
          Revenue Breakdown ({formatINR(totalRevenue)})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="month" className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              Month
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-1 text-xs">
              <Building2 className="w-3 h-3" />
              Client
            </TabsTrigger>
            <TabsTrigger value="lob" className="flex items-center gap-1 text-xs">
              <Briefcase className="w-3 h-3" />
              LOB
            </TabsTrigger>
            <TabsTrigger value="labType" className="flex items-center gap-1 text-xs">
              <Layers className="w-3 h-3" />
              Lab Type
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="month">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart 
                  key={`month-${animationKey}`}
                  data={monthlyData}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatINR(value),
                      name === 'solutions' ? 'Solutions' : 'Delivery'
                    ]}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="solutions" 
                    stackId="a" 
                    name="Solutions" 
                    radius={[0, 0, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onClick={(data) => handleBarClick(data, 'solutions')}
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                  >
                    {monthlyData.map((_, index) => (
                      <Cell 
                        key={`cell-solutions-${index}`} 
                        fill={activeBarIndex === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'}
                        className="transition-all duration-200"
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="delivery" 
                    stackId="a" 
                    name="Delivery" 
                    radius={[4, 4, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onClick={(data) => handleBarClick(data, 'delivery')}
                  >
                    {monthlyData.map((_, index) => (
                      <Cell 
                        key={`cell-delivery-${index}`} 
                        fill={activeBarIndex === index ? '#16a34a' : '#22c55e'}
                        className="transition-all duration-200"
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
                <span>Click bars to navigate to source</span>
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
                  margin={{ left: 50 }}
                  className="cursor-pointer"
                >
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
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="solutions" 
                    stackId="a" 
                    name="Solutions"
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onClick={(data) => handleBarClick(data, 'solutions')}
                    onMouseEnter={(_, index) => setActiveBarIndex(index)}
                    onMouseLeave={() => setActiveBarIndex(null)}
                  >
                    {clientData.map((_, index) => (
                      <Cell 
                        key={`cell-solutions-${index}`} 
                        fill={activeBarIndex === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'}
                        className="transition-all duration-200"
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="delivery" 
                    stackId="a" 
                    name="Delivery" 
                    radius={[0, 4, 4, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    onClick={(data) => handleBarClick(data, 'delivery')}
                  >
                    {clientData.map((_, index) => (
                      <Cell 
                        key={`cell-delivery-${index}`} 
                        fill={activeBarIndex === index ? '#16a34a' : '#22c55e'}
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
                <span>Click bars to navigate to source</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="lob">
            {lobData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart key={`lob-${animationKey}`} data={lobData} layout="vertical" margin={{ left: 50 }} className="cursor-pointer">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={45} />
                  <Tooltip formatter={(value: number, name: string) => [formatINR(value), name === 'solutions' ? 'Solutions' : 'Delivery']} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="solutions" stackId="a" name="Solutions" onClick={(data) => handleBarClick(data, 'solutions')}>
                    {lobData.map((_, index) => (
                      <Cell key={`lob-sol-${index}`} fill={activeBarIndex === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'} className="transition-all duration-200" />
                    ))}
                  </Bar>
                  <Bar dataKey="delivery" stackId="a" name="Delivery" radius={[0, 4, 4, 0]} onClick={(data) => handleBarClick(data, 'delivery')}>
                    {lobData.map((_, index) => (
                      <Cell key={`lob-del-${index}`} fill={activeBarIndex === index ? '#16a34a' : '#22c55e'} className="transition-all duration-200" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No LOB data available</div>
            )}
            {lobData.length > 0 && <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground"><span>Click bars to navigate</span><ArrowRight className="w-3 h-3" /></div>}
          </TabsContent>

          <TabsContent value="labType">
            {labTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart key={`labType-${animationKey}`} data={labTypeData} layout="vertical" margin={{ left: 50 }} className="cursor-pointer">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={45} />
                  <Tooltip formatter={(value: number, name: string) => [formatINR(value), name === 'solutions' ? 'Solutions' : 'Delivery']} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="solutions" stackId="a" name="Solutions" onClick={(data) => handleBarClick(data, 'solutions')}>
                    {labTypeData.map((_, index) => (
                      <Cell key={`lt-sol-${index}`} fill={activeBarIndex === index ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'} className="transition-all duration-200" />
                    ))}
                  </Bar>
                  <Bar dataKey="delivery" stackId="a" name="Delivery" radius={[0, 4, 4, 0]} onClick={(data) => handleBarClick(data, 'delivery')}>
                    {labTypeData.map((_, index) => (
                      <Cell key={`lt-del-${index}`} fill={activeBarIndex === index ? '#16a34a' : '#22c55e'} className="transition-all duration-200" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No lab type data available</div>
            )}
            {labTypeData.length > 0 && <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground"><span>Click bars to navigate</span><ArrowRight className="w-3 h-3" /></div>}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};