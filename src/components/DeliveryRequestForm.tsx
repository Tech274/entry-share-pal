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
import { DeliveryRequest, LAB_STATUS_OPTIONS, CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS, LINE_OF_BUSINESS_OPTIONS } from '@/types/deliveryRequest';
import { useAgents, useAccountManagers, useClients, useDeliveryManagers } from '@/hooks/usePersonnel';
import { CurrencyInput } from '@/components/CurrencyInput';
import { IntegerInput } from '@/components/IntegerInput';
import { formatINR } from '@/lib/formatUtils';
import { Send, RotateCcw } from 'lucide-react';

interface DeliveryRequestFormProps {
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
}

const initialFormState = {
  potentialId: '',
  freshDeskTicketNumber: '',
  trainingName: '',
  numberOfUsers: 0,
  month: '',
  year: new Date().getFullYear(),
  receivedOn: '',
  client: '',
  clientId: '' as string,
  cloud: '',
  cloudType: '',
  tpLabType: '',
  labName: '',
  requester: '',
  requesterId: '' as string,
  agentName: '',
  agentId: '' as string,
  accountManager: '',
  accountManagerId: '' as string,
  labStatus: '',
  labType: '',
  startDate: '',
  endDate: '',
  labSetupRequirement: '',
  inputCostPerUser: 0,
  sellingCostPerUser: 0,
  totalAmount: 0,
  lineOfBusiness: '',
  invoiceDetails: '',
};

export const DeliveryRequestForm = ({ onSubmit }: DeliveryRequestFormProps) => {
  const { data: clients = [] } = useClients();
  const { data: agents = [] } = useAgents();
  const { data: accountManagers = [] } = useAccountManagers();
  const { data: deliveryManagers = [] } = useDeliveryManagers();

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Pre-fill account manager when client is selected
      if (field === 'clientId' && typeof value === 'string') {
        const client = clients.find((c) => c.id === value);
        if (client?.account_manager_id) {
          updated.accountManagerId = client.account_manager_id;
          updated.accountManager = accountManagers.find((am) => am.id === client.account_manager_id)?.name ?? '';
        }
      }
      if (field === 'clientId') {
        const c = clients.find((x) => x.id === value);
        updated.client = c?.name ?? '';
      }
      if (field === 'agentId') {
        const a = agents.find((x) => x.id === value);
        updated.agentName = a?.name ?? '';
      }
      if (field === 'accountManagerId') {
        const am = accountManagers.find((x) => x.id === value);
        updated.accountManager = am?.name ?? '';
      }
      if (field === 'requesterId') {
        const dm = deliveryManagers.find((x) => x.id === value);
        updated.requester = dm?.name ?? '';
      }
      // Clear cloudType when cloud changes to non-Public Cloud
      if (field === 'cloud' && value !== 'Public Cloud') {
        updated.cloudType = '';
      }
      // Clear tpLabType when cloud changes to non-TP Labs
      if (field === 'cloud' && value !== 'TP Labs') {
        updated.tpLabType = '';
      }
      // Auto-calculate total when users or costs change
      if (field === 'numberOfUsers' || field === 'inputCostPerUser' || field === 'sellingCostPerUser') {
        const users = field === 'numberOfUsers' ? Number(value) : updated.numberOfUsers;
        const inputCost = field === 'inputCostPerUser' ? Number(value) : updated.inputCostPerUser;
        const sellingCost = field === 'sellingCostPerUser' ? Number(value) : updated.sellingCostPerUser;
        updated.totalAmount = Math.round(users * (inputCost + sellingCost) * 100) / 100;
      }
      return updated;
    });
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear date error when either date changes
    if (field === 'startDate' || field === 'endDate') {
      setErrors(prev => ({ ...prev, endDate: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.lineOfBusiness) {
      newErrors.lineOfBusiness = 'Line of Business is required';
    }
    if (!formData.client.trim()) {
      newErrors.client = 'Client is required';
    }
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }
    if (formData.numberOfUsers <= 0) {
      newErrors.numberOfUsers = 'Number of users must be greater than 0';
    }
    
    // Date validation: end date must be after start date
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return (
      formData.lineOfBusiness !== '' &&
      formData.client.trim() !== '' &&
      formData.month !== '' &&
      formData.numberOfUsers > 0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData(initialFormState);
      setErrors({});
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="lineOfBusiness">
              Line of Business <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.lineOfBusiness} onValueChange={v => handleChange('lineOfBusiness', v)}>
              <SelectTrigger className={errors.lineOfBusiness ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select LOB" />
              </SelectTrigger>
              <SelectContent>
                {LINE_OF_BUSINESS_OPTIONS.map(lob => (
                  <SelectItem key={lob} value={lob}>{lob}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lineOfBusiness && (
              <p className="text-sm text-destructive">{errors.lineOfBusiness}</p>
            )}
          </div>
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
            <Label htmlFor="trainingName">Training Name</Label>
            <Input
              id="trainingName"
              value={formData.trainingName}
              onChange={e => handleChange('trainingName', e.target.value)}
              placeholder="Enter training name"
            />
          </div>
        </div>
      </div>

      {/* Client & Lab Details */}
      <div className="form-section">
        <h3 className="form-section-title">Client & Lab Details</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="client">
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.clientId || '__none__'}
              onValueChange={v => handleChange('clientId', v === '__none__' ? '' : v)}
            >
              <SelectTrigger className={errors.client ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select client</SelectItem>
                {clients.filter((c) => c.is_active).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.client && (
              <p className="text-sm text-destructive">{errors.client}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cloud">Lab Type</Label>
            <Select value={formData.cloud} onValueChange={v => handleChange('cloud', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select lab type" />
              </SelectTrigger>
              <SelectContent>
                {CLOUD_OPTIONS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.cloud === 'Public Cloud' && (
            <div className="space-y-2">
              <Label htmlFor="cloudType">Cloud Type</Label>
              <Select value={formData.cloudType} onValueChange={v => handleChange('cloudType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cloud type" />
                </SelectTrigger>
                <SelectContent>
                  {CLOUD_TYPE_OPTIONS.map(ct => (
                    <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.cloud === 'TP Labs' && (
            <div className="space-y-2">
              <Label htmlFor="tpLabType">TP Lab Type</Label>
              <Select value={formData.tpLabType} onValueChange={v => handleChange('tpLabType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select TP lab type" />
                </SelectTrigger>
                <SelectContent>
                  {TP_LAB_TYPE_OPTIONS.map(lt => (
                    <SelectItem key={lt} value={lt}>{lt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            <Label htmlFor="requester">Delivery Manager</Label>
            <Select
              value={formData.requesterId || '__none__'}
              onValueChange={v => handleChange('requesterId', v === '__none__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select delivery manager</SelectItem>
                {deliveryManagers.filter((d) => d.is_active).map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent</Label>
            <Select
              value={formData.agentId || '__none__'}
              onValueChange={v => handleChange('agentId', v === '__none__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select agent</SelectItem>
                {agents.filter((a) => a.is_active).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountManager">Account Manager</Label>
            <Select
              value={formData.accountManagerId || '__none__'}
              onValueChange={v => handleChange('accountManagerId', v === '__none__' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select account manager</SelectItem>
                {accountManagers.filter((am) => am.is_active).map((am) => (
                  <SelectItem key={am.id} value={am.id}>{am.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="form-section">
        <h3 className="form-section-title">Dates</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="month">
              Month <span className="text-destructive">*</span>
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
            {errors.month && (
              <p className="text-sm text-destructive">{errors.month}</p>
            )}
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
            <Label htmlFor="receivedOn">Received On</Label>
            <Input
              id="receivedOn"
              type="date"
              value={formData.receivedOn}
              onChange={e => handleChange('receivedOn', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lab Details */}
      <div className="form-section">
        <h3 className="form-section-title">Lab Details</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="labStatus">Lab Status</Label>
            <Select value={formData.labStatus} onValueChange={v => handleChange('labStatus', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {LAB_STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={e => handleChange('startDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={e => handleChange('endDate', e.target.value)}
              min={formData.startDate || undefined}
              className={errors.endDate ? 'border-destructive' : ''}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lab Setup Requirement */}
      <div className="form-section">
        <h3 className="form-section-title">Lab Setup Requirement</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Enter Hardware, Software, and Version details
        </p>
        <Textarea
          id="labSetupRequirement"
          value={formData.labSetupRequirement}
          onChange={e => handleChange('labSetupRequirement', e.target.value)}
          placeholder="Example:&#10;Hardware: 8GB RAM, 4 Core CPU, 100GB Storage&#10;Software: Docker, Jenkins, Kubernetes&#10;Version: Docker 24.0, Jenkins 2.x, K8s 1.28"
          rows={6}
          className="min-h-[150px]"
        />
      </div>

      {/* Metrics & Costs */}
      <div className="form-section">
        <h3 className="form-section-title">Metrics & Costs</h3>
        <div className="form-grid">
          <IntegerInput
            id="numberOfUsers"
            label="Number of Users"
            value={formData.numberOfUsers}
            onChange={v => handleChange('numberOfUsers', v)}
            error={errors.numberOfUsers}
            required
          />
          <CurrencyInput
            id="inputCostPerUser"
            label="Input Cost Per User"
            value={formData.inputCostPerUser}
            onChange={v => handleChange('inputCostPerUser', v)}
          />
          <CurrencyInput
            id="sellingCostPerUser"
            label="Selling Cost Per User"
            value={formData.sellingCostPerUser}
            onChange={v => handleChange('sellingCostPerUser', v)}
          />
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                ₹
              </span>
              <Input
                id="totalAmount"
                type="text"
                value={formData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                readOnly
                className="bg-muted font-semibold pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-calculated: (Input + Selling) × Users
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="form-section">
        <h3 className="form-section-title">Additional Information</h3>
        <div className="space-y-2">
          <Label htmlFor="invoiceDetails">Invoice Details</Label>
          <Textarea
            id="invoiceDetails"
            value={formData.invoiceDetails}
            onChange={e => handleChange('invoiceDetails', e.target.value)}
            placeholder="Enter invoice number, billing details, etc..."
            rows={2}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button type="submit" disabled={!isFormValid()}>
          <Send className="w-4 h-4 mr-2" />
          Submit Delivery Request
        </Button>
      </div>
    </form>
  );
};
