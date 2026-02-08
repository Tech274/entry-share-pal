import { useLabRequestsQuery } from '@/hooks/useLabRequestsQuery';
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
import { LabRequest, CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS, STATUS_OPTIONS, MONTH_OPTIONS, LOB_OPTIONS } from '@/types/labRequest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

// CSV template headers for Solutions
const SOLUTIONS_CSV_HEADERS = [
  'Potential ID', 'Training Name', 'Client', 'Month', 'Year', 'LOB', 
  'User Count', 'Lab Start Date', 'Lab End Date',
  'Input Cost', 'Selling Cost', 'Status', 'Invoice Details', 'Remarks'
];

// Parse CSV row to LabRequest
const parseLabRequestRow = (row: Record<string, string | number>): Omit<LabRequest, 'id' | 'createdAt'> | null => {
  const client = String(row['Client'] || '').trim();
  const month = String(row['Month'] || '').trim();
  
  if (!client || !month) return null;

  return {
    potentialId: String(row['Potential ID'] || ''),
    freshDeskTicketNumber: '',
    labName: String(row['Training Name'] || ''),
    client,
    month,
    year: Number(row['Year']) || new Date().getFullYear(),
    cloud: '',
    cloudType: '',
    tpLabType: '',
    lineOfBusiness: String(row['LOB'] || ''),
    userCount: Number(row['User Count']) || 0,
    requester: '',
    agentName: '',
    accountManager: '',
    receivedOn: '',
    labStartDate: String(row['Lab Start Date'] || ''),
    labEndDate: String(row['Lab End Date'] || ''),
    durationInDays: 0,
    inputCostPerUser: Number(row['Input Cost']) || 0,
    sellingCostPerUser: Number(row['Selling Cost']) || 0,
    totalAmountForTraining: 0,
    margin: 0,
    status: String(row['Status'] || 'Solution Pending'),
    invoiceDetails: String(row['Invoice Details'] || ''),
    remarks: String(row['Remarks'] || ''),
  };
};

const Preview = () => {
  const { requests, updateRequest, deleteRequest, clearAll, bulkDelete, bulkUpdateStatus, bulkInsert } = useLabRequestsQuery();
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
  } = useSpreadsheetControls(requests, 'solutions');

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

  // Keyboard shortcuts: Ctrl+A to select all, Escape to deselect, Delete to bulk delete
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
    exportToCSV(filteredAndSortedRequests);
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
    exportToXLS(filteredAndSortedRequests);
    toast({
      title: 'Export Complete',
      description: `Exported ${filteredAndSortedRequests.length} entries as XLS.`,
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

  const handleBulkUpload = async (data: Omit<LabRequest, 'id' | 'createdAt'>[]) => {
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
                  {filteredAndSortedRequests.length} of {requests.length} {requests.length === 1 ? 'entry' : 'entries'}
                  {activeFilterCount > 0 && ' (filtered)'}
                  • Double-click to edit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BulkUploadDialog
                title="Import Solutions from CSV"
                description="Upload a CSV file to bulk import solution records. Download the template for the correct format."
                templateHeaders={SOLUTIONS_CSV_HEADERS}
                onUpload={handleBulkUpload}
                parseRow={parseLabRequestRow}
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
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground mb-4">
              Start by adding lab requests or import from CSV.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Entry Form
                </Button>
              </Link>
              <BulkUploadDialog
                title="Import Solutions from CSV"
                description="Upload a CSV file to bulk import solution records. Download the template for the correct format."
                templateHeaders={SOLUTIONS_CSV_HEADERS}
                onUpload={handleBulkUpload}
                parseRow={parseLabRequestRow}
              />
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            {/* Bulk Actions Bar */}
            <BulkActionsBar
              selectedCount={selectedCount}
              selectedIds={Array.from(selectedIds)}
              statusOptions={STATUS_OPTIONS}
              requestType="solution"
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
                      {isColumnVisible('labName') && (
                        <SortableHeader
                          label="Training Name"
                          field="labName"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('client') && (
                        <SortableHeader
                          label="Client Name"
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
                      {isColumnVisible('userCount') && (
                        <SortableHeader
                          label="User Count"
                          field="userCount"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="center"
                        />
                      )}
                      {isColumnVisible('remarks') && (
                        <th className="spreadsheet-cell font-semibold text-left">Remarks</th>
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
                          label="Lab Type"
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
                      {isColumnVisible('receivedOn') && (
                        <SortableHeader
                          label="Received On"
                          field="receivedOn"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('labStartDate') && (
                        <SortableHeader
                          label="Lab Start Date"
                          field="labStartDate"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('labEndDate') && (
                        <SortableHeader
                          label="Lab End Date"
                          field="labEndDate"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                        />
                      )}
                      {isColumnVisible('durationInDays') && (
                        <SortableHeader
                          label="Duration"
                          field="durationInDays"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="center"
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
                      {isColumnVisible('totalAmountForTraining') && (
                        <SortableHeader
                          label="Total Amount"
                          field="totalAmountForTraining"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                      )}
                      {isColumnVisible('margin') && (
                        <SortableHeader
                          label="Margin %"
                          field="margin"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
                          align="right"
                        />
                      )}
                      {isColumnVisible('status') && (
                        <SortableHeader
                          label="Status"
                          field="status"
                          currentSortField={sortField}
                          currentSortDirection={sortDirection}
                          onSort={handleSort}
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
                    {filteredAndSortedRequests.map((request, index) => (
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
                        {isColumnVisible('labName') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.labName}
                              onSave={(v) => handleCellUpdate(request.id, 'labName', v)}
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
                              options={LOB_OPTIONS}
                            />
                          </td>
                        )}
                        {isColumnVisible('userCount') && (
                          <td className="spreadsheet-cell bg-accent/30">
                            <EditableCell
                              value={request.userCount}
                              onSave={(v) => handleCellUpdate(request.id, 'userCount', v)}
                              type="number"
                              align="center"
                              className="font-medium"
                            />
                          </td>
                        )}
                        {isColumnVisible('remarks') && (
                          <td className="spreadsheet-cell max-w-xs">
                            <EditableCell
                              value={request.remarks}
                              onSave={(v) => handleCellUpdate(request.id, 'remarks', v)}
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
                        {isColumnVisible('receivedOn') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.receivedOn}
                              onSave={(v) => handleCellUpdate(request.id, 'receivedOn', v)}
                              type="date"
                            />
                          </td>
                        )}
                        {isColumnVisible('labStartDate') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.labStartDate}
                              onSave={(v) => handleCellUpdate(request.id, 'labStartDate', v)}
                              type="date"
                            />
                          </td>
                        )}
                        {isColumnVisible('labEndDate') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.labEndDate}
                              onSave={(v) => handleCellUpdate(request.id, 'labEndDate', v)}
                              type="date"
                            />
                          </td>
                        )}
                        {isColumnVisible('durationInDays') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.durationInDays}
                              onSave={(v) => handleCellUpdate(request.id, 'durationInDays', v)}
                              type="number"
                              align="center"
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
                        {isColumnVisible('totalAmountForTraining') && (
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
                        )}
                        {isColumnVisible('margin') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.margin}
                              onSave={(v) => handleCellUpdate(request.id, 'margin', v)}
                              type="number"
                              align="right"
                              suffix="%"
                            />
                          </td>
                        )}
                        {isColumnVisible('status') && (
                          <td className="spreadsheet-cell">
                            <EditableCell
                              value={request.status}
                              onSave={(v) => handleCellUpdate(request.id, 'status', v)}
                              type="select"
                              options={STATUS_OPTIONS}
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
                            requestType="solution"
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

export default Preview;
