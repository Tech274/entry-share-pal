import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { DeliveryTable } from '@/components/DeliveryTable';
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { CalendarView } from '@/components/CalendarView';
import { Header } from '@/components/Header';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardList, Truck, TableProperties, LayoutDashboard, Calendar } from 'lucide-react';

const Index = () => {
  const { requests, addRequest, deleteRequest, clearAll } = useLabRequests();
  const { 
    requests: deliveryRequests, 
    addRequest: addDeliveryRequest,
    deleteRequest: deleteDeliveryRequest
  } = useDeliveryRequests();
  const { toast } = useToast();
  const { role, isFinance } = useAuth();

  const handleDeliveryDelete = (id: string) => {
    deleteDeliveryRequest(id);
    toast({
      title: 'Delivery Entry Deleted',
      description: 'The delivery request has been removed.',
      variant: 'destructive',
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

  // Finance users have limited tabs
  const showOperationalTabs = !isFinance;

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
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className={`grid w-full max-w-4xl ${isFinance ? 'grid-cols-2' : 'grid-cols-6'}`}>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            {showOperationalTabs && (
              <>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="solutions" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Solutions
                </TabsTrigger>
                <TabsTrigger value="delivery" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger value="solutions-table" className="gap-2">
                  <TableProperties className="w-4 h-4" />
                  Solutions ({requests.length})
                </TabsTrigger>
              </>
            )}
            {!isFinance && (
              <TabsTrigger value="delivery-table" className="gap-2">
                <TableProperties className="w-4 h-4" />
                Delivery ({deliveryRequests.length})
              </TabsTrigger>
            )}
            {isFinance && (
              <TabsTrigger value="reports" className="gap-2">
                <TableProperties className="w-4 h-4" />
                Reports
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RoleBasedDashboard labRequests={requests} deliveryRequests={deliveryRequests} />
          </TabsContent>

          {showOperationalTabs && (
            <>
              <TabsContent value="calendar" className="space-y-6">
                <CalendarView labRequests={requests} deliveryRequests={deliveryRequests} />
              </TabsContent>

              <TabsContent value="solutions" className="space-y-6">
                <LabRequestForm onSubmit={handleSubmit} />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-6">
                <DeliveryRequestForm onSubmit={handleDeliverySubmit} />
              </TabsContent>

              <TabsContent value="solutions-table">
                <RequestsTable requests={requests} onDelete={handleDelete} />
              </TabsContent>

              <TabsContent value="delivery-table">
                <DeliveryTable requests={deliveryRequests} onDelete={handleDeliveryDelete} />
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
    </div>
  );
};

export default Index;
