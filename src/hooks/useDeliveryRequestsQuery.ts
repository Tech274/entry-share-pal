import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/external-supabase/client';
import { DeliveryRequest } from '@/types/deliveryRequest';

// Helper to convert snake_case DB row to camelCase DeliveryRequest
const mapRowToDeliveryRequest = (row: any): DeliveryRequest => ({
  id: row.id,
  potentialId: row.potential_id || '',
  freshDeskTicketNumber: row.fresh_desk_ticket_number || '',
  trainingName: row.training_name || '',
  numberOfUsers: row.number_of_users || 0,
  month: row.month,
  year: row.year,
  receivedOn: row.received_on || '',
  client: row.client,
  cloud: row.cloud || '',
  cloudType: row.cloud_type || '',
  tpLabType: row.tp_lab_type || '',
  labName: row.lab_name || '',
  requester: row.requester || '',
  agentName: row.agent_name || '',
  accountManager: row.account_manager || '',
  labStatus: row.lab_status || 'Pending',
  labType: row.lab_type || '',
  startDate: row.start_date || '',
  endDate: row.end_date || '',
  labSetupRequirement: row.lab_setup_requirement || '',
  inputCostPerUser: Number(row.input_cost_per_user) || 0,
  sellingCostPerUser: Number(row.selling_cost_per_user) || 0,
  totalAmount: Number(row.total_amount) || 0,
  lineOfBusiness: row.line_of_business || '',
  invoiceDetails: row.invoice_details || '',
  assignedTo: row.assigned_to || null,
  agentId: row.agent_id || null,
  accountManagerId: row.account_manager_id || null,
  clientId: row.client_id || null,
  createdAt: row.created_at,
});

// Helper to convert camelCase to snake_case for DB insert
const mapDeliveryRequestToRow = (request: Omit<DeliveryRequest, 'id' | 'createdAt'>) => ({
  potential_id: request.potentialId,
  fresh_desk_ticket_number: request.freshDeskTicketNumber,
  training_name: request.trainingName,
  number_of_users: request.numberOfUsers,
  month: request.month,
  year: request.year,
  received_on: request.receivedOn,
  client: request.client,
  cloud: request.cloud,
  cloud_type: request.cloudType,
  tp_lab_type: request.tpLabType,
  lab_name: request.labName,
  requester: request.requester,
  agent_name: request.agentName,
  account_manager: request.accountManager,
  lab_status: request.labStatus,
  lab_type: request.labType,
  start_date: request.startDate,
  end_date: request.endDate,
  lab_setup_requirement: request.labSetupRequirement,
  input_cost_per_user: request.inputCostPerUser,
  selling_cost_per_user: request.sellingCostPerUser,
  total_amount: request.totalAmount,
  line_of_business: request.lineOfBusiness,
  invoice_details: request.invoiceDetails,
  agent_id: request.agentId || null,
  account_manager_id: request.accountManagerId || null,
  client_id: request.clientId || null,
});

const fetchDeliveryRequests = async (): Promise<DeliveryRequest[]> => {
  const { data, error } = await supabase
    .from('delivery_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivery requests:', error);
    throw error;
  }

  return data ? data.map(mapRowToDeliveryRequest) : [];
};

export const useDeliveryRequestsQuery = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['delivery-requests'],
    queryFn: fetchDeliveryRequests,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMutation = useMutation({
    mutationFn: async (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => {
      const { data: newRow, error } = await supabase
        .from('delivery_requests')
        .insert(mapDeliveryRequestToRow(data))
        .select()
        .single();

      if (error) throw error;
      return newRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeliveryRequest> }) => {
      const updateData: Record<string, any> = {};
      if (data.potentialId !== undefined) updateData.potential_id = data.potentialId;
      if (data.freshDeskTicketNumber !== undefined) updateData.fresh_desk_ticket_number = data.freshDeskTicketNumber;
      if (data.trainingName !== undefined) updateData.training_name = data.trainingName;
      if (data.numberOfUsers !== undefined) updateData.number_of_users = data.numberOfUsers;
      if (data.month !== undefined) updateData.month = data.month;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.receivedOn !== undefined) updateData.received_on = data.receivedOn;
      if (data.client !== undefined) updateData.client = data.client;
      if (data.cloud !== undefined) updateData.cloud = data.cloud;
      if (data.cloudType !== undefined) updateData.cloud_type = data.cloudType;
      if (data.tpLabType !== undefined) updateData.tp_lab_type = data.tpLabType;
      if (data.labName !== undefined) updateData.lab_name = data.labName;
      if (data.requester !== undefined) updateData.requester = data.requester;
      if (data.agentName !== undefined) updateData.agent_name = data.agentName;
      if (data.accountManager !== undefined) updateData.account_manager = data.accountManager;
      if (data.labStatus !== undefined) updateData.lab_status = data.labStatus;
      if (data.labType !== undefined) updateData.lab_type = data.labType;
      if (data.startDate !== undefined) updateData.start_date = data.startDate;
      if (data.endDate !== undefined) updateData.end_date = data.endDate;
      if (data.labSetupRequirement !== undefined) updateData.lab_setup_requirement = data.labSetupRequirement;
      if (data.inputCostPerUser !== undefined) updateData.input_cost_per_user = data.inputCostPerUser;
      if (data.sellingCostPerUser !== undefined) updateData.selling_cost_per_user = data.sellingCostPerUser;
      if (data.lineOfBusiness !== undefined) updateData.line_of_business = data.lineOfBusiness;
      if (data.totalAmount !== undefined) updateData.total_amount = data.totalAmount;
      if (data.invoiceDetails !== undefined) updateData.invoice_details = data.invoiceDetails;
      if (data.agentId !== undefined) updateData.agent_id = data.agentId;
      if (data.accountManagerId !== undefined) updateData.account_manager_id = data.accountManagerId;
      if (data.clientId !== undefined) updateData.client_id = data.clientId;

      const { data: updatedRow, error } = await supabase
        .from('delivery_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('delivery_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('delivery_requests').delete().in('id', ids);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase.from('delivery_requests').update({ lab_status: status }).in('id', ids);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const bulkInsertMutation = useMutation({
    mutationFn: async (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => {
      const rows = data.map(mapDeliveryRequestToRow);
      const { error } = await supabase.from('delivery_requests').insert(rows).select();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('delivery_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-requests'] });
    },
  });

  return {
    requests,
    loading,
    addRequest: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => addMutation.mutateAsync(data),
    updateRequest: (id: string, data: Partial<DeliveryRequest>) => updateMutation.mutateAsync({ id, data }),
    deleteRequest: (id: string) => deleteMutation.mutateAsync(id),
    clearAll: () => clearAllMutation.mutateAsync(),
    bulkDelete: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    bulkUpdateStatus: (ids: string[], status: string) => bulkUpdateStatusMutation.mutateAsync({ ids, status }),
    bulkInsert: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => bulkInsertMutation.mutateAsync(data),
    refetch,
  };
};
