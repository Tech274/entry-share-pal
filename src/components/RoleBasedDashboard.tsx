import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OpsEngineerDashboard } from './dashboards/OpsEngineerDashboard';
import { OpsLeadDashboard } from './dashboards/OpsLeadDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { DashboardFilters, DashboardFiltersState, defaultFilters, applyDashboardFilters } from './dashboards/DashboardFilters';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface RoleBasedDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const RoleBasedDashboard = ({ labRequests, deliveryRequests }: RoleBasedDashboardProps) => {
  const { role } = useAuth();
  const [filters, setFilters] = useState<DashboardFiltersState>(defaultFilters);

  // Apply filters to both request types
  const filteredLabRequests = useMemo(
    () => applyDashboardFilters(labRequests, filters),
    [labRequests, filters]
  );

  const filteredDeliveryRequests = useMemo(
    () => applyDashboardFilters(deliveryRequests, filters),
    [deliveryRequests, filters]
  );

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard labRequests={filteredLabRequests} deliveryRequests={filteredDeliveryRequests} />;
      case 'ops_lead':
        return <OpsLeadDashboard labRequests={filteredLabRequests} deliveryRequests={filteredDeliveryRequests} />;
      case 'finance':
        return <FinanceDashboard labRequests={filteredLabRequests} deliveryRequests={filteredDeliveryRequests} />;
      case 'ops_engineer':
      default:
        return <OpsEngineerDashboard labRequests={filteredLabRequests} deliveryRequests={filteredDeliveryRequests} />;
    }
  };

  return (
    <div className="space-y-4">
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />
      {renderDashboard()}
    </div>
  );
};
