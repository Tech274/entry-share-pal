import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { sampleDeliveryRequests } from '@/lib/sampleData';

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
});

export const useDeliveryRequests = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching delivery requests:', error);
        setLoading(false);
        return;
      }

      // If no data exists, seed with sample data
      if (!data || data.length === 0) {
        await seedSampleData();
      } else {
        setRequests(data.map(mapRowToDeliveryRequest));
      }
    } catch (error) {
      console.error('Error fetching delivery requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedSampleData = async () => {
    try {
      const sampleRows = sampleDeliveryRequests.map(mapDeliveryRequestToRow);
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(sampleRows)
        .select();

      if (error) {
        console.error('Error seeding sample data:', error);
        return;
      }

      if (data) {
        setRequests(data.map(mapRowToDeliveryRequest));
      }
    } catch (error) {
      console.error('Error seeding sample data:', error);
    }
  };

  const addRequest = async (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => {
    try {
      const { data: newRow, error } = await supabase
        .from('delivery_requests')
        .insert(mapDeliveryRequestToRow(data))
        .select()
        .single();

      if (error) {
        console.error('Error adding delivery request:', error);
        return;
      }

      if (newRow) {
        setRequests(prev => [mapRowToDeliveryRequest(newRow), ...prev]);
      }
    } catch (error) {
      console.error('Error adding delivery request:', error);
    }
  };

  const updateRequest = async (id: string, data: Partial<DeliveryRequest>) => {
    try {
      // Convert camelCase to snake_case for the update
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

      const { data: updatedRow, error } = await supabase
        .from('delivery_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating delivery request:', error);
        return;
      }

      if (updatedRow) {
        setRequests(prev =>
          prev.map(req => (req.id === id ? mapRowToDeliveryRequest(updatedRow) : req))
        );
      }
    } catch (error) {
      console.error('Error updating delivery request:', error);
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting delivery request:', error);
        return;
      }

      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error deleting delivery request:', error);
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error('Error clearing delivery requests:', error);
        return;
      }

      setRequests([]);
    } catch (error) {
      console.error('Error clearing delivery requests:', error);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Error bulk deleting delivery requests:', error);
        return false;
      }

      setRequests(prev => prev.filter(req => !ids.includes(req.id)));
      return true;
    } catch (error) {
      console.error('Error bulk deleting delivery requests:', error);
      return false;
    }
  };

  const bulkUpdateStatus = async (ids: string[], status: string) => {
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ lab_status: status })
        .in('id', ids);

      if (error) {
        console.error('Error bulk updating delivery requests:', error);
        return false;
      }

      setRequests(prev =>
        prev.map(req => (ids.includes(req.id) ? { ...req, labStatus: status } : req))
      );
      return true;
    } catch (error) {
      console.error('Error bulk updating delivery requests:', error);
      return false;
    }
  };

  const bulkInsert = async (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => {
    try {
      const rows = data.map(mapDeliveryRequestToRow);
      const { data: newRows, error } = await supabase
        .from('delivery_requests')
        .insert(rows)
        .select();

      if (error) {
        console.error('Error bulk inserting delivery requests:', error);
        throw error;
      }

      if (newRows) {
        setRequests(prev => [...newRows.map(mapRowToDeliveryRequest), ...prev]);
      }
      return true;
    } catch (error) {
      console.error('Error bulk inserting delivery requests:', error);
      throw error;
    }
  };

  return {
    requests,
    loading,
    addRequest,
    updateRequest,
    deleteRequest,
    clearAll,
    bulkDelete,
    bulkUpdateStatus,
    bulkInsert,
    refetch: fetchRequests,
  };
};
