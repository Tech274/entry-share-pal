export interface DeliveryRequest {
  id: string;
  startDate: string;
  endDate: string;
  numberOfUsers: number;
  labSetupRequirement: string; // Hardware, Software, Version details
  trainingVenue: string;
  testLabCreated: string;
  testLabDate: string;
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  createdAt: string;
}

export const VENUE_OPTIONS = ['VILT', 'Classroom', 'Hybrid', 'On-Site', 'Remote'];
export const LAB_CREATED_OPTIONS = ['Yes', 'No', 'In Progress'];
