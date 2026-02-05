import { useState, useRef } from 'react';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Upload, Cloud, Server, Building2, FileSpreadsheet, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { getStatusBadgeVariant } from '@/lib/statusColors';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

// ADR statuses for delivery filtering
const ADR_STATUSES = ['Delivered', 'Delivery In-Progress', 'Completed'];

const MasterDataSheet = () => {
  const { requests: labRequests, addRequest: addLabRequest } = useLabRequests();
  const { requests: deliveryRequests, addRequest: addDeliveryRequest } = useDeliveryRequests();
  const { toast } = useToast();
  const [activeLabType, setActiveLabType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('solutions');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter delivery requests by ADR statuses only
  const adrDeliveryRequests = deliveryRequests.filter(r => 
    r.labStatus && ADR_STATUSES.includes(r.labStatus)
  );

  // Filter by lab type
  const filterByLabType = <T extends { cloud?: string }>(items: T[], labType: string): T[] => {
    if (labType === 'all') return items;
    return items.filter(item => item.cloud === labType);
  };

  const filteredLabRequests = filterByLabType(labRequests, activeLabType);
  const filteredDeliveryRequests = filterByLabType(adrDeliveryRequests, activeLabType);

  // Count by lab type
  const labTypeCounts = {
    all: { solutions: labRequests.length, delivery: adrDeliveryRequests.length },
    'Public Cloud': { 
      solutions: labRequests.filter(r => r.cloud === 'Public Cloud').length,
      delivery: adrDeliveryRequests.filter(r => r.cloud === 'Public Cloud').length
    },
    'Private Cloud': { 
      solutions: labRequests.filter(r => r.cloud === 'Private Cloud').length,
      delivery: adrDeliveryRequests.filter(r => r.cloud === 'Private Cloud').length
    },
    'TP Labs': { 
      solutions: labRequests.filter(r => r.cloud === 'TP Labs').length,
      delivery: adrDeliveryRequests.filter(r => r.cloud === 'TP Labs').length
    },
  };

  const handleExportCSV = () => {
    const filename = `master-${activeTab}-${activeLabType.replace(/\s+/g, '-').toLowerCase()}`;
    if (activeTab === 'solutions') {
      exportToCSV(filteredLabRequests, filename);
    } else {
      exportToCSV(filteredDeliveryRequests, filename);
    }
    toast({
      title: 'Export Complete',
      description: `Exported ${activeTab === 'solutions' ? filteredLabRequests.length : filteredDeliveryRequests.length} records as CSV.`,
    });
  };

  const handleExportXLS = () => {
    const filename = `master-${activeTab}-${activeLabType.replace(/\s+/g, '-').toLowerCase()}`;
    if (activeTab === 'solutions') {
      exportToXLS(filteredLabRequests, filename);
    } else {
      exportToXLS(filteredDeliveryRequests, filename);
    }
    toast({
      title: 'Export Complete',
      description: `Exported ${activeTab === 'solutions' ? filteredLabRequests.length : filteredDeliveryRequests.length} records as XLS.`,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isXLS = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');

    if (!isCSV && !isXLS) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV or XLS file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: 'Empty File',
          description: 'The file contains no data rows.',
          variant: 'destructive',
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        const currentDate = new Date();
        const month = row.month || currentDate.toLocaleString('default', { month: 'long' });
        const year = parseInt(row.year) || currentDate.getFullYear();

        if (activeTab === 'solutions') {
          await addLabRequest({
            potentialId: row['potential id'] || '',
            freshDeskTicketNumber: row['freshdesk ticket number'] || row['ticket'] || '',
            client: row.client || 'Unknown Client',
            month,
            year,
            cloud: row['lab type'] || row.cloud || '',
            cloudType: row['cloud type'] || '',
            tpLabType: row['tp lab type'] || '',
            labName: row['training name'] || row['lab name'] || '',
            requester: row.requester || '',
            agentName: row['agent name'] || '',
            accountManager: row['account manager'] || '',
            receivedOn: row['received on'] || '',
            labStartDate: row['lab start date'] || row['start date'] || '',
            labEndDate: row['lab end date'] || row['end date'] || '',
            userCount: parseInt(row['user count'] || row.users || '0') || 0,
            durationInDays: parseInt(row['duration'] || row['duration (in days)'] || '0') || 0,
            inputCostPerUser: parseFloat(row['input cost per user'] || '0') || 0,
            sellingCostPerUser: parseFloat(row['selling cost per user'] || '0') || 0,
            totalAmountForTraining: parseFloat(row['total amount'] || row['total amount for training'] || '0') || 0,
            margin: parseFloat(row.margin || '0') || 0,
            status: row.status || 'Solution Pending',
            remarks: row.remarks || '',
            lineOfBusiness: row.lob || row['line of business'] || '',
            invoiceDetails: row['invoice details'] || '',
          });
        } else {
          await addDeliveryRequest({
            potentialId: row['potential id'] || '',
            freshDeskTicketNumber: row['freshdesk ticket number'] || row['ticket'] || '',
            trainingName: row['training name'] || '',
            numberOfUsers: parseInt(row['number of users'] || row['user count'] || row.users || '0') || 0,
            client: row.client || 'Unknown Client',
            month,
            year,
            receivedOn: row['received on'] || '',
            cloud: row['lab type'] || row.cloud || '',
            cloudType: row['cloud type'] || '',
            tpLabType: row['tp lab type'] || '',
            labName: row['lab name'] || '',
            requester: row.requester || '',
            agentName: row['agent name'] || '',
            accountManager: row['account manager'] || '',
            labStatus: row.status || row['lab status'] || 'Pending',
            labType: row['lab type category'] || '',
            startDate: row['start date'] || '',
            endDate: row['end date'] || '',
            labSetupRequirement: row['lab setup requirement'] || '',
            inputCostPerUser: parseFloat(row['input cost per user'] || '0') || 0,
            sellingCostPerUser: parseFloat(row['selling cost per user'] || '0') || 0,
            totalAmount: parseFloat(row['total amount'] || '0') || 0,
            lineOfBusiness: row.lob || row['line of business'] || '',
            invoiceDetails: row['invoice details'] || '',
          });
        }
        importedCount++;
      }

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${importedCount} ${activeTab} records.`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: 'There was an error processing the file.',
        variant: 'destructive',
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getLabTypeIcon = (labType: string) => {
    switch (labType) {
      case 'Public Cloud': return <Cloud className="w-4 h-4" />;
      case 'Private Cloud': return <Server className="w-4 h-4" />;
      case 'TP Labs': return <Building2 className="w-4 h-4" />;
      default: return <FileSpreadsheet className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img src={logo} alt="MakeMyLabs" className="h-8 object-contain" />
              <div className="hidden sm:block">
                <h1 className="font-semibold">Master Data Sheet</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredLabRequests.length} Solutions • {filteredDeliveryRequests.length} Delivery Records
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".csv,.xls,.xlsx"
                className="hidden"
              />
              <Button variant="outline" onClick={handleImportClick}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" disabled={(activeTab === 'solutions' ? filteredLabRequests.length : filteredDeliveryRequests.length) === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportXLS}>
                    Export as XLS
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Lab Type Filter Tabs */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Filter by Lab Type:</span>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Public Cloud', 'Private Cloud', 'TP Labs'].map((labType) => {
              const counts = labTypeCounts[labType as keyof typeof labTypeCounts];
              const total = counts.solutions + counts.delivery;
              return (
                <Button
                  key={labType}
                  variant={activeLabType === labType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveLabType(labType)}
                  className="gap-2"
                >
                  {getLabTypeIcon(labType)}
                  {labType === 'all' ? 'All' : labType}
                  <Badge variant="secondary" className="ml-1">
                    {total}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Data Classification Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="solutions" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Solutions ({filteredLabRequests.length})
            </TabsTrigger>
            <TabsTrigger value="delivery" className="gap-2">
              <Package className="w-4 h-4" />
              Delivery ({filteredDeliveryRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Solutions Table */}
          <TabsContent value="solutions">
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Solutions Requests
                  {activeLabType !== 'all' && (
                    <Badge variant="outline">{activeLabType}</Badge>
                  )}
                </h2>
              </div>
              <ScrollArea className="w-full">
                <div className="min-w-[1200px]">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="p-3 text-left font-semibold">#</th>
                        <th className="p-3 text-left font-semibold">Client</th>
                        <th className="p-3 text-left font-semibold">Training Name</th>
                        <th className="p-3 text-left font-semibold">Lab Type</th>
                        <th className="p-3 text-left font-semibold">Month/Year</th>
                        <th className="p-3 text-center font-semibold">Users</th>
                        <th className="p-3 text-right font-semibold">Total Amount</th>
                        <th className="p-3 text-right font-semibold">Margin</th>
                        <th className="p-3 text-left font-semibold">Status</th>
                        <th className="p-3 text-left font-semibold">LOB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLabRequests.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-8 text-center text-muted-foreground">
                            No solutions records found
                          </td>
                        </tr>
                      ) : (
                        filteredLabRequests.map((request, index) => (
                          <tr key={request.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-medium">{request.client}</td>
                            <td className="p-3">{request.labName || '-'}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getLabTypeIcon(request.cloud || '')}
                                {request.cloud || '-'}
                              </div>
                            </td>
                            <td className="p-3">{request.month} {request.year}</td>
                            <td className="p-3 text-center">{request.userCount || 0}</td>
                            <td className="p-3 text-right font-medium">
                              {formatINR(request.totalAmountForTraining || 0)}
                            </td>
                            <td className="p-3 text-right">
                              {formatPercentage(request.margin || 0)}
                            </td>
                            <td className="p-3">
                              <Badge variant={getStatusBadgeVariant(request.status || '')}>
                                {request.status || '-'}
                              </Badge>
                            </td>
                            <td className="p-3">{request.lineOfBusiness || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Delivery Table */}
          <TabsContent value="delivery">
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Delivery Requests
                  {activeLabType !== 'all' && (
                    <Badge variant="outline">{activeLabType}</Badge>
                  )}
                  <Badge className="bg-primary/10 text-primary ml-2">
                    Status: Delivered, Delivery In-Progress, Completed
                  </Badge>
                </h2>
              </div>
              <ScrollArea className="w-full">
                <div className="min-w-[1200px]">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="p-3 text-left font-semibold">#</th>
                        <th className="p-3 text-left font-semibold">Client</th>
                        <th className="p-3 text-left font-semibold">Training Name</th>
                        <th className="p-3 text-left font-semibold">Lab Type</th>
                        <th className="p-3 text-left font-semibold">Month/Year</th>
                        <th className="p-3 text-center font-semibold">Users</th>
                        <th className="p-3 text-left font-semibold">Start Date</th>
                        <th className="p-3 text-left font-semibold">End Date</th>
                        <th className="p-3 text-right font-semibold">Total Amount</th>
                        <th className="p-3 text-left font-semibold">Status</th>
                        <th className="p-3 text-left font-semibold">LOB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveryRequests.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="p-8 text-center text-muted-foreground">
                            No delivery records found
                          </td>
                        </tr>
                      ) : (
                        filteredDeliveryRequests.map((request, index) => (
                          <tr key={request.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3 font-medium">{request.client}</td>
                            <td className="p-3">{request.trainingName || '-'}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getLabTypeIcon(request.cloud || '')}
                                {request.cloud || '-'}
                              </div>
                            </td>
                            <td className="p-3">{request.month} {request.year}</td>
                            <td className="p-3 text-center">{request.numberOfUsers || 0}</td>
                            <td className="p-3">{request.startDate || '-'}</td>
                            <td className="p-3">{request.endDate || '-'}</td>
                            <td className="p-3 text-right font-medium">
                              {formatINR(request.totalAmount || 0)}
                            </td>
                            <td className="p-3">
                              <Badge variant={getStatusBadgeVariant(request.labStatus || '')}>
                                {request.labStatus || '-'}
                              </Badge>
                            </td>
                            <td className="p-3">{request.lineOfBusiness || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MasterDataSheet;
