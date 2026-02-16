import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// report_access_config table doesn't exist in DB yet — return empty via useQuery to preserve hook count
export const useReportAccessConfig = (_role?: AppRole | null) => {
  return useQuery({
    queryKey: [...queryKey, _role ?? 'all'],
    queryFn: async () => {
      // Table doesn't exist yet, return empty array
      return [] as ReportAccessConfigRow[];
    },
    staleTime: Infinity,
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
    mutationFn: async (_row: {
      role: string;
      report_slug: string;
      enabled: boolean;
      display_order: number;
    }) => {
      // No-op until report_access_config table is created
      console.warn('report_access_config table not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { upsert };
};
