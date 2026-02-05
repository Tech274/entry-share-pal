import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText, Upload, CheckCircle, Clock, ListFilter, Share2, Download } from 'lucide-react';
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

const DELIVERY_SAMPLE_ROW = [
  'POT-2025-001', 'FD-12345', 'Azure Fundamentals Training', '25',
  'Acme Corp', 'February', '2025', '2025-02-01', 'Public Cloud', 'Azure', '',
  'Azure Fundamentals', 'John Doe', 'Delivery In-Progress', '2025-02-10', '2025-02-15',
  'Standard VM setup', '500', '750',
  '18750', 'Standalone', 'INV-2025-001'
];

interface DeliveryTabContentProps {
  requests: DeliveryRequest[];
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onBulkInsert?: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => Promise<boolean>;
}

export const DeliveryTabContent = ({
  requests,
  onSubmit,
  onDelete,
  onBulkInsert,
}: DeliveryTabContentProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listSubTab, setListSubTab] = useState<string>('all');

  // Filter requests by status
  const deliveredRequests = requests.filter(r => r.labStatus === 'Delivered' || r.labStatus === 'Completed');
  const inProgressRequests = requests.filter(r => r.labStatus === 'Delivery In-Progress' || r.labStatus === 'Work-in-Progress');
  const testCredentialsRequests = requests.filter(r => r.labStatus === 'Test Credentials Shared');

  const getFilteredRequests = () => {
    switch (listSubTab) {
      case 'delivered':
        return deliveredRequests;
      case 'in-progress':
        return inProgressRequests;
      case 'test-credentials':
        return testCredentialsRequests;
      default:
        return requests;
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = DELIVERY_CSV_HEADERS.join(',') + '\n' + DELIVERY_SAMPLE_ROW.join(',') + '\n';
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

  return (
    <Tabs defaultValue="form" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form" className="gap-2">
            <FileText className="w-4 h-4" />
            Entry Form
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Truck className="w-4 h-4" />
            Requests List ({requests.length})
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
        {/* Sub-tabs for filtering by status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            <ListFilter className="w-4 h-4 inline mr-1" />
            Filter:
          </span>
          <Button
            variant={listSubTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setListSubTab('all')}
            className="gap-2"
          >
            All
            <Badge variant="secondary" className="ml-1">
              {requests.length}
            </Badge>
          </Button>
          <Button
            variant={listSubTab === 'delivered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setListSubTab('delivered')}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Delivered
            <Badge variant="secondary" className="ml-1">
              {deliveredRequests.length}
            </Badge>
          </Button>
          <Button
            variant={listSubTab === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setListSubTab('in-progress')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            In-Progress
            <Badge variant="secondary" className="ml-1">
              {inProgressRequests.length}
            </Badge>
          </Button>
          <Button
            variant={listSubTab === 'test-credentials' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setListSubTab('test-credentials')}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Test Credentials
            <Badge variant="secondary" className="ml-1">
              {testCredentialsRequests.length}
            </Badge>
          </Button>
        </div>

        <DeliveryTable requests={getFilteredRequests()} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
};
