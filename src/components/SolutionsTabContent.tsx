import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequestForm } from '@/components/LabRequestForm';
import { RequestsTable } from '@/components/RequestsTable';
import { LabRequest } from '@/types/labRequest';
import { ClipboardList, FileText } from 'lucide-react';

interface SolutionsTabContentProps {
  requests: LabRequest[];
  onSubmit: (data: Omit<LabRequest, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
}

export const SolutionsTabContent = ({
  requests,
  onSubmit,
  onDelete,
}: SolutionsTabContentProps) => {
  return (
    <Tabs defaultValue="form" className="space-y-6">
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

      <TabsContent value="form" className="space-y-6">
        <LabRequestForm onSubmit={onSubmit} />
      </TabsContent>

      <TabsContent value="list">
        <RequestsTable requests={requests} onDelete={onDelete} />
      </TabsContent>
    </Tabs>
  );
};
