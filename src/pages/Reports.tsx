import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessReports, getAllowedReportSlugs, type ReportSlug } from '@/lib/reportAccessMatrix';
import { RevenueBreakdown } from '@/components/dashboards/RevenueBreakdown';
import { LabTypeBreakdown } from '@/components/dashboards/LabTypeBreakdown';
import { LearnersBreakdown } from '@/components/dashboards/LearnersBreakdown';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, PieChart, Users, IndianRupee, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabRequest } from '@/types/labRequest';

const Reports = () => {
  const { requests: labRequests, loading: labLoading } = useLabRequests();
  const { requests: deliveryRequests, loading: deliveryLoading } = useDeliveryRequests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canAccess = canAccessReports(role);
  const allowedSlugs = getAllowedReportSlugs(role);

  useRealtimeSync();

  const handleExportCSV = () => {
    exportToCSV(labRequests);
    toast({ title: 'Export Complete', description: 'Solutions data exported as CSV.' });
  };

  const handleExportXLS = () => {
    exportToXLS(labRequests);
    toast({ title: 'Export Complete', description: 'Solutions data exported as XLS.' });
  };

  const handleNavigateToTab = (tab: string, filter?: string) => {
    navigate('/dashboard', { state: { activeTab: tab, filter } });
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Reports are available to Admin, Finance, and Ops Lead.</p>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Reports</h1>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              {role === 'admin' ? 'Admin' : role === 'finance' ? 'Finance' : 'Ops Lead'}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 animate-pulse">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        ) : (
          <Tabs defaultValue={allowedSlugs[0] ?? 'revenue'} className="space-y-6">
            <TabsList
              className={`grid w-full gap-1 ${
                allowedSlugs.length === 1
                  ? 'max-w-[8rem] grid-cols-1'
                  : allowedSlugs.length === 2
                    ? 'max-w-md grid-cols-2'
                    : allowedSlugs.length === 3
                      ? 'max-w-2xl grid-cols-3'
                      : 'max-w-3xl grid-cols-4'
              }`}
            >
              {allowedSlugs.includes('revenue') && (
                <TabsTrigger value="revenue" className="gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Revenue
                </TabsTrigger>
              )}
              {allowedSlugs.includes('labType') && (
                <TabsTrigger value="labType" className="gap-2">
                  <Layers className="w-4 h-4" />
                  Lab Type
                </TabsTrigger>
              )}
              {allowedSlugs.includes('learners') && (
                <TabsTrigger value="learners" className="gap-2">
                  <Users className="w-4 h-4" />
                  Learners
                </TabsTrigger>
              )}
              {allowedSlugs.includes('summary') && (
                <TabsTrigger value="summary" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Summary
                </TabsTrigger>
              )}
            </TabsList>

            {allowedSlugs.includes('revenue') && (
            <TabsContent value="revenue" className="space-y-6">
              <RevenueBreakdown
                labRequests={labRequests}
                deliveryRequests={deliveryRequests}
                onNavigateToTab={handleNavigateToTab}
              />
            </TabsContent>
            )}

            {allowedSlugs.includes('labType') && (
            <TabsContent value="labType" className="space-y-6">
              <LabTypeBreakdown
                labRequests={labRequests}
                deliveryRequests={deliveryRequests}
                onNavigateToTab={handleNavigateToTab}
              />
            </TabsContent>
            )}

            {allowedSlugs.includes('learners') && (
            <TabsContent value="learners" className="space-y-6">
              <LearnersBreakdown
                deliveryRequests={deliveryRequests}
                onNavigateToTab={handleNavigateToTab}
              />
            </TabsContent>
            )}

            {allowedSlugs.includes('summary') && (
            <TabsContent value="summary" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="bg-blue-500 text-white py-3 px-4 rounded-t-lg">
                    <CardTitle className="text-base">Solutions Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Solutions</span>
                        <span className="font-bold">{labRequests.length}</span>
                      </div>
                      {['Solution Pending', 'Solution Sent', 'POC In-Progress', 'Lost Closed'].map((status) => (
                        <div key={status} className="flex justify-between">
                          <span>{status}</span>
                          <span className="font-medium">{labRequests.filter((r: LabRequest) => r.status === status).length}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t">
                        <span>Total Revenue</span>
                        <span className="font-bold">₹{labRequests.reduce((s, r) => s + (r.totalAmountForTraining || 0), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="bg-green-500 text-white py-3 px-4 rounded-t-lg">
                    <CardTitle className="text-base">Delivery Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Deliveries</span>
                        <span className="font-bold">{deliveryRequests.length}</span>
                      </div>
                      {['Pending', 'Work-in-Progress', 'Test Credentials Shared', 'Delivery In-Progress', 'Delivery Completed'].map((status) => (
                        <div key={status} className="flex justify-between">
                          <span>{status}</span>
                          <span className="font-medium">{deliveryRequests.filter((r) => r.labStatus === status).length}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 border-t">
                        <span>Total Learners</span>
                        <span className="font-bold">{deliveryRequests.reduce((s, r) => s + (r.numberOfUsers || 0), 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Reports;
