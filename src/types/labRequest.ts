export interface LabRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  month: string;
  year: number;
  client: string;
  cloud: string;
  cloudType: string;
  tpLabType: string;
  labName: string;
  requester: string;
  agentName: string;
  accountManager: string;
  receivedOn: string;
  labStartDate: string;
  labEndDate: string;
  userCount: number;
  durationInDays: number;
  inputCostPerUser: number;
  sellingCostPerUser: number;
  totalAmountForTraining: number;
  margin: number;
  status: string;
  remarks: string;
  lineOfBusiness: string;
  invoiceDetails: string;
  assignedTo?: string | null;
  createdAt: string;
}

export const CLOUD_OPTIONS = ['Public Cloud', 'Private Cloud', 'TP Labs'];
export const CLOUD_TYPE_OPTIONS = ['AWS', 'Azure', 'GCP'];
export const TP_LAB_TYPE_OPTIONS = ['SAP', 'Oracle', 'OEM'];
export const STATUS_OPTIONS = ['Solution Pending', 'Solution Sent'];
export const LOB_OPTIONS = ['Standalone', 'VILT', 'Integrated'];
export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const YEAR_OPTIONS = [2025, 2026];
