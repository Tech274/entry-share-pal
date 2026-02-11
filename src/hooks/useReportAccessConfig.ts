import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/roles';
import type { ReportSlug } from '@/lib/reportAccessMatrix';
import { getAllowedReportSlugs } from '@/lib/reportAccessMatrix';

export interface ReportAccessConfigRow {
  id: string;
  role: string;
  report_slug: string;
  enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const queryKey = ['report-access-config'] as const;

export const useReportAccessConfig = (role?: AppRole | null) => {
  return useQuery({
    queryKey: [...queryKey, role ?? 'all'],
    queryFn: async () => {
      let q = supabase
        .from('report_access_config')
        .select('*')
        .order('display_order');
      if (role) q = q.eq('role', role);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ReportAccessConfigRow[];
    },
  });
};

export const useReportAccessForRole = (role: AppRole | null | undefined) => {
  const { data: rows = [], error } = useReportAccessConfig(role ?? undefined);

  return useMemo(() => {
    const enabledFromDb = rows
      .filter((r) => r.enabled)
      .sort((a, b) => a.display_order - b.display_order)
      .map((r) => r.report_slug as ReportSlug);

    const fallback = getAllowedReportSlugs(role);
    const allowedSlugs = enabledFromDb.length > 0 ? enabledFromDb : fallback;

    return {
      rows,
      allowedSlugs,
      canAccess: allowedSlugs.length > 0,
      usingFallback: !!error || enabledFromDb.length === 0,
    };
  }, [rows, role, error]);
};

export const useReportAccessConfigMutations = () => {
  const queryClient = useQueryClient();

  const upsert = useMutation({
    mutationFn: async (row: {
      role: string;
      report_slug: string;
      enabled: boolean;
      display_order: number;
    }) => {
      const { error } = await supabase.from('report_access_config').upsert(row, {
        onConflict: 'role,report_slug',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { upsert };
};
