// Sample data has been removed as per enterprise requirements
// All data should be entered by users through the forms

import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

// Empty arrays - no prefilled data
export const sampleLabRequests: Omit<LabRequest, 'id' | 'createdAt'>[] = [];

export const sampleDeliveryRequests: Omit<DeliveryRequest, 'id' | 'createdAt'>[] = [];
