import { useLabRequests } from '@/hooks/useLabRequests';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Download, FileSpreadsheet, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Preview = () => {
  const { requests, deleteRequest, clearAll } = useLabRequests();
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Preview & Export</h1>
                <p className="text-sm text-muted-foreground">
                  {requests.length} {requests.length === 1 ? 'entry' : 'entries'} available
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
            <FileSpreadsheet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
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
            <ScrollArea className="w-full">
              <div className="min-w-[2000px]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="spreadsheet-cell font-semibold text-left">#</th>
                      <th className="spreadsheet-cell font-semibold text-left">Training Name</th>
                      <th className="spreadsheet-cell font-semibold text-left">Client Name</th>
                      <th className="spreadsheet-cell font-semibold text-left">Technology</th>
                      <th className="spreadsheet-cell font-semibold text-center">User Count</th>
                      <th className="spreadsheet-cell font-semibold text-left">Remarks</th>
                      <th className="spreadsheet-cell font-semibold text-left">Month</th>
                      <th className="spreadsheet-cell font-semibold text-left">Cloud</th>
                      <th className="spreadsheet-cell font-semibold text-left">Requester</th>
                      <th className="spreadsheet-cell font-semibold text-left">Agent</th>
                      <th className="spreadsheet-cell font-semibold text-left">Account Manager</th>
                      <th className="spreadsheet-cell font-semibold text-left">Received On</th>
                      <th className="spreadsheet-cell font-semibold text-left">Delivered On</th>
                      <th className="spreadsheet-cell font-semibold text-center">Duration</th>
                      <th className="spreadsheet-cell font-semibold text-right">Input Cost</th>
                      <th className="spreadsheet-cell font-semibold text-right">Shelling Cost</th>
                      <th className="spreadsheet-cell font-semibold text-right">Total Amount</th>
                      <th className="spreadsheet-cell font-semibold text-right">Margin</th>
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
                        <td className="spreadsheet-cell font-medium">{request.labName || '-'}</td>
                        <td className="spreadsheet-cell">{request.client || '-'}</td>
                        <td className="spreadsheet-cell">{request.vendor || '-'}</td>
                        <td className="spreadsheet-cell text-center font-medium bg-accent/30">
                          {request.userCount || 0}
                        </td>
                        <td className="spreadsheet-cell max-w-xs truncate" title={request.remarks}>
                          {request.remarks || '-'}
                        </td>
                        <td className="spreadsheet-cell">{request.month || '-'}</td>
                        <td className="spreadsheet-cell">{request.cloud || '-'}</td>
                        <td className="spreadsheet-cell">{request.requester || '-'}</td>
                        <td className="spreadsheet-cell">{request.agentName || '-'}</td>
                        <td className="spreadsheet-cell">{request.accountManager || '-'}</td>
                        <td className="spreadsheet-cell">{request.receivedOn || '-'}</td>
                        <td className="spreadsheet-cell">{request.deliveredOn || '-'}</td>
                        <td className="spreadsheet-cell text-center">{request.durationInDays || 0}</td>
                        <td className="spreadsheet-cell text-right">₹{request.inputCostPerUser?.toLocaleString() || 0}</td>
                        <td className="spreadsheet-cell text-right">₹{request.shellingCostPerUser?.toLocaleString() || 0}</td>
                        <td className="spreadsheet-cell text-right font-medium">
                          ₹{request.totalAmountForTraining?.toLocaleString() || 0}
                        </td>
                        <td className="spreadsheet-cell text-right">₹{request.margin?.toLocaleString() || 0}</td>
                        <td className="spreadsheet-cell">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                              request.status === 'Completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : request.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : request.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : request.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {request.status || '-'}
                          </span>
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
