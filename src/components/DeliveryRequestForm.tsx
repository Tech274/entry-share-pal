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
import { DeliveryRequest, VENUE_OPTIONS, LAB_CREATED_OPTIONS } from '@/types/deliveryRequest';
import { Send, RotateCcw } from 'lucide-react';

interface DeliveryRequestFormProps {
  onSubmit: (data: Omit<DeliveryRequest, 'id' | 'createdAt'>) => void;
}

const initialFormState = {
  startDate: '',
  endDate: '',
  numberOfUsers: 0,
  labSetupRequirement: '',
  trainingVenue: '',
  testLabCreated: '',
  testLabDate: '',
};

export const DeliveryRequestForm = ({ onSubmit }: DeliveryRequestFormProps) => {
  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      {/* Schedule Information */}
      <div className="form-section">
        <h3 className="form-section-title">Schedule Information</h3>
        <div className="form-grid">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfUsers">No. of Users</Label>
            <Input
              id="numberOfUsers"
              type="number"
              min="0"
              value={formData.numberOfUsers || ''}
              onChange={e => handleChange('numberOfUsers', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Training Details */}
      <div className="form-section">
        <h3 className="form-section-title">Training Details</h3>
        <div className="form-grid">
          <div className="space-y-2">
            <Label htmlFor="trainingVenue">Training Venue</Label>
            <Select value={formData.trainingVenue} onValueChange={v => handleChange('trainingVenue', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {VENUE_OPTIONS.map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testLabCreated">Test Lab Created</Label>
            <Select value={formData.testLabCreated} onValueChange={v => handleChange('testLabCreated', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {LAB_CREATED_OPTIONS.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="testLabDate">Test Lab Date</Label>
            <Input
              id="testLabDate"
              type="date"
              value={formData.testLabDate}
              onChange={e => handleChange('testLabDate', e.target.value)}
            />
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

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button type="submit">
          <Send className="w-4 h-4 mr-2" />
          Submit Delivery Request
        </Button>
      </div>
    </form>
  );
};
