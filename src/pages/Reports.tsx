import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuth } from '@/contexts/AuthContext';
import { type ReportSlug } from '@/lib/reportAccessMatrix';
import { useReportAccessForRole } from '@/hooks/useReportAccessConfig';
import { RevenueBreakdown } from '@/components/dashboards/RevenueBreakdown';
import { LabTypeBreakdown } from '@/components/dashboards/LabTypeBreakdown';
import { LearnersBreakdown } from '@/components/dashboards/LearnersBreakdown';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, PieChart, Users, IndianRupee, Layers, Cloud, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LabRequest } from '@/types/labRequest';
import { CloudBillingDashboard } from '@/components/dashboards/CloudBillingDashboard';
import { TimeBucketMetricsPanel } from '@/components/dashboards/TimeBucketMetricsPanel';
import { normalizeDeliveryEntries, normalizeSolutionEntries } from '@/lib/reportTimeMetrics';
import { useState, useMemo } from 'react';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

const Reports = () => {
  const { requests: labRequests, loading: labLoading } = useLabRequests();
  const { requests: deliveryRequests, loading: deliveryLoading } = useDeliveryRequests();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { canAccess, allowedSlugs } = useReportAccessForRole(role);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useRealtimeSync();

  // Filter data by date range
  const filteredLabRequests = useMemo(() => {
    if (!dateRange?.from) return labRequests;
    return labRequests.filter(r => {
      const d = r.receivedOn ? parseISO(r.receivedOn) : r.createdAt ? parseISO(r.createdAt) : null;
      if (!d) return true;
      const from = startOfDay(dateRange.from!);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
      return isWithinInterval(d, { start: from, end: to });
    });
  }, [labRequests, dateRange]);

  const filteredDeliveryRequests = useMemo(() => {
    if (!dateRange?.from) return deliveryRequests;
    return deliveryRequests.filter(r => {
      const d = r.receivedOn ? parseISO(r.receivedOn) : r.createdAt ? parseISO(r.createdAt) : null;
      if (!d) return true;
      const from = startOfDay(dateRange.from!);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
      return isWithinInterval(d, { start: from, end: to });
    });
  }, [deliveryRequests, dateRange]);

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
  const solutionEntries = normalizeSolutionEntries(filteredLabRequests);
  const deliveryEntries = normalizeDeliveryEntries(filteredDeliveryRequests);

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
                      : allowedSlugs.length === 4
                        ? 'max-w-3xl grid-cols-4'
                        : 'max-w-4xl grid-cols-5'
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
              {allowedSlugs.includes('cloudBilling') && (
                <TabsTrigger value="cloudBilling" className="gap-2">
                  <Cloud className="w-4 h-4" />
                  Cloud Billing
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

            {allowedSlugs.includes('cloudBilling') && (
            <TabsContent value="cloudBilling" className="space-y-6">
              <CloudBillingDashboard />
            </TabsContent>
            )}

            {allowedSlugs.includes('summary') && (
            <TabsContent value="summary" className="space-y-6">
              {/* Date Range Picker + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal min-w-[260px]", !dateRange?.from && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "dd MMM yyyy")} – {format(dateRange.to, "dd MMM yyyy")}
                            </>
                          ) : (
                            format(dateRange.from, "dd MMM yyyy")
                          )
                        ) : (
                          <span>All Time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {dateRange?.from && (
                    <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                      Clear
                    </Button>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/delivery-dashboard')}>
                  Open Delivery Dashboard
                </Button>
              </div>

              {/* Unified Summary Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Solutions Card */}
                <Card>
                  <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
                    <CardTitle className="text-base">Solutions ({filteredLabRequests.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      {['Solution Pending', 'Solution Sent', 'POC In-Progress', 'Lost Closed'].map((status) => (
                        <div key={status} className="flex justify-between">
                          <span>{status}</span>
                          <span className="font-medium">{filteredLabRequests.filter((r: LabRequest) => r.status === status).length}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 space-y-2">
                        <div className="flex justify-between"><span>Total Users</span><span className="font-bold">{filteredLabRequests.reduce((s, r) => s + (r.userCount || 0), 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Avg Duration (days)</span><span className="font-bold">{filteredLabRequests.length ? Math.round(filteredLabRequests.reduce((s, r) => s + (r.durationInDays || 0), 0) / filteredLabRequests.length) : 0}</span></div>
                      </div>
                      <div className="border-t pt-2 space-y-2">
                        <p className="font-medium text-muted-foreground">By Line of Business</p>
                        {['Standalone', 'VILT', 'Integrated'].map((lob) => {
                          const count = filteredLabRequests.filter(r => r.lineOfBusiness === lob).length;
                          return count > 0 ? (
                            <div key={lob} className="flex justify-between"><span>{lob}</span><span className="font-medium">{count}</span></div>
                          ) : null;
                        })}
                      </div>
                      <div className="border-t pt-2 space-y-2">
                        <p className="font-medium text-muted-foreground">By Lab Type</p>
                        {['Public Cloud', 'Private Cloud', 'TP Labs'].map((cloud) => {
                          const count = filteredLabRequests.filter(r => r.cloud === cloud).length;
                          return count > 0 ? (
                            <div key={cloud} className="flex justify-between"><span>{cloud}</span><span className="font-medium">{count}</span></div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Card */}
                <Card>
                  <CardHeader className="bg-accent text-accent-foreground py-3 px-4 rounded-t-lg">
                    <CardTitle className="text-base">Delivery ({filteredDeliveryRequests.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      {['Pending', 'Work-in-Progress', 'Test Credentials Shared', 'Delivery In-Progress', 'Delivery Completed', 'Cancelled'].map((status) => (
                        <div key={status} className="flex justify-between">
                          <span>{status}</span>
                          <span className="font-medium">{filteredDeliveryRequests.filter((r) => r.labStatus === status).length}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 space-y-2">
                        <div className="flex justify-between"><span>Total Learners</span><span className="font-bold">{filteredDeliveryRequests.reduce((s, r) => s + (r.numberOfUsers || 0), 0).toLocaleString()}</span></div>
                      </div>
                      <div className="border-t pt-2 space-y-2">
                        <p className="font-medium text-muted-foreground">By Line of Business</p>
                        {['Standalone', 'VILT', 'Integrated'].map((lob) => {
                          const count = filteredDeliveryRequests.filter(r => r.lineOfBusiness === lob).length;
                          return count > 0 ? (
                            <div key={lob} className="flex justify-between"><span>{lob}</span><span className="font-medium">{count}</span></div>
                          ) : null;
                        })}
                      </div>
                      <div className="border-t pt-2 space-y-2">
                        <p className="font-medium text-muted-foreground">By Lab Type</p>
                        {['Public Cloud', 'Private Cloud', 'TP Labs'].map((cloud) => {
                          const count = filteredDeliveryRequests.filter(r => r.cloud === cloud).length;
                          return count > 0 ? (
                            <div key={cloud} className="flex justify-between"><span>{cloud}</span><span className="font-medium">{count}</span></div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Time Summaries side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeBucketMetricsPanel
                  title="Solutions Time Summary"
                  subtitle="Submission-time metrics by daily, weekly, monthly, and overall buckets."
                  entries={solutionEntries}
                />
                <TimeBucketMetricsPanel
                  title="Delivery Time Summary"
                  subtitle="Delivery request metrics with status and agent visibility."
                  entries={deliveryEntries}
                />
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
