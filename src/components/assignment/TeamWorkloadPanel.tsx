import { Users, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEngineers } from '@/hooks/useEngineers';
import { cn } from '@/lib/utils';

interface TeamWorkloadPanelProps {
  className?: string;
}

export function TeamWorkloadPanel({ className }: TeamWorkloadPanelProps) {
  const { engineers, loading, refetch, getWorkloadColor, getWorkloadBgColor } = useEngineers();

  const totalCapacity = engineers.reduce((sum, e) => sum + e.maxCapacity, 0);
  const totalActive = engineers.reduce((sum, e) => sum + e.activeCount, 0);
  const availableEngineers = engineers.filter(e => e.is_available);
  const overloadedEngineers = engineers.filter(e => e.activeCount >= e.maxCapacity);

  return (
    <Card className={className}>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Workload
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
      <CardContent className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{engineers.length}</div>
            <div className="text-xs text-muted-foreground">Total Engineers</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-600">{availableEngineers.length}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-600">{overloadedEngineers.length}</div>
            <div className="text-xs text-muted-foreground">At Capacity</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Team Utilization</span>
            <span className="font-medium">
              {totalActive} / {totalCapacity} ({totalCapacity > 0 ? Math.round((totalActive / totalCapacity) * 100) : 0}%)
            </span>
          </div>
          <Progress value={totalCapacity > 0 ? (totalActive / totalCapacity) * 100 : 0} className="h-2" />
        </div>

        {/* Individual Engineers */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : engineers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No engineers found
            </div>
          ) : (
            engineers.map((engineer) => {
              const utilization = engineer.maxCapacity > 0 
                ? (engineer.activeCount / engineer.maxCapacity) * 100 
                : 0;
              
              return (
                <div key={engineer.user_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate max-w-[150px]">
                        {engineer.full_name || engineer.email || 'Unknown'}
                      </span>
                      {!engineer.is_available && (
                        <Badge variant="secondary" className="text-xs">
                          Away
                        </Badge>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      getWorkloadColor(engineer.activeCount, engineer.maxCapacity)
                    )}>
                      {engineer.activeCount}/{engineer.maxCapacity}
                    </span>
                  </div>
                  <Progress 
                    value={utilization} 
                    className={cn("h-2", utilization >= 100 && "bg-red-200")}
                  />
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
