import { useDeliveryRequests } from '@/hooks/useDeliveryRequests';
import { useSpreadsheetControls } from '@/hooks/useSpreadsheetControls';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useSpreadsheetKeyboardShortcuts } from '@/hooks/useSpreadsheetKeyboardShortcuts';
import { exportToCSV, exportToXLS } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Download, ArrowLeft, Trash2, Table, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditableCell } from '@/components/EditableCell';
import { SpreadsheetToolbar } from '@/components/SpreadsheetToolbar';
import { SortableHeader } from '@/components/SortableHeader';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { BulkUploadDialog } from '@/components/BulkUploadDialog';
import { AssigneeDropdown } from '@/components/assignment/AssigneeDropdown';
import { DeliveryRequest, LINE_OF_BUSINESS_OPTIONS, MONTH_OPTIONS, LAB_STATUS_OPTIONS, LAB_TYPE_OPTIONS, CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS } from '@/types/deliveryRequest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

// CSV template headers for Delivery
const DELIVERY_CSV_HEADERS = [
  'Potential ID', 'Training Name', 'Client', 'Month', 'Year', 'LOB', 
  'Users', 'Lab Status', 'Start Date', 'End Date',
  'Input Cost', 'Selling Cost', 'Invoice Details'
];

// Parse CSV row to DeliveryRequest
const parseDeliveryRequestRow = (row: Record<string, string | number>): Omit<DeliveryRequest, 'id' | 'createdAt'> | null => {
  const client = String(row['Client'] || '').trim();
  const month = String(row['Month'] || '').trim();
  
  if (!client || !month) return null;

  return {
    potentialId: String(row['Potential ID'] || ''),
    freshDeskTicketNumber: '',
    trainingName: String(row['Training Name'] || ''),
    client,
    month,
    year: Number(row['Year']) || new Date().getFullYear(),
    cloud: '',
    cloudType: '',
    tpLabType: '',
    lineOfBusiness: String(row['LOB'] || ''),
    numberOfUsers: Number(row['Users']) || 0,
    labStatus: String(row['Lab Status'] || 'Pending'),
    labType: '',
    startDate: String(row['Start Date'] || ''),
    endDate: String(row['End Date'] || ''),
    requester: '',
    agentName: '',
    accountManager: '',
    inputCostPerUser: Number(row['Input Cost']) || 0,
    sellingCostPerUser: Number(row['Selling Cost']) || 0,
    totalAmount: 0,
    labSetupRequirement: '',
    invoiceDetails: String(row['Invoice Details'] || ''),
    receivedOn: '',
    labName: '',
  };
};

const DeliveryPreview = () => {
  const { requests, updateRequest, deleteRequest, clearAll, bulkDelete, bulkUpdateStatus, bulkInsert } = useDeliveryRequests();
  const { toast } = useToast();
  
  const {
    columns,
    visibleColumns,
    sortField,
    sortDirection,
    filters,
    filteredAndSortedRequests,
    activeFilterCount,
    hiddenColumnCount,
    toggleColumnVisibility,
    handleSort,
    updateFilter,
    clearFilters,
    resetColumns,
  } = useSpreadsheetControls(requests, 'delivery');

  const {
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelection,
    toggleSelectAll,
    selectAll,
    deselectAll,
    selectedIds,
  } = useBulkSelection(filteredAndSortedRequests);

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected records? This cannot be undone.`)) {
      const ids = Array.from(selectedIds);
      const success = await bulkDelete(ids);
      if (success) {
        toast({
          title: 'Bulk Delete Complete',
          description: `${ids.length} records deleted successfully.`,
          variant: 'destructive',
        });
        deselectAll();
      }
    }
  };

  // Keyboard shortcuts
  useSpreadsheetKeyboardShortcuts({
    onSelectAll: selectAll,
    onDeselectAll: deselectAll,
    onDelete: handleBulkDelete,
    selectedCount,
    isEnabled: requests.length > 0,
  });

  const handleExportCSV = () => {
    if (filteredAndSortedRequests.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no entries to export.',
        variant: 'destructive',
      });
      return;
    }
    exportToCSV(filteredAndSortedRequests as DeliveryRequest[], 'delivery-requests');
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredAndSortedRequests.length} entries as CSV.`,
    });
  };

  const handleExportXLS = () => {
    if (filteredAndSortedRequests.length === 0) {
      toast({
        title: 'No Data',
        description: 'There are no entries to export.',
        variant: 'destructive',
      });
      return;
    }
    exportToXLS(filteredAndSortedRequests as DeliveryRequest[], 'delivery-requests');
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredAndSortedRequests.length} entries as XLS.`,
    });
  };

  const handleDelete = (id: string) => {
    deleteRequest(id);
    toast({
      title: 'Entry Deleted',
      description: 'The delivery request has been removed.',
      variant: 'destructive',
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all entries? This cannot be undone.')) {
      clearAll();
      toast({
        title: 'All Entries Cleared',
        description: 'All delivery requests have been removed.',
        variant: 'destructive',
      });
    }
  };

  const handleCellUpdate = (id: string, field: keyof DeliveryRequest, value: string | number) => {
    updateRequest(id, { [field]: value });
    toast({
      title: 'Updated',
      description: 'Cell value has been saved.',
    });
  };

  const handleBulkStatusUpdate = async (status: string) => {
    const ids = Array.from(selectedIds);
    const success = await bulkUpdateStatus(ids, status);
    if (success) {
      toast({
        title: 'Status Updated',
        description: `${ids.length} records updated to "${status}".`,
      });
      deselectAll();
    }
  };

  const handleBulkUpload = async (data: Omit<DeliveryRequest, 'id' | 'createdAt'>[]) => {
    await bulkInsert(data);
  };

  const isColumnVisible = (columnId: string) => 
    visibleColumns.some(col => col.id === columnId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-20">
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
                  Delivery • {filteredAndSortedRequests.length} of {requests.length} {requests.length === 1 ? 'entry' : 'entries'}
                  {activeFilterCount > 0 && ' (filtered)'}
                  • Double-click to edit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BulkUploadDialog
                title="Import Delivery Requests from CSV"
                description="Upload a CSV file to bulk import delivery records. Download the template for the correct format."
                templateHeaders={DELIVERY_CSV_HEADERS}
                onUpload={handleBulkUpload}
                parseRow={parseDeliveryRequestRow}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </Button>
                }
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" disabled={filteredAndSortedRequests.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
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
            <h2 className="text-xl font-semibold mb-2">No Delivery Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Start by adding delivery requests or import from CSV.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Entry Form
                </Button>
              </Link>
              <BulkUploadDialog
                title="Import Delivery Requests from CSV"
                description="Upload a CSV file to bulk import delivery records. Download the template for the correct format."
                templateHeaders={DELIVERY_CSV_HEADERS}
                onUpload={handleBulkUpload}
                parseRow={parseDeliveryRequestRow}
              />
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            {/* Bulk Actions Bar */}
            <BulkActionsBar
              selectedCount={selectedCount}
              selectedIds={Array.from(selectedIds)}
              statusOptions={LAB_STATUS_OPTIONS}
              requestType="delivery"
              onUpdateStatus={handleBulkStatusUpdate}
              onDelete={handleBulkDelete}
              onDeselectAll={deselectAll}
            />

            {/* Toolbar with Filters and Column Visibility */}
            <SpreadsheetToolbar
              columns={columns}
              filters={filters}
              activeFilterCount={activeFilterCount}
              hiddenColumnCount={hiddenColumnCount}
              onToggleColumn={toggleColumnVisibility}
              onUpdateFilter={updateFilter}
              onClearFilters={clearFilters}
              onResetColumns={resetColumns}
              type="delivery"
            />

            <ScrollArea className="w-full max-h-[calc(100vh-280px)]">
              <div className="min-w-[2400px]">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-primary text-primary-foreground">
                      {/* Select All Checkbox */}
                      <th className="spreadsheet-cell w-10">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
                          className="border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                          aria-label="Select all"
                          {...(isSomeSelected ? { 'data-state': 'indeterminate' } : {})}
                        />
                      </th>
                      {isColumnVisible('index') && (
                        <th className="spreadsheet-cell font-semibold text-left">#</th>
                      )}
                      {isColumnVisible('potentialId') && (
                        <SortableHeader
                          label="Potential ID"
                          field="potentialId"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('freshDeskTicketNumber') && (
                        <SortableHeader
                          label="Ticket #"
                          field="freshDeskTicketNumber"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('trainingName') && (
                        <SortableHeader
                          label="Training Name"
                          field="trainingName"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('client') && (
                        <SortableHeader
                          label="Client"
                          field="client"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('lineOfBusiness') && (
                        <SortableHeader
                          label="LOB"
                          field="lineOfBusiness"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('numberOfUsers') && (
                        <SortableHeader
                          label="Users"
                          field="numberOfUsers"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="center"
                        />
                      )}
                      {isColumnVisible('month') && (
                        <SortableHeader
                          label="Month"
                          field="month"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('cloud') && (
                        <SortableHeader
                          label="Cloud"
                          field="cloud"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('cloudType') && (
                        <SortableHeader
                          label="Cloud Type"
                          field="cloudType"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('tpLabType') && (
                        <SortableHeader
                          label="TP Lab Type"
                          field="tpLabType"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('labStatus') && (
                        <SortableHeader
                          label="Lab Status"
                          field="labStatus"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('labType') && (
                        <SortableHeader
                          label="Lab Type"
                          field="labType"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('startDate') && (
                        <SortableHeader
                          label="Start Date"
                          field="startDate"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('endDate') && (
                        <SortableHeader
                          label="End Date"
                          field="endDate"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('requester') && (
                        <SortableHeader
                          label="Requester"
                          field="requester"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('agentName') && (
                        <SortableHeader
                          label="Agent"
                          field="agentName"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('accountManager') && (
                        <SortableHeader
                          label="Account Manager"
                          field="accountManager"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('inputCostPerUser') && (
                        <SortableHeader
                          label="Input Cost"
                          field="inputCostPerUser"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                      )}
                      {isColumnVisible('sellingCostPerUser') && (
                        <SortableHeader
                          label="Selling Cost"
                          field="sellingCostPerUser"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                      )}
                      {isColumnVisible('totalAmount') && (
                        <SortableHeader
                          label="Total Amount"
                          field="totalAmount"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                      )}
                      {isColumnVisible('invoiceDetails') && (
                        <th className="spreadsheet-cell font-semibold text-left">Invoice Details</th>
                      )}
                      <th className="spreadsheet-cell font-semibold text-left">Assignee</th>
                      {isColumnVisible('actions') && (
                        <th className="spreadsheet-cell font-semibold text-center">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredAndSortedRequests as DeliveryRequest[]).map((request, index) => (
                      <tr
                        key={request.id}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        } ${isSelected(request.id) ? 'bg-primary/10' : ''}`}
                      >
                        {/* Row Selection Checkbox */}
                        <td className="spreadsheet-cell">
                          <Checkbox
                            checked={isSelected(request.id)}
                            onCheckedChange={() => toggleSelection(request.id)}
                            aria-label={`Select row ${index + 1}`}
                          />
                        </td>
                        {isColumnVisible('index') && (
                          <td className="spreadsheet-cell text-muted-foreground">{index + 1}</td>
                        )}
                        {isColumnVisible('potentialId') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.potentialId}
                              onSave={(v) => handleCellUpdate(request.id, 'potentialId', v)}
                              className="font-medium"
                            />
                          </td>
                        )}
                        {isColumnVisible('freshDeskTicketNumber') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.freshDeskTicketNumber}
                              onSave={(v) => handleCellUpdate(request.id, 'freshDeskTicketNumber', v)}
                            />
                          </td>
                        )}
                        {isColumnVisible('trainingName') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.trainingName}
                              onSave={(v) => handleCellUpdate(request.id, 'trainingName', v)}
                              className="font-medium"
                            />
                          </td>
                        )}
                        {isColumnVisible('client') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.client}
                              onSave={(v) => handleCellUpdate(request.id, 'client', v)}
                            />
                          </td>
                        )}
                        {isColumnVisible('lineOfBusiness') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.lineOfBusiness}
                              onSave={(v) => handleCellUpdate(request.id, 'lineOfBusiness', v)}
                              type="select"
                              options={LINE_OF_BUSINESS_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('numberOfUsers') && (
                          <td className="spreadsheet-cell bg-accent/30">
                            <EditableCell
                              value={request.numberOfUsers}
                              onSave={(v) => handleCellUpdate(request.id, 'numberOfUsers', v)}
                              type="number"
                              align="center"
                              className="font-medium"
                            />
                          </td>
                        )}
                        {isColumnVisible('month') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.month}
                              onSave={(v) => handleCellUpdate(request.id, 'month', v)}
                              type="select"
                              options={MONTH_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('cloud') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.cloud}
                              onSave={(v) => handleCellUpdate(request.id, 'cloud', v)}
                              type="select"
                              options={CLOUD_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('cloudType') && (
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
                        )}
                        {isColumnVisible('tpLabType') && (
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
                        )}
                        {isColumnVisible('labStatus') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.labStatus}
                              onSave={(v) => handleCellUpdate(request.id, 'labStatus', v)}
                              type="select"
                              options={LAB_STATUS_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('labType') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.labType}
                              onSave={(v) => handleCellUpdate(request.id, 'labType', v)}
                              type="select"
                              options={LAB_TYPE_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('startDate') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.startDate}
                              onSave={(v) => handleCellUpdate(request.id, 'startDate', v)}
                              type="date"
                            />
                          </td>
                        )}
                        {isColumnVisible('endDate') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.endDate}
                              onSave={(v) => handleCellUpdate(request.id, 'endDate', v)}
                              type="date"
                            />
                          </td>
                        )}
                        {isColumnVisible('requester') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.requester}
                              onSave={(v) => handleCellUpdate(request.id, 'requester', v)}
                            />
                          </td>
                        )}
                        {isColumnVisible('agentName') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.agentName}
                              onSave={(v) => handleCellUpdate(request.id, 'agentName', v)}
                            />
                          </td>
                        )}
                        {isColumnVisible('accountManager') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.accountManager}
                              onSave={(v) => handleCellUpdate(request.id, 'accountManager', v)}
                            />
                          </td>
                        )}
                        {isColumnVisible('inputCostPerUser') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.inputCostPerUser}
                              onSave={(v) => handleCellUpdate(request.id, 'inputCostPerUser', v)}
                              type="number"
                              align="right"
                              prefix="₹"
                            />
                          </td>
                        )}
                        {isColumnVisible('sellingCostPerUser') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.sellingCostPerUser}
                              onSave={(v) => handleCellUpdate(request.id, 'sellingCostPerUser', v)}
                              type="number"
                              align="right"
                              prefix="₹"
                            />
                          </td>
                        )}
                        {isColumnVisible('totalAmount') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.totalAmount}
                              onSave={(v) => handleCellUpdate(request.id, 'totalAmount', v)}
                              type="number"
                              align="right"
                              prefix="₹"
                              className="font-medium"
                            />
                          </td>
                        )}
                        {isColumnVisible('invoiceDetails') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.invoiceDetails}
                              onSave={(v) => handleCellUpdate(request.id, 'invoiceDetails', v)}
                            />
                          </td>
                        )}
                        <td className="spreadsheet-cell">
                          <AssigneeDropdown
                            requestId={request.id}
                            requestType="delivery"
                            currentAssignee={request.assignedTo || null}
                            compact
                          />
                        </td>
                        {isColumnVisible('actions') && (
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
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Results summary */}
            {filteredAndSortedRequests.length === 0 && requests.length > 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No results match your filters.{' '}
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryPreview;
