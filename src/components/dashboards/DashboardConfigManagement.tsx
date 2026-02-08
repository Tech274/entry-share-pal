import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS } from '@/types/roles';
import type { AppRole } from '@/types/roles';
import { useAllDashboardConfig, useDashboardConfigMutations, DASHBOARD_SLUGS } from '@/hooks/useDashboardConfig';
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DASHBOARD_SLUG_LABELS: Record<string, string> = {
  ops: 'Ops Dashboard',
  leadership: 'Leadership Dashboard',
  ops_lead: 'Ops + Leadership',
  admin: 'Admin Dashboard',
};

const ROLES: AppRole[] = ['ops_engineer', 'finance', 'ops_lead', 'admin'];

export const DashboardConfigManagement = () => {
  const { data: rows = [], isLoading } = useAllDashboardConfig();
  const { update, upsert } = useDashboardConfigMutations();

  const byRole = useMemo(() => {
    const map: Record<string, typeof rows> = {};
    ROLES.forEach((r) => (map[r] = []));
    rows.forEach((row) => {
      if (!map[row.role]) map[row.role] = [];
      map[row.role].push(row);
    });
    ROLES.forEach((role) => {
      map[role].sort((a, b) => a.display_order - b.display_order);
      const haveSlugs = new Set(map[role].map((r) => r.dashboard_slug));
      DASHBOARD_SLUGS.forEach((slug) => {
        if (!haveSlugs.has(slug)) {
          map[role].push({
            id: '',
            role,
            dashboard_slug: slug,
            enabled: false,
            display_order: map[role].length,
            created_at: '',
            updated_at: '',
          });
        }
      });
      map[role].sort((a, b) => a.display_order - b.display_order);
    });
    return map;
  }, [rows]);

  const handleToggle = (row: { id: string; role: string; dashboard_slug: string; enabled: boolean; display_order: number }, enabled: boolean) => {
    if (row.id) {
      update.mutate(
        { id: row.id, enabled },
        {
          onSuccess: () => toast.success('Dashboard visibility updated'),
          onError: (e: Error) => toast.error(e.message),
        }
      );
    } else {
      upsert.mutate(
        { role: row.role, dashboard_slug: row.dashboard_slug, enabled, display_order: row.display_order },
        {
          onSuccess: () => toast.success('Dashboard added'),
          onError: (e: Error) => toast.error(e.message),
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard access by role
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <p className="text-sm text-muted-foreground">
          Enable or disable which dashboard(s) each role sees. A role can have multiple dashboards (e.g. Ops Lead can see
          both Ops and Leadership). Order controls tab order when multiple are enabled.
        </p>
        {ROLES.map((role) => (
          <div key={role} className="space-y-2">
            <Label className="text-sm font-medium">{ROLE_LABELS[role]}</Label>
            <div className="grid gap-2 rounded-md border p-3 bg-muted/30">
              {byRole[role]?.map((row) => (
                <div
                  key={`${role}-${row.dashboard_slug}`}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm">
                    {DASHBOARD_SLUG_LABELS[row.dashboard_slug] ?? row.dashboard_slug}
                  </span>
                  <Switch
                    checked={row.enabled}
                    onCheckedChange={(checked) => handleToggle(row, checked)}
                    disabled={update.isPending || upsert.isPending}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
