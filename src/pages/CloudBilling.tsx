import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuth } from '@/contexts/AuthContext';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CloudBillingDashboard } from '@/components/dashboards/CloudBillingDashboard';

const CloudBilling = () => {
  const { requests: labRequests, loading: labLoading } = useLabRequests();
  const { requests: deliveryRequests, loading: deliveryLoading } = useDeliveryRequests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useAuth();

  useRealtimeSync();

  const handleExportCSV = () => {
    exportToCSV(labRequests);
    toast({ title: 'Export Complete', description: 'Solutions data exported as CSV.' });
  };

  const handleExportXLS = () => {
    exportToXLS(labRequests);
    toast({ title: 'Export Complete', description: 'Solutions data exported as XLS.' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        requestCount={labRequests.length + deliveryRequests.length}
        onExportCSV={handleExportCSV}
        onExportXLS={handleExportXLS}
        onClearAll={() => {}}
        labRequests={labRequests}
        deliveryRequests={deliveryRequests}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold">Cloud Billing</h1>
            </div>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {role === 'admin' ? 'Admin' : role === 'finance' ? 'Finance' : 'Ops Lead'}
            </Badge>
          </div>
        </div>

        <CloudBillingDashboard />
      </main>
    </div>
  );
};

export default CloudBilling;
