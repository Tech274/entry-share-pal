import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface StatusDistributionChartProps {
  requests: DeliveryRequest[];
  compact?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#eab308',
  'Work-in-Progress': '#3b82f6',
  'Test Credentials Shared': '#a855f7',
  'Delivery In-Progress': '#06b6d4',
  'Cancelled': '#ef4444',
};

export const StatusDistributionChart = ({ requests, compact = false }: StatusDistributionChartProps) => {
  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    
    requests.forEach(req => {
      const status = req.labStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#6b7280',
      }))
      .filter(item => item.value > 0);
  }, [requests]);

  if (requests.length === 0 || chartData.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={12}
              outerRadius={22}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [`${value}`, name]}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
                padding: '4px 8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [`${value} records`, name]}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
