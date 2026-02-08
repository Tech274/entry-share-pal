import { useCallback } from 'react';
import { supabase } from '@/integrations/external-supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEngineers } from './useEngineers';

type RequestType = 'solution' | 'delivery';

interface AssignmentResult {
  success: boolean;
  message: string;
}

export const useAssignment = () => {
  const { user } = useAuth();
  const { engineers, refetch: refetchEngineers, getNextAvailableEngineer } = useEngineers();

  const logActivity = async (
    requestId: string,
    requestType: RequestType,
    action: string,
    oldValues: Record<string, any> | null,
    newValues: Record<string, any> | null
  ) => {
    try {
      await supabase.from('request_activity_log').insert({
        request_id: requestId,
        request_type: requestType,
        action,
        old_values: oldValues,
        new_values: newValues,
        performed_by: user?.id || null,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const assignRequest = useCallback(async (
    requestId: string,
    requestType: RequestType,
    assigneeId: string | null,
    previousAssignee: string | null = null
  ): Promise<AssignmentResult> => {
    try {
      const table = requestType === 'solution' ? 'lab_requests' : 'delivery_requests';
      
      const { error } = await supabase
        .from(table)
        .update({ assigned_to: assigneeId })
        .eq('id', requestId);

      if (error) {
        console.error('Error assigning request:', error);
        return { success: false, message: error.message };
      }

      // Log the assignment
      await logActivity(
        requestId,
        requestType,
        assigneeId ? 'assigned' : 'unassigned',
        { assigned_to: previousAssignee },
        { assigned_to: assigneeId }
      );

      // Refresh engineer workloads
      refetchEngineers();

      return { success: true, message: 'Request assigned successfully' };
    } catch (error) {
      console.error('Error assigning request:', error);
      return { success: false, message: 'Failed to assign request' };
    }
  }, [user, refetchEngineers]);

  const assignToMe = useCallback(async (
    requestId: string,
    requestType: RequestType,
    previousAssignee: string | null = null
  ): Promise<AssignmentResult> => {
    if (!user?.id) {
      return { success: false, message: 'Not logged in' };
    }
    return assignRequest(requestId, requestType, user.id, previousAssignee);
  }, [user, assignRequest]);

  const bulkAssign = useCallback(async (
    requestIds: string[],
    requestType: RequestType,
    assigneeId: string
  ): Promise<AssignmentResult> => {
    try {
      const table = requestType === 'solution' ? 'lab_requests' : 'delivery_requests';
      
      const { error } = await supabase
        .from(table)
        .update({ assigned_to: assigneeId })
        .in('id', requestIds);

      if (error) {
        console.error('Error bulk assigning:', error);
        return { success: false, message: error.message };
      }

      // Log activities for each request
      for (const requestId of requestIds) {
        await logActivity(
          requestId,
          requestType,
          'assigned',
          null,
          { assigned_to: assigneeId }
        );
      }

      refetchEngineers();

      return { 
        success: true, 
        message: `${requestIds.length} requests assigned successfully` 
      };
    } catch (error) {
      console.error('Error bulk assigning:', error);
      return { success: false, message: 'Failed to bulk assign requests' };
    }
  }, [refetchEngineers]);

  const autoAssign = useCallback(async (
    requestIds: string[],
    requestType: RequestType
  ): Promise<AssignmentResult> => {
    try {
      const availableEngineers = engineers.filter(
        e => e.is_available && e.activeCount < e.maxCapacity
      );

      if (availableEngineers.length === 0) {
        return { success: false, message: 'No available engineers with capacity' };
      }

      const table = requestType === 'solution' ? 'lab_requests' : 'delivery_requests';
      let assignedCount = 0;
      let engineerIndex = 0;

      for (const requestId of requestIds) {
        const engineer = availableEngineers[engineerIndex % availableEngineers.length];
        
        const { error } = await supabase
          .from(table)
          .update({ assigned_to: engineer.user_id })
          .eq('id', requestId);

        if (!error) {
          await logActivity(
            requestId,
            requestType,
            'auto_assigned',
            null,
            { assigned_to: engineer.user_id }
          );
          assignedCount++;
        }

        engineerIndex++;
      }

      refetchEngineers();

      return { 
        success: true, 
        message: `${assignedCount} requests auto-assigned to ${availableEngineers.length} engineers` 
      };
    } catch (error) {
      console.error('Error auto-assigning:', error);
      return { success: false, message: 'Failed to auto-assign requests' };
    }
  }, [engineers, refetchEngineers]);

  return {
    assignRequest,
    assignToMe,
    bulkAssign,
    autoAssign,
    engineers,
    getNextAvailableEngineer,
  };
};
