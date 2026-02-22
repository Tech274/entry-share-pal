export interface LabRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  month: string;
  year: number;
  client: string;
  clientId?: string | null;
  cloud: string;
  cloudType: string;
  tpLabType: string;
  labName: string;
  requester: string;
  requesterId?: string | null;
  agentName: string;
  agentId?: string | null;
  accountManager: string;
  accountManagerId?: string | null;
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

export const CLOUD_OPTIONS = ['AWS', 'Azure', 'GCP', 'Private Cloud', 'SAP', 'Oracle', 'OEM'];
export const PUBLIC_CLOUD_VALUES = ['AWS', 'Azure', 'GCP'];
export const TP_LABS_VALUES = ['SAP', 'Oracle', 'OEM'];
export const CLOUD_TYPE_OPTIONS = ['AWS', 'Azure', 'GCP'];
export const TP_LAB_TYPE_OPTIONS = ['SAP', 'Oracle', 'OEM'];
export const SOLUTION_STATUS_OPTIONS = ['Solution Pending', 'Solution Sent', 'POC In-Progress', 'Lost Closed'] as const;
export const STATUS_OPTIONS = [...SOLUTION_STATUS_OPTIONS]; // Legacy alias
export const LOB_OPTIONS = ['Standalone', 'VILT', 'Integrated'];
export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const YEAR_OPTIONS = [2025, 2026];
