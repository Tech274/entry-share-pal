import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { useCloudBillingDetails, useCloudBillingMutations, SAMPLE_CLOUD_BILLING_DATA, type CloudBillingDetail, type CloudProvider } from '@/hooks/useCloudBillingDetails';
import { exportCloudBillingToCSV, exportCloudBillingToXLS } from '@/lib/exportUtils';
import { Plus, Pencil, Trash2, Cloud, AlertCircle, Database, FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PROVIDERS: { id: CloudProvider; label: string }[] = [
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'gcp', label: 'GCP' },
];

function ProviderSection({
  provider,
  rows,
  onEdit,
  onDelete,
  onAdd,
}: {
  provider: CloudProvider;
  rows: CloudBillingDetail[];
  onEdit: (r: CloudBillingDetail) => void;
  onDelete: (r: CloudBillingDetail) => void;
  onAdd: () => void;
}) {
  const providerLabel = PROVIDERS.find((p) => p.id === provider)?.label ?? provider.toUpperCase();

  const totals = useMemo(() => {
    const ob = rows.reduce((s, r) => s + r.overall_business, 0);
    const cc = rows.reduce((s, r) => s + r.cloud_cost, 0);
    const inv = rows.reduce((s, r) => s + r.invoiced_to_customer, 0);
    const ytb = rows.reduce((s, r) => s + r.yet_to_be_billed, 0);
    const margins = ob - cc;
    const marginPct = ob > 0 ? (margins / ob) * 100 : 0;
    return { overall_business: ob, cloud_cost: cc, margins, marginPct, invoiced_to_customer: inv, yet_to_be_billed: ytb };
  }, [rows]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const y = b.year - a.year;
      if (y !== 0) return y;
      return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
    });
  }, [rows]);

  return (
    <Card>
      <CardHeader className="bg-amber-500/90 text-amber-950 py-3 px-4 rounded-t-lg flex flex-row items-center justify-between">
        <CardTitle className="text-base">{providerLabel}</CardTitle>
        <Button size="sm" variant="secondary" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Month</TableHead>
                <TableHead className="w-40">Vendor Name</TableHead>
                <TableHead className="text-right">Overall Business</TableHead>
                <TableHead className="text-right">Cost on {providerLabel}</TableHead>
                <TableHead className="text-right">Margins</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Invoiced to Customer</TableHead>
                <TableHead className="text-right">Yet to be Billed</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => {
                const margins = r.overall_business - r.cloud_cost;
                const marginPct = r.overall_business > 0 ? (margins / r.overall_business) * 100 : 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.month} {r.year}</TableCell>
                    <TableCell className="text-muted-foreground">{r.vendor_name || '—'}</TableCell>
                    <TableCell className="text-right">{formatINR(r.overall_business)}</TableCell>
                    <TableCell className="text-right">{formatINR(r.cloud_cost)}</TableCell>
                    <TableCell className={`text-right ${margins < 0 ? 'text-red-600' : ''}`}>
                      {formatINR(margins)}
                    </TableCell>
                    <TableCell className={`text-right ${marginPct < 0 ? 'text-red-600' : ''}`}>
                      {formatPercentage(marginPct)}
                    </TableCell>
                    <TableCell className="text-right">{formatINR(r.invoiced_to_customer)}</TableCell>
                    <TableCell className="text-right">{formatINR(r.yet_to_be_billed)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(r)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDelete(r)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length > 0 && (
                <TableRow className="bg-green-600/20 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right">{formatINR(totals.overall_business)}</TableCell>
                  <TableCell className="text-right">{formatINR(totals.cloud_cost)}</TableCell>
                  <TableCell className={`text-right ${totals.margins < 0 ? 'text-red-600' : ''}`}>
                    {formatINR(totals.margins)}
                  </TableCell>
                  <TableCell className={`text-right ${totals.marginPct < 0 ? 'text-red-600' : ''}`}>
                    {formatPercentage(totals.marginPct)}
                  </TableCell>
                  <TableCell className="text-right">{formatINR(totals.invoiced_to_customer)}</TableCell>
                  <TableCell className="text-right">{formatINR(totals.yet_to_be_billed)}</TableCell>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {rows.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No data. Click Add to enter month-on-month billing for {providerLabel}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CloudBillingDashboard() {
  const { data: details = [], isLoading, isError, error } = useCloudBillingDetails();
  const mutations = useCloudBillingMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CloudBillingDetail | null>(null);
  const [activeProvider, setActiveProvider] = useState<CloudProvider | null>(null);

  // Filter state
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterMonthFrom, setFilterMonthFrom] = useState<string>('all');
  const [filterMonthTo, setFilterMonthTo] = useState<string>('all');

  const formState = useState({
    provider: 'aws' as CloudProvider,
    vendor_name: '' as string,
    month: 'April',
    year: new Date().getFullYear(),
    overall_business: 0,
    cloud_cost: 0,
    invoiced_to_customer: 0,
  });
  const [form, setForm] = formState;

  const resetForm = () => {
    setEditing(null);
    setActiveProvider(null);
    setForm({
      provider: 'aws',
      vendor_name: '',
      month: 'April',
      year: new Date().getFullYear(),
      overall_business: 0,
      cloud_cost: 0,
      invoiced_to_customer: 0,
    });
    setDialogOpen(false);
  };

  const openAdd = (provider: CloudProvider) => {
    setActiveProvider(provider);
    setForm({
      provider,
      vendor_name: PROVIDERS.find((p) => p.id === provider)?.label ?? '',
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear(),
      overall_business: 0,
      cloud_cost: 0,
      invoiced_to_customer: 0,
    });
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (r: CloudBillingDetail) => {
    setEditing(r);
    setActiveProvider(null);
    setForm({
      provider: r.provider,
      vendor_name: r.vendor_name ?? '',
      month: r.month,
      year: r.year,
      overall_business: r.overall_business,
      cloud_cost: r.cloud_cost,
      invoiced_to_customer: r.invoiced_to_customer,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      mutations.update.mutate(
        {
          id: editing.id,
          data: {
            provider: form.provider,
            vendor_name: form.vendor_name || null,
            month: form.month,
            year: form.year,
            overall_business: form.overall_business,
            cloud_cost: form.cloud_cost,
            invoiced_to_customer: form.invoiced_to_customer,
          },
        },
        {
          onSuccess: () => { toast.success('Updated'); resetForm(); },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    } else {
      mutations.create.mutate(
        {
          provider: form.provider,
          vendor_name: form.vendor_name || null,
          month: form.month,
          year: form.year,
          overall_business: form.overall_business,
          cloud_cost: form.cloud_cost,
          invoiced_to_customer: form.invoiced_to_customer,
        },
        {
          onSuccess: () => { toast.success('Entry added'); resetForm(); },
          onError: (err: Error) => toast.error(err.message),
        }
      );
    }
  };

  const handleDelete = (r: CloudBillingDetail) => {
    if (!confirm(`Delete ${r.month} ${r.year} for ${r.provider.toUpperCase()}?`)) return;
    mutations.remove.mutate(r.id, {
      onSuccess: () => toast.success('Deleted'),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  // Derive available years from data
  const availableYears = useMemo(() => {
    const years = [...new Set(details.map((d) => d.year))].sort((a, b) => b - a);
    return years;
  }, [details]);

  // Filtered data based on year + provider + month range selections
  const filteredDetails = useMemo(() => {
    const fromIdx = filterMonthFrom === 'all' ? -1 : MONTHS.indexOf(filterMonthFrom);
    const toIdx = filterMonthTo === 'all' ? 99 : MONTHS.indexOf(filterMonthTo);
    return details.filter((d) => {
      const yearMatch = filterYear === 'all' || d.year === Number(filterYear);
      const providerMatch = filterProvider === 'all' || d.provider === filterProvider;
      const monthIdx = MONTHS.indexOf(d.month);
      const monthFromMatch = fromIdx === -1 || monthIdx >= fromIdx;
      const monthToMatch = toIdx === 99 || monthIdx <= toIdx;
      return yearMatch && providerMatch && monthFromMatch && monthToMatch;
    });
  }, [details, filterYear, filterProvider, filterMonthFrom, filterMonthTo]);

  const byProvider = useMemo(() => {
    const map: Record<CloudProvider, CloudBillingDetail[]> = { aws: [], azure: [], gcp: [] };
    filteredDetails.forEach((d) => {
      if (map[d.provider]) map[d.provider].push(d);
    });
    return map;
  }, [filteredDetails]);

  const visibleProviders = useMemo(() => {
    return filterProvider === 'all'
      ? PROVIDERS
      : PROVIDERS.filter((p) => p.id === filterProvider);
  }, [filterProvider]);

  const isFiltered = filterYear !== 'all' || filterProvider !== 'all' || filterMonthFrom !== 'all' || filterMonthTo !== 'all';

  if (isError) {
    const msg = error instanceof Error ? error.message : String(error);
    const missingTable = /does not exist|relation|schema/i.test(msg);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cloud Billing table missing</AlertTitle>
        <AlertDescription>
          {missingTable ? (
            <>Run <code className="text-xs bg-muted px-1 rounded">supabase/RUN_CLOUD_BILLING.sql</code> in the SQL Editor to create the table.</>
          ) : msg}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const loadSample = () => {
    if (!confirm('Load sample data for AWS, Azure, GCP (April–June 2025)? Existing rows for those months will be replaced.')) return;
    mutations.bulkInsert.mutate(SAMPLE_CLOUD_BILLING_DATA, {
      onSuccess: () => toast.success('Sample data loaded.'),
      onError: (err: Error) => toast.error(err.message),
    });
  };

  const buildExportSuffix = () => {
    const parts: string[] = [];
    if (filterProvider !== 'all') parts.push(filterProvider.toUpperCase());
    if (filterYear !== 'all') parts.push(filterYear);
    if (filterMonthFrom !== 'all') parts.push(filterMonthFrom.slice(0, 3));
    if (filterMonthTo !== 'all') parts.push(`to-${filterMonthTo.slice(0, 3)}`);
    return parts.length ? `-${parts.join('-')}` : '';
  };

  const handleExportCSV = () => {
    if (filteredDetails.length === 0) { toast.error('No data to export.'); return; }
    exportCloudBillingToCSV(filteredDetails, `cloud-billing-report${buildExportSuffix()}`);
    toast.success(`Exported ${filteredDetails.length} rows as CSV.`);
  };

  const handleExportXLS = () => {
    if (filteredDetails.length === 0) { toast.error('No data to export.'); return; }
    exportCloudBillingToXLS(filteredDetails, `cloud-billing-report${buildExportSuffix()}`);
    toast.success(`Exported ${filteredDetails.length} rows as XLS.`);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Cloud className="w-4 h-4" />
          <span>Month-on-month invoiced to customer, cloud spend vs cloud sales, and % margins by provider.</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredDetails.length === 0} className="gap-2">
            <FileDown className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportXLS} disabled={filteredDetails.length === 0} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Export XLS
          </Button>
          <Button variant="outline" size="sm" onClick={loadSample} disabled={mutations.bulkInsert.isPending} className="gap-2">
            <Database className="w-4 h-4" />
            {mutations.bulkInsert.isPending ? 'Loading…' : 'Load sample data'}
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border bg-muted/40">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>

        {/* Provider filter */}
        <Select value={filterProvider} onValueChange={setFilterProvider}>
          <SelectTrigger className="h-8 w-36 text-sm bg-background">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            {PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year filter */}
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="h-8 w-28 text-sm bg-background">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month From filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Month:</span>
          <Select value={filterMonthFrom} onValueChange={setFilterMonthFrom}>
            <SelectTrigger className="h-8 w-32 text-sm bg-background">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any start</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">to</span>
          <Select value={filterMonthTo} onValueChange={setFilterMonthTo}>
            <SelectTrigger className="h-8 w-32 text-sm bg-background">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any end</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter summary + clear */}
        {isFiltered && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDetails.length}</span> of {details.length} records
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              onClick={() => { setFilterYear('all'); setFilterProvider('all'); setFilterMonthFrom('all'); setFilterMonthTo('all'); }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {visibleProviders.map(({ id }) => (
        <ProviderSection
          key={id}
          provider={id}
          rows={byProvider[id]}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdd={() => openAdd(id)}
        />
      ))}


      <Dialog open={dialogOpen} onOpenChange={(v) => !v && resetForm()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit entry' : 'Add billing entry'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provider</Label>
                <Select
                  value={form.provider}
                  onValueChange={(v) => setForm((f) => ({ ...f, provider: v as CloudProvider }))}
                  disabled={!!activeProvider}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Month</Label>
                <Select
                  value={form.month}
                  onValueChange={(v) => setForm((f) => ({ ...f, month: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Vendor Name</Label>
              <Input
                value={form.vendor_name}
                onChange={(e) => setForm((f) => ({ ...f, vendor_name: e.target.value }))}
                placeholder="e.g. Amazon Web Services"
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value, 10) || f.year }))}
              />
            </div>
            <div>
              <Label>Overall Business (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.overall_business || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, overall_business: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label>Cloud Cost (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.cloud_cost || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cloud_cost: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div>
              <Label>Invoiced to Customer (₹)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.invoiced_to_customer || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invoiced_to_customer: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium">Yet to be Billed (₹)</span> is auto-calculated by the database as <em>Overall Business − Invoiced to Customer</em>.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
                {editing ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
