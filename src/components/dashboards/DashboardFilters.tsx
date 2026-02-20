import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X, Download, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { CLOUD_OPTIONS, CLOUD_TYPE_OPTIONS, TP_LAB_TYPE_OPTIONS, LOB_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS, STATUS_OPTIONS } from '@/types/labRequest';
import { LAB_STATUS_OPTIONS } from '@/types/deliveryRequest';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DateRangePickerFilter, DateRange, isDateInRange } from './DateRangePickerFilter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface DashboardFiltersState {
  labType: string;
  cloudType: string;
  tpLabType: string;
  lineOfBusiness: string;
  month: string;
  year: string;
  client: string;
  agentName: string;
  accountManager: string;
  status: string;
  dateRange: DateRange;
}

export const defaultFilters: DashboardFiltersState = {
  labType: 'all',
  cloudType: 'all',
  tpLabType: 'all',
  lineOfBusiness: 'all',
  month: 'all',
  year: 'all',
  client: 'all',
  agentName: 'all',
  accountManager: 'all',
  status: 'all',
  dateRange: { from: undefined, to: undefined },
};

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  onFiltersChange: (filters: DashboardFiltersState) => void;
  clients?: string[];
  agentNames?: string[];
  accountManagers?: string[];
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardFilters({ 
  filters, 
  onFiltersChange, 
  clients = [], 
  agentNames = [], 
  accountManagers = [], 
  onExportCSV, 
  onExportPDF,
  onRefresh,
  isRefreshing = false,
}: DashboardFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') {
      const range = value as DateRange;
      return range.from || range.to;
    }
    return value !== 'all';
  }).length;
  
  // Combine status options from both Solutions and Delivery
  const allStatusOptions = [...new Set([...STATUS_OPTIONS, ...LAB_STATUS_OPTIONS])];

  const handleFilterChange = (key: keyof DashboardFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset dependent filters when lab type changes
    if (key === 'labType') {
      if (value !== 'Public Cloud' && value !== 'Private Cloud') {
        newFilters.cloudType = 'all';
      }
      if (value !== 'TP Labs') {
        newFilters.tpLabType = 'all';
      }
    }
    
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    onFiltersChange({ ...filters, dateRange });
  };

  const handleClearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  // Show Cloud Type only for Public Cloud or Private Cloud
  const showCloudType = filters.labType === 'Public Cloud' || filters.labType === 'Private Cloud';
  // Show TP Lab Type only for TP Labs
  const showTPLabType = filters.labType === 'TP Labs';

  return (
    <div className="bg-card border rounded-lg">
      {/* Header row - always visible */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setIsExpanded(!isExpanded)}>
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          
          {/* Date Range Picker - always visible */}
          <DateRangePickerFilter 
            dateRange={filters.dateRange} 
            onDateRangeChange={handleDateRangeChange} 
          />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
          
          {/* Export Dropdown */}
          {(onExportCSV || onExportPDF) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                {onExportCSV && (
                  <DropdownMenuItem onClick={onExportCSV}>
                    Export as CSV
                  </DropdownMenuItem>
                )}
                {onExportPDF && (
                  <DropdownMenuItem onClick={onExportPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Filter row - plain CSS show/hide, no Radix Collapsible */}
      <div style={{ display: isExpanded ? 'flex' : 'none' }} className="flex-wrap items-center gap-3 p-4">
        {/* Lab Type Filter */}
        <Select
          value={filters.labType}
          onValueChange={(v) => handleFilterChange('labType', v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Lab Type" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Lab Types</SelectItem>
            {CLOUD_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cloud Type Filter (conditional) */}
        {showCloudType && (
          <Select
            value={filters.cloudType}
            onValueChange={(v) => handleFilterChange('cloudType', v)}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Cloud Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Cloud Types</SelectItem>
              {CLOUD_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* TP Lab Type Filter (conditional) */}
        {showTPLabType && (
          <Select
            value={filters.tpLabType}
            onValueChange={(v) => handleFilterChange('tpLabType', v)}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="TP Lab Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All TP Labs</SelectItem>
              {TP_LAB_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Client Filter */}
        <Select
          value={filters.client}
          onValueChange={(v) => handleFilterChange('client', v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client} value={client}>
                {client}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Line of Business Filter */}
        <Select
          value={filters.lineOfBusiness}
          onValueChange={(v) => handleFilterChange('lineOfBusiness', v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="LOB" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All LOB</SelectItem>
            {LOB_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Filter */}
        <Select
          value={filters.month}
          onValueChange={(v) => handleFilterChange('month', v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Months</SelectItem>
            {MONTH_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select
          value={filters.year}
          onValueChange={(v) => handleFilterChange('year', v)}
        >
          <SelectTrigger className="h-8 w-24">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Years</SelectItem>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={String(option)} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Agent Name Filter */}
        <Select
          value={filters.agentName}
          onValueChange={(v) => handleFilterChange('agentName', v)}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            <SelectItem value="all">All Agents</SelectItem>
            {agentNames.map((agent) => (
              <SelectItem key={agent} value={agent}>
                {agent}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Account Manager Filter */}
        <Select
          value={filters.accountManager}
          onValueChange={(v) => handleFilterChange('accountManager', v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Account Mgr" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            <SelectItem value="all">All Account Mgrs</SelectItem>
            {accountManagers.map((am) => (
              <SelectItem key={am} value={am}>
                {am}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover max-h-60">
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
    </div>
  );
}

// Utility function to apply filters to data
export function applyDashboardFilters<T extends { 
  cloud?: string; 
  cloudType?: string; 
  tpLabType?: string; 
  lineOfBusiness?: string; 
  month?: string; 
  year?: number; 
  client?: string; 
  agentName?: string; 
  accountManager?: string; 
  status?: string; 
  labStatus?: string;
  receivedOn?: string;
}>(
  data: T[],
  filters: DashboardFiltersState
): T[] {
  return data.filter((item) => {
    if (filters.labType !== 'all' && item.cloud !== filters.labType) return false;
    if (filters.cloudType !== 'all' && item.cloudType !== filters.cloudType) return false;
    if (filters.tpLabType !== 'all' && item.tpLabType !== filters.tpLabType) return false;
    if (filters.lineOfBusiness !== 'all' && item.lineOfBusiness !== filters.lineOfBusiness) return false;
    if (filters.month !== 'all' && item.month !== filters.month) return false;
    if (filters.year !== 'all' && item.year !== Number(filters.year)) return false;
    if (filters.client !== 'all' && item.client !== filters.client) return false;
    if (filters.agentName !== 'all' && item.agentName !== filters.agentName) return false;
    if (filters.accountManager !== 'all' && item.accountManager !== filters.accountManager) return false;
    // Handle status for both Solutions (status) and Delivery (labStatus)
    if (filters.status !== 'all') {
      const itemStatus = item.status || item.labStatus;
      if (itemStatus !== filters.status) return false;
    }
    // Date range filter on receivedOn
    if (filters.dateRange.from || filters.dateRange.to) {
      if (!isDateInRange(item.receivedOn, filters.dateRange)) return false;
    }
    return true;
  });
}
