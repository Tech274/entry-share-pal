import { useAuth } from '@/contexts/AuthContext';
import { OpsEngineerDashboard } from './dashboards/OpsEngineerDashboard';
import { OpsLeadDashboard } from './dashboards/OpsLeadDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface RoleBasedDashboardProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const RoleBasedDashboard = ({ labRequests, deliveryRequests }: RoleBasedDashboardProps) => {
  const { role } = useAuth();

  switch (role) {
    case 'admin':
      return <AdminDashboard labRequests={labRequests} deliveryRequests={deliveryRequests} />;
    case 'ops_lead':
      return <OpsLeadDashboard labRequests={labRequests} deliveryRequests={deliveryRequests} />;
    case 'finance':
      return <FinanceDashboard labRequests={labRequests} deliveryRequests={deliveryRequests} />;
    case 'ops_engineer':
    default:
      return <OpsEngineerDashboard labRequests={labRequests} deliveryRequests={deliveryRequests} />;
  }
};
