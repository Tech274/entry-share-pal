import { useState, useCallback, useMemo } from 'react';

export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, selectAll, deselectAll]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useMemo(() => 
    items.length > 0 && selectedIds.size === items.length, 
    [items.length, selectedIds.size]
  );

  const isSomeSelected = useMemo(() => 
    selectedIds.size > 0 && selectedIds.size < items.length, 
    [selectedIds.size, items.length]
  );

  const selectedCount = selectedIds.size;
  
  const selectedItems = useMemo(() => 
    items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  return {
    selectedIds,
    selectedCount,
    selectedItems,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
  };
}
