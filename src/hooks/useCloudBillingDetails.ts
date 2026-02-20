import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudBillingDetail {
  id: string;
  provider: CloudProvider;
  vendor_name: string | null;
  month: string;
  year: number;
  overall_business: number;
  cloud_cost: number;
  invoiced_to_customer: number;
  // Generated columns (read-only, computed by DB)
  yet_to_be_billed: number;
  margins: number;
  margin_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface CloudBillingDetailInsert {
  provider: CloudProvider;
  vendor_name?: string | null;
  month: string;
  year: number;
  overall_business?: number;
  cloud_cost?: number;
  invoiced_to_customer?: number;
  // NOTE: yet_to_be_billed, margins, margin_percentage are generated columns — do NOT insert/update them
}

const parseRow = (r: Record<string, unknown>): CloudBillingDetail => ({
  ...r,
  vendor_name: (r.vendor_name as string) ?? null,
  overall_business: Number(r.overall_business) || 0,
  cloud_cost: Number(r.cloud_cost) || 0,
  invoiced_to_customer: Number(r.invoiced_to_customer) || 0,
  yet_to_be_billed: Number(r.yet_to_be_billed) || 0,    // generated column — read-only
  margins: Number(r.margins) || 0,                        // generated column — read-only
  margin_percentage: Number(r.margin_percentage) || 0,   // generated column — read-only
  year: Number(r.year) || 0,
} as CloudBillingDetail);

const queryKey = ['cloud-billing-details'] as const;

export function useCloudBillingDetails() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloud_billing_details')
        .select('*')
        .order('year', { ascending: false })
        .order('month');
      if (error) throw error;
      return (data ?? []).map(parseRow) as CloudBillingDetail[];
    },
  });
}

export function useCloudBillingMutations() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (input: CloudBillingDetailInsert) => {
      const { error } = await supabase.from('cloud_billing_details').insert({
        provider: input.provider,
        vendor_name: input.vendor_name ?? null,
        month: input.month,
        year: input.year,
        overall_business: input.overall_business ?? 0,
        cloud_cost: input.cloud_cost ?? 0,
        invoiced_to_customer: input.invoiced_to_customer ?? 0,
        // yet_to_be_billed, margins, margin_percentage are generated columns — omit them
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CloudBillingDetailInsert> }) => {
      const payload: Record<string, unknown> = {};
      if (data.provider != null) payload.provider = data.provider;
      if (data.vendor_name !== undefined) payload.vendor_name = data.vendor_name;
      if (data.month != null) payload.month = data.month;
      if (data.year != null) payload.year = data.year;
      if (data.overall_business != null) payload.overall_business = data.overall_business;
      if (data.cloud_cost != null) payload.cloud_cost = data.cloud_cost;
      if (data.invoiced_to_customer != null) payload.invoiced_to_customer = data.invoiced_to_customer;
      // yet_to_be_billed, margins, margin_percentage are generated columns — never update them
      const { error } = await supabase.from('cloud_billing_details').update(payload).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cloud_billing_details').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
  const bulkInsert = useMutation({
    mutationFn: async (rows: CloudBillingDetailInsert[]) => {
      const payload = rows.map((r) => ({
        provider: r.provider,
        vendor_name: r.vendor_name ?? null,
        month: r.month,
        year: r.year,
        overall_business: r.overall_business ?? 0,
        cloud_cost: r.cloud_cost ?? 0,
        invoiced_to_customer: r.invoiced_to_customer ?? 0,
        // yet_to_be_billed, margins, margin_percentage are generated columns — omit them
      }));
      const { error } = await supabase
        .from('cloud_billing_details')
        .upsert(payload, { onConflict: 'provider,month,year' });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
  return { create, update, remove, bulkInsert };
}

/** Sample data matching the Public Cloud Billing - Details Excel (AWS, Azure, GCP Apr–Jun) */
export const SAMPLE_CLOUD_BILLING_DATA: CloudBillingDetailInsert[] = [
  { provider: 'aws', vendor_name: 'Amazon Web Services', month: 'April', year: 2025, overall_business: 2241051, cloud_cost: 253075, invoiced_to_customer: 1162266 },
  { provider: 'aws', vendor_name: 'Amazon Web Services', month: 'May', year: 2025, overall_business: 1250000, cloud_cost: 1100000, invoiced_to_customer: 850000 },
  { provider: 'aws', vendor_name: 'Amazon Web Services', month: 'June', year: 2025, overall_business: 1270097, cloud_cost: 1372212, invoiced_to_customer: 677079 },
  { provider: 'azure', vendor_name: 'Microsoft Azure', month: 'April', year: 2025, overall_business: 2612794, cloud_cost: 293507, invoiced_to_customer: 2078545 },
  { provider: 'azure', vendor_name: 'Microsoft Azure', month: 'May', year: 2025, overall_business: 1680000, cloud_cost: 156594, invoiced_to_customer: 1187000 },
  { provider: 'azure', vendor_name: 'Microsoft Azure', month: 'June', year: 2025, overall_business: 1701186, cloud_cost: 156500, invoiced_to_customer: 1195208 },
  { provider: 'gcp', vendor_name: 'Google Cloud Platform', month: 'April', year: 2025, overall_business: 161644, cloud_cost: 54819, invoiced_to_customer: 161644 },
  { provider: 'gcp', vendor_name: 'Google Cloud Platform', month: 'May', year: 2025, overall_business: 145823, cloud_cost: 56643, invoiced_to_customer: 40287 },
  { provider: 'gcp', vendor_name: 'Google Cloud Platform', month: 'June', year: 2025, overall_business: 145824, cloud_cost: 56643, invoiced_to_customer: 0 },
];

