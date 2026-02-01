export interface DeliveryRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  trainingName: string;
  numberOfUsers: number;
  client: string;
  cloud: string;
  labName: string;
  requester: string;
  agentName: string;
  accountManager: string;
  labStatus: string;
  labType: string;
  startDate: string;
  endDate: string;
  labSetupRequirement: string; // Hardware, Software, Version details
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  createdAt: string;
}

export const LAB_STATUS_OPTIONS = ['Pending', 'In Progress', 'Ready', 'Completed'];
export const LAB_TYPE_OPTIONS = ['Cloud', 'On-Premise', 'Hybrid', 'Virtual'];
export const CLOUD_OPTIONS = ['AWS', 'Azure', 'GCP', 'Oracle', 'On-Premise', 'Other'];
