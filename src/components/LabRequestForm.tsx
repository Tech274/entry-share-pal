import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CLOUD_OPTIONS, STATUS_OPTIONS, MONTH_OPTIONS, LabRequest } from '@/types/labRequest';
import { Send, RotateCcw } from 'lucide-react';

interface LabRequestFormProps {
  onSubmit: (data: Omit<LabRequest, 'id' | 'createdAt'>) => void;
}

const initialFormState = {
  freshDeskTicketNumber: '',
  month: '',
  client: '',
  cloud: '',
  labName: '',
  requester: '',
  agentName: '',
  accountManager: '',
  receivedOn: '',
  labStartDate: '',
  labEndDate: '',
  userCount: 0,
  durationInDays: 0,
  inputCostPerUser: 0,
  sellingCostPerUser: 0,
  totalAmountForTraining: 0,
  margin: 0,
  status: '',
  remarks: '',
};

export const LabRequestForm = ({ onSubmit }: LabRequestFormProps) => {
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate margin: totalAmountForTraining - (userCount * durationInDays * inputCostPerUser)
      if (field === 'userCount' || field === 'durationInDays' || field === 'inputCostPerUser' || field === 'totalAmountForTraining') {
        const userCount = field === 'userCount' ? Number(value) : updated.userCount;
        const days = field === 'durationInDays' ? Number(value) : updated.durationInDays;
        const inputCost = field === 'inputCostPerUser' ? Number(value) : updated.inputCostPerUser;
        const totalAmount = field === 'totalAmountForTraining' ? Number(value) : updated.totalAmountForTraining;
        updated.margin = totalAmount - (userCount * days * inputCost);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(initialFormState);
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="freshDeskTicketNumber">FreshDesk Ticket Number</Label>
            <Input
              id="freshDeskTicketNumber"
              value={formData.freshDeskTicketNumber}
              onChange={e => handleChange('freshDeskTicketNumber', e.target.value)}
              placeholder="Enter ticket number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={formData.month} onValueChange={v => handleChange('month', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Client & Lab Details */}
      <div className="form-section">
        <h3 className="form-section-title">Client & Lab Details</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={e => handleChange('client', e.target.value)}
              placeholder="Client name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloud">Cloud</Label>
            <Select value={formData.cloud} onValueChange={v => handleChange('cloud', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cloud" />
              </SelectTrigger>
              <SelectContent>
                {CLOUD_OPTIONS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="labName">Lab Name</Label>
            <Input
              id="labName"
              value={formData.labName}
              onChange={e => handleChange('labName', e.target.value)}
              placeholder="Lab name"
            />
          </div>
        </div>
      </div>

      {/* Personnel */}
      <div className="form-section">
        <h3 className="form-section-title">Personnel</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="requester">Requester</Label>
            <Input
              id="requester"
              value={formData.requester}
              onChange={e => handleChange('requester', e.target.value)}
              placeholder="Requester name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              value={formData.agentName}
              onChange={e => handleChange('agentName', e.target.value)}
              placeholder="Agent name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountManager">Account Manager</Label>
            <Input
              id="accountManager"
              value={formData.accountManager}
              onChange={e => handleChange('accountManager', e.target.value)}
              placeholder="Account manager"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="form-section">
        <h3 className="form-section-title">Dates</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="receivedOn">Received On</Label>
            <Input
              id="receivedOn"
              type="date"
              value={formData.receivedOn}
              onChange={e => handleChange('receivedOn', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labStartDate">Lab Start Date</Label>
            <Input
              id="labStartDate"
              type="date"
              value={formData.labStartDate}
              onChange={e => handleChange('labStartDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="labEndDate">Lab End Date</Label>
            <Input
              id="labEndDate"
              type="date"
              value={formData.labEndDate}
              onChange={e => handleChange('labEndDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Metrics & Costs */}
      <div className="form-section">
        <h3 className="form-section-title">Metrics & Costs</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="userCount">User Count</Label>
            <Input
              id="userCount"
              type="number"
              min="0"
              value={formData.userCount || ''}
              onChange={e => handleChange('userCount', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationInDays">Duration (in days)</Label>
            <Input
              id="durationInDays"
              type="number"
              min="0"
              value={formData.durationInDays || ''}
              onChange={e => handleChange('durationInDays', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inputCostPerUser">Input Cost Per User</Label>
            <Input
              id="inputCostPerUser"
              type="number"
              min="0"
              step="0.01"
              value={formData.inputCostPerUser || ''}
              onChange={e => handleChange('inputCostPerUser', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellingCostPerUser">Selling Cost Per User</Label>
            <Input
              id="sellingCostPerUser"
              type="number"
              min="0"
              step="0.01"
              value={formData.sellingCostPerUser || ''}
              onChange={e => handleChange('sellingCostPerUser', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAmountForTraining">Total Amount for Training</Label>
            <Input
              id="totalAmountForTraining"
              type="number"
              min="0"
              step="0.01"
              value={formData.totalAmountForTraining || ''}
              onChange={e => handleChange('totalAmountForTraining', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="margin">Margin</Label>
            <Input
              id="margin"
              type="number"
              step="0.01"
              value={formData.margin || ''}
              onChange={e => handleChange('margin', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="form-section">
        <h3 className="form-section-title">Remarks</h3>
        <Textarea
          id="remarks"
          value={formData.remarks}
          onChange={e => handleChange('remarks', e.target.value)}
          placeholder="Enter any additional remarks or notes..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button type="submit">
          <Send className="w-4 h-4 mr-2" />
          Submit Request
        </Button>
      </div>
    </form>
  );
};
