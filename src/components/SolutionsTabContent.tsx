import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { LabRequest } from '@/types/labRequest';
import { ClipboardList, FileText, CheckCircle, Clock } from 'lucide-react';
import { StatusFilterBar, FilterOption } from '@/components/shared/StatusFilterBar';

interface SolutionsTabContentProps {
  requests: LabRequest[];
  onSubmit: (data: Omit<LabRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onConvertToDelivery?: (request: LabRequest) => Promise<void>;
  onUpdate?: (id: string, data: Partial<LabRequest>) => void;
  initialFilter?: string;
  onFilterChange?: (filter: string | undefined) => void;
}

export const SolutionsTabContent = ({
  requests,
  onSubmit,
  onDelete,
  onConvertToDelivery,
  onUpdate,
  initialFilter,
  onFilterChange,
}: SolutionsTabContentProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mainTab, setMainTab] = useState<string>('form');

  // Handle initial filter from dashboard navigation
  useEffect(() => {
    if (initialFilter) {
      setMainTab('list');
      if (initialFilter === 'Solution Pending') {
        setStatusFilter('pending');
      } else if (initialFilter === 'Solution Sent') {
        setStatusFilter('sent');
      } else {
        setStatusFilter('all');
      }
    }
  }, [initialFilter]);

  // Filter counts
  const pendingRequests = useMemo(() => 
    requests.filter(r => r.status === 'Solution Pending'), [requests]);
  const sentRequests = useMemo(() => 
    requests.filter(r => r.status === 'Solution Sent'), [requests]);

  const filterOptions: FilterOption[] = [
    { key: 'all', label: 'All', count: requests.length },
    { key: 'pending', label: 'Pending', count: pendingRequests.length, icon: <Clock className="w-4 h-4" /> },
    { key: 'sent', label: 'Sent', count: sentRequests.length, icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const getFilteredRequests = () => {
    switch (statusFilter) {
      case 'pending':
        return pendingRequests;
      case 'sent':
        return sentRequests;
      default:
        return requests;
    }
  };
  
  const handleFilterChange = (key: string) => {
    setStatusFilter(key);
    if (onFilterChange) {
      const filterValue = key === 'pending' ? 'Solution Pending' : 
                         key === 'sent' ? 'Solution Sent' : undefined;
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
          <ClipboardList className="w-4 h-4" />
          Requests List ({requests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="space-y-6">
        <LabRequestForm onSubmit={onSubmit} />
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <StatusFilterBar
          options={filterOptions}
          activeFilter={statusFilter}
          onFilterChange={handleFilterChange}
        />

        <RequestsTable 
          requests={getFilteredRequests()} 
          onDelete={onDelete}
          onConvertToDelivery={onConvertToDelivery}
          onUpdate={onUpdate}
        />
      </TabsContent>
    </Tabs>
  );
};
