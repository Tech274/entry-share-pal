export interface DeliveryRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  trainingName: string;
  numberOfUsers: number;
  month: string;
  year: number;
  receivedOn: string;
  client: string;
  cloud: string;
  cloudType: string;
  tpLabType: string;
  labName: string;
  requester: string;
  agentName: string;
  accountManager: string;
  labStatus: string;
  labType: string;
  startDate: string;
  endDate: string;
  labSetupRequirement: string;
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmount: number;
  lineOfBusiness: string;
  invoiceDetails: string;
  assignedTo?: string | null;
  createdAt: string;
}

export const LINE_OF_BUSINESS_OPTIONS = ['Standalone', 'VILT', 'Integrated'];

export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const YEAR_OPTIONS = [2025, 2026];
export const LAB_STATUS_OPTIONS = ['Pending', 'Work-in-Progress', 'Test Credentials Shared', 'Delivery In-Progress', 'Delivery Completed', 'Cancelled'];
export const LAB_TYPE_OPTIONS = ['Cloud', 'On-Premise', 'Hybrid', 'Virtual'];
export const CLOUD_OPTIONS = ['Public Cloud', 'Private Cloud', 'TP Labs'];
export const CLOUD_TYPE_OPTIONS = ['AWS', 'Azure', 'GCP'];
export const TP_LAB_TYPE_OPTIONS = ['SAP', 'Oracle', 'OEM'];
