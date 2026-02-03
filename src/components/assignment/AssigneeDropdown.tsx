import { useState } from 'react';
import { User, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useEngineers, Engineer } from '@/hooks/useEngineers';
import { useAssignment } from '@/hooks/useAssignment';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AssigneeDropdownProps {
  requestId: string;
  requestType: 'solution' | 'delivery';
  currentAssignee: string | null;
  currentAssigneeName?: string;
  onAssigned?: () => void;
  compact?: boolean;
}

export function AssigneeDropdown({
  requestId,
  requestType,
  currentAssignee,
  currentAssigneeName,
  onAssigned,
  compact = false,
}: AssigneeDropdownProps) {
  const { user } = useAuth();
  const { engineers, loading, getWorkloadColor, getWorkloadBgColor } = useEngineers();
  const { assignRequest, assignToMe } = useAssignment();
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (engineerId: string | null) => {
    setIsAssigning(true);
    try {
      await assignRequest(requestId, requestType, engineerId, currentAssignee);
      onAssigned?.();
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignToMe = async () => {
    setIsAssigning(true);
    try {
      await assignToMe(requestId, requestType, currentAssignee);
      onAssigned?.();
    } finally {
      setIsAssigning(false);
    }
  };

  const currentEngineer = engineers.find(e => e.user_id === currentAssignee);
  const displayName = currentEngineer?.full_name || currentAssigneeName || 'Unassigned';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "gap-1.5 h-auto py-1 px-2",
            compact ? "text-xs" : "text-sm",
            !currentAssignee && "text-muted-foreground"
          )}
          disabled={isAssigning}
        >
          {isAssigning ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <User className="w-3 h-3" />
          )}
          <span className="truncate max-w-[120px]">{displayName}</span>
          {currentEngineer && (
            <span className={cn("text-xs", getWorkloadColor(currentEngineer.activeCount, currentEngineer.maxCapacity))}>
              ({currentEngineer.activeCount}/{currentEngineer.maxCapacity})
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover">
        {/* Assign to Me option */}
        {user && user.id !== currentAssignee && (
          <>
            <DropdownMenuItem onClick={handleAssignToMe} className="gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="font-medium">Assign to Me</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Unassign option */}
        {currentAssignee && (
          <>
            <DropdownMenuItem onClick={() => handleAssign(null)} className="gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Unassign</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Engineers list */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : engineers.length === 0 ? (
          <div className="py-3 px-2 text-sm text-muted-foreground text-center">
            No engineers available
          </div>
        ) : (
          engineers.map((engineer) => (
            <DropdownMenuItem
              key={engineer.user_id}
              onClick={() => handleAssign(engineer.user_id)}
              disabled={engineer.user_id === currentAssignee || !engineer.is_available}
              className="flex flex-col items-start gap-1.5 py-2"
            >
              <div className="flex items-center justify-between w-full">
                <span className={cn(
                  "font-medium",
                  engineer.user_id === currentAssignee && "text-primary"
                )}>
                  {engineer.full_name || engineer.email || 'Unknown'}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  getWorkloadColor(engineer.activeCount, engineer.maxCapacity)
                )}>
                  {engineer.activeCount}/{engineer.maxCapacity}
                </span>
              </div>
              <Progress 
                value={(engineer.activeCount / engineer.maxCapacity) * 100} 
                className="h-1.5 w-full"
              />
              {!engineer.is_available && (
                <span className="text-xs text-muted-foreground">Unavailable</span>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
