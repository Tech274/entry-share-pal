import { useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cloud, Server, Building2, Eye, Upload, Download } from 'lucide-react';
import { DeliveryTable } from '@/components/DeliveryTable';
import { useToast } from '@/hooks/use-toast';

// CSV Headers for bulk upload template
const ADR_CSV_HEADERS = [
  'Potential ID', 'FreshDesk Ticket Number', 'Training Name', 'Number of Users',
  'Client', 'Month', 'Year', 'Received On', 'Lab Type', 'Cloud Type', 'TP Lab Type',
  'Lab Name', 'Requester', 'Lab Status', 'Start Date', 'End Date',
  'Input Cost Per User', 'Selling Cost Per User', 'Total Amount', 
  'Line of Business', 'Invoice Details'
];

interface ADRTabContentProps {
  deliveryRequests: DeliveryRequest[];
  onDeliveryDelete: (id: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  onBulkInsert?: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => Promise<boolean>;
}

export const ADRTabContent = ({
  deliveryRequests,
  onDeliveryDelete,
  onUpdate,
  onBulkInsert,
}: ADRTabContentProps) => {
  const { isAdmin, isOpsLead } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPreview = isAdmin || isOpsLead;

  // ADR Status filter - only show Delivery records with specific statuses
  const adrStatuses = ['Delivered', 'Delivery In-Progress', 'Delivery Completed', 'Completed'];
  
  // Filter delivery requests by ADR statuses - NO Solutions/labRequests included
  const adrDeliveryRequests = deliveryRequests.filter(r => 
    r.labStatus && adrStatuses.includes(r.labStatus)
  );

  // Filter by cloud type
  const publicCloudDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'TP Labs');

  const handleDownloadTemplate = () => {
    const csvContent = ADR_CSV_HEADERS.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'adr-bulk-upload-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast({
      title: 'Template Downloaded',
      description: 'Fill in the template and use Import to upload your data.',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx]?.trim().replace(/^"|"$/g, '') || '';
        });

        const currentDate = new Date();
        const month = row.month || currentDate.toLocaleString('default', { month: 'long' });
        const year = parseInt(row.year) || currentDate.getFullYear();

        // Map status - "Sent for Testing" -> "Test Credentials Shared"
        let mappedStatus = row.status || row['lab status'] || 'Delivered';
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

  // Helper to parse CSV line with quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  return (
    <div className="space-y-6">
      {/* ADR Info Header with Bulk Upload */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">All Delivery Records (ADR)</span>
          <span className="text-xs text-muted-foreground">
            ({adrDeliveryRequests.length} Delivery Records)
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            Status: Delivered, Delivery In-Progress, Delivery Completed
          </span>
        </div>

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
            Bulk Upload
          </Button>
        </div>
      </div>

      {/* Cloud Type Sub-tabs */}
      <Tabs defaultValue="overall" className="space-y-6">
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="overall" className="gap-2">
            <Building2 className="w-4 h-4" />
            Overall ({adrDeliveryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="public-cloud" className="gap-2">
            <Cloud className="w-4 h-4" />
            Public Cloud ({publicCloudDeliveryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="private-cloud" className="gap-2">
            <Server className="w-4 h-4" />
            Private Cloud ({privateCloudDeliveryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="tp-labs" className="gap-2">
            <Building2 className="w-4 h-4" />
            Third-Party Labs ({tpLabsDeliveryRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <div className="space-y-4">
            {/* Preview Master Sheet Button - Only in Overall tab */}
            {canPreview && (
              <div className="flex justify-end">
                <Link to="/master-data-sheet">
                  <Button variant="secondary" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview Master Data Sheet
                  </Button>
                </Link>
              </div>
            )}
            <DeliveryTable
              requests={adrDeliveryRequests}
              onDelete={onDeliveryDelete}
              onUpdate={onUpdate}
            />
          </div>
        </TabsContent>

        <TabsContent value="public-cloud">
          <DeliveryTable
            requests={publicCloudDeliveryRequests}
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="private-cloud">
          <DeliveryTable
            requests={privateCloudDeliveryRequests}
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="tp-labs">
          <DeliveryTable
            requests={tpLabsDeliveryRequests}
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
