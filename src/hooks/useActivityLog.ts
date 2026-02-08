import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLogEntry {
  id: string;
  request_id: string;
  request_type: 'solution' | 'delivery';
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  performed_by: string | null;
  performed_by_name?: string;
  created_at: string;
}

export const useActivityLog = (requestId?: string, requestType?: 'solution' | 'delivery') => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('request_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (requestId) {
        query = query.eq('request_id', requestId);
      }

      if (requestType) {
        query = query.eq('request_type', requestType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity log:', error);
        return;
      }

      // Fetch performer names
      const performerIds = [...new Set((data || []).map(a => a.performed_by).filter(Boolean))];
      
      let profileMap = new Map<string, string>();
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', performerIds);
        
        profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name || 'Unknown']));
      }

      const enrichedData: ActivityLogEntry[] = (data || []).map(activity => ({
        id: activity.id,
        request_id: activity.request_id,
        request_type: activity.request_type as 'solution' | 'delivery',
        action: activity.action,
        old_values: activity.old_values as Record<string, any> | null,
        new_values: activity.new_values as Record<string, any> | null,
        performed_by: activity.performed_by,
        created_at: activity.created_at,
        performed_by_name: activity.performed_by ? profileMap.get(activity.performed_by) || 'Unknown' : 'System',
      }));

      setActivities(enrichedData);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
    }
  }, [requestId, requestType]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const logActivity = async (
    reqId: string,
    reqType: 'solution' | 'delivery',
    action: string,
    oldValues: Record<string, any> | null,
    newValues: Record<string, any> | null,
    performedBy?: string
  ) => {
    try {
      const { error } = await supabase.from('request_activity_log').insert({
        request_id: reqId,
        request_type: reqType,
        action,
        old_values: oldValues,
        new_values: newValues,
        performed_by: performedBy || null,
      });

      if (error) {
        console.error('Error logging activity:', error);
        return false;
      }

      // Refresh activities
      fetchActivities();
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  };

  return {
    activities,
    loading,
    refetch: fetchActivities,
    logActivity,
  };
};
