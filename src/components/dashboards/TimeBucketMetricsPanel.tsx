import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type MetricEntry, buildAllTimeBucketSummaries } from '@/lib/reportTimeMetrics';

interface TimeBucketMetricsPanelProps {
  title: string;
  subtitle: string;
  entries: MetricEntry[];
}

const summaryCards = (summary: ReturnType<typeof buildAllTimeBucketSummaries>[keyof ReturnType<typeof buildAllTimeBucketSummaries>][0]) => [
  { label: 'Total Requests', value: summary.totalRequests.toLocaleString() },
  { label: 'Expected Users', value: summary.totalExpectedUsers.toLocaleString() },
  { label: 'Unique Clients', value: summary.uniqueClients.toLocaleString() },
  { label: 'Unique Agents', value: summary.uniqueAgents.toLocaleString() },
];

export function TimeBucketMetricsPanel({ title, subtitle, entries }: TimeBucketMetricsPanelProps) {
  const data = useMemo(() => buildAllTimeBucketSummaries(entries), [entries]);

  const firstAvailableTab =
    (data.daily.length > 0 && 'daily') ||
    (data.weekly.length > 0 && 'weekly') ||
    (data.monthly.length > 0 && 'monthly') ||
    (data.overall.length > 0 && 'overall') ||
    'daily';

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No records found for this section yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={firstAvailableTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="overall">Overall</TabsTrigger>
          </TabsList>

          {(['daily', 'weekly', 'monthly', 'overall'] as const).map((bucket) => (
            <TabsContent key={bucket} value={bucket} className="space-y-4">
              {(data[bucket].length === 0 && (
                <p className="text-sm text-muted-foreground">No records available in this time bucket.</p>
              )) ||
                data[bucket].slice(0, 1).map((summary) => (
                  <div key={`${bucket}-${summary.key}`} className="space-y-4">
                    <div className="text-sm font-medium">{summary.label}</div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {summaryCards(summary).map((item) => (
                        <Card key={item.label}>
                          <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="text-lg font-semibold">{item.value}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="rounded-md border p-3">
                      <div className="mb-2 text-xs font-semibold text-muted-foreground">Status Breakdown</div>
                      <div className="flex flex-wrap gap-2">
                        {summary.statusCounts.map((status) => (
                          <span key={status.status} className="rounded-full bg-muted px-2 py-1 text-xs">
                            {status.status}: {status.count}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Technology Name</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead className="text-right">Expected Users</TableHead>
                            <TableHead>Lab Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Agent</TableHead>
                            <TableHead className="text-right">Requests</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.rows.slice(0, 10).map((row, index) => (
                            <TableRow key={`${row.technologyName}-${row.client}-${index}`}>
                              <TableCell>{row.technologyName}</TableCell>
                              <TableCell>{row.client}</TableCell>
                              <TableCell className="text-right">{row.expectedUsers.toLocaleString()}</TableCell>
                              <TableCell>{row.labType}</TableCell>
                              <TableCell>{row.status}</TableCell>
                              <TableCell>{row.agent}</TableCell>
                              <TableCell className="text-right">{row.requests}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
