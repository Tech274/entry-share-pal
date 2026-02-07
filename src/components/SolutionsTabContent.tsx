import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { LabRequest } from '@/types/labRequest';
import { ClipboardList, FileText, CheckCircle, Clock, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [listSubTab, setListSubTab] = useState<string>('all');
  const [mainTab, setMainTab] = useState<string>('form');

  // Handle initial filter from dashboard navigation
  useEffect(() => {
    if (initialFilter) {
      // Switch to list tab and set appropriate filter
      setMainTab('list');
      if (initialFilter === 'Solution Pending') {
        setListSubTab('pending');
      } else if (initialFilter === 'Solution Sent') {
        setListSubTab('sent');
      } else {
        setListSubTab('all');
      }
    }
  }, [initialFilter]);

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.status === 'Solution Pending');
  const sentRequests = requests.filter(r => r.status === 'Solution Sent');

  const getFilteredRequests = () => {
    switch (listSubTab) {
      case 'pending':
        return pendingRequests;
      case 'sent':
        return sentRequests;
      default:
        return requests;
    }
  };
  
  // Handle filter change and notify parent
  const handleSubTabChange = (tab: string) => {
    setListSubTab(tab);
    if (onFilterChange) {
      const filterValue = tab === 'pending' ? 'Solution Pending' : 
                         tab === 'sent' ? 'Solution Sent' : undefined;
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
        {/* Sub-tabs for filtering by status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            <ListFilter className="w-4 h-4 inline mr-1" />
            Filter:
          </span>
          <Button
            variant={listSubTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSubTabChange('all')}
            className="gap-2"
          >
            All
            <Badge variant="secondary" className="ml-1">
              {requests.length}
            </Badge>
          </Button>
          <Button
            variant={listSubTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSubTabChange('pending')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending
            <Badge variant="secondary" className="ml-1">
              {pendingRequests.length}
            </Badge>
          </Button>
          <Button
            variant={listSubTab === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSubTabChange('sent')}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Sent
            <Badge variant="secondary" className="ml-1">
              {sentRequests.length}
            </Badge>
          </Button>
        </div>

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
