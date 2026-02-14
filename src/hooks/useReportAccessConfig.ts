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

const mapRow = (row: Record<string, unknown>): ReportAccessConfigRow => ({
  id: (row.id ?? '') as string,
  role: (row.role ?? '') as string,
  report_slug: (row.report_slug ?? '') as string,
  enabled: (row.enabled ?? row.is_enabled ?? false) as boolean,
  display_order: (row.display_order ?? 0) as number,
  created_at: (row.created_at ?? '') as string,
  updated_at: (row.updated_at ?? '') as string,
});

const queryKey = ['report-access-config'] as const;

export const useReportAccessConfig = (role?: AppRole | null) => {
  return useQuery({
    queryKey: [...queryKey, role ?? 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_access_config' as any)
        .select('*')
        .order('display_order');
      if (error) {
        // Table may not exist yet — fall back gracefully
        console.warn('report_access_config query failed:', error.message);
        return [] as ReportAccessConfigRow[];
      }
      return ((data as any[]) ?? []).map(mapRow);
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
      const { error } = await supabase.from('report_access_config' as any).upsert(row as any, {
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
