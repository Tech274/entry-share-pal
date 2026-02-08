import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  ClipboardList,
  Truck,
  CheckCircle
} from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface QuickActionsPanelProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
  onNavigate: (tab: string, filter?: string) => void;
}

export function QuickActionsPanel({ 
  labRequests, 
  deliveryRequests, 
  onNavigate 
}: QuickActionsPanelProps) {
  const pendingSolutions = labRequests.filter(r => r.status === 'Solution Pending').length;
  const pendingDeliveries = deliveryRequests.filter(r => r.labStatus === 'Pending').length;
  const inProgressDeliveries = deliveryRequests.filter(r => r.labStatus === 'Delivery In-Progress' || r.labStatus === 'Work-in-Progress').length;
  
  // Expiring labs (within 7 days)
  const today = new Date();
  const expiringLabs = deliveryRequests.filter(r => {
    if (!r.endDate) return false;
    try {
      const endDate = new Date(r.endDate);
      const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    } catch {
      return false;
    }
  }).length;

  const actions = [
    {
      label: 'View Pending Solutions',
      count: pendingSolutions,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
      onClick: () => onNavigate('solutions', 'Solution Pending'),
      show: pendingSolutions > 0,
    },
    {
      label: 'View Pending Deliveries',
      count: pendingDeliveries,
      icon: Truck,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
      onClick: () => onNavigate('delivery', 'Pending'),
      show: pendingDeliveries > 0,
    },
    {
      label: 'View In-Progress',
      count: inProgressDeliveries,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
      onClick: () => onNavigate('delivery', 'Delivery In-Progress'),
      show: inProgressDeliveries > 0,
    },
    {
      label: 'Expiring Soon',
      count: expiringLabs,
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200',
      onClick: () => onNavigate('delivery', 'expiring'),
      show: expiringLabs > 0,
    },
  ].filter(a => a.show);

  if (actions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex flex-wrap gap-2">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className={`gap-2 ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
              <span className="font-bold">({action.count})</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
