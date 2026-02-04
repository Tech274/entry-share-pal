import { useState, useMemo, useCallback, useEffect } from 'react';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = string | null;

export interface ColumnConfig {
  id: string;
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

type SpreadsheetType = 'solutions' | 'delivery';

const getStorageKeys = (type: SpreadsheetType) => ({
  COLUMNS: `spreadsheet-${type}-columns-visibility`,
  FILTERS: `spreadsheet-${type}-filters`,
});

const SOLUTIONS_COLUMNS: ColumnConfig[] = [
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
  { id: 'invoiceDetails', label: 'Invoice Details', visible: true, sortable: false, filterable: false },
  { id: 'actions', label: 'Actions', visible: true, sortable: false, filterable: false },
];

const DELIVERY_COLUMNS: ColumnConfig[] = [
  { id: 'index', label: '#', visible: true, sortable: false, filterable: false },
  { id: 'potentialId', label: 'Potential ID', visible: true, sortable: true, filterable: false },
  { id: 'freshDeskTicketNumber', label: 'Ticket #', visible: true, sortable: true, filterable: false },
  { id: 'trainingName', label: 'Training Name', visible: true, sortable: true, filterable: false },
  { id: 'client', label: 'Client', visible: true, sortable: true, filterable: true },
  { id: 'lineOfBusiness', label: 'LOB', visible: true, sortable: true, filterable: true },
  { id: 'numberOfUsers', label: 'Users', visible: true, sortable: true, filterable: false },
  { id: 'month', label: 'Month', visible: true, sortable: true, filterable: true },
  { id: 'cloud', label: 'Cloud', visible: true, sortable: true, filterable: true },
  { id: 'cloudType', label: 'Cloud Type', visible: true, sortable: true, filterable: false },
  { id: 'tpLabType', label: 'TP Lab Type', visible: true, sortable: true, filterable: false },
  { id: 'labStatus', label: 'Lab Status', visible: true, sortable: true, filterable: true },
  { id: 'labType', label: 'Lab Type', visible: true, sortable: true, filterable: false },
  { id: 'startDate', label: 'Start Date', visible: true, sortable: true, filterable: false },
  { id: 'endDate', label: 'End Date', visible: true, sortable: true, filterable: false },
  { id: 'requester', label: 'Requester', visible: true, sortable: true, filterable: false },
  { id: 'agentName', label: 'Agent', visible: true, sortable: true, filterable: false },
  { id: 'accountManager', label: 'Account Manager', visible: true, sortable: true, filterable: false },
  { id: 'inputCostPerUser', label: 'Input Cost', visible: true, sortable: true, filterable: false },
  { id: 'sellingCostPerUser', label: 'Selling Cost', visible: true, sortable: true, filterable: false },
  { id: 'totalAmount', label: 'Total Amount', visible: true, sortable: true, filterable: false },
  { id: 'invoiceDetails', label: 'Invoice Details', visible: true, sortable: false, filterable: false },
  { id: 'actions', label: 'Actions', visible: true, sortable: false, filterable: false },
];

const DEFAULT_FILTERS: Filters = {
  status: '',
  month: '',
  cloud: '',
  lineOfBusiness: '',
  client: '',
};

function getDefaultColumns(type: SpreadsheetType): ColumnConfig[] {
  return type === 'delivery' ? DELIVERY_COLUMNS : SOLUTIONS_COLUMNS;
}

function loadColumnsFromStorage(type: SpreadsheetType): ColumnConfig[] {
  const storageKeys = getStorageKeys(type);
  const defaultCols = getDefaultColumns(type);
  try {
    const stored = localStorage.getItem(storageKeys.COLUMNS);
    if (stored) {
      const storedVisibility = JSON.parse(stored) as Record<string, boolean>;
      return defaultCols.map(col => ({
        ...col,
        visible: storedVisibility[col.id] ?? col.visible,
      }));
    }
  } catch (e) {
    console.warn('Failed to load column preferences from localStorage:', e);
  }
  return defaultCols;
}

function loadFiltersFromStorage(type: SpreadsheetType): Filters {
  const storageKeys = getStorageKeys(type);
  try {
    const stored = localStorage.getItem(storageKeys.FILTERS);
    if (stored) {
      const storedFilters = JSON.parse(stored) as Partial<Filters>;
      return { ...DEFAULT_FILTERS, ...storedFilters };
    }
  } catch (e) {
    console.warn('Failed to load filter preferences from localStorage:', e);
  }
  return DEFAULT_FILTERS;
}

type SpreadsheetRequest = LabRequest | DeliveryRequest;

export function useSpreadsheetControls<T extends SpreadsheetRequest>(
  requests: T[],
  type: SpreadsheetType = 'solutions'
) {
  const storageKeys = getStorageKeys(type);
  const defaultColumns = getDefaultColumns(type);

  const [columns, setColumns] = useState<ColumnConfig[]>(() => loadColumnsFromStorage(type));
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Filters>(() => loadFiltersFromStorage(type));

  // Persist column visibility to localStorage
  useEffect(() => {
    const visibility: Record<string, boolean> = {};
    columns.forEach(col => {
      visibility[col.id] = col.visible;
    });
    localStorage.setItem(storageKeys.COLUMNS, JSON.stringify(visibility));
  }, [columns, storageKeys.COLUMNS]);

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem(storageKeys.FILTERS, JSON.stringify(filters));
  }, [filters, storageKeys.FILTERS]);

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  }, []);

  const handleSort = useCallback((field: string) => {
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
    localStorage.removeItem(storageKeys.FILTERS);
  }, [storageKeys.FILTERS]);

  const resetColumns = useCallback(() => {
    setColumns(defaultColumns);
    localStorage.removeItem(storageKeys.COLUMNS);
  }, [defaultColumns, storageKeys.COLUMNS]);

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible),
    [columns]
  );

  const filteredAndSortedRequests = useMemo(() => {
    let result = [...requests];

    // Apply filters - use type-safe access
    if (filters.status) {
      result = result.filter(r => {
        // For Solutions: use 'status', for Delivery: use 'labStatus'
        const statusField = type === 'delivery' ? 'labStatus' : 'status';
        return (r as any)[statusField] === filters.status;
      });
    }
    if (filters.month) {
      result = result.filter(r => (r as any).month === filters.month);
    }
    if (filters.cloud) {
      result = result.filter(r => (r as any).cloud === filters.cloud);
    }
    if (filters.lineOfBusiness) {
      result = result.filter(r => (r as any).lineOfBusiness === filters.lineOfBusiness);
    }
    if (filters.client) {
      result = result.filter(r => 
        ((r as any).client || '').toLowerCase().includes(filters.client.toLowerCase())
      );
    }

    // Apply sorting
    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];

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
  }, [requests, filters, sortField, sortDirection, type]);

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
