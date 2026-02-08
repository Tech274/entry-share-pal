import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subDays, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { RequestsTable } from '@/components/RequestsTable';
import { DeliveryTable } from '@/components/DeliveryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { Users, IndianRupee, TrendingUp, ClipboardList, Truck, CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloudTabContentProps {
  title: string;
  icon: React.ReactNode;
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
}

type DatePreset = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear' | 'custom';

const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  try {
    return parseISO(dateStr);
  } catch {
    return null;
  }
};

const isInDateRange = (dateStr: string | null | undefined, startDate: Date | undefined, endDate: Date | undefined): boolean => {
  if (!startDate && !endDate) return true;
  const date = parseDate(dateStr);
  if (!date) return false;
  
  if (startDate && endDate) {
    return isWithinInterval(date, { start: startDate, end: endDate });
  }
  if (startDate) return date >= startDate;
  if (endDate) return date <= endDate;
  return true;
};

export const CloudTabContent = ({
  title,
  icon,
  labRequests,
  deliveryRequests,
  onLabDelete,
  onDeliveryDelete,
}: CloudTabContentProps) => {
  const [showCombined, setShowCombined] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const applyPreset = (preset: DatePreset) => {
    const today = new Date();
    setDatePreset(preset);
    
    switch (preset) {
      case 'all':
        setStartDate(undefined);
        setEndDate(undefined);
        break;
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'last7':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'last30':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case 'thisQuarter':
        setStartDate(startOfQuarter(today));
        setEndDate(endOfQuarter(today));
        break;
      case 'thisYear':
        setStartDate(startOfYear(today));
        setEndDate(endOfYear(today));
        break;
      case 'custom':
        // Keep existing dates for custom
        break;
    }
  };

  const clearDateFilter = () => {
    setDatePreset('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Filter requests based on date range
  const filteredLabRequests = useMemo(() => {
    return labRequests.filter(r => isInDateRange(r.labStartDate || r.receivedOn, startDate, endDate));
  }, [labRequests, startDate, endDate]);

  const filteredDeliveryRequests = useMemo(() => {
    return deliveryRequests.filter(r => isInDateRange(r.startDate || r.receivedOn, startDate, endDate));
  }, [deliveryRequests, startDate, endDate]);

  // Calculate statistics from filtered data
  const totalLabRevenue = filteredLabRequests.reduce((sum, r) => sum + (r.totalAmountForTraining || 0), 0);
  const totalDeliveryRevenue = filteredDeliveryRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalRevenue = totalLabRevenue + totalDeliveryRevenue;

  const totalLabUsers = filteredLabRequests.reduce((sum, r) => sum + (r.userCount || 0), 0);
  const totalDeliveryUsers = filteredDeliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
  const totalUsers = totalLabUsers + totalDeliveryUsers;

  const avgMargin = filteredLabRequests.length > 0
    ? filteredLabRequests.reduce((sum, r) => sum + (r.margin || 0), 0) / filteredLabRequests.length
    : 0;

  const totalRequests = filteredLabRequests.length + filteredDeliveryRequests.length;

  // Combine and sort all requests for combined view
  const combinedRequests = useMemo(() => [
    ...filteredLabRequests.map(r => ({ ...r, type: 'solution' as const, date: r.labStartDate || r.receivedOn })),
    ...filteredDeliveryRequests.map(r => ({ ...r, type: 'delivery' as const, date: r.startDate || r.receivedOn })),
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  }), [filteredLabRequests, filteredDeliveryRequests]);

  const presets: { value: DatePreset; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last30', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
  ];

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
        <span className="text-sm font-medium text-muted-foreground mr-2">Filter by Date:</span>
        
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant={datePreset === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => applyPreset(preset.value)}
              className="h-7 text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Custom Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={datePreset === 'custom' ? 'default' : 'outline'}
                size="sm"
                className={cn('h-7 text-xs gap-1', datePreset === 'custom' && 'bg-primary')}
              >
                <CalendarIcon className="h-3 w-3" />
                {startDate ? format(startDate, 'MMM d') : 'Start'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setDatePreset('custom');
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <span className="text-xs text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={datePreset === 'custom' ? 'default' : 'outline'}
                size="sm"
                className={cn('h-7 text-xs gap-1', datePreset === 'custom' && 'bg-primary')}
              >
                <CalendarIcon className="h-3 w-3" />
                {endDate ? format(endDate, 'MMM d') : 'End'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setDatePreset('custom');
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filter */}
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilter}
              className="h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {formatINR(totalLabRevenue)} | Delivery: {formatINR(totalDeliveryRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {totalLabUsers} | Delivery: {totalDeliveryUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgMargin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {filteredLabRequests.length} solutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Solutions: {filteredLabRequests.length} | Delivery: {filteredDeliveryRequests.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
            Separate Tables
          </Label>
          <Switch
            id="view-toggle"
            checked={showCombined}
            onCheckedChange={setShowCombined}
          />
          <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
            Combined View
          </Label>
        </div>
      </div>

      {/* Tables */}
      {showCombined ? (
        <CombinedTable
          requests={combinedRequests}
          onLabDelete={onLabDelete}
          onDeliveryDelete={onDeliveryDelete}
        />
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Solutions ({filteredLabRequests.length})
            </h4>
            <RequestsTable requests={filteredLabRequests} onDelete={onLabDelete} />
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Delivery ({filteredDeliveryRequests.length})
            </h4>
            <DeliveryTable requests={filteredDeliveryRequests} onDelete={onDeliveryDelete} />
          </div>
        </div>
      )}
    </div>
  );
};

// Combined table component
interface CombinedRequest {
  id: string;
  type: 'solution' | 'delivery';
  client: string;
  labName?: string | null;
  trainingName?: string;
  cloud?: string | null;
  cloudType?: string | null;
  status?: string | null;
  labStatus?: string;
  userCount?: number;
  numberOfUsers?: number;
  totalAmountForTraining?: number;
  totalAmount?: number;
  margin?: number;
  date?: string | null;
}

const CombinedTable = ({
  requests,
  onLabDelete,
  onDeliveryDelete,
}: {
  requests: CombinedRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
}) => {
  if (requests.length === 0) {
    return (
      <div className="form-section text-center py-12">
        <p className="text-muted-foreground">No requests found for this cloud type.</p>
      </div>
    );
  }

  return (
    <div className="form-section p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-semibold">Type</th>
              <th className="text-left p-3 font-semibold">Client</th>
              <th className="text-left p-3 font-semibold">Lab/Training Name</th>
              <th className="text-left p-3 font-semibold">Cloud Type</th>
              <th className="text-left p-3 font-semibold">Users</th>
              <th className="text-left p-3 font-semibold">Amount</th>
              <th className="text-left p-3 font-semibold">Status</th>
              <th className="text-left p-3 font-semibold w-[80px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={`${request.type}-${request.id}`} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                    request.type === 'solution' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {request.type === 'solution' ? (
                      <><ClipboardList className="w-3 h-3" /> Solution</>
                    ) : (
                      <><Truck className="w-3 h-3" /> Delivery</>
                    )}
                  </span>
                </td>
                <td className="p-3">{request.client || '-'}</td>
                <td className="p-3">{request.labName || request.trainingName || '-'}</td>
                <td className="p-3">{request.cloudType || '-'}</td>
                <td className="p-3">{request.userCount || request.numberOfUsers || 0}</td>
                <td className="p-3 font-semibold">
                  {formatINR(request.totalAmountForTraining || request.totalAmount || 0)}
                </td>
                <td className="p-3">
                  <span className="text-xs">
                    {request.status || request.labStatus || '-'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => request.type === 'solution' ? onLabDelete(request.id) : onDeliveryDelete(request.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
