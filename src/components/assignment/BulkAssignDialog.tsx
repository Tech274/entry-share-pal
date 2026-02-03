import { useState } from 'react';
import { Users, Loader2, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useEngineers } from '@/hooks/useEngineers';
import { useAssignment } from '@/hooks/useAssignment';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BulkAssignDialogProps {
  selectedIds: string[];
  requestType: 'solution' | 'delivery';
  onComplete?: () => void;
  trigger?: React.ReactNode;
}

export function BulkAssignDialog({
  selectedIds,
  requestType,
  onComplete,
  trigger,
}: BulkAssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<string>('');
  const [useAutoAssign, setUseAutoAssign] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const { engineers, loading, getWorkloadColor } = useEngineers();
  const { bulkAssign, autoAssign } = useAssignment();
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!useAutoAssign && !selectedEngineer) {
      toast({
        title: 'Select Engineer',
        description: 'Please select an engineer or enable auto-assign.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      let result;
      if (useAutoAssign) {
        result = await autoAssign(selectedIds, requestType);
      } else {
        result = await bulkAssign(selectedIds, requestType, selectedEngineer);
      }

      if (result.success) {
        toast({
          title: 'Assignment Complete',
          description: result.message,
        });
        setOpen(false);
        onComplete?.();
      } else {
        toast({
          title: 'Assignment Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Users className="w-3.5 h-3.5" />
            Assign
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Assign Requests</DialogTitle>
          <DialogDescription>
            Assign {selectedIds.length} selected request{selectedIds.length !== 1 ? 's' : ''} to an engineer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Auto-assign toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="auto-assign" className="text-base font-medium flex items-center gap-2">
                <Shuffle className="w-4 h-4" />
                Auto-Assign (Round Robin)
              </Label>
              <p className="text-sm text-muted-foreground">
                Distribute evenly across available engineers
              </p>
            </div>
            <Switch
              id="auto-assign"
              checked={useAutoAssign}
              onCheckedChange={setUseAutoAssign}
            />
          </div>

          {/* Manual engineer selection */}
          {!useAutoAssign && (
            <div className="space-y-2">
              <Label>Select Engineer</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an engineer..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {engineers.map((engineer) => (
                      <SelectItem
                        key={engineer.user_id}
                        value={engineer.user_id}
                        disabled={!engineer.is_available || engineer.activeCount >= engineer.maxCapacity}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{engineer.full_name || engineer.email}</span>
                          <span className={cn(
                            "text-xs font-medium",
                            getWorkloadColor(engineer.activeCount, engineer.maxCapacity)
                          )}>
                            {engineer.activeCount}/{engineer.maxCapacity}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Preview workload */}
          {(useAutoAssign || selectedEngineer) && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
              <p className="text-sm font-medium">Workload Preview</p>
              {useAutoAssign ? (
                <p className="text-sm text-muted-foreground">
                  {selectedIds.length} requests will be distributed across {engineers.filter(e => e.is_available).length} available engineers.
                </p>
              ) : (
                (() => {
                  const engineer = engineers.find(e => e.user_id === selectedEngineer);
                  if (!engineer) return null;
                  const newCount = engineer.activeCount + selectedIds.length;
                  const willExceed = newCount > engineer.maxCapacity;
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{engineer.full_name}</span>
                        <span className={cn(
                          "font-medium",
                          willExceed ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {engineer.activeCount} → {newCount} / {engineer.maxCapacity}
                        </span>
                      </div>
                      <Progress 
                        value={(newCount / engineer.maxCapacity) * 100} 
                        className="h-2"
                      />
                      {willExceed && (
                        <p className="text-xs text-red-600">
                          This will exceed the engineer's capacity!
                        </p>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isAssigning}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isAssigning || (!useAutoAssign && !selectedEngineer)}>
            {isAssigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedIds.length} Request${selectedIds.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
