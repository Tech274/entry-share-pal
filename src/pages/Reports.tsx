import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLabRequestsQuery } from '@/hooks/useLabRequestsQuery';
import { useDeliveryRequestsQuery } from '@/hooks/useDeliveryRequestsQuery';
import { RevenueBreakdown } from '@/components/dashboards/RevenueBreakdown';
import { LabTypeBreakdown } from '@/components/dashboards/LabTypeBreakdown';
import { LearnersBreakdown } from '@/components/dashboards/LearnersBreakdown';
import { ReportsSummary } from '@/components/reports/ReportsSummary';
import { CloudBillingTab } from '@/components/reports/CloudBillingTab';
import { IndianRupee, Layers, Users, FileText, Cloud } from 'lucide-react';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';

const ReportsPage = () => {
  const { isAdmin, isFinance, isOpsLead } = useAuth();
  const { requests: labRequests } = useLabRequestsQuery();
  const { requests: deliveryRequests } = useDeliveryRequestsQuery();
  const { toast } = useToast();

  // Only admin, finance, and ops_lead can access reports
  const canAccessReports = isAdmin || isFinance || isOpsLead;
  
  // Only admin and finance can access Cloud Billing
  const canAccessCloudBilling = isAdmin || isFinance || isOpsLead;

  const handleExportCSV = () => {
    exportToCSV(labRequests);
    toast({ title: 'Export Complete', description: 'Data exported as CSV' });
  };

  const handleExportXLS = () => {
    exportToXLS(labRequests);
    toast({ title: 'Export Complete', description: 'Data exported as XLS' });
  };

  const handleClearAll = () => {
    // No-op for reports page
  };

  if (!canAccessReports) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          requestCount={0} 
          labRequests={[]} 
          deliveryRequests={[]} 
          onExportCSV={handleExportCSV}
          onExportXLS={handleExportXLS}
          onClearAll={handleClearAll}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center p-8 text-muted-foreground">
            You don't have permission to access this page.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        requestCount={labRequests.length + deliveryRequests.length} 
        labRequests={labRequests} 
        deliveryRequests={deliveryRequests} 
        onExportCSV={handleExportCSV}
        onExportXLS={handleExportXLS}
        onClearAll={handleClearAll}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Reports</h1>
          </div>

          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList className={`grid w-full max-w-3xl ${canAccessCloudBilling ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="revenue" className="gap-2">
                <IndianRupee className="w-4 h-4" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="labtype" className="gap-2">
                <Layers className="w-4 h-4" />
                Lab Type
              </TabsTrigger>
              <TabsTrigger value="learners" className="gap-2">
                <Users className="w-4 h-4" />
                Learners
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2">
                <FileText className="w-4 h-4" />
                Summary
              </TabsTrigger>
              {canAccessCloudBilling && (
                <TabsTrigger value="cloudbilling" className="gap-2">
                  <Cloud className="w-4 h-4" />
                  Cloud Billing
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="revenue" className="space-y-6">
              <RevenueBreakdown labRequests={labRequests} deliveryRequests={deliveryRequests} />
            </TabsContent>

            <TabsContent value="labtype" className="space-y-6">
              <LabTypeBreakdown labRequests={labRequests} deliveryRequests={deliveryRequests} />
            </TabsContent>

            <TabsContent value="learners" className="space-y-6">
              <LearnersBreakdown deliveryRequests={deliveryRequests} />
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <ReportsSummary labRequests={labRequests} deliveryRequests={deliveryRequests} />
            </TabsContent>

            {canAccessCloudBilling && (
              <TabsContent value="cloudbilling" className="space-y-6">
                <CloudBillingTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
