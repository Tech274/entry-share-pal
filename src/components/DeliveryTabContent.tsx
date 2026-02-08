import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText, Clock, Wrench, KeyRound, XCircle } from 'lucide-react';
import { StatusFilterBar, FilterOption } from '@/components/shared/StatusFilterBar';
import { LabTypeFilterBar } from '@/components/shared/LabTypeFilterBar';

interface DeliveryTabContentProps {
  requests: DeliveryRequest[];
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  initialFilter?: string;
  onFilterChange?: (filter: string | undefined) => void;
}

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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [labTypeFilter, setLabTypeFilter] = useState<string>('all');

  // Handle initial filter from dashboard navigation
  useEffect(() => {
    if (initialFilter) {
      setMainTab('list');
      // Map initialFilter to status filter
      if (initialFilter === 'Pending') setStatusFilter('pending');
      else if (initialFilter === 'Work-in-Progress') setStatusFilter('wip');
      else if (initialFilter === 'Test Credentials Shared') setStatusFilter('test-creds');
      else setStatusFilter('all');
    }
  }, [initialFilter]);

  // Active requests only (not in-progress or completed - those are in ADR tab)
  const activeRequests = useMemo(() => requests.filter(r => 
    r.labStatus !== 'Completed' && 
    r.labStatus !== 'Delivery Completed' && 
    r.labStatus !== 'Delivery In-Progress' &&
    r.labStatus !== 'Delivered'
  ), [requests]);

  // Status counts
  const pendingRequests = useMemo(() => 
    activeRequests.filter(r => r.labStatus === 'Pending'), [activeRequests]);
  const wipRequests = useMemo(() => 
    activeRequests.filter(r => r.labStatus === 'Work-in-Progress'), [activeRequests]);
  const testCredsRequests = useMemo(() => 
    activeRequests.filter(r => r.labStatus === 'Test Credentials Shared'), [activeRequests]);
  const cancelledRequests = useMemo(() => 
    activeRequests.filter(r => r.labStatus === 'Cancelled'), [activeRequests]);

  // Status filter options
  const statusFilterOptions: FilterOption[] = [
    { key: 'all', label: 'All', count: activeRequests.length },
    { key: 'pending', label: 'Pending', count: pendingRequests.length, icon: <Clock className="w-4 h-4" /> },
    { key: 'wip', label: 'Work-in-Progress', count: wipRequests.length, icon: <Wrench className="w-4 h-4" /> },
    { key: 'test-creds', label: 'Test Credentials', count: testCredsRequests.length, icon: <KeyRound className="w-4 h-4" /> },
    { key: 'cancelled', label: 'Cancelled', count: cancelledRequests.length, icon: <XCircle className="w-4 h-4" /> },
  ];

  // Get status-filtered requests
  const getStatusFilteredRequests = () => {
    switch (statusFilter) {
      case 'pending': return pendingRequests;
      case 'wip': return wipRequests;
      case 'test-creds': return testCredsRequests;
      case 'cancelled': return cancelledRequests;
      default: return activeRequests;
    }
  };

  // Apply lab type filter on top of status filter
  const getFilteredRequests = () => {
    const statusFiltered = getStatusFilteredRequests();
    switch (labTypeFilter) {
      case 'public': return statusFiltered.filter(r => r.cloud === 'Public Cloud');
      case 'private': return statusFiltered.filter(r => r.cloud === 'Private Cloud');
      case 'tp-labs': return statusFiltered.filter(r => r.cloud === 'TP Labs');
      default: return statusFiltered;
    }
  };

  const filteredRequests = getFilteredRequests();
  const statusFiltered = getStatusFilteredRequests();

  // Lab type counts based on status-filtered data
  const labTypeCounts = useMemo(() => ({
    all: statusFiltered.length,
    publicCloud: statusFiltered.filter(r => r.cloud === 'Public Cloud').length,
    privateCloud: statusFiltered.filter(r => r.cloud === 'Private Cloud').length,
    tpLabs: statusFiltered.filter(r => r.cloud === 'TP Labs').length,
  }), [statusFiltered]);

  const handleStatusFilterChange = (key: string) => {
    setStatusFilter(key);
    if (onFilterChange) {
      const filterValue = key === 'pending' ? 'Pending' : 
                         key === 'wip' ? 'Work-in-Progress' : 
                         key === 'test-creds' ? 'Test Credentials Shared' :
                         key === 'cancelled' ? 'Cancelled' : undefined;
      onFilterChange(filterValue);
    }
  };

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
        {/* Status Filter Row */}
        <StatusFilterBar
          options={statusFilterOptions}
          activeFilter={statusFilter}
          onFilterChange={handleStatusFilterChange}
        />

        {/* Lab Type Filter Row */}
        <LabTypeFilterBar
          counts={labTypeCounts}
          activeFilter={labTypeFilter}
          onFilterChange={setLabTypeFilter}
        />

        <DeliveryTable 
          requests={filteredRequests} 
          onDelete={onDelete} 
          onStatusChange={onStatusChange} 
          onUpdate={onUpdate} 
        />
      </TabsContent>
    </Tabs>
  );
};
