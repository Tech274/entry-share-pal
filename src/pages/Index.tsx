// Dashboard page - main operational hub
import { cn } from '@/lib/utils';
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { SolutionsTabContent } from '@/components/SolutionsTabContent';
import { DeliveryTabContent } from '@/components/DeliveryTabContent';
import { ADRTabContent } from '@/components/ADRTabContent';
import { CalendarView } from '@/components/CalendarView';
import { Header } from '@/components/Header';
import { AIAssistant } from '@/components/AIAssistant';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, Truck, LayoutDashboard, Database, Calendar } from 'lucide-react';
import { useReportAccessForRole } from '@/hooks/useReportAccessConfig';
import { LabRequest } from '@/types/labRequest';
import { useMemo, useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { 
    requests, 
    loading: labLoading,
    addRequest, 
    deleteRequest, 
    clearAll, 
    bulkInsert, 
    updateRequest: updateLabRequest, 
    refetch: refetchLabRequests 
  } = useLabRequests();
  const { 
    requests: deliveryRequests, 
    loading: deliveryLoading,
    addRequest: addDeliveryRequest,
    deleteRequest: deleteDeliveryRequest,
    bulkInsert: bulkInsertDelivery,
    updateRequest: updateDeliveryRequest,
    refetch: refetchDeliveryRequests
  } = useDeliveryRequests();
  const { toast } = useToast();
  const { isFinance, isOpsLead, isAdmin, role } = useAuth();
  const { canAccess: canAccessReports } = useReportAccessForRole(role);
  const navigate = useNavigate();

  // Enable realtime sync for all data
  useRealtimeSync();

  // Dashboard refresh handler
  const handleDashboardRefresh = useCallback(async () => {
    await Promise.all([refetchLabRequests(), refetchDeliveryRequests()]);
  }, [refetchLabRequests, refetchDeliveryRequests]);

  const handleDeliveryDelete = (id: string) => {
    deleteDeliveryRequest(id);
    toast({
      title: 'Delivery Entry Deleted',
      description: 'The delivery request has been removed.',
      variant: 'destructive',
    });
  };

  const handleDeliveryStatusChange = (id: string, newStatus: string) => {
    updateDeliveryRequest(id, { labStatus: newStatus });
    toast({
      title: 'Status Updated',
      description: `Status changed to "${newStatus}".`,
    });
  };

  const handleSubmit = (data: Parameters<typeof addRequest>[0]) => {
    addRequest(data);
    toast({
      title: 'Request Submitted',
      description: 'Your lab request has been recorded successfully.',
    });
  };

  const handleDeliverySubmit = (data: Parameters<typeof addDeliveryRequest>[0]) => {
    addDeliveryRequest(data);
    toast({
      title: 'Delivery Request Submitted',
      description: 'Your delivery request has been recorded successfully.',
    });
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    toast({
      title: 'Entry Deleted',
      description: 'The request has been removed.',
      variant: 'destructive',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
      clearAll();
      toast({
        title: 'All Entries Cleared',
        description: 'All lab requests have been removed.',
        variant: 'destructive',
      });
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

  // Convert solution to delivery - creates delivery record and DB trigger auto-removes the solution
  const handleConvertToDelivery = async (request: LabRequest) => {
    try {
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
      
      // Refetch lab requests to reflect auto-removal by DB trigger
      await refetchLabRequests();
      
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
        <div className="space-y-6">
          {/* Custom tab bar to avoid Radix Tabs removeChild DOM conflict */}
          <div
            className={`grid w-full ${
              isFinance ? 'max-w-md grid-cols-2' : (isOpsLead || isAdmin) ? 'max-w-4xl grid-cols-6' : 'max-w-3xl grid-cols-5'
            } inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground`}
          >
            <button
              onClick={() => handleTabChange('dashboard')}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                activeTab === 'dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : ''
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            {showOperationalTabs && (
              <button
                onClick={() => handleTabChange('solutions')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === 'solutions' ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <ClipboardList className="w-4 h-4" />
                Solutions
              </button>
            )}
            {showOperationalTabs && (
              <button
                onClick={() => handleTabChange('delivery')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === 'delivery' ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <Truck className="w-4 h-4" />
                Delivery
              </button>
            )}
            {showOperationalTabs && (
              <button
                onClick={() => handleTabChange('adr')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === 'adr' ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <Database className="w-4 h-4" />
                ADR
              </button>
            )}
            {showOperationalTabs && (
              <button
                onClick={() => handleTabChange('calendar')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === 'calendar' ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
            )}
            {(isFinance || isOpsLead || isAdmin) && canAccessReports && (
              <button
                onClick={() => handleTabChange('reports')}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  activeTab === 'reports' ? 'bg-primary text-primary-foreground shadow-sm' : ''
                )}
              >
                <Database className="w-4 h-4" />
                Reports
              </button>
            )}
          </div>

          {/* Tab content panels - use display:none instead of conditional rendering to avoid removeChild crashes from Radix components */}
          <div className="space-y-6" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            <RoleBasedDashboard 
              labRequests={requests} 
              deliveryRequests={deliveryRequests}
              isLoading={labLoading || deliveryLoading}
              onRefresh={handleDashboardRefresh}
              onNavigateToTab={handleNavigateToTab}
              onNavigateToCalendar={handleNavigateToCalendar}
            />
          </div>

          {showOperationalTabs && (
            <div className="space-y-6" style={{ display: activeTab === 'solutions' ? 'block' : 'none' }}>
              <SolutionsTabContent
                requests={requests}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                onConvertToDelivery={handleConvertToDelivery}
                onUpdate={updateLabRequest}
                initialFilter={solutionsFilter}
                onFilterChange={setSolutionsFilter}
              />
            </div>
          )}

          {showOperationalTabs && (
            <div className="space-y-6" style={{ display: activeTab === 'delivery' ? 'block' : 'none' }}>
              <DeliveryTabContent
                requests={deliveryRequests}
                onSubmit={handleDeliverySubmit}
                onDelete={handleDeliveryDelete}
                onStatusChange={handleDeliveryStatusChange}
                onUpdate={updateDeliveryRequest}
                initialFilter={deliveryFilter}
                onFilterChange={setDeliveryFilter}
              />
            </div>
          )}

          {showOperationalTabs && (
            <div className="space-y-6" style={{ display: activeTab === 'adr' ? 'block' : 'none' }}>
              <ADRTabContent
                deliveryRequests={deliveryRequests}
                onDeliveryDelete={handleDeliveryDelete}
                onUpdate={updateDeliveryRequest}
                onBulkInsert={bulkInsertDelivery}
                onRefetch={refetchDeliveryRequests}
                initialFilter={adrFilter}
                onFilterChange={setAdrFilter}
                onNavigateToDashboard={handleNavigateToDashboard}
              />
            </div>
          )}

          {showOperationalTabs && (
            <div className="space-y-6" style={{ display: activeTab === 'calendar' ? 'block' : 'none' }}>
              <CalendarView labRequests={requests} deliveryRequests={deliveryRequests} />
            </div>
          )}

          {(isFinance || isOpsLead || isAdmin) && canAccessReports && (
            <div className="space-y-6" style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
              <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Reports</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Revenue, Lab Type, Learners, Summary, and Cloud Billing. Open the full Reports page for filters and detailed breakdowns.
                    </p>
                  </div>
                  <Button onClick={() => navigate('/reports')} className="gap-2 shrink-0 w-full sm:w-auto" size="lg">
                    <Database className="w-4 h-4" />
                    Open Reports
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant context={aiContext} />
    </div>
  );
};

export default Index;
