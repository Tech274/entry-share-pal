import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudTabContent } from '@/components/CloudTabContent';
import { BulkUploadDialog } from '@/components/BulkUploadDialog';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Server, Building2, Download, Upload, ChevronDown } from 'lucide-react';

interface ADRTabContentProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
  onBulkImport?: (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => Promise<boolean>;
}

// CSV template headers for bulk import
const CSV_TEMPLATE_HEADERS = [
  'Month',
  'Year',
  'Client',
  'Lab Type',
  'Cloud Type',
  'TP Lab Type',
  'Lab Name',
  'User Count',
  'Duration (Days)',
  'Input Cost Per User',
  'Selling Cost Per User',
  'Total Amount',
  'Margin (%)',
  'Status',
  'LOB',
  'Invoice Details',
];

// Parse CSV row to LabRequest
const parseCSVRow = (row: Record<string, string | number>, headers: string[]): Omit<LabRequest, 'id' | 'createdAt'> | null => {
  const month = String(row['Month'] || '');
  const client = String(row['Client'] || '');
  const lineOfBusiness = String(row['LOB'] || row['Line of Business'] || '');

  // Required fields validation
  if (!month || !client || !lineOfBusiness) {
    return null;
  }

  return {
    potentialId: String(row['Potential ID'] || ''),
    freshDeskTicketNumber: String(row['Ticket #'] || row['FreshDesk Ticket'] || ''),
    month,
    year: Number(row['Year']) || new Date().getFullYear(),
    client,
    cloud: String(row['Lab Type'] || row['Cloud'] || ''),
    cloudType: String(row['Cloud Type'] || ''),
    tpLabType: String(row['TP Lab Type'] || ''),
    labName: String(row['Lab Name'] || ''),
    requester: String(row['Requester'] || ''),
    agentName: String(row['Agent Name'] || ''),
    accountManager: String(row['Account Manager'] || ''),
    receivedOn: String(row['Received On'] || ''),
    labStartDate: String(row['Lab Start Date'] || row['Start Date'] || ''),
    labEndDate: String(row['Lab End Date'] || row['End Date'] || ''),
    userCount: Number(row['User Count'] || row['Users']) || 0,
    durationInDays: Number(row['Duration (Days)'] || row['Duration']) || 0,
    inputCostPerUser: Number(row['Input Cost Per User'] || row['Input Cost']) || 0,
    sellingCostPerUser: Number(row['Selling Cost Per User'] || row['Selling Cost']) || 0,
    totalAmountForTraining: Number(row['Total Amount'] || row['Total']) || 0,
    margin: Number(row['Margin (%)'] || row['Margin']) || 0,
    status: String(row['Status'] || 'Solution Pending'),
    remarks: String(row['Remarks'] || ''),
    lineOfBusiness,
    invoiceDetails: String(row['Invoice Details'] || ''),
  };
};

export const ADRTabContent = ({
  labRequests,
  deliveryRequests,
  onLabDelete,
  onDeliveryDelete,
  onBulkImport,
}: ADRTabContentProps) => {
  const { isAdmin, isOpsLead, isOpsEngineer } = useAuth();
  const { toast } = useToast();

  const canImportExport = isAdmin || isOpsLead || isOpsEngineer;

  // Filter requests by cloud type
  const publicCloudLabRequests = labRequests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudLabRequests = labRequests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsLabRequests = labRequests.filter(r => r.cloud === 'TP Labs');

  const publicCloudDeliveryRequests = deliveryRequests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudDeliveryRequests = deliveryRequests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsDeliveryRequests = deliveryRequests.filter(r => r.cloud === 'TP Labs');

  const handleExportCSV = () => {
    exportToCSV(labRequests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as CSV.',
    });
  };

  const handleExportXLS = () => {
    exportToXLS(labRequests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as XLS.',
    });
  };

  const handleBulkUpload = async (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => {
    if (onBulkImport) {
      await onBulkImport(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Import/Export Toolbar - visible to Ops roles */}
      {canImportExport && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ADR Management</span>
            <span className="text-xs text-muted-foreground">
              ({labRequests.length} Solutions, {deliveryRequests.length} Deliveries)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BulkUploadDialog
              title="Import Solutions Data"
              description="Upload a CSV file to bulk import solution requests. Download the template for the correct format."
              templateHeaders={CSV_TEMPLATE_HEADERS}
              onUpload={handleBulkUpload}
              parseRow={parseCSVRow}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportXLS}>
                  Export as XLS
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Cloud Type Sub-tabs */}
      <Tabs defaultValue="public-cloud" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="public-cloud" className="gap-2">
            <Cloud className="w-4 h-4" />
            Public Cloud ({publicCloudLabRequests.length + publicCloudDeliveryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="private-cloud" className="gap-2">
            <Server className="w-4 h-4" />
            Private Cloud ({privateCloudLabRequests.length + privateCloudDeliveryRequests.length})
          </TabsTrigger>
          <TabsTrigger value="tp-labs" className="gap-2">
            <Building2 className="w-4 h-4" />
            Third-Party Labs ({tpLabsLabRequests.length + tpLabsDeliveryRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public-cloud">
          <CloudTabContent
            title="Public Cloud"
            icon={<Cloud className="w-5 h-5" />}
            labRequests={publicCloudLabRequests}
            deliveryRequests={publicCloudDeliveryRequests}
            onLabDelete={onLabDelete}
            onDeliveryDelete={onDeliveryDelete}
          />
        </TabsContent>

        <TabsContent value="private-cloud">
          <CloudTabContent
            title="Private Cloud"
            icon={<Server className="w-5 h-5" />}
            labRequests={privateCloudLabRequests}
            deliveryRequests={privateCloudDeliveryRequests}
            onLabDelete={onLabDelete}
            onDeliveryDelete={onDeliveryDelete}
          />
        </TabsContent>

        <TabsContent value="tp-labs">
          <CloudTabContent
            title="Third-Party Labs"
            icon={<Building2 className="w-5 h-5" />}
            labRequests={tpLabsLabRequests}
            deliveryRequests={tpLabsDeliveryRequests}
            onLabDelete={onLabDelete}
            onDeliveryDelete={onDeliveryDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
