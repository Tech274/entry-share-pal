export interface LabRequest {
  id: string;
  potentialId: string;
  freshDeskTicketNumber: string;
  month: string;
  client: string;
  cloud: string;
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
  createdAt: string;
}

export const CLOUD_OPTIONS = ['AWS', 'Azure', 'GCP', 'Oracle', 'On-Premise', 'Other'];
export const STATUS_OPTIONS = ['Solution Pending', 'Solution Sent'];
export const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
