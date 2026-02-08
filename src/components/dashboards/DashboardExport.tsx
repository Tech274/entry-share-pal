import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { toast } from '@/hooks/use-toast';

interface DashboardExportProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const DashboardExport = ({ labRequests, deliveryRequests }: DashboardExportProps) => {
  const generateKPIData = () => {
    const totalSolutionsRevenue = labRequests.reduce((sum, r) => sum + r.totalAmountForTraining, 0);
    const totalDeliveryRevenue = deliveryRequests.reduce((sum, r) => {
      const users = r.numberOfUsers || 0;
      return sum + ((r.sellingCostPerUser || 0) * users) - ((r.inputCostPerUser || 0) * users);
    }, 0);
    const totalLearners = deliveryRequests.reduce((sum, r) => sum + (r.numberOfUsers || 0), 0);
    
    const avgMarginPercentage = labRequests.length > 0 
      ? labRequests.reduce((sum, r) => {
          if (r.totalAmountForTraining > 0) {
            return sum + (r.margin / r.totalAmountForTraining) * 100;
          }
          return sum;
        }, 0) / labRequests.filter(r => r.totalAmountForTraining > 0).length
      : 0;

    const agentNames = new Set(labRequests.map(r => r.agentName).filter(Boolean));

    const solutionPending = labRequests.filter(r => r.status === 'Solution Pending').length;
    const solutionSent = labRequests.filter(r => r.status === 'Solution Sent').length;
    const pocInProgress = labRequests.filter(r => r.status === 'POC In-Progress').length;
    const lostClosed = labRequests.filter(r => r.status === 'Lost Closed').length;
    const pendingDeliveries = deliveryRequests.filter(r => r.labStatus === 'Pending').length;
    const inProgressDeliveries = deliveryRequests.filter(r => r.labStatus === 'Delivery In-Progress').length;
    const completedDeliveries = deliveryRequests.filter(r => r.labStatus === 'Delivery Completed').length;

    return {
      summary: {
        'Total Revenue': formatINR(totalSolutionsRevenue + totalDeliveryRevenue),
        'Solutions Revenue': formatINR(totalSolutionsRevenue),
        'Delivery Revenue': formatINR(totalDeliveryRevenue),
        'Total Learners': totalLearners.toLocaleString(),
        'Average Margin': formatPercentage(avgMarginPercentage),
        'Active Agents': agentNames.size,
      },
      solutions: {
        'Total Solutions': labRequests.length,
        'Solution Pending': solutionPending,
        'Solution Sent': solutionSent,
        'POC In-Progress': pocInProgress,
        'Lost Closed': lostClosed,
      },
      deliveries: {
        'Total Deliveries': deliveryRequests.length,
        'Pending': pendingDeliveries,
        'In Progress': inProgressDeliveries,
        'Completed': completedDeliveries,
      },
      labTypes: {
        'Public Cloud': [...labRequests, ...deliveryRequests].filter(r => r.cloud === 'Public Cloud').length,
        'Private Cloud': [...labRequests, ...deliveryRequests].filter(r => r.cloud === 'Private Cloud').length,
        'TP Labs': [...labRequests, ...deliveryRequests].filter(r => r.cloud === 'TP Labs').length,
      }
    };
  };

  const exportToCSV = () => {
    const data = generateKPIData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let csv = 'Dashboard KPI Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'SUMMARY METRICS\n';
    csv += 'Metric,Value\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    csv += '\nSOLUTIONS OVERVIEW\n';
    csv += 'Metric,Count\n';
    Object.entries(data.solutions).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    csv += '\nDELIVERY OVERVIEW\n';
    csv += 'Metric,Count\n';
    Object.entries(data.deliveries).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    csv += '\nLAB TYPE BREAKDOWN\n';
    csv += 'Lab Type,Count\n';
    Object.entries(data.labTypes).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-kpi-report-${timestamp}.csv`;
    link.click();
    
    toast({
      title: 'Export Successful',
      description: 'Dashboard KPI report downloaded as CSV',
    });
  };

  const exportToText = () => {
    const data = generateKPIData();
    const timestamp = new Date().toISOString().split('T')[0];
    
    let text = '═══════════════════════════════════════════════════════\n';
    text += '                  DASHBOARD KPI REPORT\n';
    text += '═══════════════════════════════════════════════════════\n';
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    text += '─────────────────────────────────────────────────────────\n';
    text += '                    SUMMARY METRICS\n';
    text += '─────────────────────────────────────────────────────────\n';
    Object.entries(data.summary).forEach(([key, value]) => {
      text += `${key.padEnd(20)} : ${value}\n`;
    });
    
    text += '\n─────────────────────────────────────────────────────────\n';
    text += '                  SOLUTIONS OVERVIEW\n';
    text += '─────────────────────────────────────────────────────────\n';
    Object.entries(data.solutions).forEach(([key, value]) => {
      text += `${key.padEnd(20)} : ${value}\n`;
    });
    
    text += '\n─────────────────────────────────────────────────────────\n';
    text += '                  DELIVERY OVERVIEW\n';
    text += '─────────────────────────────────────────────────────────\n';
    Object.entries(data.deliveries).forEach(([key, value]) => {
      text += `${key.padEnd(20)} : ${value}\n`;
    });
    
    text += '\n─────────────────────────────────────────────────────────\n';
    text += '                  LAB TYPE BREAKDOWN\n';
    text += '─────────────────────────────────────────────────────────\n';
    Object.entries(data.labTypes).forEach(([key, value]) => {
      text += `${key.padEnd(20)} : ${value}\n`;
    });
    
    text += '\n═══════════════════════════════════════════════════════\n';

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dashboard-kpi-report-${timestamp}.txt`;
    link.click();
    
    toast({
      title: 'Export Successful',
      description: 'Dashboard KPI report downloaded as Text',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export KPIs
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToText} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export as Text Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
