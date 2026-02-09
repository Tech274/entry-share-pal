import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/external-supabase/client';

export interface CloudBillingEntry {
  id: string;
  provider: 'aws' | 'azure' | 'gcp';
  vendor_name: string;
  month: string;
  year: number;
  overall_business: number;
  cloud_cost: number;
  margins: number;
  margin_percentage: number;
  invoiced_to_customer: number;
  yet_to_be_billed: number;
  created_at: string;
  updated_at: string;
}

export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function useCloudBilling() {
  const [entries, setEntries] = useState<CloudBillingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('cloud_billing_details')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (fetchError) {
        // Check if it's a "relation does not exist" error
        if (fetchError.message.includes('relation') || fetchError.code === '42P01') {
          throw new Error('Table not found. Please run the cloud_billing migration.');
        }
        throw fetchError;
      }

      setEntries(data as CloudBillingEntry[] || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching cloud billing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<CloudBillingEntry, 'id' | 'margins' | 'margin_percentage' | 'yet_to_be_billed' | 'created_at' | 'updated_at'>) => {
    const { data, error: insertError } = await supabase
      .from('cloud_billing_details')
      .insert([entry])
      .select()
      .single();

    if (insertError) throw insertError;
    
    await fetchEntries();
    return data;
  }, [fetchEntries]);

  const updateEntry = useCallback(async (id: string, updates: Partial<CloudBillingEntry>) => {
    const { error: updateError } = await supabase
      .from('cloud_billing_details')
      .update(updates)
      .eq('id', id);

    if (updateError) throw updateError;
    
    await fetchEntries();
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('cloud_billing_details')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    
    await fetchEntries();
  }, [fetchEntries]);

  const loadSampleData = useCallback(async () => {
    const sampleData = [
      { provider: 'aws', vendor_name: 'Amazon Web Services', month: 'January', year: 2025, overall_business: 500000, cloud_cost: 350000, invoiced_to_customer: 450000 },
      { provider: 'aws', vendor_name: 'Amazon Web Services', month: 'February', year: 2025, overall_business: 620000, cloud_cost: 420000, invoiced_to_customer: 520000 },
      { provider: 'azure', vendor_name: 'Microsoft Azure', month: 'January', year: 2025, overall_business: 380000, cloud_cost: 280000, invoiced_to_customer: 350000 },
      { provider: 'azure', vendor_name: 'Microsoft Azure', month: 'February', year: 2025, overall_business: 450000, cloud_cost: 320000, invoiced_to_customer: 400000 },
      { provider: 'gcp', vendor_name: 'Google Cloud Platform', month: 'January', year: 2025, overall_business: 220000, cloud_cost: 150000, invoiced_to_customer: 200000 },
      { provider: 'gcp', vendor_name: 'Google Cloud Platform', month: 'February', year: 2025, overall_business: 280000, cloud_cost: 190000, invoiced_to_customer: 250000 },
    ];

    const { error: insertError } = await supabase
      .from('cloud_billing_details')
      .insert(sampleData);

    if (insertError) throw insertError;
    
    await fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    loadSampleData,
    refetch: fetchEntries,
  };
}
