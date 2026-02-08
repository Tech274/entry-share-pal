import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/external-supabase/client';

export interface Engineer {
  user_id: string;
  full_name: string | null;
  email: string | null;
  activeCount: number;
  maxCapacity: number;
  expertise: string[];
  is_available: boolean;
}

export const useEngineers = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEngineers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all users with ops_engineer or ops_lead role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['ops_engineer', 'ops_lead']);

      if (roleError) {
        console.error('Error fetching user roles:', roleError);
        setLoading(false);
        return;
      }

      if (!roleData || roleData.length === 0) {
        setEngineers([]);
        setLoading(false);
        return;
      }

      const userIds = roleData.map(r => r.user_id);

      // Fetch profiles for these users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        setLoading(false);
        return;
      }

      // Fetch engineer settings
      const { data: settingsData } = await supabase
        .from('engineer_settings')
        .select('user_id, max_active_requests, expertise, is_available')
        .in('user_id', userIds);

      // Create a map of settings
      const settingsMap = new Map(
        (settingsData || []).map(s => [s.user_id, s])
      );

      // For each engineer, get their workload using the database function
      const engineersWithWorkload: Engineer[] = await Promise.all(
        (profileData || []).map(async (profile) => {
          // Get workload count using the database function
          const { data: workloadData } = await supabase
            .rpc('get_engineer_workload', { engineer_id: profile.user_id });

          const settings = settingsMap.get(profile.user_id);
          
          return {
            user_id: profile.user_id,
            full_name: profile.full_name,
            email: profile.email,
            activeCount: workloadData || 0,
            maxCapacity: settings?.max_active_requests || 10,
            expertise: (settings?.expertise as string[]) || [],
            is_available: settings?.is_available ?? true,
          };
        })
      );

      // Sort by workload (lowest first for assignment)
      engineersWithWorkload.sort((a, b) => {
        const aRatio = a.activeCount / a.maxCapacity;
        const bRatio = b.activeCount / b.maxCapacity;
        return aRatio - bRatio;
      });

      setEngineers(engineersWithWorkload);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEngineers();
  }, [fetchEngineers]);

  const getWorkloadColor = (activeCount: number, maxCapacity: number): string => {
    const ratio = activeCount / maxCapacity;
    if (ratio < 0.5) return 'text-green-600';
    if (ratio < 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWorkloadBgColor = (activeCount: number, maxCapacity: number): string => {
    const ratio = activeCount / maxCapacity;
    if (ratio < 0.5) return 'bg-green-500';
    if (ratio < 0.8) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getNextAvailableEngineer = (): Engineer | null => {
    const available = engineers.filter(e => e.is_available && e.activeCount < e.maxCapacity);
    return available.length > 0 ? available[0] : null;
  };

  return {
    engineers,
    loading,
    refetch: fetchEngineers,
    getWorkloadColor,
    getWorkloadBgColor,
    getNextAvailableEngineer,
  };
};
