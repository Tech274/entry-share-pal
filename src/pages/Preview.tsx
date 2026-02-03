import { useLabRequests } from '@/hooks/useLabRequests';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Download, ArrowLeft, Trash2, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableCell } from '@/components/EditableCell';
import { LabRequest, CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS, STATUS_OPTIONS, MONTH_OPTIONS, LOB_OPTIONS } from '@/types/labRequest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

const Preview = () => {
  const { requests, updateRequest, deleteRequest, clearAll } = useLabRequests();
  const { toast } = useToast();

  const handleExportCSV = () => {
    if (requests.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no entries to export.',
        variant: 'destructive',
      });
      return;
    }
    exportToCSV(requests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as CSV.',
    });
  };

  const handleExportXLS = () => {
    if (requests.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no entries to export.',
        variant: 'destructive',
      });
      return;
    }
    exportToXLS(requests);
    toast({
      title: 'Export Complete',
      description: 'Your data has been exported as XLS.',
    });
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    toast({
      title: 'Entry Deleted',
      description: 'The request has been removed.',
      variant: 'destructive',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
      clearAll();
      toast({
        title: 'All Entries Cleared',
        description: 'All lab requests have been removed.',
        variant: 'destructive',
      });
    }
  };

  const handleCellUpdate = (id: string, field: keyof LabRequest, value: string | number) => {
    updateRequest(id, { [field]: value });
    toast({
      title: 'Updated',
      description: 'Cell value has been saved.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <img src={logo} alt="MakeMyLabs" className="h-8 object-contain" />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  {requests.length} {requests.length === 1 ? 'entry' : 'entries'} • Double-click to edit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" disabled={requests.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportXLS}>
                    Export as XLS (Excel)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {requests.length > 0 && (
                <Button variant="destructive" size="icon" onClick={handleClearAll} title="Clear all entries">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spreadsheet View */}
      <main className="container mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <Table className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Start by adding lab requests to see them here.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Entry Form
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <ScrollArea className="w-full max-h-[calc(100vh-200px)]">
              <div className="min-w-[2400px]">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-primary text-primary-foreground">
                      <th className="spreadsheet-cell font-semibold text-left">#</th>
                      <th className="spreadsheet-cell font-semibold text-left">Potential ID</th>
                      <th className="spreadsheet-cell font-semibold text-left">Training Name</th>
                      <th className="spreadsheet-cell font-semibold text-left">Client Name</th>
                      <th className="spreadsheet-cell font-semibold text-left">LOB</th>
                      <th className="spreadsheet-cell font-semibold text-center">User Count</th>
                      <th className="spreadsheet-cell font-semibold text-left">Remarks</th>
                      <th className="spreadsheet-cell font-semibold text-left">Month</th>
                      <th className="spreadsheet-cell font-semibold text-left">Lab Type</th>
                      <th className="spreadsheet-cell font-semibold text-left">Cloud Type</th>
                      <th className="spreadsheet-cell font-semibold text-left">TP Lab Type</th>
                      <th className="spreadsheet-cell font-semibold text-left">Requester</th>
                      <th className="spreadsheet-cell font-semibold text-left">Agent</th>
                      <th className="spreadsheet-cell font-semibold text-left">Account Manager</th>
                      <th className="spreadsheet-cell font-semibold text-left">Received On</th>
                      <th className="spreadsheet-cell font-semibold text-left">Lab Start Date</th>
                      <th className="spreadsheet-cell font-semibold text-left">Lab End Date</th>
                      <th className="spreadsheet-cell font-semibold text-center">Duration</th>
                      <th className="spreadsheet-cell font-semibold text-right">Input Cost</th>
                      <th className="spreadsheet-cell font-semibold text-right">Selling Cost</th>
                      <th className="spreadsheet-cell font-semibold text-right">Total Amount</th>
                      <th className="spreadsheet-cell font-semibold text-right">Margin %</th>
                      <th className="spreadsheet-cell font-semibold text-left">Status</th>
                      <th className="spreadsheet-cell font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request, index) => (
                      <tr
                        key={request.id}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <td className="spreadsheet-cell text-muted-foreground">{index + 1}</td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.potentialId}
                            onSave={(v) => handleCellUpdate(request.id, 'potentialId', v)}
                            className="font-medium"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.labName}
                            onSave={(v) => handleCellUpdate(request.id, 'labName', v)}
                            className="font-medium"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.client}
                            onSave={(v) => handleCellUpdate(request.id, 'client', v)}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.lineOfBusiness}
                            onSave={(v) => handleCellUpdate(request.id, 'lineOfBusiness', v)}
                            type="select"
                            options={LOB_OPTIONS}
                          />
                        </td>
                        <td className="spreadsheet-cell bg-accent/30">
                          <EditableCell
                            value={request.userCount}
                            onSave={(v) => handleCellUpdate(request.id, 'userCount', v)}
                            type="number"
                            align="center"
                            className="font-medium"
                          />
                        </td>
                        <td className="spreadsheet-cell max-w-xs">
                          <EditableCell
                            value={request.remarks}
                            onSave={(v) => handleCellUpdate(request.id, 'remarks', v)}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.month}
                            onSave={(v) => handleCellUpdate(request.id, 'month', v)}
                            type="select"
                            options={MONTH_OPTIONS}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.cloud}
                            onSave={(v) => handleCellUpdate(request.id, 'cloud', v)}
                            type="select"
                            options={CLOUD_OPTIONS}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          {request.cloud === 'Public Cloud' ? (
                            <EditableCell
                              value={request.cloudType || ''}
                              onSave={(v) => handleCellUpdate(request.id, 'cloudType', v)}
                              type="select"
                              options={CLOUD_TYPE_OPTIONS}
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="spreadsheet-cell">
                          {request.cloud === 'TP Labs' ? (
                            <EditableCell
                              value={request.tpLabType || ''}
                              onSave={(v) => handleCellUpdate(request.id, 'tpLabType', v)}
                              type="select"
                              options={TP_LAB_TYPE_OPTIONS}
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.requester}
                            onSave={(v) => handleCellUpdate(request.id, 'requester', v)}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.agentName}
                            onSave={(v) => handleCellUpdate(request.id, 'agentName', v)}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.accountManager}
                            onSave={(v) => handleCellUpdate(request.id, 'accountManager', v)}
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.receivedOn}
                            onSave={(v) => handleCellUpdate(request.id, 'receivedOn', v)}
                            type="date"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.labStartDate}
                            onSave={(v) => handleCellUpdate(request.id, 'labStartDate', v)}
                            type="date"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.labEndDate}
                            onSave={(v) => handleCellUpdate(request.id, 'labEndDate', v)}
                            type="date"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.durationInDays}
                            onSave={(v) => handleCellUpdate(request.id, 'durationInDays', v)}
                            type="number"
                            align="center"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.inputCostPerUser}
                            onSave={(v) => handleCellUpdate(request.id, 'inputCostPerUser', v)}
                            type="number"
                            align="right"
                            prefix="₹"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.sellingCostPerUser}
                            onSave={(v) => handleCellUpdate(request.id, 'sellingCostPerUser', v)}
                            type="number"
                            align="right"
                            prefix="₹"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.totalAmountForTraining}
                            onSave={(v) => handleCellUpdate(request.id, 'totalAmountForTraining', v)}
                            type="number"
                            align="right"
                            prefix="₹"
                            className="font-medium"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.margin}
                            onSave={(v) => handleCellUpdate(request.id, 'margin', v)}
                            type="number"
                            align="right"
                            suffix="%"
                          />
                        </td>
                        <td className="spreadsheet-cell">
                          <EditableCell
                            value={request.status}
                            onSave={(v) => handleCellUpdate(request.id, 'status', v)}
                            type="select"
                            options={STATUS_OPTIONS}
                          />
                        </td>
                        <td className="spreadsheet-cell text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  );
};

export default Preview;
