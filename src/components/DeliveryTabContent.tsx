import { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText, Upload, CheckCircle, Download, PackageCheck, Cloud, Server, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const DELIVERY_CSV_HEADERS = [
  'Potential ID', 'FreshDesk Ticket Number', 'Training Name', 'Number of Users',
  'Client', 'Month', 'Year', 'Received On', 'Lab Type', 'Cloud Type', 'TP Lab Type',
  'Lab Name', 'Requester', 'Lab Status', 'Start Date', 'End Date',
  'Lab Setup Requirement', 'Input Cost Per User', 'Selling Cost Per User',
  'Total Amount', 'Line of Business', 'Invoice Details'
];

interface DeliveryTabContentProps {
  requests: DeliveryRequest[];
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onBulkInsert?: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => Promise<boolean>;
}

// Sub-component for Lab Type filtered view
const LabTypeSubTabs = ({ 
  requests, 
  onDelete,
  label,
  showStatusBreakdown = false
}: { 
  requests: DeliveryRequest[]; 
  onDelete: (id: string) => void;
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
      <div className="flex flex-col gap-2 p-3 bg-accent/50 border border-accent rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <Badge variant="secondary" className="ml-auto">
            {requests.length} total records
          </Badge>
        </div>
        
        {showStatusBreakdown && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-accent/50">
            <span className="text-xs text-muted-foreground">Status:</span>
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300">
                Pending: {pendingCount}
              </Badge>
            )}
            {wipCount > 0 && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300">
                WIP: {wipCount}
              </Badge>
            )}
            {testCredentialsCount > 0 && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300">
                Test Credentials: {testCredentialsCount}
              </Badge>
            )}
            {inProgressCount > 0 && (
              <Badge variant="outline" className="text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-300">
                In-Progress: {inProgressCount}
              </Badge>
            )}
            {cancelledCount > 0 && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300">
                Cancelled: {cancelledCount}
              </Badge>
            )}
          </div>
        )}
      </div>
      
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
        <DeliveryTable requests={requests} onDelete={onDelete} />
      </TabsContent>

      <TabsContent value="public">
        <DeliveryTable requests={publicCloudRequests} onDelete={onDelete} />
      </TabsContent>

      <TabsContent value="private">
        <DeliveryTable requests={privateCloudRequests} onDelete={onDelete} />
      </TabsContent>

      <TabsContent value="tp-labs">
        <DeliveryTable requests={tpLabsRequests} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
};

export const DeliveryTabContent = ({
  requests,
  onSubmit,
  onDelete,
  onBulkInsert,
}: DeliveryTabContentProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = DELIVERY_CSV_HEADERS.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'delivery-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast({
      title: 'Template Downloaded',
      description: 'Fill in the template and use Import to upload your data.',
    });
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isXLS = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

    if (!isCSV && !isXLS) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV or XLS file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast({
          title: 'Empty File',
          description: 'The file contains no data rows.',
          variant: 'destructive',
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const recordsToInsert: Omit<DeliveryRequest, 'id' | 'createdAt'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        const currentDate = new Date();
        const month = row.month || currentDate.toLocaleString('default', { month: 'long' });
        const year = parseInt(row.year) || currentDate.getFullYear();

        // Map status - "Sent for Testing" -> "Test Credentials Shared"
        let mappedStatus = row.status || row['lab status'] || 'Pending';
        if (mappedStatus.toLowerCase() === 'sent for testing') {
          mappedStatus = 'Test Credentials Shared';
        }

        recordsToInsert.push({
          potentialId: row['potential id'] || '',
          freshDeskTicketNumber: row['freshdesk ticket number'] || row['ticket'] || '',
          trainingName: row['lab name'] || row['training name'] || '',
          numberOfUsers: parseInt(row['user count'] || row['number of users'] || row.users || '0') || 0,
          client: row.client || 'Unknown Client',
          month,
          year,
          receivedOn: row['received on'] || '',
          cloud: row['lab type'] || row.cloud || '',
          cloudType: row['cloud type'] || '',
          tpLabType: row['tp lab type'] || '',
          labName: row['lab name'] || '',
          requester: row.requester || '',
          agentName: row['agent name'] || '',
          accountManager: row['account manager'] || '',
          labStatus: mappedStatus,
          labType: row['lab type category'] || '',
          startDate: row['lab start date'] || row['start date'] || '',
          endDate: row['lab end date'] || row['end date'] || '',
          labSetupRequirement: row['lab setup requirement'] || '',
          inputCostPerUser: parseFloat(row['input cost per user'] || '0') || 0,
          sellingCostPerUser: parseFloat(row['selling cost per user'] || '0') || 0,
          totalAmount: parseFloat(row['total amount'] || '0') || 0,
          lineOfBusiness: row.lob || row['line of business'] || '',
          invoiceDetails: row['invoice details'] || row['invoice number'] || '',
        });
      }

      if (onBulkInsert && recordsToInsert.length > 0) {
        await onBulkInsert(recordsToInsert);
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${recordsToInsert.length} delivery records.`,
        });
      } else if (recordsToInsert.length > 0) {
        // Fallback to individual inserts
        for (const record of recordsToInsert) {
          await onSubmit(record);
        }
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${recordsToInsert.length} delivery records.`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'There was an error processing the file.',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filter completed and delivered requests for their respective tabs
  const completedRequests = requests.filter(r => r.labStatus === 'Completed');
  const deliveredTabRequests = requests.filter(r => r.labStatus === 'Delivered');
  const activeRequests = requests.filter(r => r.labStatus !== 'Completed' && r.labStatus !== 'Delivered');

  return (
    <Tabs defaultValue="form" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="form" className="gap-2">
            <FileText className="w-4 h-4" />
            Entry Form
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Truck className="w-4 h-4" />
            Requests List ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="gap-2">
            <PackageCheck className="w-4 h-4" />
            Delivered ({deliveredTabRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv,.xls,.xlsx"
            className="hidden"
          />
          <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
            <Download className="w-4 h-4" />
            Template
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="gap-2">
            <Upload className="w-4 h-4" />
            Import
          </Button>
        </div>
      </div>

      <TabsContent value="form" className="space-y-6">
        <DeliveryRequestForm onSubmit={onSubmit} />
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <LabTypeSubTabs 
          requests={activeRequests} 
          onDelete={onDelete} 
          label="Active Requests"
          showStatusBreakdown={true}
        />
      </TabsContent>

      <TabsContent value="delivered" className="space-y-4">
        <LabTypeSubTabs 
          requests={deliveredTabRequests} 
          onDelete={onDelete} 
          label="Delivered Records" 
        />
      </TabsContent>

      <TabsContent value="completed" className="space-y-4">
        <LabTypeSubTabs 
          requests={completedRequests} 
          onDelete={onDelete} 
          label="Completed Deliveries" 
        />
      </TabsContent>
    </Tabs>
  );
};
