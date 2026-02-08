import type { AppRole } from '@/types/roles';

export type ReportSlug = 'revenue' | 'labType' | 'learners' | 'summary' | 'cloudBilling';

/**
 * Report access matrix (Phase 4).
 * Admin: all; Finance: Revenue, Learners, Lab Type; Ops Lead: all; Ops Engineer: none (Agent Performance "own only" not yet a report tab).
 */
export const REPORT_ACCESS_BY_ROLE: Record<AppRole, ReportSlug[]> = {
  admin: ['revenue', 'labType', 'learners', 'summary', 'cloudBilling'],
  finance: ['revenue', 'labType', 'learners', 'cloudBilling'],
  ops_lead: ['revenue', 'labType', 'learners', 'summary', 'cloudBilling'],
  ops_engineer: [],
};

export const ROLES_WITH_REPORTS_ACCESS: AppRole[] = ['admin', 'finance', 'ops_lead'];

export function canAccessReports(role: AppRole | null | undefined): boolean {
  return role != null && ROLES_WITH_REPORTS_ACCESS.includes(role);
}

export function getAllowedReportSlugs(role: AppRole | null | undefined): ReportSlug[] {
  if (!role) return [];
  return REPORT_ACCESS_BY_ROLE[role] ?? [];
}
