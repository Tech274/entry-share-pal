import { CloudBillingEntry } from '@/hooks/useCloudBilling';
import { formatINR, formatPercentage } from '@/lib/formatUtils';

const CLOUD_BILLING_HEADERS = [
  'Provider',
  'Vendor Name',
  'Month',
  'Year',
  'Overall Business (₹ INR)',
  'Cloud Cost (₹ INR)',
  'Margins (₹ INR)',
  'Margin %',
  'Invoiced to Customer (₹ INR)',
  'Yet to be Billed (₹ INR)',
];

const escapeCSV = (value: string | number): string => {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
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

const billingToRow = (entry: CloudBillingEntry) => [
  entry.provider.toUpperCase(),
  entry.vendor_name,
  entry.month,
  entry.year,
  formatINR(entry.overall_business),
  formatINR(entry.cloud_cost),
  formatINR(entry.margins),
  formatPercentage(entry.margin_percentage),
  formatINR(entry.invoiced_to_customer),
  formatINR(entry.yet_to_be_billed),
];

export function exportCloudBillingCSV(entries: CloudBillingEntry[], filename = 'cloud-billing'): void {
  if (entries.length === 0) return;

  const csvContent = [
    CLOUD_BILLING_HEADERS.map(escapeCSV).join(','),
    ...entries.map(e => billingToRow(e).map(escapeCSV).join(',')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportCloudBillingXLS(entries: CloudBillingEntry[], filename = 'cloud-billing'): void {
  if (entries.length === 0) return;

  const rows = entries.map(e => {
    const r = billingToRow(e);
    return `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`;
  }).join('');

  const xlsContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="utf-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; }
        th { background-color: #0891b2; color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <thead><tr>${CLOUD_BILLING_HEADERS.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

  downloadFile(xlsContent, `${filename}.xls`, 'application/vnd.ms-excel');
}
