import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/external-supabase/client';
import { LabRequest } from '@/types/labRequest';

// Helper to convert snake_case DB row to camelCase LabRequest
const mapRowToLabRequest = (row: any): LabRequest => ({
  id: row.id,
  potentialId: row.potential_id || '',
  freshDeskTicketNumber: row.fresh_desk_ticket_number || '',
  month: row.month,
  year: row.year,
  client: row.client,
  cloud: row.cloud || '',
  cloudType: row.cloud_type || '',
  tpLabType: row.tp_lab_type || '',
  labName: row.lab_name || '',
  requester: row.requester || '',
  agentName: row.agent_name || '',
  accountManager: row.account_manager || '',
  receivedOn: row.received_on || '',
  labStartDate: row.lab_start_date || '',
  labEndDate: row.lab_end_date || '',
  userCount: row.user_count || 0,
  durationInDays: row.duration_in_days || 0,
  inputCostPerUser: Number(row.input_cost_per_user) || 0,
  sellingCostPerUser: Number(row.selling_cost_per_user) || 0,
  totalAmountForTraining: Number(row.total_amount_for_training) || 0,
  margin: Number(row.margin) || 0,
  status: row.status || 'Solution Pending',
  remarks: row.remarks || '',
  lineOfBusiness: row.line_of_business || '',
  invoiceDetails: row.invoice_details || '',
  assignedTo: row.assigned_to || null,
  agentId: row.agent_id || null,
  accountManagerId: row.account_manager_id || null,
  clientId: row.client_id || null,
  createdAt: row.created_at,
});

// Helper to convert camelCase to snake_case for DB insert
const mapLabRequestToRow = (request: Omit<LabRequest, 'id' | 'createdAt'>) => ({
  potential_id: request.potentialId,
  fresh_desk_ticket_number: request.freshDeskTicketNumber,
  month: request.month,
  year: request.year,
  client: request.client,
  cloud: request.cloud,
  cloud_type: request.cloudType,
  tp_lab_type: request.tpLabType,
  lab_name: request.labName,
  requester: request.requester,
  agent_name: request.agentName,
  account_manager: request.accountManager,
  received_on: request.receivedOn,
  lab_start_date: request.labStartDate,
  lab_end_date: request.labEndDate,
  user_count: request.userCount,
  duration_in_days: request.durationInDays,
  input_cost_per_user: request.inputCostPerUser,
  selling_cost_per_user: request.sellingCostPerUser,
  total_amount_for_training: request.totalAmountForTraining,
  margin: request.margin,
  status: request.status,
  remarks: request.remarks,
  line_of_business: request.lineOfBusiness,
  invoice_details: request.invoiceDetails,
  agent_id: request.agentId || null,
  account_manager_id: request.accountManagerId || null,
  client_id: request.clientId || null,
});

const fetchLabRequests = async (): Promise<LabRequest[]> => {
  const { data, error } = await supabase
    .from('lab_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lab requests:', error);
    throw error;
  }

  return data ? data.map(mapRowToLabRequest) : [];
};

export const useLabRequestsQuery = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['lab-requests'],
    queryFn: fetchLabRequests,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addMutation = useMutation({
    mutationFn: async (data: Omit<LabRequest, 'id' | 'createdAt'>) => {
      const { data: newRow, error } = await supabase
        .from('lab_requests')
        .insert(mapLabRequestToRow(data))
        .select()
        .single();

      if (error) throw error;
      return newRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LabRequest> }) => {
      const updateData: Record<string, any> = {};
      if (data.potentialId !== undefined) updateData.potential_id = data.potentialId;
      if (data.freshDeskTicketNumber !== undefined) updateData.fresh_desk_ticket_number = data.freshDeskTicketNumber;
      if (data.month !== undefined) updateData.month = data.month;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.client !== undefined) updateData.client = data.client;
      if (data.cloud !== undefined) updateData.cloud = data.cloud;
      if (data.cloudType !== undefined) updateData.cloud_type = data.cloudType;
      if (data.tpLabType !== undefined) updateData.tp_lab_type = data.tpLabType;
      if (data.labName !== undefined) updateData.lab_name = data.labName;
      if (data.requester !== undefined) updateData.requester = data.requester;
      if (data.agentName !== undefined) updateData.agent_name = data.agentName;
      if (data.accountManager !== undefined) updateData.account_manager = data.accountManager;
      if (data.receivedOn !== undefined) updateData.received_on = data.receivedOn;
      if (data.labStartDate !== undefined) updateData.lab_start_date = data.labStartDate;
      if (data.labEndDate !== undefined) updateData.lab_end_date = data.labEndDate;
      if (data.userCount !== undefined) updateData.user_count = data.userCount;
      if (data.durationInDays !== undefined) updateData.duration_in_days = data.durationInDays;
      if (data.inputCostPerUser !== undefined) updateData.input_cost_per_user = data.inputCostPerUser;
      if (data.sellingCostPerUser !== undefined) updateData.selling_cost_per_user = data.sellingCostPerUser;
      if (data.totalAmountForTraining !== undefined) updateData.total_amount_for_training = data.totalAmountForTraining;
      if (data.margin !== undefined) updateData.margin = data.margin;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.remarks !== undefined) updateData.remarks = data.remarks;
      if (data.lineOfBusiness !== undefined) updateData.line_of_business = data.lineOfBusiness;
      if (data.invoiceDetails !== undefined) updateData.invoice_details = data.invoiceDetails;
      if (data.agentId !== undefined) updateData.agent_id = data.agentId;
      if (data.accountManagerId !== undefined) updateData.account_manager_id = data.accountManagerId;
      if (data.clientId !== undefined) updateData.client_id = data.clientId;

      const { data: updatedRow, error } = await supabase
        .from('lab_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lab_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('lab_requests').delete().in('id', ids);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase.from('lab_requests').update({ status }).in('id', ids);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const bulkInsertMutation = useMutation({
    mutationFn: async (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => {
      const rows = data.map(mapLabRequestToRow);
      const { error } = await supabase.from('lab_requests').insert(rows).select();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('lab_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-requests'] });
    },
  });

  return {
    requests,
    loading,
    addRequest: (data: Omit<LabRequest, 'id' | 'createdAt'>) => addMutation.mutateAsync(data),
    updateRequest: (id: string, data: Partial<LabRequest>) => updateMutation.mutateAsync({ id, data }),
    deleteRequest: (id: string) => deleteMutation.mutateAsync(id),
    clearAll: () => clearAllMutation.mutateAsync(),
    bulkDelete: (ids: string[]) => bulkDeleteMutation.mutateAsync(ids),
    bulkUpdateStatus: (ids: string[], status: string) => bulkUpdateStatusMutation.mutateAsync({ ids, status }),
    bulkInsert: (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => bulkInsertMutation.mutateAsync(data),
    refetch,
  };
};
