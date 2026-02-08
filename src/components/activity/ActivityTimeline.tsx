import { 
  User, 
  RefreshCw, 
  Clock, 
  ArrowRight, 
  UserPlus, 
  FileEdit,
  Loader2,
  Activity 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivityLog, ActivityLogEntry } from '@/hooks/useActivityLog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityTimelineProps {
  requestId?: string;
  requestType?: 'solution' | 'delivery';
  className?: string;
  maxItems?: number;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  created: <FileEdit className="w-4 h-4" />,
  updated: <FileEdit className="w-4 h-4" />,
  assigned: <UserPlus className="w-4 h-4" />,
  auto_assigned: <UserPlus className="w-4 h-4" />,
  unassigned: <User className="w-4 h-4" />,
  status_changed: <RefreshCw className="w-4 h-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-700',
  updated: 'bg-blue-100 text-blue-700',
  assigned: 'bg-purple-100 text-purple-700',
  auto_assigned: 'bg-purple-100 text-purple-700',
  unassigned: 'bg-gray-100 text-gray-700',
  status_changed: 'bg-yellow-100 text-yellow-700',
};

function formatActionLabel(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function ActivityItem({ activity }: { activity: ActivityLogEntry }) {
  const icon = ACTION_ICONS[activity.action] || <Activity className="w-4 h-4" />;
  const colorClass = ACTION_COLORS[activity.action] || 'bg-muted text-muted-foreground';

  const getChangeDescription = () => {
    if (activity.action === 'assigned' || activity.action === 'auto_assigned') {
      return 'Request assigned';
    }
    if (activity.action === 'unassigned') {
      return 'Request unassigned';
    }
    if (activity.action === 'status_changed' && activity.old_values?.status && activity.new_values?.status) {
      return (
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{activity.old_values.status}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-medium">{activity.new_values.status}</span>
        </span>
      );
    }
    return formatActionLabel(activity.action);
  };

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <div className={cn("flex items-center justify-center w-8 h-8 rounded-full shrink-0", colorClass)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {activity.request_type}
            </Badge>
            <span className="font-medium text-sm">
              {getChangeDescription()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {activity.performed_by_name}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActivityTimeline({ 
  requestId, 
  requestType, 
  className,
  maxItems = 20 
}: ActivityTimelineProps) {
  const { activities, loading, refetch } = useActivityLog(requestId, requestType);
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Timeline
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => refetch()}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="px-4">
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
