import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { Header } from '@/components/Header';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Truck, TableProperties } from 'lucide-react';

const Index = () => {
  const { requests, addRequest, deleteRequest, clearAll } = useLabRequests();
  const { 
    requests: deliveryRequests, 
    addRequest: addDeliveryRequest 
  } = useDeliveryRequests();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      <Header
        requestCount={requests.length + deliveryRequests.length}
        onExportCSV={handleExportCSV}
        onExportXLS={handleExportXLS}
        onClearAll={handleClearAll}
      />

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="solutions" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="solutions" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Solutions
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Truck className="w-4 h-4" />
              Delivery
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <TableProperties className="w-4 h-4" />
              Entries ({requests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solutions" className="space-y-6">
            <LabRequestForm onSubmit={handleSubmit} />
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <DeliveryRequestForm onSubmit={handleDeliverySubmit} />
          </TabsContent>

          <TabsContent value="table">
            <RequestsTable requests={requests} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
