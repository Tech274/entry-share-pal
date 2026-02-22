import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Cloud, Server, Building, Layers, IndianRupee, ArrowRight } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR } from '@/lib/formatUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';

interface LabTypeBreakdownProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigateToTab?: (tab: string, filter?: string) => void;
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

// Animated active shape for pie chart
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))', transition: 'all 0.3s ease' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        fill={fill}
        opacity={0.3}
      />
      <text 
        x={cx} 
        y={cy - 8} 
        textAnchor="middle" 
        fill="hsl(var(--foreground))"
        className="text-xs font-semibold"
      >
        {payload.name}
      </text>
      <text 
        x={cx} 
        y={cy + 8} 
        textAnchor="middle" 
        fill="hsl(var(--muted-foreground))"
        className="text-xs"
      >
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export const LabTypeBreakdown = ({ labRequests, deliveryRequests, onNavigateToTab }: LabTypeBreakdownProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation on tab change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
    setActiveIndex(undefined);
  }, [activeTab]);

  // Trigger animation on data change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [labRequests.length, deliveryRequests.length]);

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

  // Lab Type breakdown with revenue — group AWS/Azure/GCP as "Public Cloud", SAP/Oracle/OEM as "TP Labs"
  const labTypeData = allRequests.reduce((acc, req) => {
    let type = req.cloud || 'Unknown';
    if (['AWS', 'Azure', 'GCP'].includes(type)) type = 'Public Cloud';
    else if (['SAP', 'Oracle', 'OEM'].includes(type)) type = 'TP Labs';
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

  // Cloud Type breakdown for Public Cloud (AWS, Azure, GCP)
  const publicCloudRequests = allRequests.filter(r => ['AWS', 'Azure', 'GCP'].includes(r.cloud));
  const cloudTypeData = publicCloudRequests.reduce((acc, req) => {
    const type = req.cloud || 'Unknown';
    if (!acc[type]) acc[type] = { name: type, value: 0, revenue: 0 };
    acc[type].value++;
    acc[type].revenue += req.revenue;
    return acc;
  }, {} as Record<string, { name: string; value: number; revenue: number }>);

  const cloudTypePieData = Object.values(cloudTypeData)
    .filter(d => d.name !== 'Unknown' && d.value > 0)
    .sort((a, b) => b.value - a.value);

  // TP Lab Type breakdown (SAP, Oracle, OEM)
  const tpLabRequests = allRequests.filter(r => ['SAP', 'Oracle', 'OEM'].includes(r.cloud));
  const tpLabTypeData = tpLabRequests.reduce((acc, req) => {
    const type = req.cloud || 'Unknown';
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

  const handlePieClick = (data: any, index: number, labType?: string) => {
    if (onNavigateToTab && data) {
      // Navigate to ADR tab with lab type filter
      const filterValue = labType || data.name;
      onNavigateToTab('adr', filterValue);
    }
  };

  const handleLegendClick = (labType: string) => {
    if (onNavigateToTab) {
      onNavigateToTab('adr', labType);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05 || activeIndex !== undefined) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold pointer-events-none"
        style={{ fontSize: '11px', fontWeight: 600 }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Lab Type & Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-2xl font-bold text-primary">{totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-2xl font-bold text-success">{formatINR(totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
          </div>
        </div>

        <div className="w-full">
          <div className="inline-flex h-9 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-4 mb-3">
            {[
              { value: 'overview', label: 'Overview', icon: Layers },
              { value: 'public', label: 'Public', icon: Cloud },
              { value: 'private', label: 'Private', icon: Server },
              { value: 'tp', label: 'TP Labs', icon: Building },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium ring-offset-background transition-all gap-1 focus-visible:outline-none',
                  activeTab === value ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
          
          {activeTab === 'overview' && (
            <div>
            <div className="flex gap-4 items-start">
              {/* Chart Section */}
              <div className="flex-shrink-0 w-[180px]">
                {labTypePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        key={`overview-${animationKey}`}
                        data={labTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                        paddingAngle={2}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        onClick={(data, index) => handlePieClick(data, index)}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        className="cursor-pointer"
                      >
                        {labTypePieData.map((entry) => (
                          <Cell 
                            key={entry.name} 
                            fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value} requests (${formatINR(props.payload.revenue)})`,
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                    No lab type data
                  </div>
                )}
              </div>
              
              {/* Legend/Stats Section */}
              <div className="flex-1 space-y-2 min-w-0">
                {labTypePieData.map((item) => (
                  <div 
                    key={item.name} 
                    className="p-2.5 rounded-lg bg-muted/60 border border-border/50 cursor-pointer hover:bg-muted hover:shadow-sm transition-all duration-200 group"
                    onClick={() => handleLegendClick(item.name)}
                  >
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
                        />
                        <span className="text-sm font-medium truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-bold">{item.value}</span>
                        <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {((item.value / totalRequests) * 100).toFixed(0)}%
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pl-5">
                      <IndianRupee className="w-3 h-3" />
                      <span>{formatINR(item.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
          
          {activeTab === 'public' && (
            <div>
            {cloudTypePieData.length > 0 ? (
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-[180px]">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        key={`public-${animationKey}`}
                        data={cloudTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                        paddingAngle={2}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        onClick={(data, index) => handlePieClick(data, index, 'Public Cloud')}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        className="cursor-pointer"
                      >
                        {cloudTypePieData.map((entry) => (
                          <Cell 
                            key={entry.name} 
                            fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value} requests (${formatINR(props.payload.revenue)})`,
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">Cloud Providers</h4>
                  {cloudTypePieData.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/50 cursor-pointer hover:bg-muted hover:shadow-sm transition-all duration-200 group"
                      onClick={() => handleLegendClick('Public Cloud')}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="text-xs text-muted-foreground">{formatINR(item.revenue)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{item.value}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                No Public Cloud data available
              </div>
            )}
            </div>
          )}
          
          {activeTab === 'private' && (
            <div 
              className="h-[180px] flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors group"
              onClick={() => handleLegendClick('Private Cloud')}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Server className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">{labTypeData['Private Cloud']?.value || 0}</div>
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                Private Cloud Requests
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-xl font-semibold text-success">
                {formatINR(labTypeData['Private Cloud']?.revenue || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {labTypeData['Private Cloud']?.value ? 
                  `${((labTypeData['Private Cloud'].value / totalRequests) * 100).toFixed(1)}% of total requests` : 
                  'No private cloud data'
                }
              </div>
            </div>
          )}
          
          {activeTab === 'tp' && (
            <div>
            {tpLabTypePieData.length > 0 ? (
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-[180px]">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        key={`tp-${animationKey}`}
                        data={tpLabTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={false}
                        paddingAngle={2}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                        onClick={(data, index) => handlePieClick(data, index, 'TP Labs')}
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                        className="cursor-pointer"
                      >
                        {tpLabTypePieData.map((entry) => (
                          <Cell 
                            key={entry.name} 
                            fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value} requests (${formatINR(props.payload.revenue)})`,
                          name
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">TP Lab Types</h4>
                  {tpLabTypePieData.map((item) => (
                    <div 
                      key={item.name} 
                      className="flex justify-between items-center p-2.5 rounded-lg bg-muted/60 border border-border/50 cursor-pointer hover:bg-muted hover:shadow-sm transition-all duration-200 group"
                      onClick={() => handleLegendClick('TP Labs')}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-110" 
                          style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
                        />
                        <div className="min-w-0">
                          <span className="text-sm font-medium">{item.name}</span>
                          <div className="text-xs text-muted-foreground">{formatINR(item.revenue)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{item.value}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                No TP Labs data available
              </div>
            )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};