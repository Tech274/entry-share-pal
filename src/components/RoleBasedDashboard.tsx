import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgents, useAccountManagers, useClients } from '@/hooks/usePersonnel';
import { useDashboardConfigForRole, type DashboardSlug } from '@/hooks/useDashboardConfig';
import { OpsEngineerDashboard } from './dashboards/OpsEngineerDashboard';
import { OpsLeadDashboard } from './dashboards/OpsLeadDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { DashboardFilters, DashboardFiltersState, defaultFilters, applyDashboardFilters } from './dashboards/DashboardFilters';
import { FullDashboardSkeleton } from './dashboards/DashboardSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useToast } from '@/hooks/use-toast';

interface RoleBasedDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onNavigateToTab?: (tab: string, filter?: string) => void;
  onNavigateToCalendar?: () => void;
}

export const RoleBasedDashboard = ({ 
  labRequests, 
  deliveryRequests, 
  isLoading = false,
  onRefresh,
  onNavigateToTab,
  onNavigateToCalendar 
}: RoleBasedDashboardProps) => {
  const { role } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<DashboardFiltersState>(defaultFilters);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { enabledSlugs } = useDashboardConfigForRole(role);

  // Use reference tables for filter options (agents, account managers, clients)
  const { data: clientsData = [] } = useClients();
  const { data: agentsData = [] } = useAgents();
  const { data: accountManagersData = [] } = useAccountManagers();

  const clients = useMemo(() => clientsData.filter((c) => c.is_active).map((c) => c.name).sort(), [clientsData]);
  const agentNames = useMemo(() => agentsData.filter((a) => a.is_active).map((a) => a.name).sort(), [agentsData]);
  const accountManagers = useMemo(() => accountManagersData.filter((am) => am.is_active).map((am) => am.name).sort(), [accountManagersData]);

  // Apply filters to both request types
  const filteredLabRequests = useMemo(
    () => applyDashboardFilters(labRequests, filters),
    [labRequests, filters]
  );

  const filteredDeliveryRequests = useMemo(
    () => applyDashboardFilters(deliveryRequests, filters),
    [deliveryRequests, filters]
  );

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const rows: string[] = [];
    
    // Header
    rows.push('Type,Client,Lab Name,Status,Month,Year,Lab Type,LOB,Users,Amount');
    
    // Solutions data
    filteredLabRequests.forEach(r => {
      rows.push(`Solution,"${r.client}","${r.labName}","${r.status}","${r.month}",${r.year},"${r.cloud}","${r.lineOfBusiness}",${r.userCount},${r.totalAmountForTraining}`);
    });
    
    // Delivery data
    filteredDeliveryRequests.forEach(r => {
      rows.push(`Delivery,"${r.client}","${r.trainingName || r.labName}","${r.labStatus}","${r.month}",${r.year},"${r.cloud}","${r.lineOfBusiness}",${r.numberOfUsers},${r.totalAmount}`);
    });
    
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredLabRequests.length + filteredDeliveryRequests.length} records to CSV`,
    });
  }, [filteredLabRequests, filteredDeliveryRequests, toast]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast({
        title: 'Dashboard Refreshed',
        description: 'Data has been updated',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, toast]);

  const handleExportPDF = useCallback(() => {
    // Create a simple printable HTML view
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Export Failed',
        description: 'Please allow pop-ups to export PDF',
        variant: 'destructive',
      });
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dashboard Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          h2 { color: #666; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f5f5f5; }
          .summary { display: flex; gap: 24px; margin-bottom: 20px; }
          .stat { background: #f5f5f5; padding: 12px; border-radius: 4px; }
          .stat-value { font-size: 24px; font-weight: bold; }
          .stat-label { color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Dashboard Export - ${new Date().toLocaleDateString()}</h1>
        <div class="summary">
          <div class="stat">
            <div class="stat-value">${filteredLabRequests.length}</div>
            <div class="stat-label">Solutions</div>
          </div>
          <div class="stat">
            <div class="stat-value">${filteredDeliveryRequests.length}</div>
            <div class="stat-label">Deliveries</div>
          </div>
        </div>
        <h2>Solutions (${filteredLabRequests.length})</h2>
        <table>
          <tr><th>Client</th><th>Lab Name</th><th>Status</th><th>Month</th><th>Lab Type</th><th>Users</th><th>Amount</th></tr>
          ${filteredLabRequests.map(r => `<tr><td>${r.client}</td><td>${r.labName}</td><td>${r.status}</td><td>${r.month}</td><td>${r.cloud}</td><td>${r.userCount}</td><td>₹${r.totalAmountForTraining.toLocaleString()}</td></tr>`).join('')}
        </table>
        <h2>Deliveries (${filteredDeliveryRequests.length})</h2>
        <table>
          <tr><th>Client</th><th>Training</th><th>Status</th><th>Month</th><th>Lab Type</th><th>Users</th><th>Amount</th></tr>
          ${filteredDeliveryRequests.map(r => `<tr><td>${r.client}</td><td>${r.trainingName || r.labName}</td><td>${r.labStatus}</td><td>${r.month}</td><td>${r.cloud}</td><td>${r.numberOfUsers}</td><td>₹${r.totalAmount.toLocaleString()}</td></tr>`).join('')}
        </table>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    
    toast({
      title: 'Print Dialog Opened',
      description: 'Use "Save as PDF" option in the print dialog',
    });
  }, [filteredLabRequests, filteredDeliveryRequests, toast]);

  // For admin role, AdminDashboard has its own internal tabs (Overview, User Management, etc.)
  // The dashboard_config entries for admin are sub-tab configs, not dashboard-type selectors.
  const isAdminRole = role === 'admin';
  const effectiveSlugs = isAdminRole 
    ? ['admin' as DashboardSlug]
    : enabledSlugs.length > 0 
      ? enabledSlugs 
      : (role ? [role === 'ops_lead' ? 'ops_lead' : role === 'finance' ? 'leadership' : 'ops'] : ['ops']) as DashboardSlug[];
  const [selectedDashboardTab, setSelectedDashboardTab] = useState<string>(effectiveSlugs[0] ?? 'ops');
  useEffect(() => {
    if (effectiveSlugs.length > 0 && !effectiveSlugs.includes(selectedDashboardTab as DashboardSlug)) {
      setSelectedDashboardTab(effectiveSlugs[0]);
    }
  }, [effectiveSlugs, selectedDashboardTab]);

  const renderDashboardBySlug = (slug: DashboardSlug) => {
    switch (slug) {
      case 'admin':
        return (
          <AdminDashboard 
            labRequests={filteredLabRequests} 
            deliveryRequests={filteredDeliveryRequests}
            onNavigate={onNavigateToTab}
            onNavigateToCalendar={onNavigateToCalendar}
          />
        );
      case 'ops_lead':
        return (
          <OpsLeadDashboard 
            labRequests={filteredLabRequests} 
            deliveryRequests={filteredDeliveryRequests}
            onNavigate={onNavigateToTab}
            onNavigateToCalendar={onNavigateToCalendar}
          />
        );
      case 'leadership':
        return (
          <FinanceDashboard 
            labRequests={filteredLabRequests} 
            deliveryRequests={filteredDeliveryRequests}
            onNavigate={onNavigateToTab}
          />
        );
      case 'ops':
      default:
        return (
          <OpsEngineerDashboard 
            labRequests={filteredLabRequests} 
            deliveryRequests={filteredDeliveryRequests}
            onNavigate={onNavigateToTab}
            onNavigateToCalendar={onNavigateToCalendar}
          />
        );
    }
  };

  const renderDashboard = () => {
    const slug = (selectedDashboardTab as DashboardSlug) || effectiveSlugs[0] || 'ops';
    if (effectiveSlugs.length > 1) {
      return (
        <Tabs value={selectedDashboardTab} onValueChange={setSelectedDashboardTab} className="space-y-4">
          <TabsList>
            {(effectiveSlugs as DashboardSlug[]).map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === 'ops' ? 'Ops' : s === 'leadership' ? 'Leadership' : s === 'ops_lead' ? 'Ops + Leadership' : 'Admin'}
              </TabsTrigger>
            ))}
          </TabsList>
          {(effectiveSlugs as DashboardSlug[]).map((s) => (
            <TabsContent key={s} value={s}>
              {renderDashboardBySlug(s)}
            </TabsContent>
          ))}
        </Tabs>
      );
    }
    return renderDashboardBySlug(slug);
  };

  // Show skeleton during initial load
  if (isLoading) {
    return <FullDashboardSkeleton />;
  }

  return (
    <div className="space-y-4">
      <DashboardFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        clients={clients}
        agentNames={agentNames}
        accountManagers={accountManagers}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onRefresh={onRefresh ? handleRefresh : undefined}
        isRefreshing={isRefreshing}
      />
      {renderDashboard()}
    </div>
  );
};
