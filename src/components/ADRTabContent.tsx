import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cloud, Server, Building2, Eye, Upload, Download, Sparkles, Loader2 } from 'lucide-react';
import { DeliveryTable } from '@/components/DeliveryTable';
import { AIDataEditBar } from '@/components/AIDataEditBar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  onRefetch?: () => void;
}

interface CorrectedRow {
  potentialId: string;
  freshDeskTicketNumber: string;
  trainingName: string;
  numberOfUsers: number;
  client: string;
  month: string;
  year: number;
  receivedOn: string;
  cloud: string;
  cloudType: string;
  tpLabType: string;
  labName: string;
  requester: string;
  agentName: string;
  accountManager: string;
  labStatus: string;
  labType: string;
  startDate: string;
  endDate: string;
  labSetupRequirement: string;
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  lineOfBusiness: string;
  invoiceDetails: string;
}

export const ADRTabContent = ({
  deliveryRequests,
  onDeliveryDelete,
  onUpdate,
  onBulkInsert,
  onRefetch,
}: ADRTabContentProps) => {
  const { isAdmin, isOpsLead } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

    setIsProcessing(true);
    
    toast({
      title: 'AI Processing',
      description: 'Analyzing and auto-correcting your data...',
    });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast({
          title: 'Empty File',
          description: 'The file contains no data rows.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Parse headers and rows
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx]?.trim().replace(/^"|"$/g, '') || '';
        });
        rows.push(row);
      }

      // Call AI autocorrect edge function
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-csv-autocorrect', {
        body: { headers, rows }
      });

      if (aiError) {
        console.error('AI autocorrect error:', aiError);
        throw new Error('AI processing failed. Proceeding with standard import.');
      }

      let recordsToInsert: Omit<DeliveryRequest, 'id' | 'createdAt'>[];

      if (aiResult?.success && aiResult?.correctedRows) {
        // Use AI-corrected data
        recordsToInsert = aiResult.correctedRows.map((row: CorrectedRow) => ({
          potentialId: row.potentialId || '',
          freshDeskTicketNumber: row.freshDeskTicketNumber || '',
          trainingName: row.trainingName || row.labName || '',
          numberOfUsers: row.numberOfUsers || 0,
          client: row.client || 'Unknown Client',
          month: row.month,
          year: row.year,
          receivedOn: row.receivedOn || '',
          cloud: row.cloud || '',
          cloudType: row.cloudType || '',
          tpLabType: row.tpLabType || '',
          labName: row.labName || row.trainingName || '',
          requester: row.requester || '',
          agentName: row.agentName || '',
          accountManager: row.accountManager || '',
          labStatus: row.labStatus || 'Delivered',
          labType: row.labType || '',
          startDate: row.startDate || '',
          endDate: row.endDate || '',
          labSetupRequirement: row.labSetupRequirement || '',
          inputCostPerUser: row.inputCostPerUser || 0,
          sellingCostPerUser: row.sellingCostPerUser || 0,
          totalAmount: row.totalAmount || 0,
          lineOfBusiness: row.lineOfBusiness || '',
          invoiceDetails: row.invoiceDetails || '',
        }));

        // Show AI corrections summary
        if (aiResult.corrections && aiResult.corrections.length > 0) {
          toast({
            title: 'AI Auto-Corrections Applied',
            description: aiResult.corrections.slice(0, 3).join(' • '),
          });
        }
      } else {
        throw new Error('AI response was invalid');
      }

      if (onBulkInsert && recordsToInsert.length > 0) {
        await onBulkInsert(recordsToInsert);
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${recordsToInsert.length} delivery records with AI corrections.`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'There was an error processing the file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            disabled={isProcessing}
          />
          <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2" disabled={isProcessing}>
            <Download className="w-4 h-4" />
            Template
          </Button>
          <Button 
            variant="outline" 
            onClick={handleImportClick} 
            className="gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <Upload className="w-4 h-4" />
                AI Bulk Upload
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Data Edit Bar */}
      <AIDataEditBar 
        tableType="delivery" 
        onEditComplete={onRefetch}
        recordCount={adrDeliveryRequests.length}
      />

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
