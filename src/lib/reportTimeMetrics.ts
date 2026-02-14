import { format, isValid, parseISO, startOfWeek } from 'date-fns';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { LabRequest } from '@/types/labRequest';

export type TimeBucket = 'daily' | 'weekly' | 'monthly' | 'overall';

export interface MetricEntry {
  id: string;
  createdAt: string;
  technologyName: string;
  client: string;
  expectedUsers: number;
  labType: string;
  status: string;
  agent: string;
  source: 'solutions' | 'delivery';
}

export interface MetricDimensionRow {
  technologyName: string;
  client: string;
  expectedUsers: number;
  labType: string;
  status: string;
  agent: string;
  requests: number;
}

export interface BucketSummary {
  bucket: TimeBucket;
  key: string;
  label: string;
  totalRequests: number;
  totalExpectedUsers: number;
  uniqueClients: number;
  uniqueAgents: number;
  statusCounts: Array<{ status: string; count: number }>;
  rows: MetricDimensionRow[];
}

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const safeDate = (value: string) => {
  const parsed = parseISO(value);
  if (isValid(parsed)) return parsed;
  const fallback = new Date(value);
  return isValid(fallback) ? fallback : null;
};

const getTimeKey = (date: Date, bucket: TimeBucket): string => {
  if (bucket === 'daily') return format(date, 'yyyy-MM-dd');
  if (bucket === 'weekly') return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  if (bucket === 'monthly') return format(date, 'yyyy-MM');
  return 'overall';
};

const getTimeLabel = (key: string, bucket: TimeBucket): string => {
  if (bucket === 'overall') return 'Overall';
  if (bucket === 'daily') {
    const date = parseISO(key);
    return isValid(date) ? format(date, 'dd MMM yyyy') : key;
  }
  if (bucket === 'weekly') {
    const weekStart = parseISO(key);
    return isValid(weekStart) ? `Week of ${format(weekStart, 'dd MMM yyyy')}` : key;
  }
  const [year, month] = key.split('-').map(Number);
  if (!year || !month) return key;
  return monthYearFormatter.format(new Date(year, month - 1, 1));
};

const sortBucketKeys = (keys: string[], bucket: TimeBucket): string[] => {
  if (bucket === 'overall') return keys;
  return [...keys].sort((a, b) => b.localeCompare(a));
};

const normalizeLabType = (source: 'solutions' | 'delivery', request: LabRequest | DeliveryRequest): string => {
  if (source === 'delivery') {
    const delivery = request as DeliveryRequest;
    return delivery.labType || delivery.tpLabType || delivery.cloudType || delivery.cloud || 'N/A';
  }
  const solution = request as LabRequest;
  return solution.tpLabType || solution.cloudType || solution.cloud || 'N/A';
};

export const normalizeSolutionEntries = (requests: LabRequest[]): MetricEntry[] =>
  requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    technologyName: request.labName || 'N/A',
    client: request.client || 'N/A',
    expectedUsers: request.userCount || 0,
    labType: normalizeLabType('solutions', request),
    status: request.status || 'Unknown',
    agent: request.agentName || 'Unassigned',
    source: 'solutions',
  }));

export const normalizeDeliveryEntries = (requests: DeliveryRequest[]): MetricEntry[] =>
  requests.map((request) => ({
    id: request.id,
    createdAt: request.createdAt,
    technologyName: request.trainingName || request.labName || 'N/A',
    client: request.client || 'N/A',
    expectedUsers: request.numberOfUsers || 0,
    labType: normalizeLabType('delivery', request),
    status: request.labStatus || 'Unknown',
    agent: request.agentName || 'Unassigned',
    source: 'delivery',
  }));

export const buildBucketSummary = (entries: MetricEntry[], bucket: TimeBucket): BucketSummary[] => {
  const grouped = new Map<string, MetricEntry[]>();
  entries.forEach((entry) => {
    const date = safeDate(entry.createdAt);
    if (!date) return;
    const key = getTimeKey(date, bucket);
    const list = grouped.get(key) ?? [];
    list.push(entry);
    grouped.set(key, list);
  });

  return sortBucketKeys([...grouped.keys()], bucket).map((key) => {
    const bucketEntries = grouped.get(key) ?? [];
    const statusMap = new Map<string, number>();
    const rowMap = new Map<string, MetricDimensionRow>();
    const clients = new Set<string>();
    const agents = new Set<string>();

    bucketEntries.forEach((entry) => {
      clients.add(entry.client);
      agents.add(entry.agent);
      statusMap.set(entry.status, (statusMap.get(entry.status) ?? 0) + 1);
      const rowKey = [
        entry.technologyName,
        entry.client,
        entry.labType,
        entry.status,
        entry.agent,
      ].join('||');
      const current = rowMap.get(rowKey);
      if (current) {
        current.expectedUsers += entry.expectedUsers;
        current.requests += 1;
      } else {
        rowMap.set(rowKey, {
          technologyName: entry.technologyName,
          client: entry.client,
          expectedUsers: entry.expectedUsers,
          labType: entry.labType,
          status: entry.status,
          agent: entry.agent,
          requests: 1,
        });
      }
    });

    return {
      bucket,
      key,
      label: getTimeLabel(key, bucket),
      totalRequests: bucketEntries.length,
      totalExpectedUsers: bucketEntries.reduce((sum, entry) => sum + entry.expectedUsers, 0),
      uniqueClients: clients.size,
      uniqueAgents: agents.size,
      statusCounts: [...statusMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([status, count]) => ({ status, count })),
      rows: [...rowMap.values()].sort((a, b) => b.requests - a.requests || b.expectedUsers - a.expectedUsers),
    };
  });
};

export const buildAllTimeBucketSummaries = (entries: MetricEntry[]) => ({
  daily: buildBucketSummary(entries, 'daily'),
  weekly: buildBucketSummary(entries, 'weekly'),
  monthly: buildBucketSummary(entries, 'monthly'),
  overall: buildBucketSummary(entries, 'overall'),
});
