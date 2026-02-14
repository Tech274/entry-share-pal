import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cloud, Server, Building2, Eye, Upload, Download, Sparkles, Loader2, ChevronRight, LayoutDashboard, X, PackageCheck, CheckCircle, Database } from 'lucide-react';
import { DeliveryTable } from '@/components/DeliveryTable';
import { AIDataEditBar } from '@/components/AIDataEditBar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

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
  initialFilter?: string;
  onFilterChange?: (filter: string | undefined) => void;
  onNavigateToDashboard?: () => void;
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

// Sub-component for Lab Type filtered view within each main tab
const LabTypeSubTabs = ({ 
  requests, 
  onDelete,
  onUpdate,
  showMasterSheetButton = false,
  canPreview = false,
}: { 
  requests: DeliveryRequest[]; 
  onDelete: (id: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
  showMasterSheetButton?: boolean;
  canPreview?: boolean;
}) => {
  const publicCloudRequests = requests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudRequests = requests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsRequests = requests.filter(r => r.cloud === 'TP Labs');

  return (
    <Tabs defaultValue="all" className="space-y-4">
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
        <div className="space-y-4">
          {showMasterSheetButton && canPreview && (
            <div className="flex justify-end">
              <Link to="/master-data-sheet">
                <Button variant="secondary" className="gap-2">
                  <Eye className="w-4 h-4" />
                  Preview Master Data Sheet
                </Button>
              </Link>
            </div>
          )}
          <DeliveryTable requests={requests} onDelete={onDelete} onUpdate={onUpdate} />
        </div>
      </TabsContent>

      <TabsContent value="public">
        <DeliveryTable requests={publicCloudRequests} onDelete={onDelete} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="private">
        <DeliveryTable requests={privateCloudRequests} onDelete={onDelete} onUpdate={onUpdate} />
      </TabsContent>

      <TabsContent value="tp-labs">
        <DeliveryTable requests={tpLabsRequests} onDelete={onDelete} onUpdate={onUpdate} />
      </TabsContent>
    </Tabs>
  );
};

export const ADRTabContent = ({
  deliveryRequests,
  onDeliveryDelete,
  onUpdate,
  onBulkInsert,
  onRefetch,
  initialFilter,
  onFilterChange,
  onNavigateToDashboard,
}: ADRTabContentProps) => {
  const { isAdmin, isOpsLead } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mainTab, setMainTab] = useState('in-progress');
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined);

  const canPreview = isAdmin || isOpsLead;

  // Handle initial filter from dashboard navigation
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
      // Map filter to appropriate main tab
      if (initialFilter === 'Delivery Completed' || initialFilter === 'Completed') {
        setMainTab('completed');
      } else if (initialFilter === 'Delivery In-Progress') {
        setMainTab('in-progress');
      } else {
        // For lab type filters, stay on current tab
        setMainTab('all-records');
      }
    }
  }, [initialFilter]);

  const clearFilter = () => {
    setActiveFilter(undefined);
    onFilterChange?.(undefined);
  };

  // Filter delivery requests by status categories
  const deliveryInProgressRequests = deliveryRequests.filter(r => 
    r.labStatus === 'Delivery In-Progress'
  );
  
  const completedRequests = deliveryRequests.filter(r => 
    r.labStatus === 'Completed' || r.labStatus === 'Delivery Completed'
  );

  // All ADR records (Delivery In-Progress + Completed)
  const allAdrRequests = deliveryRequests.filter(r => 
    r.labStatus === 'Delivery In-Progress' || 
    r.labStatus === 'Completed' || 
    r.labStatus === 'Delivery Completed' ||
    r.labStatus === 'Delivered'
  );

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
      {/* Breadcrumb Navigation - shown when navigated from dashboard */}
      {activeFilter && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 animate-fade-in">
          <button 
            onClick={onNavigateToDashboard}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">ADR</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-primary">{activeFilter}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="ml-auto h-7 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear Filter
          </Button>
        </div>
      )}

      {/* ADR Info Header with Bulk Upload */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">All Delivery Records (ADR)</span>
          <span className="text-xs text-muted-foreground">
            ({allAdrRequests.length} Total Records)
          </span>
          <Badge variant="outline" className="text-xs gap-1 bg-cyan-500/10 text-cyan-700 border-cyan-200">
            <PackageCheck className="w-3 h-3" />
            In-Progress: {deliveryInProgressRequests.length}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1 bg-emerald-500/10 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            Completed: {completedRequests.length}
          </Badge>
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
        recordCount={allAdrRequests.length}
      />

      {/* Main Status Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="in-progress" className="gap-2">
            <PackageCheck className="w-4 h-4" />
            Delivery In-Progress ({deliveryInProgressRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all-records" className="gap-2">
            <Database className="w-4 h-4" />
            All Records ({allAdrRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          <LabTypeSubTabs 
            requests={deliveryInProgressRequests} 
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <LabTypeSubTabs 
            requests={completedRequests} 
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
          />
        </TabsContent>

        <TabsContent value="all-records" className="space-y-4">
          <LabTypeSubTabs 
            requests={allAdrRequests} 
            onDelete={onDeliveryDelete}
            onUpdate={onUpdate}
            showMasterSheetButton={true}
            canPreview={canPreview}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};