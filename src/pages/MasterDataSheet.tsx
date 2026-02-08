import { useState, useRef } from 'react';
import { useLabRequests } from '@/hooks/useLabRequests';
import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useAgents, useAccountManagers, useClients, useSolutionManagers, useDeliveryManagers } from '@/hooks/usePersonnel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Download, Upload, Cloud, Server, Building2, FileSpreadsheet, Package, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { getStatusBadgeVariant } from '@/lib/statusColors';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { AIDataEditBar } from '@/components/AIDataEditBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

// ADR statuses for delivery filtering
const ADR_STATUSES = ['Delivered', 'Delivery In-Progress', 'Delivery Completed', 'Completed'];

// Resolve text values to personnel IDs (match by name, case-insensitive)
function resolvePersonnelIds(
  clientName: string,
  agentName: string,
  accountManagerName: string,
  requesterName: string,
  clients: { id: string; name: string }[],
  agents: { id: string; name: string }[],
  accountManagers: { id: string; name: string }[],
  requesters: { id: string; name: string }[]
) {
  const byName = (arr: { id: string; name: string }[], name: string) =>
    arr.find((x) => name && x.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null;
  return {
    clientId: byName(clients, clientName),
    agentId: byName(agents, agentName),
    accountManagerId: byName(accountManagers, accountManagerName),
    requesterId: byName(requesters, requesterName),
  };
}

const MasterDataSheet = () => {
  const { requests: labRequests, addRequest: addLabRequest, refetch: refetchLabRequests } = useLabRequests();
  const { requests: deliveryRequests, addRequest: addDeliveryRequest, refetch: refetchDeliveryRequests } = useDeliveryRequests();
  const { data: clients = [] } = useClients();
  const { data: agents = [] } = useAgents();
  const { data: accountManagers = [] } = useAccountManagers();
  const { data: solutionManagers = [] } = useSolutionManagers();
  const { data: deliveryManagers = [] } = useDeliveryManagers();
  const { toast } = useToast();
  const [activeLabType, setActiveLabType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('solutions');
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Helper to parse CSV line with quote handling
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
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

    setIsProcessing(true);
    
    toast({
      title: 'AI Processing',
      description: 'Analyzing and auto-correcting your data...',
    });

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: 'Empty File',
          description: 'The file contains no data rows.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Parse headers and rows
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx]?.trim().replace(/^"|"$/g, '') || '';
        });
        rows.push(row);
      }

      // Call AI autocorrect edge function for Delivery records
      if (activeTab === 'delivery') {
        const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-csv-autocorrect', {
          body: { headers, rows }
        });

        if (aiError) {
          console.error('AI autocorrect error:', aiError);
          throw new Error('AI processing failed.');
        }

        if (aiResult?.success && aiResult?.correctedRows) {
          let importedCount = 0;

          for (const row of aiResult.correctedRows) {
            const ids = resolvePersonnelIds(
              row.client || '',
              row.agentName || '',
              row.accountManager || '',
              row.requester || '',
              clients,
              agents,
              accountManagers,
              deliveryManagers
            );

            await addDeliveryRequest({
              potentialId: row.potentialId || '',
              freshDeskTicketNumber: row.freshDeskTicketNumber || '',
              trainingName: row.trainingName || row.labName || '',
              numberOfUsers: row.numberOfUsers || 0,
              client: row.client || 'Unknown Client',
              clientId: ids.clientId,
              month: row.month,
              year: row.year,
              receivedOn: row.receivedOn || '',
              cloud: row.cloud || '',
              cloudType: row.cloudType || '',
              tpLabType: row.tpLabType || '',
              labName: row.labName || row.trainingName || '',
              requester: row.requester || '',
              requesterId: ids.requesterId,
              agentName: row.agentName || '',
              agentId: ids.agentId,
              accountManager: row.accountManager || '',
              accountManagerId: ids.accountManagerId,
              labStatus: row.labStatus || 'Delivered',
              labType: row.labType || '',
              startDate: row.startDate || '',
              endDate: row.endDate || '',
              labSetupRequirement: row.labSetupRequirement || '',
              inputCostPerUser: row.inputCostPerUser || 0,
              sellingCostPerUser: row.sellingCostPerUser || 0,
              totalAmount: row.totalAmount || 0,
              lineOfBusiness: row.lineOfBusiness || '',
              invoiceDetails: row.invoiceDetails || '',
            });
            importedCount++;
          }

          // Show AI corrections summary
          if (aiResult.corrections && aiResult.corrections.length > 0) {
            toast({
              title: 'AI Auto-Corrections Applied',
              description: aiResult.corrections.slice(0, 3).join(' • '),
            });
          }

          toast({
            title: 'Import Complete',
            description: `Successfully imported ${importedCount} delivery records with AI corrections.`,
          });
        }
      } else {
        // Solutions import (standard processing)
        let importedCount = 0;
        const headersLower = headers.map(h => h.toLowerCase());

        for (const row of rows) {
          const rowLower: Record<string, string> = {};
          Object.keys(row).forEach(k => {
            rowLower[k.toLowerCase()] = row[k];
          });

          const clientName = rowLower.client || 'Unknown Client';
          const agentName = rowLower['agent name'] || '';
          const accountManagerName = rowLower['account manager'] || '';
          const requesterName = rowLower.requester || '';

          const ids = resolvePersonnelIds(
            clientName,
            agentName,
            accountManagerName,
            requesterName,
            clients,
            agents,
            accountManagers,
            solutionManagers
          );

          const currentDate = new Date();
          const month = rowLower.month || currentDate.toLocaleString('default', { month: 'long' });
          const year = parseInt(rowLower.year) || currentDate.getFullYear();

          await addLabRequest({
            potentialId: rowLower['potential id'] || '',
            freshDeskTicketNumber: rowLower['freshdesk ticket number'] || rowLower['ticket'] || '',
            client: clientName,
            clientId: ids.clientId,
            month,
            year,
            cloud: rowLower['lab type'] || rowLower.cloud || '',
            cloudType: rowLower['cloud type'] || '',
            tpLabType: rowLower['tp lab type'] || '',
            labName: rowLower['training name'] || rowLower['lab name'] || '',
            requester: requesterName,
            requesterId: ids.requesterId,
            agentName,
            agentId: ids.agentId,
            accountManager: accountManagerName,
            accountManagerId: ids.accountManagerId,
            receivedOn: rowLower['received on'] || '',
            labStartDate: rowLower['lab start date'] || rowLower['start date'] || '',
            labEndDate: rowLower['lab end date'] || rowLower['end date'] || '',
            userCount: parseInt(rowLower['user count'] || rowLower.users || '0') || 0,
            durationInDays: parseInt(rowLower['duration'] || rowLower['duration (in days)'] || '0') || 0,
            inputCostPerUser: parseFloat(rowLower['input cost per user'] || '0') || 0,
            sellingCostPerUser: parseFloat(rowLower['selling cost per user'] || '0') || 0,
            totalAmountForTraining: parseFloat(rowLower['total amount'] || rowLower['total amount for training'] || '0') || 0,
            margin: parseFloat(rowLower.margin || '0') || 0,
            status: rowLower.status || 'Solution Pending',
            remarks: rowLower.remarks || '',
            lineOfBusiness: rowLower.lob || rowLower['line of business'] || '',
            invoiceDetails: rowLower['invoice details'] || '',
          });
          importedCount++;
        }

        toast({
          title: 'Import Complete',
          description: `Successfully imported ${importedCount} solutions records.`,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'There was an error processing the file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
                disabled={isProcessing}
              />
              <Button variant="outline" onClick={handleImportClick} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <Upload className="w-4 h-4 mr-2" />
                    AI Import
                  </>
                )}
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
            {/* AI Edit Bar for Solutions */}
            <div className="mb-4">
              <AIDataEditBar 
                tableType="lab_requests" 
                onEditComplete={refetchLabRequests}
                recordCount={filteredLabRequests.length}
              />
            </div>
            
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
              <ScrollArea className="w-full h-[calc(100vh-450px)]">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-primary text-primary-foreground">
                      <th className="p-3 text-left font-semibold w-[40px]">#</th>
                      <th className="p-3 text-left font-semibold">Client</th>
                      <th className="p-3 text-left font-semibold">Lab Name</th>
                      <th className="p-3 text-left font-semibold">Lab Type</th>
                      <th className="p-3 text-left font-semibold">Period</th>
                      <th className="p-3 text-center font-semibold">Users</th>
                      <th className="p-3 text-right font-semibold">Total Amount</th>
                      <th className="p-3 text-right font-semibold">Margin</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLabRequests.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-muted-foreground">
                          No solutions records found
                        </td>
                      </tr>
                    ) : (
                      filteredLabRequests.map((request, index) => (
                        <tr key={request.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium truncate">{request.client}</td>
                          <td className="p-3 truncate">{request.labName || '-'}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getLabTypeIcon(request.cloud || '')}
                              <span className="truncate">{request.cloud || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3 truncate">{request.month} {request.year}</td>
                          <td className="p-3 text-center">{request.userCount || 0}</td>
                          <td className="p-3 text-right font-medium">
                            {formatINR(request.totalAmountForTraining || 0)}
                          </td>
                          <td className="p-3 text-right">
                            {formatPercentage(request.margin || 0)}
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusBadgeVariant(request.status || '')} className="text-xs">
                              {request.status || '-'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Delivery Table */}
          <TabsContent value="delivery">
            {/* AI Edit Bar for Delivery */}
            <div className="mb-4">
              <AIDataEditBar 
                tableType="delivery" 
                onEditComplete={refetchDeliveryRequests}
                recordCount={filteredDeliveryRequests.length}
              />
            </div>
            
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="p-4 border-b bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Delivery Requests
                  {activeLabType !== 'all' && (
                    <Badge variant="outline">{activeLabType}</Badge>
                  )}
                  <Badge className="bg-primary/10 text-primary ml-2">
                    Status: Delivered, Delivery In-Progress, Delivery Completed
                  </Badge>
                </h2>
              </div>
              <ScrollArea className="w-full h-[calc(100vh-450px)]">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-primary text-primary-foreground">
                      <th className="p-3 text-left font-semibold w-[40px]">#</th>
                      <th className="p-3 text-left font-semibold">Client</th>
                      <th className="p-3 text-left font-semibold">Training Name</th>
                      <th className="p-3 text-left font-semibold">Lab Type</th>
                      <th className="p-3 text-left font-semibold">Period</th>
                      <th className="p-3 text-center font-semibold">Users</th>
                      <th className="p-3 text-left font-semibold">Start Date</th>
                      <th className="p-3 text-left font-semibold">End Date</th>
                      <th className="p-3 text-right font-semibold">Total Amount</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveryRequests.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-muted-foreground">
                          No delivery records found
                        </td>
                      </tr>
                    ) : (
                      filteredDeliveryRequests.map((request, index) => (
                        <tr key={request.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium truncate">{request.client}</td>
                          <td className="p-3 truncate">{request.trainingName || '-'}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {getLabTypeIcon(request.cloud || '')}
                              <span className="truncate">{request.cloud || '-'}</span>
                            </div>
                          </td>
                          <td className="p-3 truncate">{request.month} {request.year}</td>
                          <td className="p-3 text-center">{request.numberOfUsers || 0}</td>
                          <td className="p-3 truncate">{request.startDate || '-'}</td>
                          <td className="p-3 truncate">{request.endDate || '-'}</td>
                          <td className="p-3 text-right font-medium">
                            {formatINR(request.totalAmount || 0)}
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusBadgeVariant(request.labStatus || '')} className="text-xs">
                              {request.labStatus || '-'}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MasterDataSheet;
