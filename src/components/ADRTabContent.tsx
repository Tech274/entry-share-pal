import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CloudTabContent } from '@/components/CloudTabContent';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Cloud, Server, Building2, Download, ChevronDown } from 'lucide-react';

interface ADRTabContentProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onLabDelete: (id: string) => void;
  onDeliveryDelete: (id: string) => void;
}

export const ADRTabContent = ({
  labRequests,
  deliveryRequests,
  onLabDelete,
  onDeliveryDelete,
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

  return (
    <div className="space-y-6">
      {/* Import/Export Toolbar - visible to Ops roles */}
      {canImportExport && (
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ADR Management</span>
          </div>
          <div className="flex items-center gap-2">
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
