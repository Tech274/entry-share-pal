import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/external-supabase/client';

export interface PersonnelEntry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  account_manager_id?: string;
  created_at: string;
  updated_at: string;
}

type PersonnelInsert = {
  name: string;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
  account_manager_id?: string | null;
};

export function usePersonnel() {
  const [agents, setAgents] = useState<PersonnelEntry[]>([]);
  const [accountManagers, setAccountManagers] = useState<PersonnelEntry[]>([]);
  const [clients, setClients] = useState<PersonnelEntry[]>([]);
  const [solutionManagers, setSolutionManagers] = useState<PersonnelEntry[]>([]);
  const [deliveryManagers, setDeliveryManagers] = useState<PersonnelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [agentsRes, amRes, clientsRes, smRes, dmRes] = await Promise.all([
        supabase.from('agents').select('*').order('name'),
        supabase.from('account_managers').select('*').order('name'),
        supabase.from('clients').select('*').order('name'),
        supabase.from('solution_managers').select('*').order('name'),
        supabase.from('delivery_managers').select('*').order('name'),
      ]);

      // Check for table not found errors
      const checkError = (res: { error: { code?: string; message?: string } | null; data: unknown[] | null }) => {
        if (res.error?.code === '42P01' || res.error?.message?.includes('relation')) {
          throw new Error('Personnel tables not found');
        }
        if (res.error) throw res.error;
        return (res.data || []) as PersonnelEntry[];
      };

      setAgents(checkError(agentsRes));
      setAccountManagers(checkError(amRes));
      setClients(checkError(clientsRes));
      setSolutionManagers(checkError(smRes));
      setDeliveryManagers(checkError(dmRes));
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching personnel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Agents CRUD
  const addAgent = async (entry: PersonnelInsert) => {
    const { error } = await supabase.from('agents').insert([entry]);
    if (error) throw error;
    await fetchAll();
  };

  const updateAgent = async (id: string, updates: Partial<PersonnelInsert>) => {
    const { error } = await supabase.from('agents').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteAgent = async (id: string) => {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Account Managers CRUD
  const addAccountManager = async (entry: PersonnelInsert) => {
    const { error } = await supabase.from('account_managers').insert([entry]);
    if (error) throw error;
    await fetchAll();
  };

  const updateAccountManager = async (id: string, updates: Partial<PersonnelInsert>) => {
    const { error } = await supabase.from('account_managers').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteAccountManager = async (id: string) => {
    const { error } = await supabase.from('account_managers').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Clients CRUD
  const addClient = async (entry: PersonnelInsert) => {
    const { error } = await supabase.from('clients').insert([entry]);
    if (error) throw error;
    await fetchAll();
  };

  const updateClient = async (id: string, updates: Partial<PersonnelInsert>) => {
    const { error } = await supabase.from('clients').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Solution Managers CRUD
  const addSolutionManager = async (entry: PersonnelInsert) => {
    const { error } = await supabase.from('solution_managers').insert([entry]);
    if (error) throw error;
    await fetchAll();
  };

  const updateSolutionManager = async (id: string, updates: Partial<PersonnelInsert>) => {
    const { error } = await supabase.from('solution_managers').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteSolutionManager = async (id: string) => {
    const { error } = await supabase.from('solution_managers').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  // Delivery Managers CRUD
  const addDeliveryManager = async (entry: PersonnelInsert) => {
    const { error } = await supabase.from('delivery_managers').insert([entry]);
    if (error) throw error;
    await fetchAll();
  };

  const updateDeliveryManager = async (id: string, updates: Partial<PersonnelInsert>) => {
    const { error } = await supabase.from('delivery_managers').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const deleteDeliveryManager = async (id: string) => {
    const { error } = await supabase.from('delivery_managers').delete().eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  return {
    agents,
    accountManagers,
    clients,
    solutionManagers,
    deliveryManagers,
    loading,
    error,
    refetch: fetchAll,
    addAgent,
    updateAgent,
    deleteAgent,
    addAccountManager,
    updateAccountManager,
    deleteAccountManager,
    addClient,
    updateClient,
    deleteClient,
    addSolutionManager,
    updateSolutionManager,
    deleteSolutionManager,
    addDeliveryManager,
    updateDeliveryManager,
    deleteDeliveryManager,
  };
}
