import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { SolutionsTabContent } from '@/components/SolutionsTabContent';
import { DeliveryTabContent } from '@/components/DeliveryTabContent';
import { ADRTabContent } from '@/components/ADRTabContent';
import { CalendarView } from '@/components/CalendarView';
import { Header } from '@/components/Header';
import { AIAssistant } from '@/components/AIAssistant';
import { useLabRequestsQuery } from '@/hooks/useLabRequestsQuery';
import { useDeliveryRequestsQuery } from '@/hooks/useDeliveryRequestsQuery';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, Truck, LayoutDashboard, Database, Calendar } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { useMemo, useCallback, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const queryClient = useQueryClient();
  const { 
    requests, 
    loading: labLoading,
    addRequest, 
    deleteRequest, 
    clearAll, 
    updateRequest: updateLabRequest, 
    refetch: refetchLabRequests 
  } = useLabRequestsQuery();
  const { 
    requests: deliveryRequests, 
    loading: deliveryLoading,
    addRequest: addDeliveryRequest,
    deleteRequest: deleteDeliveryRequest,
    bulkInsert: bulkInsertDelivery,
    updateRequest: updateDeliveryRequest,
    refetch: refetchDeliveryRequests
  } = useDeliveryRequestsQuery();
  const { toast } = useToast();
  const { isFinance } = useAuth();

  // Enable realtime sync for all data - single global subscription
  useRealtimeSync();

  // Dashboard refresh handler
  const handleDashboardRefresh = useCallback(async () => {
    await Promise.all([refetchLabRequests(), refetchDeliveryRequests()]);
  }, [refetchLabRequests, refetchDeliveryRequests]);

  const handleDeliveryDelete = async (id: string) => {
    try {
      await deleteDeliveryRequest(id);
      toast({
        title: 'Delivery Entry Deleted',
        description: 'The delivery request has been removed.',
        variant: 'destructive',
      });
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the delivery request.',
        variant: 'destructive',
      });
    }
  };

  const handleDeliveryStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDeliveryRequest(id, { labStatus: newStatus });
      toast({
        title: 'Status Updated',
        description: `Status changed to "${newStatus}".`,
      });
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Could not update the status.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Parameters<typeof addRequest>[0]) => {
    try {
      await addRequest(data);
      toast({
        title: 'Request Submitted',
        description: 'Your lab request has been recorded successfully.',
      });
    } catch {
      toast({
        title: 'Submit Failed',
        description: 'Could not submit the request.',
        variant: 'destructive',
      });
    }
  };

  const handleDeliverySubmit = async (data: Parameters<typeof addDeliveryRequest>[0]) => {
    try {
      await addDeliveryRequest(data);
      toast({
        title: 'Delivery Request Submitted',
        description: 'Your delivery request has been recorded successfully.',
      });
    } catch {
      toast({
        title: 'Submit Failed',
        description: 'Could not submit the delivery request.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest(id);
      toast({
        title: 'Entry Deleted',
        description: 'The request has been removed.',
        variant: 'destructive',
      });
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete the request.',
        variant: 'destructive',
      });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
      try {
        await clearAll();
        toast({
          title: 'All Entries Cleared',
          description: 'All lab requests have been removed.',
          variant: 'destructive',
        });
      } catch {
        toast({
          title: 'Clear Failed',
          description: 'Could not clear all entries.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleExportCSV = () => {
    exportToCSV(requests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as CSV.',
    });
  };

  const handleExportXLS = () => {
    exportToXLS(requests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as XLS.',
    });
  };

  // Convert solution to delivery - atomic operation with proper cache invalidation
  const handleConvertToDelivery = async (request: LabRequest) => {
    try {
      // Create delivery record first
      await addDeliveryRequest({
        potentialId: request.potentialId,
        freshDeskTicketNumber: request.freshDeskTicketNumber,
        trainingName: request.labName,
        numberOfUsers: request.userCount,
        month: request.month,
        year: request.year,
        receivedOn: request.receivedOn,
        client: request.client,
        cloud: request.cloud,
        cloudType: request.cloudType,
        tpLabType: request.tpLabType,
        labName: request.labName,
        requester: request.requester,
        agentName: request.agentName,
        accountManager: request.accountManager,
        labStatus: 'Pending',
        labType: '',
        startDate: request.labStartDate,
        endDate: request.labEndDate,
        labSetupRequirement: '',
        inputCostPerUser: request.inputCostPerUser,
        sellingCostPerUser: request.sellingCostPerUser,
        totalAmount: request.totalAmountForTraining,
        lineOfBusiness: request.lineOfBusiness,
        invoiceDetails: request.invoiceDetails,
      });
      
      // Delete the original solution request to avoid duplicates
      await deleteRequest(request.id);
      
      // Invalidate both caches to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
      
      toast({
        title: 'Converted to Delivery',
        description: 'Solution has been moved to Delivery workflow.',
      });
    } catch (error) {
      console.error('Error converting to delivery:', error);
      toast({
        title: 'Conversion Failed',
        description: 'There was an error converting to delivery.',
        variant: 'destructive',
      });
    }
  };

  // Handle update for lab requests
  const handleUpdateLabRequest = async (id: string, data: Partial<LabRequest>) => {
    try {
      await updateLabRequest(id, data);
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Could not update the request.',
        variant: 'destructive',
      });
    }
  };

  // Handle update for delivery requests
  const handleUpdateDeliveryRequest = async (id: string, data: Partial<import('@/types/deliveryRequest').DeliveryRequest>) => {
    try {
      await updateDeliveryRequest(id, data);
    } catch {
      toast({
        title: 'Update Failed',
        description: 'Could not update the delivery request.',
        variant: 'destructive',
      });
    }
  };

  // Finance users have limited tabs
  const showOperationalTabs = !isFinance;

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filter persistence for navigation from KPI cards
  const [solutionsFilter, setSolutionsFilter] = useState<string | undefined>(undefined);
  const [deliveryFilter, setDeliveryFilter] = useState<string | undefined>(undefined);
  const [adrFilter, setAdrFilter] = useState<string | undefined>(undefined);

  // Handle navigation from dashboard quick actions with filter persistence
  const handleNavigateToTab = useCallback((tab: string, filter?: string) => {
    setActiveTab(tab);
    
    // Set the appropriate filter based on destination tab
    if (tab === 'solutions') {
      setSolutionsFilter(filter);
    } else if (tab === 'delivery') {
      setDeliveryFilter(filter);
    } else if (tab === 'adr') {
      setAdrFilter(filter);
    }
  }, []);

  const handleNavigateToCalendar = useCallback(() => {
    setActiveTab('calendar');
  }, []);
  
  // Navigate back to dashboard
  const handleNavigateToDashboard = useCallback(() => {
    setActiveTab('dashboard');
    setSolutionsFilter(undefined);
    setDeliveryFilter(undefined);
    setAdrFilter(undefined);
  }, []);
  
  // Clear filters when manually changing tabs
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    // Only clear filters if navigating away from the filtered tab
    if (tab !== 'solutions') {
      setSolutionsFilter(undefined);
    }
    if (tab !== 'delivery') {
      setDeliveryFilter(undefined);
    }
    if (tab !== 'adr') {
      setAdrFilter(undefined);
    }
  }, []);

  // AI Assistant context
  const aiContext = useMemo(() => ({
    solutionsCount: requests.length,
    deliveriesCount: deliveryRequests.length,
    pendingCount: requests.filter(r => r.status === 'Solution Pending').length,
  }), [requests, deliveryRequests]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        requestCount={requests.length + deliveryRequests.length}
        onExportCSV={handleExportCSV}
        onExportXLS={handleExportXLS}
        onClearAll={handleClearAll}
        labRequests={requests}
        deliveryRequests={deliveryRequests}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className={`grid w-full ${isFinance ? 'max-w-md grid-cols-2' : 'max-w-3xl grid-cols-5'}`}>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            {showOperationalTabs && (
              <>
                <TabsTrigger value="solutions" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Solutions
                </TabsTrigger>
                <TabsTrigger value="delivery" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger value="adr" className="gap-2">
                  <Database className="w-4 h-4" />
                  ADR
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
              </>
            )}
            {isFinance && (
              <TabsTrigger value="reports" className="gap-2">
                <Database className="w-4 h-4" />
                Reports
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RoleBasedDashboard 
              labRequests={requests} 
              deliveryRequests={deliveryRequests}
              isLoading={labLoading || deliveryLoading}
              onRefresh={handleDashboardRefresh}
              onNavigateToTab={handleNavigateToTab}
              onNavigateToCalendar={handleNavigateToCalendar}
            />
          </TabsContent>

          {showOperationalTabs && (
            <>
              <TabsContent value="solutions" className="space-y-6">
                <SolutionsTabContent
                  requests={requests}
                  onSubmit={handleSubmit}
                  onDelete={handleDelete}
                  onConvertToDelivery={handleConvertToDelivery}
                  onUpdate={handleUpdateLabRequest}
                  initialFilter={solutionsFilter}
                  onFilterChange={setSolutionsFilter}
                />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-6">
                <DeliveryTabContent
                  requests={deliveryRequests}
                  onSubmit={handleDeliverySubmit}
                  onDelete={handleDeliveryDelete}
                  onStatusChange={handleDeliveryStatusChange}
                  onUpdate={handleUpdateDeliveryRequest}
                  initialFilter={deliveryFilter}
                  onFilterChange={setDeliveryFilter}
                />
              </TabsContent>

              <TabsContent value="adr" className="space-y-6">
                <ADRTabContent
                  deliveryRequests={deliveryRequests}
                  onDeliveryDelete={handleDeliveryDelete}
                  onUpdate={handleUpdateDeliveryRequest}
                  onBulkInsert={bulkInsertDelivery}
                  onRefetch={refetchDeliveryRequests}
                  initialFilter={adrFilter}
                  onFilterChange={setAdrFilter}
                  onNavigateToDashboard={handleNavigateToDashboard}
                />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <CalendarView labRequests={requests} deliveryRequests={deliveryRequests} />
              </TabsContent>
            </>
          )}

          {isFinance && (
            <TabsContent value="reports" className="space-y-6">
              <div className="text-center p-8 text-muted-foreground">
                Financial reports view - Summary of costs and margins
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* AI Assistant */}
      <AIAssistant context={aiContext} />
    </div>
  );
};

export default Index;
