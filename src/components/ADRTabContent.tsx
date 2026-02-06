import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cloud, Server, Building2, Eye } from 'lucide-react';
import { DeliveryTable } from '@/components/DeliveryTable';

interface ADRTabContentProps {
  deliveryRequests: DeliveryRequest[];
  onDeliveryDelete: (id: string) => void;
  onUpdate?: (id: string, data: Partial<DeliveryRequest>) => void;
}

export const ADRTabContent = ({
  deliveryRequests,
  onDeliveryDelete,
  onUpdate,
}: ADRTabContentProps) => {
  const { isAdmin, isOpsLead } = useAuth();

  const canPreview = isAdmin || isOpsLead;

  // ADR Status filter - only show Delivery records with specific statuses
  const adrStatuses = ['Delivered', 'Delivery In-Progress', 'Completed'];
  
  // Filter delivery requests by ADR statuses - NO Solutions/labRequests included
  const adrDeliveryRequests = deliveryRequests.filter(r => 
    r.labStatus && adrStatuses.includes(r.labStatus)
  );

  // Filter by cloud type
  const publicCloudDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'Public Cloud');
  const privateCloudDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'Private Cloud');
  const tpLabsDeliveryRequests = adrDeliveryRequests.filter(r => r.cloud === 'TP Labs');

  return (
    <div className="space-y-6">
      {/* ADR Info Header */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">All Delivery Records (ADR)</span>
          <span className="text-xs text-muted-foreground">
            ({adrDeliveryRequests.length} Delivery Records)
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            Status: Delivered, Delivery In-Progress, Completed
          </span>
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
