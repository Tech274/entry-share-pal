import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
}: {
  requests: DeliveryRequest[];
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  label: string;
  showStatusBreakdown?: boolean;
}) => {
  const [listSubTab, setListSubTab] = useState<string>('all');

  const pendingRequests = requests.filter((r) => r.labStatus === 'Pending');
  const wipRequests = requests.filter((r) => r.labStatus === 'Work-in-Progress');
  const testCredsRequests = requests.filter((r) => r.labStatus === 'Test Credentials Shared');

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
            onClick={() => setListSubTab(value)}
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
    <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="form" className="gap-2">
          <FileText className="w-4 h-4" />
          Entry Form
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-2">
          <Truck className="w-4 h-4" />
          Requests List ({activeRequests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="space-y-6">
        <DeliveryRequestForm onSubmit={onSubmit} />
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <LabTypeSubTabs 
          requests={activeRequests} 
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
          label="Active Requests"
          showStatusBreakdown={true}
        />
      </TabsContent>
    </Tabs>
  );
};
