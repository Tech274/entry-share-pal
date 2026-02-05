import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryRequestForm } from '@/components/DeliveryRequestForm';
import { DeliveryTable } from '@/components/DeliveryTable';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { Truck, FileText } from 'lucide-react';

interface DeliveryTabContentProps {
  requests: DeliveryRequest[];
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export const DeliveryTabContent = ({
  requests,
  onSubmit,
  onDelete,
}: DeliveryTabContentProps) => {
  return (
    <Tabs defaultValue="form" className="space-y-6">
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

      <TabsContent value="form" className="space-y-6">
        <DeliveryRequestForm onSubmit={onSubmit} />
      </TabsContent>

      <TabsContent value="list">
        <DeliveryTable requests={requests} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
};
