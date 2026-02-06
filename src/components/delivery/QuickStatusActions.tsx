import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Clock, Wrench, TestTube, Truck, CheckCircle, XCircle } from 'lucide-react';
import { LAB_STATUS_OPTIONS } from '@/types/deliveryRequest';

interface QuickStatusActionsProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  compact?: boolean;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'Pending': <Clock className="w-3 h-3" />,
  'Work-in-Progress': <Wrench className="w-3 h-3" />,
  'Test Credentials Shared': <TestTube className="w-3 h-3" />,
  'Delivered': <CheckCircle className="w-3 h-3" />,
  'Delivery In-Progress': <Truck className="w-3 h-3" />,
  'Cancelled': <XCircle className="w-3 h-3" />,
};

const STATUS_COLORS: Record<string, string> = {
  'Pending': 'text-yellow-600 hover:bg-yellow-50',
  'Work-in-Progress': 'text-blue-600 hover:bg-blue-50',
  'Test Credentials Shared': 'text-purple-600 hover:bg-purple-50',
  'Delivered': 'text-green-600 hover:bg-green-50',
  'Delivery In-Progress': 'text-cyan-600 hover:bg-cyan-50',
  'Cancelled': 'text-red-600 hover:bg-red-50',
};

export const QuickStatusActions = ({ 
  currentStatus, 
  onStatusChange, 
  compact = true 
}: QuickStatusActionsProps) => {
  const availableStatuses = LAB_STATUS_OPTIONS.filter(s => s !== currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {STATUS_ICONS[currentStatus] || <Clock className="w-3 h-3" />}
          {!compact && <span className="hidden sm:inline">{currentStatus}</span>}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        {availableStatuses.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(status);
            }}
            className={`gap-2 cursor-pointer ${STATUS_COLORS[status] || ''}`}
          >
            {STATUS_ICONS[status]}
            <span>{status}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
