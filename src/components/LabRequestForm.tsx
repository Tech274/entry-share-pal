import { useState, useMemo } from 'react';
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
import { CLOUD_OPTIONS, STATUS_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS, LOB_OPTIONS, LabRequest } from '@/types/labRequest';
import { CurrencyInput } from '@/components/CurrencyInput';
import { IntegerInput } from '@/components/IntegerInput';
import { PercentageInput } from '@/components/PercentageInput';
import { Send, RotateCcw } from 'lucide-react';

interface LabRequestFormProps {
  onSubmit: (data: Omit<LabRequest, 'id' | 'createdAt'>) => void;
}

interface FormErrors {
  lineOfBusiness?: string;
  client?: string;
  month?: string;
  userCount?: string;
  durationInDays?: string;
  inputCostPerUser?: string;
  sellingCostPerUser?: string;
  totalAmountForTraining?: string;
  labEndDate?: string;
  margin?: string;
}

const initialFormState = {
  potentialId: '',
  freshDeskTicketNumber: '',
  month: '',
  year: new Date().getFullYear(),
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
  lineOfBusiness: '',
};

export const LabRequestForm = ({ onSubmit }: LabRequestFormProps) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate margin percentage: ((Total - (UserCount * Days * InputCost)) / Total) * 100
      if (field === 'userCount' || field === 'durationInDays' || field === 'inputCostPerUser' || field === 'totalAmountForTraining') {
        const userCount = field === 'userCount' ? Number(value) : updated.userCount;
        const days = field === 'durationInDays' ? Number(value) : updated.durationInDays;
        const inputCost = field === 'inputCostPerUser' ? Number(value) : updated.inputCostPerUser;
        const totalAmount = field === 'totalAmountForTraining' ? Number(value) : updated.totalAmountForTraining;
        
        const totalCost = userCount * days * inputCost;
        const marginValue = totalAmount - totalCost;
        
        // Calculate margin as percentage of total if total > 0
        if (totalAmount > 0) {
          updated.margin = Math.round((marginValue / totalAmount) * 10000) / 100; // Percentage with 2 decimals
        } else {
          updated.margin = 0;
        }
      }
      
      return updated;
    });
    
    // Mark field as touched
    setTouched(prev => new Set(prev).add(field));
    
    // Clear error when field is modified
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear date error when either date changes
    if (field === 'labStartDate' || field === 'labEndDate') {
      setErrors(prev => ({ ...prev, labEndDate: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Mandatory fields
    if (!formData.lineOfBusiness) {
      newErrors.lineOfBusiness = 'Line of Business is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client name is required';
    }
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }
    
    // Numeric validations
    if (formData.userCount <= 0) {
      newErrors.userCount = 'User count must be greater than zero';
    }
    if (formData.durationInDays <= 0) {
      newErrors.durationInDays = 'Duration must be greater than zero';
    }
    if (formData.inputCostPerUser < 0) {
      newErrors.inputCostPerUser = 'Input cost cannot be negative';
    }
    if (formData.sellingCostPerUser < 0) {
      newErrors.sellingCostPerUser = 'Selling cost cannot be negative';
    }
    if (formData.totalAmountForTraining < 0) {
      newErrors.totalAmountForTraining = 'Total cost cannot be negative';
    }
    if (formData.margin < 0 || formData.margin > 100) {
      newErrors.margin = 'Margin must be between 0% and 100%';
    }
    
    // Date validation: end date must be after start date
    if (formData.labStartDate && formData.labEndDate) {
      const startDate = new Date(formData.labStartDate);
      const endDate = new Date(formData.labEndDate);
      if (endDate < startDate) {
        newErrors.labEndDate = 'End date cannot be before start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      formData.lineOfBusiness !== '' &&
      formData.client.trim() !== '' &&
      formData.month !== '' &&
      formData.userCount > 0 &&
      formData.durationInDays > 0 &&
      formData.inputCostPerUser >= 0 &&
      formData.sellingCostPerUser >= 0 &&
      formData.totalAmountForTraining >= 0 &&
      formData.margin >= 0 &&
      formData.margin <= 100
    );
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialFormState);
      setTouched(new Set());
      setErrors({});
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setTouched(new Set());
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="potentialId">Potential ID</Label>
            <Input
              id="potentialId"
              value={formData.potentialId}
              onChange={e => handleChange('potentialId', e.target.value)}
              placeholder="Enter potential ID"
            />
          </div>
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
            <Label htmlFor="month">
              Month
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={formData.month} onValueChange={v => handleChange('month', v)}>
              <SelectTrigger className={errors.month ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.month && <p className="text-sm text-destructive">{errors.month}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={formData.year.toString()} onValueChange={v => handleChange('year', parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
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
          <div className="space-y-2">
            <Label htmlFor="lineOfBusiness">
              LOB (Line of Business)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Select value={formData.lineOfBusiness} onValueChange={v => handleChange('lineOfBusiness', v)}>
              <SelectTrigger className={errors.lineOfBusiness ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select line of business" />
              </SelectTrigger>
              <SelectContent>
                {LOB_OPTIONS.map(lob => (
                  <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lineOfBusiness && <p className="text-sm text-destructive">{errors.lineOfBusiness}</p>}
          </div>
        </div>
      </div>

      {/* Client & Lab Details */}
      <div className="form-section">
        <h3 className="form-section-title">Client & Lab Details</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="client">
              Client
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="client"
              value={formData.client}
              onChange={e => handleChange('client', e.target.value)}
              placeholder="Client name"
              className={errors.client ? 'border-destructive' : ''}
            />
            {errors.client && <p className="text-sm text-destructive">{errors.client}</p>}
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
              min={formData.labStartDate || undefined}
              className={errors.labEndDate ? 'border-destructive' : ''}
            />
            {errors.labEndDate && <p className="text-sm text-destructive">{errors.labEndDate}</p>}
          </div>
        </div>
      </div>

      {/* Metrics & Costs */}
      <div className="form-section">
        <h3 className="form-section-title">Metrics & Costs</h3>
        <div className="form-grid">
          <IntegerInput
            id="userCount"
            label="User Count"
            value={formData.userCount}
            onChange={v => handleChange('userCount', v)}
            error={errors.userCount}
            required
            min={1}
          />
          <IntegerInput
            id="durationInDays"
            label="Duration (Days)"
            value={formData.durationInDays}
            onChange={v => handleChange('durationInDays', v)}
            error={errors.durationInDays}
            required
            min={1}
          />
          <CurrencyInput
            id="inputCostPerUser"
            label="Input Cost (per User)"
            value={formData.inputCostPerUser}
            onChange={v => handleChange('inputCostPerUser', v)}
            error={errors.inputCostPerUser}
            required
          />
          <CurrencyInput
            id="sellingCostPerUser"
            label="Selling Cost (per User)"
            value={formData.sellingCostPerUser}
            onChange={v => handleChange('sellingCostPerUser', v)}
            error={errors.sellingCostPerUser}
            required
          />
          <CurrencyInput
            id="totalAmountForTraining"
            label="Total Cost"
            value={formData.totalAmountForTraining}
            onChange={v => handleChange('totalAmountForTraining', v)}
            error={errors.totalAmountForTraining}
            required
          />
          <PercentageInput
            id="margin"
            label="Margin"
            value={formData.margin}
            onChange={v => handleChange('margin', v)}
            error={errors.margin}
            readOnly
          />
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
        <Button type="submit" disabled={!isFormValid}>
          <Send className="w-4 h-4 mr-2" />
          Submit Request
        </Button>
      </div>
    </form>
  );
};
