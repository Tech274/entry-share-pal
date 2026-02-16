import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/roles';

export const DASHBOARD_SLUGS = ['ops', 'leadership', 'ops_lead', 'admin'] as const;
export type DashboardSlug = (typeof DASHBOARD_SLUGS)[number];

export interface DashboardConfigRow {
  id: string;
  role: string;
  dashboard_slug: string;
  enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Map DB row to our interface
const mapRow = (row: any): DashboardConfigRow => ({
  id: row.id,
  role: row.role,
  dashboard_slug: row.dashboard_key,
  enabled: row.is_enabled ?? true,
  display_order: row.display_order ?? 0,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const queryKey = ['dashboard-config'] as const;

export const useDashboardConfig = (role?: AppRole | null) => {
  return useQuery({
    queryKey: [...queryKey, role ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('dashboard_config')
        .select('*')
        .order('display_order');
      if (role) {
        q = q.eq('role', role);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
};

export const useDashboardConfigForRole = (role: AppRole | null | undefined) => {
  const { data: rows = [] } = useDashboardConfig(role ?? undefined);
  const enabled = rows.filter((r) => r.enabled).sort((a, b) => a.display_order - b.display_order);
  const slugs = enabled.map((r) => r.dashboard_slug as DashboardSlug);
  return { configs: enabled, enabledSlugs: slugs };
};

export const useAllDashboardConfig = () => {
  return useQuery({
    queryKey: [...queryKey, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_config')
        .select('*')
        .order('role')
        .order('display_order');
      if (error) throw error;
      return (data ?? []).map(mapRow);
    },
  });
};

export const useDashboardConfigMutations = () => {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: async ({
      id,
      enabled,
      display_order,
    }: {
      id: string;
      enabled?: boolean;
      display_order?: number;
    }) => {
      const payload: Record<string, any> = {};
      if (enabled !== undefined) payload.is_enabled = enabled;
      if (display_order !== undefined) payload.display_order = display_order;
      const { error } = await supabase.from('dashboard_config').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const upsert = useMutation({
    mutationFn: async (row: {
      role: string;
      dashboard_slug: string;
      enabled: boolean;
      display_order: number;
    }) => {
      const { error } = await supabase.from('dashboard_config').upsert({
        role: row.role,
        dashboard_key: row.dashboard_slug,
        is_enabled: row.enabled,
        display_order: row.display_order,
      } as any, {
        onConflict: 'role,dashboard_key',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
  return { update, upsert };
};
