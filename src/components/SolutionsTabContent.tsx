import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LabRequestForm } from '@/components/LabRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { LabRequest } from '@/types/labRequest';
import { ClipboardList, FileText, CheckCircle, Clock, ListFilter, Beaker, XCircle } from 'lucide-react';
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
      setMainTab('list');
      const tabMap: Record<string, string> = {
        'Solution Pending': 'pending',
        'Solution Sent': 'sent',
        'POC In-Progress': 'pocInProgress',
        'Lost Closed': 'lostClosed',
      };
      setListSubTab(tabMap[initialFilter] ?? 'all');
    }
  }, [initialFilter]);

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.status === 'Solution Pending');
  const sentRequests = requests.filter(r => r.status === 'Solution Sent');
  const pocInProgressRequests = requests.filter(r => r.status === 'POC In-Progress');
  const lostClosedRequests = requests.filter(r => r.status === 'Lost Closed');

  const getFilteredRequests = () => {
    switch (listSubTab) {
      case 'pending': return pendingRequests;
      case 'sent': return sentRequests;
      case 'pocInProgress': return pocInProgressRequests;
      case 'lostClosed': return lostClosedRequests;
      default: return requests;
    }
  };

  const statusToFilter: Record<string, string | undefined> = {
    pending: 'Solution Pending',
    sent: 'Solution Sent',
    pocInProgress: 'POC In-Progress',
    lostClosed: 'Lost Closed',
    all: undefined,
  };

  const handleSubTabChange = (tab: string) => {
    setListSubTab(tab);
    onFilterChange?.(statusToFilter[tab]);
  };

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
          <ClipboardList className="w-4 h-4" />
          Requests List ({requests.length})
        </button>
      </div>

      {mainTab === 'form' && (
        <div className="space-y-6">
          <LabRequestForm onSubmit={onSubmit} />
        </div>
      )}

      {mainTab === 'list' && (
        <div className="space-y-4">
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
            <Button
              variant={listSubTab === 'pocInProgress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSubTabChange('pocInProgress')}
              className="gap-2"
            >
              <Beaker className="w-4 h-4" />
              POC In-Progress
              <Badge variant="secondary" className="ml-1">
                {pocInProgressRequests.length}
              </Badge>
            </Button>
            <Button
              variant={listSubTab === 'lostClosed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSubTabChange('lostClosed')}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Lost Closed
              <Badge variant="secondary" className="ml-1">
                {lostClosedRequests.length}
              </Badge>
            </Button>
          </div>

          <RequestsTable 
            requests={getFilteredRequests()} 
            onDelete={onDelete}
            onConvertToDelivery={onConvertToDelivery}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
};
