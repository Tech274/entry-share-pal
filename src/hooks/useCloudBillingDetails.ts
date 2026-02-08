import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CloudProvider = 'aws' | 'azure' | 'gcp';

export interface CloudBillingDetail {
  id: string;
  provider: CloudProvider;
  month: string;
  year: number;
  overall_business: number;
  cloud_cost: number;
  invoiced_to_customer: number;
  yet_to_be_billed: number;
  created_at: string;
  updated_at: string;
}

export interface CloudBillingDetailInsert {
  provider: CloudProvider;
  month: string;
  year: number;
  overall_business?: number;
  cloud_cost?: number;
  invoiced_to_customer?: number;
  yet_to_be_billed?: number;
}

const parseRow = (r: Record<string, unknown>): CloudBillingDetail => ({
  ...r,
  overall_business: Number(r.overall_business) || 0,
  cloud_cost: Number(r.cloud_cost) || 0,
  invoiced_to_customer: Number(r.invoiced_to_customer) || 0,
  yet_to_be_billed: Number(r.yet_to_be_billed) || 0,
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
        month: input.month,
        year: input.year,
        overall_business: input.overall_business ?? 0,
        cloud_cost: input.cloud_cost ?? 0,
        invoiced_to_customer: input.invoiced_to_customer ?? 0,
        yet_to_be_billed: input.yet_to_be_billed ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CloudBillingDetailInsert> }) => {
      const payload: Record<string, unknown> = {};
      if (data.provider != null) payload.provider = data.provider;
      if (data.month != null) payload.month = data.month;
      if (data.year != null) payload.year = data.year;
      if (data.overall_business != null) payload.overall_business = data.overall_business;
      if (data.cloud_cost != null) payload.cloud_cost = data.cloud_cost;
      if (data.invoiced_to_customer != null) payload.invoiced_to_customer = data.invoiced_to_customer;
      if (data.yet_to_be_billed != null) payload.yet_to_be_billed = data.yet_to_be_billed;
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
  return { create, update, remove };
}
