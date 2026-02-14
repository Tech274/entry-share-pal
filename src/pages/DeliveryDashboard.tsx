import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuth } from '@/contexts/AuthContext';
import { useReportAccessForRole } from '@/hooks/useReportAccessConfig';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { TimeBucketMetricsPanel } from '@/components/dashboards/TimeBucketMetricsPanel';
import { normalizeDeliveryEntries } from '@/lib/reportTimeMetrics';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { canAccess } = useReportAccessForRole(role);
  const { toast } = useToast();
  const { requests: labRequests, loading: labLoading } = useLabRequests();
  const { requests: deliveryRequests, loading: deliveryLoading } = useDeliveryRequests();

  useRealtimeSync();

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Reports are available to Admin, Finance, and Ops Lead.</p>
      </div>
    );
  }

  const handleExportCSV = () => {
    exportToCSV(deliveryRequests, 'delivery-dashboard');
    toast({ title: 'Export Complete', description: 'Delivery dashboard data exported as CSV.' });
  };

  const handleExportXLS = () => {
    exportToXLS(deliveryRequests, 'delivery-dashboard');
    toast({ title: 'Export Complete', description: 'Delivery dashboard data exported as XLS.' });
  };

  const isLoading = labLoading || deliveryLoading;

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

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Button>
            <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {role === 'admin' ? 'Admin' : role === 'finance' ? 'Finance' : 'Ops Lead'}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        ) : (
          <TimeBucketMetricsPanel
            title="Delivery Metrics by Submission Time"
            subtitle="Daily, weekly, monthly, and overall delivery calculations using automated request submission timestamps."
            entries={normalizeDeliveryEntries(deliveryRequests)}
          />
        )}
      </main>
    </div>
  );
};

export default DeliveryDashboard;
