import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Server, Building, Layers, IndianRupee } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface LabTypeBreakdownProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

const COLORS = {
  'Public Cloud': '#3b82f6',
  'Private Cloud': '#8b5cf6', 
  'TP Labs': '#f59e0b',
  'AWS': '#ff9900',
  'Azure': '#0078d4',
  'GCP': '#4285f4',
  'SAP': '#0faaff',
  'Oracle': '#f80000',
  'OEM': '#6b7280',
  'Other': '#94a3b8'
};

export const LabTypeBreakdown = ({ labRequests, deliveryRequests }: LabTypeBreakdownProps) => {
  // Combine all requests for analysis with revenue
  const allRequests = [
    ...labRequests.map(r => ({ 
      cloud: r.cloud || 'Unknown', 
      cloudType: r.cloudType || 'Unknown',
      tpLabType: r.tpLabType || 'Unknown',
      count: 1,
      revenue: r.totalAmountForTraining || 0,
      source: 'solutions' as const
    })),
    ...deliveryRequests.map(r => ({ 
      cloud: r.cloud || 'Unknown', 
      cloudType: r.cloudType || 'Unknown',
      tpLabType: r.tpLabType || 'Unknown',
      count: 1,
      revenue: r.totalAmount || 0,
      source: 'delivery' as const
    }))
  ];

  // Lab Type breakdown with revenue
  const labTypeData = allRequests.reduce((acc, req) => {
    const type = req.cloud || 'Unknown';
    if (!acc[type]) acc[type] = { name: type, value: 0, revenue: 0, solutions: 0, delivery: 0 };
    acc[type].value++;
    acc[type].revenue += req.revenue;
    if (req.source === 'solutions') acc[type].solutions += req.revenue;
    else acc[type].delivery += req.revenue;
    return acc;
  }, {} as Record<string, { name: string; value: number; revenue: number; solutions: number; delivery: number }>);

  const labTypePieData = Object.values(labTypeData)
    .filter(d => d.name !== 'Unknown' && d.value > 0)
    .sort((a, b) => b.value - a.value);

  // Cloud Type breakdown for Public Cloud
  const publicCloudRequests = allRequests.filter(r => r.cloud === 'Public Cloud');
  const cloudTypeData = publicCloudRequests.reduce((acc, req) => {
    const type = req.cloudType || 'Unknown';
    if (!acc[type]) acc[type] = { name: type, value: 0, revenue: 0 };
    acc[type].value++;
    acc[type].revenue += req.revenue;
    return acc;
  }, {} as Record<string, { name: string; value: number; revenue: number }>);

  const cloudTypePieData = Object.values(cloudTypeData)
    .filter(d => d.name !== 'Unknown' && d.value > 0)
    .sort((a, b) => b.value - a.value);

  // TP Lab Type breakdown
  const tpLabRequests = allRequests.filter(r => r.cloud === 'TP Labs');
  const tpLabTypeData = tpLabRequests.reduce((acc, req) => {
    const type = req.tpLabType || 'Unknown';
    if (!acc[type]) acc[type] = { name: type, value: 0, revenue: 0 };
    acc[type].value++;
    acc[type].revenue += req.revenue;
    return acc;
  }, {} as Record<string, { name: string; value: number; revenue: number }>);

  const tpLabTypePieData = Object.values(tpLabTypeData)
    .filter(d => d.name !== 'Unknown' && d.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalRequests = labRequests.length + deliveryRequests.length;
  const totalRevenue = allRequests.reduce((sum, r) => sum + r.revenue, 0);

  const renderCustomLabel = ({ name, percent }: { name: string; percent: number }) => {
    return percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '';
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Lab Type & Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-2xl font-bold text-primary">{totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-2xl font-bold text-green-600">{formatINR(totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1 text-xs">
              <Layers className="w-3 h-3" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-1 text-xs">
              <Cloud className="w-3 h-3" />
              Public
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-1 text-xs">
              <Server className="w-3 h-3" />
              Private
            </TabsTrigger>
            <TabsTrigger value="tp" className="flex items-center gap-1 text-xs">
              <Building className="w-3 h-3" />
              TP Labs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4">
              <div>
                {labTypePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={labTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {labTypePieData.map((entry) => (
                          <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string, props: any) => [
                        `${value} requests (${formatINR(props.payload.revenue)})`,
                        name
                      ]} />
                      <Legend wrapperStyle={{ fontSize: '9px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                    No lab type data
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {labTypePieData.map((item) => (
                  <div key={item.name} className="p-2 rounded-lg bg-muted">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">{item.name}</span>
                      <span className="text-sm font-bold">{item.value}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {formatINR(item.revenue)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {((item.value / totalRequests) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="public">
            {cloudTypePieData.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={cloudTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={false}
                    >
                      {cloudTypePieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string, props: any) => [
                      `${value} requests (${formatINR(props.payload.revenue)})`,
                      name
                    ]} />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Cloud Providers</h4>
                  {cloudTypePieData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-2 rounded bg-muted">
                      <div>
                        <span className="text-xs font-medium">{item.name}</span>
                        <div className="text-xs text-muted-foreground">{formatINR(item.revenue)}</div>
                      </div>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                No Public Cloud data available
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="private">
            <div className="h-[160px] flex flex-col items-center justify-center text-center">
              <Server className="w-10 h-10 text-purple-500 mb-2" />
              <div className="text-2xl font-bold">{labTypeData['Private Cloud']?.value || 0}</div>
              <div className="text-sm text-muted-foreground">Private Cloud Requests</div>
              <div className="text-lg font-semibold text-green-600 mt-1">
                {formatINR(labTypeData['Private Cloud']?.revenue || 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {labTypeData['Private Cloud']?.value ? 
                  `${((labTypeData['Private Cloud'].value / totalRequests) * 100).toFixed(1)}% of total` : 
                  'No private cloud data'
                }
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tp">
            {tpLabTypePieData.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={tpLabTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={false}
                    >
                      {tpLabTypePieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string, props: any) => [
                      `${value} requests (${formatINR(props.payload.revenue)})`,
                      name
                    ]} />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">TP Lab Types</h4>
                  {tpLabTypePieData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center p-2 rounded bg-muted">
                      <div>
                        <span className="text-xs font-medium">{item.name}</span>
                        <div className="text-xs text-muted-foreground">{formatINR(item.revenue)}</div>
                      </div>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
                No TP Labs data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
