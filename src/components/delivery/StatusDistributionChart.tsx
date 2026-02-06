import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface StatusDistributionChartProps {
  requests: DeliveryRequest[];
}

const STATUS_COLORS: Record<string, string> = {
  'Pending': '#eab308',           // yellow-500
  'Work-in-Progress': '#3b82f6', // blue-500
  'Test Credentials Shared': '#a855f7', // purple-500
  'Delivery In-Progress': '#06b6d4', // cyan-500
  'Cancelled': '#ef4444',        // red-500
};

export const StatusDistributionChart = ({ requests }: StatusDistributionChartProps) => {
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
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            formatter={(value: string) => (
              <span className="text-xs text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
