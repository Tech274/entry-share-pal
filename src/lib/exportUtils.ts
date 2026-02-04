import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR, formatPercentage } from '@/lib/formatUtils';

const LAB_HEADERS = [
  'FreshDesk Ticket Number',
  'Month',
  'Line of Business',
  'Client',
  'Lab Type',
  'Cloud Type',
  'TP Lab Type',
  'Lab Name',
  'Requester',
  'Agent Name',
  'Account Manager',
  'Received On',
  'Lab Start Date',
  'Lab End Date',
  'User Count',
  'Duration (in days)',
  'Input Cost Per User',
  'Selling Cost Per User',
  'Total Amount for Training',
  'Margin',
  'Status',
  'Invoice Details',
  'Remarks',
];

const DELIVERY_HEADERS = [
  'Potential ID',
  'FreshDesk Ticket Number',
  'Training Name',
  'Month',
  'Line of Business',
  'Client',
  'Cloud',
  'Cloud Type',
  'TP Lab Type',
  'Number of Users',
  'Lab Status',
  'Lab Type',
  'Start Date',
  'End Date',
  'Requester',
  'Agent Name',
  'Account Manager',
  'Input Cost Per User',
  'Selling Cost Per User',
  'Total Amount',
  'Invoice Details',
];

const escapeCSV = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export function exportToCSV(requests: LabRequest[], filename?: string): void;
export function exportToCSV(requests: DeliveryRequest[], filename?: string): void;
export function exportToCSV(requests: (LabRequest | DeliveryRequest)[], filename = 'lab-requests'): void {
  if (requests.length === 0) return;

  // Detect type by checking for delivery-specific field
  const isDelivery = 'trainingName' in requests[0] || 'labStatus' in requests[0];
  const headers = isDelivery ? DELIVERY_HEADERS : LAB_HEADERS;

  const rows = requests.map(r => {
    if (isDelivery) {
      const dr = r as DeliveryRequest;
      return [
        dr.potentialId || '',
        dr.freshDeskTicketNumber || '',
        dr.trainingName || '',
        dr.month,
        dr.lineOfBusiness || '',
        dr.client,
        dr.cloud || '',
        dr.cloudType || '',
        dr.tpLabType || '',
        dr.numberOfUsers,
        dr.labStatus || '',
        dr.labType || '',
        dr.startDate || '',
        dr.endDate || '',
        dr.requester || '',
        dr.agentName || '',
        dr.accountManager || '',
        formatINR(dr.inputCostPerUser),
        formatINR(dr.sellingCostPerUser),
        formatINR(dr.totalAmount),
        dr.invoiceDetails || '',
      ];
    } else {
      const lr = r as LabRequest;
      return [
        lr.freshDeskTicketNumber,
        lr.month,
        lr.lineOfBusiness || '',
        lr.client,
        lr.cloud || '',
        lr.cloudType || '',
        lr.tpLabType || '',
        lr.labName,
        lr.requester,
        lr.agentName,
        lr.accountManager,
        lr.receivedOn,
        lr.labStartDate,
        lr.labEndDate,
        lr.userCount,
        lr.durationInDays,
        formatINR(lr.inputCostPerUser),
        formatINR(lr.sellingCostPerUser),
        formatINR(lr.totalAmountForTraining),
        formatPercentage(lr.margin),
        lr.status,
        lr.invoiceDetails || '',
        lr.remarks,
      ];
    }
  });

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportToXLS(requests: LabRequest[], filename?: string): void;
export function exportToXLS(requests: DeliveryRequest[], filename?: string): void;
export function exportToXLS(requests: (LabRequest | DeliveryRequest)[], filename = 'lab-requests'): void {
  if (requests.length === 0) return;

  const isDelivery = 'trainingName' in requests[0] || 'labStatus' in requests[0];
  const headers = isDelivery ? DELIVERY_HEADERS : LAB_HEADERS;

  const rows = requests.map(r => {
    if (isDelivery) {
      const dr = r as DeliveryRequest;
      return `
        <tr>
          <td>${dr.potentialId || ''}</td>
          <td>${dr.freshDeskTicketNumber || ''}</td>
          <td>${dr.trainingName || ''}</td>
          <td>${dr.month}</td>
          <td>${dr.lineOfBusiness || ''}</td>
          <td>${dr.client}</td>
          <td>${dr.cloud || ''}</td>
          <td>${dr.cloudType || ''}</td>
          <td>${dr.tpLabType || ''}</td>
          <td>${dr.numberOfUsers}</td>
          <td>${dr.labStatus || ''}</td>
          <td>${dr.labType || ''}</td>
          <td>${dr.startDate || ''}</td>
          <td>${dr.endDate || ''}</td>
          <td>${dr.requester || ''}</td>
          <td>${dr.agentName || ''}</td>
          <td>${dr.accountManager || ''}</td>
          <td>${formatINR(dr.inputCostPerUser)}</td>
          <td>${formatINR(dr.sellingCostPerUser)}</td>
          <td>${formatINR(dr.totalAmount)}</td>
          <td>${dr.invoiceDetails || ''}</td>
        </tr>
      `;
    } else {
      const lr = r as LabRequest;
      return `
        <tr>
          <td>${lr.freshDeskTicketNumber}</td>
          <td>${lr.month}</td>
          <td>${lr.lineOfBusiness || ''}</td>
          <td>${lr.client}</td>
          <td>${lr.cloud || ''}</td>
          <td>${lr.cloudType || ''}</td>
          <td>${lr.tpLabType || ''}</td>
          <td>${lr.labName}</td>
          <td>${lr.requester}</td>
          <td>${lr.agentName}</td>
          <td>${lr.accountManager}</td>
          <td>${lr.receivedOn}</td>
          <td>${lr.labStartDate}</td>
          <td>${lr.labEndDate}</td>
          <td>${lr.userCount}</td>
          <td>${lr.durationInDays}</td>
          <td>${formatINR(lr.inputCostPerUser)}</td>
          <td>${formatINR(lr.sellingCostPerUser)}</td>
          <td>${formatINR(lr.totalAmountForTraining)}</td>
          <td>${formatPercentage(lr.margin)}</td>
          <td>${lr.status}</td>
          <td>${lr.invoiceDetails || ''}</td>
          <td>${lr.remarks}</td>
        </tr>
      `;
    }
  }).join('');

  const xlsContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="utf-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background-color: #0891b2; color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(xlsContent, `${filename}.xls`, 'application/vnd.ms-excel');
}

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
