import { useEffect, useCallback } from 'react';

interface SpreadsheetKeyboardShortcutsOptions {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  selectedCount: number;
  isEnabled?: boolean;
}

/**
 * Keyboard shortcuts for spreadsheet operations:
 * - Ctrl/Cmd+A: Select all rows
 * - Escape: Deselect all rows
 * - Delete/Backspace: Bulk delete selected rows (with confirmation)
 */
export const useSpreadsheetKeyboardShortcuts = ({
  onSelectAll,
  onDeselectAll,
  onDelete,
  selectedCount,
  isEnabled = true,
}: SpreadsheetKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isEnabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + A: Select all
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onSelectAll();
        return;
      }

      // Escape: Deselect all
      if (event.key === 'Escape') {
        event.preventDefault();
        onDeselectAll();
        return;
      }

      // Delete or Backspace: Bulk delete (only if rows are selected)
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedCount > 0) {
        event.preventDefault();
        onDelete();
        return;
      }
    },
    [isEnabled, onSelectAll, onDeselectAll, onDelete, selectedCount]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
