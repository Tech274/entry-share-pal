import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText, Clock, Loader2, KeyRound, Building2, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeliveryTabContentProps {
  requests: DeliveryRequest[];
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  initialFilter?: string;
  onFilterChange?: (filter: string | undefined) => void;
}

// Status filter: same button-inline style as Solutions listing (Filter: All | Pending | Work In-Progress | Test Credentials)
const STATUS_FILTERS = [
  { value: 'all', label: 'All', icon: Building2 },
  { value: 'Pending', label: 'Pending', icon: Clock },
  { value: 'Work-in-Progress', label: 'Work In-Progress', icon: Loader2 },
  { value: 'Test Credentials Shared', label: 'Test Credentials', icon: KeyRound },
] as const;

const LabTypeSubTabs = ({
  requests,
  onDelete,
  onStatusChange,
  onUpdate,
  label,
  showStatusBreakdown = false,
  initialFilter,
  onFilterChange,
}: {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  label: string;
  showStatusBreakdown?: boolean;
  initialFilter?: string;
  onFilterChange?: (filter: string | undefined) => void;
}) => {
  const [listSubTab, setListSubTab] = useState<string>('all');

  const pendingRequests = requests.filter((r) => r.labStatus === 'Pending');
  const wipRequests = requests.filter((r) => r.labStatus === 'Work-in-Progress');
  const testCredsRequests = requests.filter((r) => r.labStatus === 'Test Credentials Shared');

  useEffect(() => {
    if (!initialFilter) return;
    const tabMap: Record<string, string> = {
      Pending: 'Pending',
      'Work-in-Progress': 'Work-in-Progress',
      'Test Credentials Shared': 'Test Credentials Shared',
    };
    setListSubTab(tabMap[initialFilter] ?? 'all');
  }, [initialFilter]);

  const getFilteredRequests = () => {
    if (listSubTab === 'all') return requests;
    if (listSubTab === 'Pending') return pendingRequests;
    if (listSubTab === 'Work-in-Progress') return wipRequests;
    if (listSubTab === 'Test Credentials Shared') return testCredsRequests;
    return requests;
  };

  const getCount = (value: string) => {
    if (value === 'all') return requests.length;
    if (value === 'Pending') return pendingRequests.length;
    if (value === 'Work-in-Progress') return wipRequests.length;
    if (value === 'Test Credentials Shared') return testCredsRequests.length;
    return 0;
  };

  const statusToFilter: Record<string, string | undefined> = {
    Pending: 'Pending',
    'Work-in-Progress': 'Work-in-Progress',
    'Test Credentials Shared': 'Test Credentials Shared',
    all: undefined,
  };

  return (
    <div className="space-y-4">
      {showStatusBreakdown && requests.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border rounded-lg">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <Badge variant="secondary" className="text-xs">
            {requests.length}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          <ListFilter className="w-4 h-4 inline mr-1" />
          Filter:
        </span>
        {STATUS_FILTERS.map(({ value, label: tabLabel, icon: Icon }) => (
          <Button
            key={value}
            variant={listSubTab === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setListSubTab(value);
              onFilterChange?.(statusToFilter[value]);
            }}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {tabLabel}
            <Badge variant="secondary" className="ml-1">
              {getCount(value)}
            </Badge>
          </Button>
        ))}
      </div>

      <DeliveryTable
        requests={getFilteredRequests()}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export const DeliveryTabContent = ({
  requests,
  onSubmit,
  onDelete,
  onStatusChange,
  onUpdate,
  initialFilter,
  onFilterChange,
}: DeliveryTabContentProps) => {
  const [mainTab, setMainTab] = useState<string>('form');

  // Handle initial filter from dashboard navigation
  useEffect(() => {
    if (initialFilter) {
      // For any filter, show the list tab
      setMainTab('list');
    }
  }, [initialFilter]);

  // Active requests only (not in-progress or completed - those are now in ADR tab)
  const activeRequests = requests.filter(r => 
    r.labStatus !== 'Completed' && 
    r.labStatus !== 'Delivery Completed' && 
    r.labStatus !== 'Delivery In-Progress' &&
    r.labStatus !== 'Delivered'
  );

  return (
    <div className="space-y-6">
      <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full max-w-md grid-cols-2">
        <button
          onClick={() => setMainTab('form')}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            mainTab === 'form' ? 'bg-primary text-primary-foreground shadow-sm' : ''
          )}
        >
          <FileText className="w-4 h-4" />
          Entry Form
        </button>
        <button
          onClick={() => setMainTab('list')}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            mainTab === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : ''
          )}
        >
          <Truck className="w-4 h-4" />
          Requests List ({activeRequests.length})
        </button>
      </div>

      {mainTab === 'form' && (
        <div className="space-y-6">
          <DeliveryRequestForm onSubmit={onSubmit} />
        </div>
      )}

      {mainTab === 'list' && (
        <div className="space-y-4">
          <LabTypeSubTabs 
            requests={activeRequests} 
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onUpdate={onUpdate}
            label="Active Requests"
            showStatusBreakdown={true}
            initialFilter={initialFilter}
            onFilterChange={onFilterChange}
          />
        </div>
      )}
    </div>
  );
};
