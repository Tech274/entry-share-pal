import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useReportAccessConfig, useReportAccessConfigMutations } from '@/hooks/useReportAccessConfig';
import { REPORT_ACCESS_BY_ROLE, type ReportSlug } from '@/lib/reportAccessMatrix';
import type { AppRole } from '@/types/roles';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

const ROLES: AppRole[] = ['admin', 'finance', 'ops_lead', 'ops_engineer'];
const REPORTS: ReportSlug[] = ['revenue', 'labType', 'learners', 'summary', 'cloudBilling'];

const pretty = (slug: ReportSlug) => {
  const map: Record<ReportSlug, string> = {
    revenue: 'Revenue',
    labType: 'Lab Type',
    learners: 'Learners',
    summary: 'Summary',
    cloudBilling: 'Cloud Billing',
  };
  return map[slug];
};

export function ReportAccessConfigManagement() {
  const { data: rows = [], isLoading } = useReportAccessConfig();
  const { upsert } = useReportAccessConfigMutations();

  const getCell = (role: AppRole, report: ReportSlug) => {
    return rows.find((r) => r.role === role && r.report_slug === report);
  };

  const isEnabled = (role: AppRole, report: ReportSlug) => {
    const row = getCell(role, report);
    if (row) return row.enabled;
    return REPORT_ACCESS_BY_ROLE[role]?.includes(report) ?? false;
  };

  const order = (role: AppRole, report: ReportSlug) => {
    return getCell(role, report)?.display_order ?? REPORTS.indexOf(report);
  };

  const updateCell = (role: AppRole, report: ReportSlug, enabled?: boolean, display_order?: number) => {
    upsert.mutate(
      {
        role,
        report_slug: report,
        enabled: enabled ?? isEnabled(role, report),
        display_order: display_order ?? order(role, report),
      },
      {
        onSuccess: () => toast.success('Report access updated'),
        onError: (e: Error) => toast.error(e.message),
      }
    );
  };

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Reports Access Config
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {ROLES.map((role) => (
              <div key={role} className="rounded-md border p-3 space-y-3">
                <div className="font-medium capitalize">{role.replace('_', ' ')}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {REPORTS.map((report) => (
                    <div key={`${role}-${report}`} className="rounded border p-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label>{pretty(report)}</Label>
                        <Switch
                          checked={isEnabled(role, report)}
                          onCheckedChange={(v) => updateCell(role, report, v)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground w-12">Order</Label>
                        <Input
                          type="number"
                          value={order(role, report)}
                          onChange={(e) => {
                            const n = parseInt(e.target.value, 10);
                            if (!Number.isNaN(n)) updateCell(role, report, undefined, n);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground">
              Tip: Reports page now reads this config first; if no rows exist, it falls back to defaults from code.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                ROLES.forEach((role) => {
                  REPORTS.forEach((report, idx) => {
                    updateCell(role, report, isEnabled(role, report), idx);
                  });
                });
              }}
            >
              Ensure all role-report rows exist
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
