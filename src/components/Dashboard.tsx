import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { 
  ClipboardList, 
  Truck, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface DashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

const MONTHS = [
  'All Months',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['All Years', '2025', '2026'];

const CHART_COLORS = {
  solutions: '#3b82f6',
  delivery: '#22c55e',
  margin: '#8b5cf6',
  revenue: '#f59e0b',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export const Dashboard = ({ labRequests, deliveryRequests }: DashboardProps) => {
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedYear, setSelectedYear] = useState('All Years');

  // Filter data based on selected month and year
  const filteredLabRequests = useMemo(() => {
    let filtered = labRequests;
    if (selectedMonth !== 'All Months') {
      filtered = filtered.filter(r => r.month === selectedMonth);
    }
    if (selectedYear !== 'All Years') {
      filtered = filtered.filter(r => r.year === parseInt(selectedYear));
    }
    return filtered;
  }, [labRequests, selectedMonth, selectedYear]);

  const filteredDeliveryRequests = useMemo(() => {
    let filtered = deliveryRequests;
    if (selectedMonth !== 'All Months') {
      filtered = filtered.filter(r => r.month === selectedMonth);
    }
    if (selectedYear !== 'All Years') {
      filtered = filtered.filter(r => r.year === parseInt(selectedYear));
    }
    return filtered;
  }, [deliveryRequests, selectedMonth, selectedYear]);

  // Calculate statistics from filtered data
  const totalLabRequests = filteredLabRequests.length;
  const totalDeliveryRequests = filteredDeliveryRequests.length;
  
  const totalLabUsers = filteredLabRequests.reduce((sum, r) => sum + (r.userCount || 0), 0);
  const totalDeliveryUsers = filteredDeliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
  
  const totalLabRevenue = filteredLabRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0);
  const totalDeliveryRevenue = filteredDeliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  
  const totalMargin = filteredLabRequests.reduce((sum, r) => sum + (r.margin || 0), 0);
  
  const solutionsSent = filteredLabRequests.filter(r => r.status === 'Solution Sent').length;
  const solutionsPending = filteredLabRequests.filter(r => r.status === 'Solution Pending').length;
  
  const deliveryReady = filteredDeliveryRequests.filter(r => r.labStatus === 'Ready' || r.labStatus === 'Completed').length;
  const deliveryInProgress = filteredDeliveryRequests.filter(r => r.labStatus === 'In Progress').length;

  // Monthly trends data (always show all months for trend chart)
  const monthlyTrendsData = useMemo(() => {
    const monthOrder = MONTHS.slice(1); // Remove 'All Months'
    return monthOrder.map(month => {
      const labForMonth = labRequests.filter(r => r.month === month);
      const deliveryForMonth = deliveryRequests.filter(r => r.month === month);
      return {
        month: month.substring(0, 3),
        solutions: labForMonth.length,
        delivery: deliveryForMonth.length,
        solutionsRevenue: labForMonth.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0),
        deliveryRevenue: deliveryForMonth.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
        margin: labForMonth.reduce((sum, r) => sum + (r.margin || 0), 0),
      };
    });
  }, [labRequests, deliveryRequests]);

  // Revenue breakdown by cloud provider
  const revenueByCloud = useMemo(() => {
    const cloudRevenue: Record<string, number> = {};
    
    filteredLabRequests.forEach(r => {
      const cloud = r.cloud || 'Other';
      cloudRevenue[cloud] = (cloudRevenue[cloud] || 0) + (r.totalAmountForTraining || 0);
    });
    
    filteredDeliveryRequests.forEach(r => {
      const cloud = r.cloud || 'Other';
      cloudRevenue[cloud] = (cloudRevenue[cloud] || 0) + (r.totalAmount || 0);
    });
    
    return Object.entries(cloudRevenue).map(([name, value]) => ({ name, value }));
  }, [filteredLabRequests, filteredDeliveryRequests]);

  // Revenue by Agent/Personnel
  const revenueByAgent = useMemo(() => {
    const agentRevenue: Record<string, { solutions: number; delivery: number }> = {};
    
    filteredLabRequests.forEach(r => {
      const agent = r.agentName || 'Unassigned';
      if (!agentRevenue[agent]) agentRevenue[agent] = { solutions: 0, delivery: 0 };
      agentRevenue[agent].solutions += (r.totalAmountForTraining || 0);
    });
    
    filteredDeliveryRequests.forEach(r => {
      const agent = r.agentName || 'Unassigned';
      if (!agentRevenue[agent]) agentRevenue[agent] = { solutions: 0, delivery: 0 };
      agentRevenue[agent].delivery += (r.totalAmount || 0);
    });
    
    return Object.entries(agentRevenue).map(([name, data]) => ({ 
      name, 
      solutions: data.solutions,
      delivery: data.delivery,
      total: data.solutions + data.delivery 
    }));
  }, [filteredLabRequests, filteredDeliveryRequests]);

  // Requests count by Agent
  const requestsByAgent = useMemo(() => {
    const agentCounts: Record<string, { solutions: number; delivery: number }> = {};
    
    filteredLabRequests.forEach(r => {
      const agent = r.agentName || 'Unassigned';
      if (!agentCounts[agent]) agentCounts[agent] = { solutions: 0, delivery: 0 };
      agentCounts[agent].solutions += 1;
    });
    
    filteredDeliveryRequests.forEach(r => {
      const agent = r.agentName || 'Unassigned';
      if (!agentCounts[agent]) agentCounts[agent] = { solutions: 0, delivery: 0 };
      agentCounts[agent].delivery += 1;
    });
    
    return Object.entries(agentCounts).map(([name, data]) => ({ 
      name, 
      solutions: data.solutions,
      delivery: data.delivery,
      total: data.solutions + data.delivery 
    }));
  }, [filteredLabRequests, filteredDeliveryRequests]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    return [
      { name: 'Solution Sent', value: solutionsSent, color: '#22c55e' },
      { name: 'Solution Pending', value: solutionsPending, color: '#f59e0b' },
      { name: 'Delivery Ready', value: deliveryReady, color: '#3b82f6' },
      { name: 'Delivery In Progress', value: deliveryInProgress, color: '#8b5cf6' },
    ].filter(item => item.value > 0);
  }, [solutionsSent, solutionsPending, deliveryReady, deliveryInProgress]);

  const stats = [
    {
      title: 'Total Solutions',
      value: totalLabRequests,
      description: `${solutionsSent} sent, ${solutionsPending} pending`,
      icon: ClipboardList,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Deliveries',
      value: totalDeliveryRequests,
      description: `${deliveryReady} ready, ${deliveryInProgress} in progress`,
      icon: Truck,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Users',
      value: totalLabUsers + totalDeliveryUsers,
      description: `${totalLabUsers} solutions, ${totalDeliveryUsers} delivery`,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${(totalLabRevenue + totalDeliveryRevenue).toLocaleString()}`,
      description: 'Combined solutions & delivery',
      icon: IndianRupee,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Total Margin',
      value: `₹${totalMargin.toLocaleString()}`,
      description: 'From solutions',
      icon: TrendingUp,
      color: totalMargin >= 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: totalMargin >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
    },
  ];

  // Recent activity (from filtered data)
  const recentLabRequests = [...filteredLabRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
    
  const recentDeliveryRequests = [...filteredDeliveryRequests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Month and Year Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map(month => (
              <SelectItem key={month} value={month}>{month}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(selectedMonth !== 'All Months' || selectedYear !== 'All Years') && (
          <span className="text-sm text-muted-foreground">
            Showing data for {selectedYear !== 'All Years' ? selectedYear : ''} {selectedMonth !== 'All Months' ? selectedMonth : ''}
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader variant="primary" className="flex flex-row items-center justify-between pb-2 pt-3">
              <CardTitle className="text-sm font-medium text-primary-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-accent">
                <stat.icon className="h-4 w-4 text-accent-foreground" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Requests Trend */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Monthly Requests Trend</CardTitle>
            <CardDescription className="text-primary-foreground/70">Solutions vs Delivery requests by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="solutions" name="Solutions" fill={CHART_COLORS.solutions} radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivery" name="Delivery" fill={CHART_COLORS.delivery} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Revenue & Margin Trend</CardTitle>
            <CardDescription className="text-primary-foreground/70">Monthly revenue and margin analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="solutionsRevenue" name="Solutions Revenue" stroke={CHART_COLORS.solutions} strokeWidth={2} dot={{ fill: CHART_COLORS.solutions }} />
                <Line type="monotone" dataKey="deliveryRevenue" name="Delivery Revenue" stroke={CHART_COLORS.delivery} strokeWidth={2} dot={{ fill: CHART_COLORS.delivery }} />
                <Line type="monotone" dataKey="margin" name="Margin" stroke={CHART_COLORS.margin} strokeWidth={2} dot={{ fill: CHART_COLORS.margin }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Cloud Provider */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Revenue by Cloud Provider</CardTitle>
            <CardDescription className="text-primary-foreground/70">Distribution across cloud platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByCloud.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByCloud}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {revenueByCloud.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Status Breakdown</CardTitle>
            <CardDescription className="text-primary-foreground/70">Current status of all requests</CardDescription>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Personnel Analytics Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Agent */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Revenue by Agent</CardTitle>
            <CardDescription className="text-primary-foreground/70">Revenue contribution by personnel</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByAgent.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByAgent} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="solutions" name="Solutions" fill={CHART_COLORS.solutions} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="delivery" name="Delivery" fill={CHART_COLORS.delivery} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Requests by Agent */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="text-primary-foreground">Requests by Agent</CardTitle>
            <CardDescription className="text-primary-foreground/70">Number of requests handled by each agent</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsByAgent.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestsByAgent}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="total"
                    label={({ name, total }) => `${name}: ${total}`}
                  >
                    {requestsByAgent.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number, name: string) => [value, name === 'total' ? 'Total Requests' : name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Solutions */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="flex items-center gap-2 text-primary-foreground">
              <ClipboardList className="h-5 w-5 text-accent" />
              Recent Solutions
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">Latest solution requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLabRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No solutions yet</p>
            ) : (
              <div className="space-y-3">
                {recentLabRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.labName || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">{req.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'Solution Sent' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium">₹{req.totalAmountForTraining?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card className="overflow-hidden">
          <CardHeader variant="primary">
            <CardTitle className="flex items-center gap-2 text-primary-foreground">
              <Truck className="h-5 w-5 text-accent" />
              Recent Deliveries
            </CardTitle>
            <CardDescription className="text-primary-foreground/70">Latest delivery requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDeliveryRequests.length === 0 ? (
              <p className="text-muted-foreground text-sm">No deliveries yet</p>
            ) : (
              <div className="space-y-3">
                {recentDeliveryRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{req.trainingName || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">{req.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.labStatus === 'Ready' || req.labStatus === 'Completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : req.labStatus === 'In Progress' ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">₹{req.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
