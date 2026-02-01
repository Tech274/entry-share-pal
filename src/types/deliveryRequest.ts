export interface DeliveryRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  trainingName: string;
  numberOfUsers: number;
  startDate: string;
  endDate: string;
  labStatus: string;
  labType: string;
  deliveryLabRequestReceived: string;
  delivered: string;
  labSetupRequirement: string; // Hardware, Software, Version details
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  createdAt: string;
}

export const LAB_STATUS_OPTIONS = ['Pending', 'In Progress', 'Ready', 'Completed'];
export const LAB_TYPE_OPTIONS = ['Cloud', 'On-Premise', 'Hybrid', 'Virtual'];
