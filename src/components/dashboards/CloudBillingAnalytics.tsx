import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { type CloudBillingDetail, type CloudProvider } from '@/hooks/useCloudBillingDetails';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Cloud, BarChart3, Layers, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const MONTHS_ORDER = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const PROVIDER_COLORS: Record<CloudProvider, string> = {
  aws: 'hsl(28, 95%, 55%)',   // warm orange
  azure: 'hsl(210, 85%, 55%)', // blue
  gcp: 'hsl(145, 65%, 45%)',  // green
};

const PROVIDER_LABELS: Record<CloudProvider, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
};

const BAR_COLORS = {
  overall_business: 'hsl(210, 70%, 55%)',
  cloud_cost: 'hsl(0, 70%, 55%)',
  invoiced: 'hsl(145, 60%, 50%)',
};

type KPIMetric = 'totalBusiness' | 'totalCost' | 'totalMargins' | 'totalInvoiced' | 'totalYTB' | 'providers';

interface Props {
  data: CloudBillingDetail[];
  onProviderFilter?: (provider: CloudProvider) => void;
  onMonthFilter?: (month: string) => void;
}

function KPICard({ icon: Icon, label, value, sub, trend, metricKey, isExpanded, onToggle }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  metricKey: KPIMetric;
  isExpanded: boolean;
  onToggle: (key: KPIMetric) => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isExpanded ? 'ring-2 ring-primary shadow-md' : ''}`}
      onClick={() => onToggle(metricKey)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold leading-tight break-all">{value}</p>
          {sub && (
            <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {sub}
            </p>
          )}
        </div>
        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </CardContent>
    </Card>
  );
}

function KPIDetailPanel({ metricKey, data, onClose }: { metricKey: KPIMetric; data: CloudBillingDetail[]; onClose: () => void }) {
  const METRIC_CONFIG: Record<KPIMetric, { title: string; getProviderValue: (rows: CloudBillingDetail[]) => number; formatValue: (v: number) => string; columns: { label: string; getValue: (r: CloudBillingDetail) => string }[] }> = {
    totalBusiness: {
      title: 'Total Business — Line Items',
      getProviderValue: (rows) => rows.reduce((s, r) => s + r.overall_business, 0),
      formatValue: formatINR,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Overall Business', getValue: (r) => formatINR(r.overall_business) },
      ],
    },
    totalCost: {
      title: 'Total Cloud Cost — Line Items',
      getProviderValue: (rows) => rows.reduce((s, r) => s + r.cloud_cost, 0),
      formatValue: formatINR,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Cloud Cost', getValue: (r) => formatINR(r.cloud_cost) },
      ],
    },
    totalMargins: {
      title: 'Total Margins — Line Items',
      getProviderValue: (rows) => rows.reduce((s, r) => s + (r.overall_business - r.cloud_cost), 0),
      formatValue: formatINR,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Business', getValue: (r) => formatINR(r.overall_business) },
        { label: 'Cost', getValue: (r) => formatINR(r.cloud_cost) },
        { label: 'Margin', getValue: (r) => formatINR(r.overall_business - r.cloud_cost) },
        { label: 'Margin %', getValue: (r) => r.overall_business > 0 ? formatPercentage(((r.overall_business - r.cloud_cost) / r.overall_business) * 100) : '0%' },
      ],
    },
    totalInvoiced: {
      title: 'Total Invoiced — Line Items',
      getProviderValue: (rows) => rows.reduce((s, r) => s + r.invoiced_to_customer, 0),
      formatValue: formatINR,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Invoiced', getValue: (r) => formatINR(r.invoiced_to_customer) },
      ],
    },
    totalYTB: {
      title: 'Yet to Bill — Line Items',
      getProviderValue: (rows) => rows.reduce((s, r) => s + r.yet_to_be_billed, 0),
      formatValue: formatINR,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Business', getValue: (r) => formatINR(r.overall_business) },
        { label: 'Invoiced', getValue: (r) => formatINR(r.invoiced_to_customer) },
        { label: 'Yet to Bill', getValue: (r) => formatINR(r.yet_to_be_billed) },
      ],
    },
    providers: {
      title: 'Provider Summary',
      getProviderValue: (rows) => rows.length,
      formatValue: (v) => `${v} entries`,
      columns: [
        { label: 'Month', getValue: (r) => `${r.month} ${r.year}` },
        { label: 'Vendor', getValue: (r) => r.vendor_name || '—' },
        { label: 'Business', getValue: (r) => formatINR(r.overall_business) },
        { label: 'Cost', getValue: (r) => formatINR(r.cloud_cost) },
        { label: 'Invoiced', getValue: (r) => formatINR(r.invoiced_to_customer) },
      ],
    },
  };

  const config = METRIC_CONFIG[metricKey];

  // Group by provider
  const grouped = useMemo(() => {
    const map: Record<string, CloudBillingDetail[]> = {};
    data.forEach((r) => {
      const key = r.provider;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return Object.entries(map).map(([provider, rows]) => ({
      provider: provider as CloudProvider,
      label: PROVIDER_LABELS[provider as CloudProvider] || provider.toUpperCase(),
      rows: rows.sort((a, b) => MONTHS_ORDER.indexOf(a.month) - MONTHS_ORDER.indexOf(b.month)),
      total: config.getProviderValue(rows),
    }));
  }, [data, config]);

  return (
    <Card className="border-primary/30 animate-in slide-in-from-top-2 duration-200">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{config.title}</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.map(({ provider, label, rows, total }) => (
          <div key={provider}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[provider] }} />
                <span className="text-sm font-semibold">{label}</span>
              </div>
              <span className="text-sm font-bold">{config.formatValue(total)}</span>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {config.columns.map((col) => (
                      <TableHead key={col.label} className="text-xs py-2">{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      {config.columns.map((col) => (
                        <TableCell key={col.label} className="text-xs py-1.5">{col.getValue(r)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}: {formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PercentTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}: {formatPercentage(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CloudBillingAnalytics({ data, onProviderFilter, onMonthFilter }: Props) {
  const [expandedKPI, setExpandedKPI] = useState<KPIMetric | null>(null);

  const toggleKPI = (key: KPIMetric) => {
    setExpandedKPI(prev => prev === key ? null : key);
  };

  const handleProviderClick = (provider: CloudProvider) => {
    onProviderFilter?.(provider);
  };

  const handleMonthClick = (rawMonth: string) => {
    onMonthFilter?.(rawMonth);
  };
  // Overall snapshot
  const overall = useMemo(() => {
    const totalBusiness = data.reduce((s, r) => s + r.overall_business, 0);
    const totalCost = data.reduce((s, r) => s + r.cloud_cost, 0);
    const totalInvoiced = data.reduce((s, r) => s + r.invoiced_to_customer, 0);
    const totalYTB = data.reduce((s, r) => s + r.yet_to_be_billed, 0);
    const totalMargins = totalBusiness - totalCost;
    const marginPct = totalBusiness > 0 ? (totalMargins / totalBusiness) * 100 : 0;
    return { totalBusiness, totalCost, totalInvoiced, totalYTB, totalMargins, marginPct };
  }, [data]);

  // Per-provider totals for pie chart
  const providerBreakdown = useMemo(() => {
    const map: Record<CloudProvider, { business: number; cost: number; invoiced: number; margins: number }> = {
      aws: { business: 0, cost: 0, invoiced: 0, margins: 0 },
      azure: { business: 0, cost: 0, invoiced: 0, margins: 0 },
      gcp: { business: 0, cost: 0, invoiced: 0, margins: 0 },
    };
    data.forEach((r) => {
      if (!map[r.provider]) return;
      map[r.provider].business += r.overall_business;
      map[r.provider].cost += r.cloud_cost;
      map[r.provider].invoiced += r.invoiced_to_customer;
      map[r.provider].margins += (r.overall_business - r.cloud_cost);
    });
    return (['aws', 'azure', 'gcp'] as CloudProvider[])
      .filter(p => map[p].business > 0)
      .map(p => ({
        name: PROVIDER_LABELS[p],
        provider: p,
        value: map[p].business,
        cost: map[p].cost,
        invoiced: map[p].invoiced,
        margins: map[p].margins,
        marginPct: map[p].business > 0 ? (map[p].margins / map[p].business) * 100 : 0,
      }));
  }, [data]);

  // Per-provider stacked bar chart data (business, cost, invoiced by provider)
  const providerBarData = useMemo(() => {
    return providerBreakdown.map(p => ({
      name: p.name,
      'Overall Business': p.value,
      'Cloud Cost': p.cost,
      'Billed': p.invoiced,
    }));
  }, [providerBreakdown]);

  // Month-on-Month data by provider for margin line chart
  const momData = useMemo(() => {
    const monthMap = new Map<string, Record<string, number>>();
    data.forEach((r) => {
      const key = `${r.month} ${r.year}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { _sortKey: MONTHS_ORDER.indexOf(r.month) + r.year * 100 });
      }
      const entry = monthMap.get(key)!;
      const margins = r.overall_business - r.cloud_cost;
      const marginPct = r.overall_business > 0 ? (margins / r.overall_business) * 100 : 0;
      entry[`${PROVIDER_LABELS[r.provider]} Margin %`] = marginPct;
      entry[`${PROVIDER_LABELS[r.provider]} Margins`] = margins;
    });
    return Array.from(monthMap.entries())
      .map(([name, vals]) => ({ name: name.replace(/\s\d{4}$/, m => ` '${m.trim().slice(2)}`), _rawMonth: name, ...vals }))
      .sort((a, b) => ((a as any)._sortKey as number) - ((b as any)._sortKey as number));
  }, [data]);

  // MoM business breakdown per provider (grouped bars)
  const momBusinessData = useMemo(() => {
    const monthMap = new Map<string, Record<string, number>>();
    data.forEach((r) => {
      const key = `${r.month} ${r.year}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { _sortKey: MONTHS_ORDER.indexOf(r.month) + r.year * 100 });
      }
      const entry = monthMap.get(key)!;
      entry[`${PROVIDER_LABELS[r.provider]} Business`] = r.overall_business;
      entry[`${PROVIDER_LABELS[r.provider]} Cost`] = r.cloud_cost;
      entry[`${PROVIDER_LABELS[r.provider]} Billed`] = r.invoiced_to_customer;
    });
    return Array.from(monthMap.entries())
      .map(([name, vals]) => ({ name: name.replace(/\s\d{4}$/, m => ` '${m.trim().slice(2)}`), _rawMonth: name, ...vals }))
      .sort((a, b) => ((a as any)._sortKey as number) - ((b as any)._sortKey as number));
  }, [data]);

  if (data.length === 0) return null;

  const RADIAN = Math.PI / 180;
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Snapshot KPIs */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Overall Cloud Snapshot
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard icon={IndianRupee} label="Total Business" value={formatINR(overall.totalBusiness)} metricKey="totalBusiness" isExpanded={expandedKPI === 'totalBusiness'} onToggle={toggleKPI} />
          <KPICard icon={Cloud} label="Total Cloud Cost" value={formatINR(overall.totalCost)} metricKey="totalCost" isExpanded={expandedKPI === 'totalCost'} onToggle={toggleKPI} />
          <KPICard
            icon={TrendingUp}
            label="Total Margins"
            value={formatINR(overall.totalMargins)}
            sub={formatPercentage(overall.marginPct)}
            trend={overall.totalMargins >= 0 ? 'up' : 'down'}
            metricKey="totalMargins"
            isExpanded={expandedKPI === 'totalMargins'}
            onToggle={toggleKPI}
          />
          <KPICard icon={IndianRupee} label="Total Invoiced" value={formatINR(overall.totalInvoiced)} metricKey="totalInvoiced" isExpanded={expandedKPI === 'totalInvoiced'} onToggle={toggleKPI} />
          <KPICard icon={Layers} label="Yet to Bill" value={formatINR(overall.totalYTB)} metricKey="totalYTB" isExpanded={expandedKPI === 'totalYTB'} onToggle={toggleKPI} />
          <KPICard icon={BarChart3} label="Providers" value={String(providerBreakdown.length)} sub={providerBreakdown.map(p => p.name).join(', ')} metricKey="providers" isExpanded={expandedKPI === 'providers'} onToggle={toggleKPI} />
        </div>
        {expandedKPI && (
          <KPIDetailPanel metricKey={expandedKPI} data={data} onClose={() => setExpandedKPI(null)} />
        )}
      </div>

      {/* Cloud Distribution: Pie + Provider Comparison Bar */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Business Share by Cloud</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={providerBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={renderPieLabel}
                  cursor="pointer"
                  onClick={(_, index) => handleProviderClick(providerBreakdown[index].provider)}
                >
                  {providerBreakdown.map((entry) => (
                    <Cell key={entry.provider} fill={PROVIDER_COLORS[entry.provider]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Business vs Cost vs Billed — by Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={providerBarData} onClick={(state) => {
                if (state?.activeLabel) {
                  const provider = providerBreakdown.find(p => p.name === state.activeLabel)?.provider;
                  if (provider) handleProviderClick(provider);
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Overall Business" fill={BAR_COLORS.overall_business} radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="Cloud Cost" fill={BAR_COLORS.cloud_cost} radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="Billed" fill={BAR_COLORS.invoiced} radius={[4, 4, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Per-Provider Detail Cards */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" /> Per-Provider Breakdown
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {providerBreakdown.map((p) => (
            <Card
              key={p.provider}
              className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]"
              onClick={() => handleProviderClick(p.provider)}
            >
              <CardHeader className="py-3 px-4" style={{ backgroundColor: PROVIDER_COLORS[p.provider], color: 'white' }}>
                <CardTitle className="text-sm flex items-center justify-between">
                  {p.name}
                  <span className="text-xs opacity-80">Click to filter ›</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Business</span>
                  <span className="font-semibold">{formatINR(p.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cloud Cost (Spent)</span>
                  <span className="font-semibold text-destructive">{formatINR(p.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Done (Invoiced)</span>
                  <span className="font-semibold text-primary">{formatINR(p.invoiced)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-muted-foreground">Profit Margins</span>
                  <span className={`font-bold ${p.margins >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatINR(p.margins)} ({formatPercentage(p.marginPct)})
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Month-on-Month Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Month-on-Month Margins (₹) by Cloud</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={momData} onClick={(state) => {
                if (state?.activeLabel) {
                  const entry = momData.find(d => d.name === state.activeLabel);
                  if (entry?._rawMonth) handleMonthClick(entry._rawMonth);
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {(['aws', 'azure', 'gcp'] as CloudProvider[]).map(p => (
                  <Bar key={p} dataKey={`${PROVIDER_LABELS[p]} Margins`} fill={PROVIDER_COLORS[p]} radius={[4, 4, 0, 0]} cursor="pointer" />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Month-on-Month Margin % by Cloud</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={momData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11 }} />
                <Tooltip content={<PercentTooltip />} />
                <Legend />
                {(['aws', 'azure', 'gcp'] as CloudProvider[]).map(p => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={`${PROVIDER_LABELS[p]} Margin %`}
                    stroke={PROVIDER_COLORS[p]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: PROVIDER_COLORS[p] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MoM Business Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Month-on-Month Business by Cloud Provider</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={momBusinessData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(['aws', 'azure', 'gcp'] as CloudProvider[]).map(p => (
                <Bar key={p} dataKey={`${PROVIDER_LABELS[p]} Business`} fill={PROVIDER_COLORS[p]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
