import { useState, useCallback } from 'react';

interface EditAction {
  id: string;
  field: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: number;
}

interface UseUndoRedoReturn {
  canUndo: boolean;
  canRedo: boolean;
  recordEdit: (id: string, field: string, oldValue: string | number, newValue: string | number) => void;
  undo: () => EditAction | null;
  redo: () => EditAction | null;
  clearHistory: () => void;
  undoStack: EditAction[];
  redoStack: EditAction[];
}

export const useUndoRedo = (maxHistory: number = 50): UseUndoRedoReturn => {
  const [undoStack, setUndoStack] = useState<EditAction[]>([]);
  const [redoStack, setRedoStack] = useState<EditAction[]>([]);

  const recordEdit = useCallback((
    id: string,
    field: string,
    oldValue: string | number,
    newValue: string | number
  ) => {
    const action: EditAction = {
      id,
      field,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };

    setUndoStack(prev => {
      const newStack = [...prev, action];
      // Limit history size
      if (newStack.length > maxHistory) {
        return newStack.slice(-maxHistory);
      }
      return newStack;
    });
    
    // Clear redo stack when new edit is made
    setRedoStack([]);
  }, [maxHistory]);

  const undo = useCallback((): EditAction | null => {
    if (undoStack.length === 0) return null;

    const lastAction = undoStack[undoStack.length - 1];
    
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastAction]);

    return lastAction;
  }, [undoStack]);

  const redo = useCallback((): EditAction | null => {
    if (redoStack.length === 0) return null;

    const lastRedo = redoStack[redoStack.length - 1];
    
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, lastRedo]);

    return lastRedo;
  }, [redoStack]);

  const clearHistory = useCallback(() => {
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  return {
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    recordEdit,
    undo,
    redo,
    clearHistory,
    undoStack,
    redoStack,
  };
};
