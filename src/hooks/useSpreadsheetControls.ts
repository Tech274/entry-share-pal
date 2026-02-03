import { useState, useMemo, useCallback } from 'react';
import { LabRequest } from '@/types/labRequest';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = keyof LabRequest | null;

export interface ColumnConfig {
  id: keyof LabRequest | 'index' | 'actions';
  label: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
}

export interface Filters {
  status: string;
  month: string;
  cloud: string;
  lineOfBusiness: string;
  client: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'index', label: '#', visible: true, sortable: false, filterable: false },
  { id: 'potentialId', label: 'Potential ID', visible: true, sortable: true, filterable: false },
  { id: 'labName', label: 'Training Name', visible: true, sortable: true, filterable: false },
  { id: 'client', label: 'Client Name', visible: true, sortable: true, filterable: true },
  { id: 'lineOfBusiness', label: 'LOB', visible: true, sortable: true, filterable: true },
  { id: 'userCount', label: 'User Count', visible: true, sortable: true, filterable: false },
  { id: 'remarks', label: 'Remarks', visible: true, sortable: false, filterable: false },
  { id: 'month', label: 'Month', visible: true, sortable: true, filterable: true },
  { id: 'cloud', label: 'Lab Type', visible: true, sortable: true, filterable: true },
  { id: 'cloudType', label: 'Cloud Type', visible: true, sortable: true, filterable: false },
  { id: 'tpLabType', label: 'TP Lab Type', visible: true, sortable: true, filterable: false },
  { id: 'requester', label: 'Requester', visible: true, sortable: true, filterable: false },
  { id: 'agentName', label: 'Agent', visible: true, sortable: true, filterable: false },
  { id: 'accountManager', label: 'Account Manager', visible: true, sortable: true, filterable: false },
  { id: 'receivedOn', label: 'Received On', visible: true, sortable: true, filterable: false },
  { id: 'labStartDate', label: 'Lab Start Date', visible: true, sortable: true, filterable: false },
  { id: 'labEndDate', label: 'Lab End Date', visible: true, sortable: true, filterable: false },
  { id: 'durationInDays', label: 'Duration', visible: true, sortable: true, filterable: false },
  { id: 'inputCostPerUser', label: 'Input Cost', visible: true, sortable: true, filterable: false },
  { id: 'sellingCostPerUser', label: 'Selling Cost', visible: true, sortable: true, filterable: false },
  { id: 'totalAmountForTraining', label: 'Total Amount', visible: true, sortable: true, filterable: false },
  { id: 'margin', label: 'Margin %', visible: true, sortable: true, filterable: false },
  { id: 'status', label: 'Status', visible: true, sortable: true, filterable: true },
  { id: 'actions', label: 'Actions', visible: true, sortable: false, filterable: false },
];

const DEFAULT_FILTERS: Filters = {
  status: '',
  month: '',
  cloud: '',
  lineOfBusiness: '',
  client: '',
};

export function useSpreadsheetControls(requests: LabRequest[]) {
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleSort = useCallback((field: keyof LabRequest) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const updateFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const resetColumns = useCallback(() => {
    setColumns(DEFAULT_COLUMNS);
  }, []);

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible),
    [columns]
  );

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Apply filters
    if (filters.status) {
      result = result.filter(r => r.status === filters.status);
    }
    if (filters.month) {
      result = result.filter(r => r.month === filters.month);
    }
    if (filters.cloud) {
      result = result.filter(r => r.cloud === filters.cloud);
    }
    if (filters.lineOfBusiness) {
      result = result.filter(r => r.lineOfBusiness === filters.lineOfBusiness);
    }
    if (filters.client) {
      result = result.filter(r => 
        r.client.toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [requests, filters, sortField, sortDirection]);

  const activeFilterCount = useMemo(() => 
    Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const hiddenColumnCount = useMemo(() =>
    columns.filter(col => !col.visible).length,
    [columns]
  );

  return {
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
  };
}
