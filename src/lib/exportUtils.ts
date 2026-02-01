import { LabRequest } from '@/types/labRequest';

const HEADERS = [
  'FreshDesk Ticket Number',
  'Month',
  'Client',
  'Cloud',
  'Vendor',
  'Lab Name',
  'Requester',
  'Agent Name',
  'Account Manager',
  'Received On',
  'Delivered On',
  'Conformation Start Date',
  'Conformation End Date',
  'User Count',
  'Duration (in days)',
  'Input Cost Per User',
  'Shelling Cost Per User',
  'Total Amount for Training',
  'Margin',
  'Status',
  'Remarks',
];

const escapeCSV = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportToCSV = (requests: LabRequest[]): void => {
  const rows = requests.map(r => [
    r.freshDeskTicketNumber,
    r.month,
    r.client,
    r.cloud,
    r.vendor,
    r.labName,
    r.requester,
    r.agentName,
    r.accountManager,
    r.receivedOn,
    r.deliveredOn,
    r.conformationStartDate,
    r.conformationEndDate,
    r.userCount,
    r.durationInDays,
    r.inputCostPerUser,
    r.shellingCostPerUser,
    r.totalAmountForTraining,
    r.margin,
    r.status,
    r.remarks,
  ]);

  const csvContent = [
    HEADERS.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(',')),
  ].join('\n');

  downloadFile(csvContent, 'lab-requests.csv', 'text/csv');
};

export const exportToXLS = (requests: LabRequest[]): void => {
  // Create a simple HTML table that Excel can open
  const rows = requests.map(r => `
    <tr>
      <td>${r.freshDeskTicketNumber}</td>
      <td>${r.month}</td>
      <td>${r.client}</td>
      <td>${r.cloud}</td>
      <td>${r.vendor}</td>
      <td>${r.labName}</td>
      <td>${r.requester}</td>
      <td>${r.agentName}</td>
      <td>${r.accountManager}</td>
      <td>${r.receivedOn}</td>
      <td>${r.deliveredOn}</td>
      <td>${r.conformationStartDate}</td>
      <td>${r.conformationEndDate}</td>
      <td>${r.userCount}</td>
      <td>${r.durationInDays}</td>
      <td>${r.inputCostPerUser}</td>
      <td>${r.shellingCostPerUser}</td>
      <td>${r.totalAmountForTraining}</td>
      <td>${r.margin}</td>
      <td>${r.status}</td>
      <td>${r.remarks}</td>
    </tr>
  `).join('');

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
          <tr>${HEADERS.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(xlsContent, 'lab-requests.xls', 'application/vnd.ms-excel');
};

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
