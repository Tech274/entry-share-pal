import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { LabRequest } from '@/types/labRequest';
import { ClipboardList, FileText, Upload, CheckCircle, Clock, ListFilter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const SOLUTIONS_CSV_HEADERS = [
  'Potential ID', 'FreshDesk Ticket Number', 'Client', 'Month', 'Year',
  'Lab Type', 'Cloud Type', 'TP Lab Type', 'Lab Name', 'Requester',
  'Received On', 'Lab Start Date', 'Lab End Date', 'User Count',
  'Duration', 'Input Cost Per User', 'Selling Cost Per User',
  'Total Amount', 'Margin', 'Status', 'Line of Business', 'Invoice Details', 'Remarks'
];


interface SolutionsTabContentProps {
  requests: LabRequest[];
  onSubmit: (data: Omit<LabRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onBulkInsert?: (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => Promise<boolean>;
  onConvertToDelivery?: (request: LabRequest) => Promise<void>;
  onUpdate?: (id: string, data: Partial<LabRequest>) => void;
}

export const SolutionsTabContent = ({
  requests,
  onSubmit,
  onDelete,
  onBulkInsert,
  onConvertToDelivery,
  onUpdate,
}: SolutionsTabContentProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listSubTab, setListSubTab] = useState<string>('all');

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const csvContent = SOLUTIONS_CSV_HEADERS.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'solutions-import-template.csv';
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
      const recordsToInsert: Omit<LabRequest, 'id' | 'createdAt'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        const currentDate = new Date();
        const month = row.month || currentDate.toLocaleString('default', { month: 'long' });
        const year = parseInt(row.year) || currentDate.getFullYear();

        recordsToInsert.push({
          potentialId: row['potential id'] || row.potentialid || '',
          freshDeskTicketNumber: row['freshdesk ticket number'] || row['ticket'] || row.ticket || '',
          month,
          year,
          client: row.client || 'Unknown Client',
          cloud: row['lab type'] || row.cloud || '',
          cloudType: row['cloud type'] || row.cloudtype || '',
          tpLabType: row['tp lab type'] || row.tplabtype || '',
          labName: row['lab name'] || row.labname || '',
          requester: row.requester || '',
          agentName: row['agent name'] || row.agentname || '',
          accountManager: row['account manager'] || row.accountmanager || '',
          receivedOn: row['received on'] || row.receivedon || '',
          labStartDate: row['lab start date'] || row.labstartdate || '',
          labEndDate: row['lab end date'] || row.labenddate || '',
          userCount: parseInt(row['user count'] || row.usercount || '0') || 0,
          durationInDays: parseInt(row['duration'] || row.durationindays || '0') || 0,
          inputCostPerUser: parseFloat(row['input cost per user'] || row.inputcostperuser || '0') || 0,
          sellingCostPerUser: parseFloat(row['selling cost per user'] || row.sellingcostperuser || '0') || 0,
          totalAmountForTraining: parseFloat(row['total amount'] || row.totalamountfortraining || '0') || 0,
          margin: parseFloat(row.margin || '0') || 0,
          status: row.status || 'Solution Pending',
          remarks: row.remarks || '',
          lineOfBusiness: row.lob || row['line of business'] || row.lineofbusiness || '',
          invoiceDetails: row['invoice details'] || row.invoicedetails || '',
        });
      }

      if (onBulkInsert && recordsToInsert.length > 0) {
        await onBulkInsert(recordsToInsert);
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${recordsToInsert.length} solution records.`,
        });
      } else if (recordsToInsert.length > 0) {
        // Fallback to individual inserts
        for (const record of recordsToInsert) {
          await onSubmit(record);
        }
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${recordsToInsert.length} solution records.`,
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
            <ClipboardList className="w-4 h-4" />
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
            onClick={() => setListSubTab('all')}
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
            onClick={() => setListSubTab('pending')}
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
            onClick={() => setListSubTab('sent')}
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
