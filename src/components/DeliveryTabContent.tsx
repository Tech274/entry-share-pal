import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText, CheckCircle, PackageCheck, Cloud, Server, Building2 } from 'lucide-react';
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

// Sub-component for Lab Type filtered view
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
  const publicCloudRequests = requests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudRequests = requests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsRequests = requests.filter(r => r.cloud === 'TP Labs');

  // Status breakdown for active requests
  const pendingCount = requests.filter(r => r.labStatus === 'Pending').length;
  const wipCount = requests.filter(r => r.labStatus === 'Work-in-Progress').length;
  const testCredentialsCount = requests.filter(r => r.labStatus === 'Test Credentials Shared').length;
  const inProgressCount = requests.filter(r => r.labStatus === 'Delivery In-Progress').length;
  const cancelledCount = requests.filter(r => r.labStatus === 'Cancelled').length;

  return (
    <Tabs defaultValue="all" className="space-y-4">
      {showStatusBreakdown && requests.length > 0 && (
        <div className="flex items-center gap-6 px-4 py-3 bg-muted/40 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <Badge variant="secondary" className="text-xs">
              {requests.length}
            </Badge>
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-xs text-muted-foreground">Pending</span>
                <span className="text-xs font-medium">{pendingCount}</span>
              </div>
            )}
            {wipCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">WIP</span>
                <span className="text-xs font-medium">{wipCount}</span>
              </div>
            )}
            {testCredentialsCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground">Test Creds</span>
                <span className="text-xs font-medium">{testCredentialsCount}</span>
              </div>
            )}
            {inProgressCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-xs text-muted-foreground">In-Progress</span>
                <span className="text-xs font-medium">{inProgressCount}</span>
              </div>
            )}
            {cancelledCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Cancelled</span>
                <span className="text-xs font-medium">{cancelledCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {!showStatusBreakdown && (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/40 border rounded-lg">
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="secondary" className="text-xs">{requests.length}</Badge>
        </div>
      )}
      
      <TabsList className="grid w-full max-w-2xl grid-cols-4">
        <TabsTrigger value="all" className="gap-2">
          <Building2 className="w-4 h-4" />
          All ({requests.length})
        </TabsTrigger>
        <TabsTrigger value="public" className="gap-2">
          <Cloud className="w-4 h-4" />
          Public Cloud ({publicCloudRequests.length})
        </TabsTrigger>
        <TabsTrigger value="private" className="gap-2">
          <Server className="w-4 h-4" />
          Private Cloud ({privateCloudRequests.length})
        </TabsTrigger>
        <TabsTrigger value="tp-labs" className="gap-2">
          <Building2 className="w-4 h-4" />
          TP Labs ({tpLabsRequests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <DeliveryTable requests={requests} onDelete={onDelete} onStatusChange={onStatusChange} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="public">
        <DeliveryTable requests={publicCloudRequests} onDelete={onDelete} onStatusChange={onStatusChange} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="private">
        <DeliveryTable requests={privateCloudRequests} onDelete={onDelete} onStatusChange={onStatusChange} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="tp-labs">
        <DeliveryTable requests={tpLabsRequests} onDelete={onDelete} onStatusChange={onStatusChange} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
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
      // Map filter to appropriate tab
      if (initialFilter === 'Delivery In-Progress') {
        setMainTab('in-progress');
      } else if (initialFilter === 'Delivery Completed' || initialFilter === 'Completed') {
        setMainTab('completed');
      } else {
        // For Pending, Ready, etc. - show in list tab
        setMainTab('list');
      }
    }
  }, [initialFilter]);

  // Filter completed and delivery in-progress requests for their respective tabs
  const completedRequests = requests.filter(r => r.labStatus === 'Completed' || r.labStatus === 'Delivery Completed');
  const deliveryInProgressRequests = requests.filter(r => r.labStatus === 'Delivery In-Progress');
  const activeRequests = requests.filter(r => 
    r.labStatus !== 'Completed' && 
    r.labStatus !== 'Delivery Completed' && 
    r.labStatus !== 'Delivery In-Progress'
  );

  return (
    <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
      <TabsList className="grid w-full max-w-2xl grid-cols-4">
        <TabsTrigger value="form" className="gap-2">
          <FileText className="w-4 h-4" />
          Entry Form
        </TabsTrigger>
        <TabsTrigger value="list" className="gap-2">
          <Truck className="w-4 h-4" />
          Requests List ({activeRequests.length})
        </TabsTrigger>
        <TabsTrigger value="in-progress" className="gap-2">
          <PackageCheck className="w-4 h-4" />
          Delivery In-Progress ({deliveryInProgressRequests.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="gap-2">
          <CheckCircle className="w-4 h-4" />
          Completed ({completedRequests.length})
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

      <TabsContent value="in-progress" className="space-y-4">
        <LabTypeSubTabs 
          requests={deliveryInProgressRequests} 
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
          label="Delivery In-Progress Records" 
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <LabTypeSubTabs 
          requests={completedRequests} 
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onUpdate={onUpdate}
          label="Completed Deliveries" 
        />
      </TabsContent>
    </Tabs>
  );
};
