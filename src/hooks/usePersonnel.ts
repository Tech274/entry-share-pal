import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Agent, AccountManager, Client, SolutionManager, DeliveryManager } from '@/types/personnel';

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string')
    return new Error((err as { message: string }).message);
  return new Error(String(err));
}

const queryKeys = {
  agents: ['personnel-agents'] as const,
  accountManagers: ['personnel-account-managers'] as const,
  clients: ['personnel-clients'] as const,
  solutionManagers: ['personnel-solution-managers'] as const,
  deliveryManagers: ['personnel-delivery-managers'] as const,
};

export const useAgents = () => {
  return useQuery({
    queryKey: queryKeys.agents,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');
      if (error) throw toError(error);
      return data as Agent[];
    },
  });
};

export const useAccountManagers = () => {
  return useQuery({
    queryKey: queryKeys.accountManagers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_managers')
        .select('*')
        .order('name');
      if (error) throw toError(error);
      return data as AccountManager[];
    },
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw toError(error);
      return data as Client[];
    },
  });
};

export const useSolutionManagers = () => {
  return useQuery({
    queryKey: queryKeys.solutionManagers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_managers')
        .select('*')
        .order('name');
      if (error) throw toError(error);
      return data as SolutionManager[];
    },
  });
};

export const useDeliveryManagers = () => {
  return useQuery({
    queryKey: queryKeys.deliveryManagers,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_managers')
        .select('*')
        .order('name');
      if (error) throw toError(error);
      return data as DeliveryManager[];
    },
  });
};

// Mutations for Admin CRUD
export const useAgentMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      const { error } = await supabase.from('agents').insert(data);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.agents }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Agent> }) => {
      const { error } = await supabase.from('agents').update(data).eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.agents }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agents').delete().eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.agents }),
  });
  return { create, update, remove };
};

export const useAccountManagerMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      const { error } = await supabase.from('account_managers').insert(data);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accountManagers }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountManager> }) => {
      const { error } = await supabase.from('account_managers').update(data).eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accountManagers }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('account_managers').delete().eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.accountManagers }),
  });
  return { create, update, remove };
};

export const useClientMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: { name: string; account_manager_id?: string | null }) => {
      const { error } = await supabase.from('clients').insert(data);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const { error } = await supabase.from('clients').update(data).eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.clients }),
  });
  return { create, update, remove };
};

export const useSolutionManagerMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      const { error } = await supabase.from('solution_managers').insert(data);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.solutionManagers }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SolutionManager> }) => {
      const { error } = await supabase.from('solution_managers').update(data).eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.solutionManagers }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('solution_managers').delete().eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.solutionManagers }),
  });
  return { create, update, remove };
};

export const useDeliveryManagerMutations = () => {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (data: { name: string; email?: string }) => {
      const { error } = await supabase.from('delivery_managers').insert(data);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.deliveryManagers }),
  });
  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryManager> }) => {
      const { error } = await supabase.from('delivery_managers').update(data).eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.deliveryManagers }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('delivery_managers').delete().eq('id', id);
      if (error) throw toError(error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.deliveryManagers }),
  });
  return { create, update, remove };
};
