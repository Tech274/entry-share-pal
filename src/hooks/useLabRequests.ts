import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LabRequest } from '@/types/labRequest';
import { sampleLabRequests } from '@/lib/sampleData';

// Helper to convert snake_case DB row to camelCase LabRequest
const mapRowToLabRequest = (row: any): LabRequest => ({
  id: row.id,
  potentialId: row.potential_id || '',
  freshDeskTicketNumber: row.fresh_desk_ticket_number || '',
  month: row.month,
  year: row.year,
  client: row.client,
  cloud: row.cloud || '',
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
});

export const useLabRequests = () => {
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('lab_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lab requests:', error);
        setLoading(false);
        return;
      }

      // If no data exists, seed with sample data
      if (!data || data.length === 0) {
        await seedSampleData();
      } else {
        setRequests(data.map(mapRowToLabRequest));
      }
    } catch (error) {
      console.error('Error fetching lab requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedSampleData = async () => {
    try {
      const sampleRows = sampleLabRequests.map(mapLabRequestToRow);
      const { data, error } = await supabase
        .from('lab_requests')
        .insert(sampleRows)
        .select();

      if (error) {
        console.error('Error seeding sample data:', error);
        return;
      }

      if (data) {
        setRequests(data.map(mapRowToLabRequest));
      }
    } catch (error) {
      console.error('Error seeding sample data:', error);
    }
  };

  const addRequest = async (data: Omit<LabRequest, 'id' | 'createdAt'>) => {
    try {
      const { data: newRow, error } = await supabase
        .from('lab_requests')
        .insert(mapLabRequestToRow(data))
        .select()
        .single();

      if (error) {
        console.error('Error adding lab request:', error);
        return;
      }

      if (newRow) {
        setRequests(prev => [mapRowToLabRequest(newRow), ...prev]);
      }
    } catch (error) {
      console.error('Error adding lab request:', error);
    }
  };

  const updateRequest = async (id: string, data: Partial<LabRequest>) => {
    try {
      // Convert camelCase to snake_case for the update
      const updateData: Record<string, any> = {};
      if (data.potentialId !== undefined) updateData.potential_id = data.potentialId;
      if (data.freshDeskTicketNumber !== undefined) updateData.fresh_desk_ticket_number = data.freshDeskTicketNumber;
      if (data.month !== undefined) updateData.month = data.month;
      if (data.year !== undefined) updateData.year = data.year;
      if (data.client !== undefined) updateData.client = data.client;
      if (data.cloud !== undefined) updateData.cloud = data.cloud;
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

      const { data: updatedRow, error } = await supabase
        .from('lab_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating lab request:', error);
        return;
      }

      if (updatedRow) {
        setRequests(prev =>
          prev.map(req => (req.id === id ? mapRowToLabRequest(updatedRow) : req))
        );
      }
    } catch (error) {
      console.error('Error updating lab request:', error);
    }
  };

  const deleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lab_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting lab request:', error);
        return;
      }

      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error('Error deleting lab request:', error);
    }
  };

  const clearAll = async () => {
    try {
      const { error } = await supabase
        .from('lab_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        console.error('Error clearing lab requests:', error);
        return;
      }

      setRequests([]);
    } catch (error) {
      console.error('Error clearing lab requests:', error);
    }
  };

  return {
    requests,
    loading,
    addRequest,
    updateRequest,
    deleteRequest,
    clearAll,
    refetch: fetchRequests,
  };
};
