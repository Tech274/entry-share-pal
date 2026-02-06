import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  undoCount?: number;
  redoCount?: number;
}

export const UndoRedoToolbar = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  undoCount = 0,
  redoCount = 0,
}: UndoRedoToolbarProps) => {
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 px-2 gap-1"
          >
            <Undo2 className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Undo</span>
            {undoCount > 0 && (
              <span className="text-xs text-muted-foreground">({undoCount})</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Undo last edit (Ctrl+Z)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 px-2 gap-1"
          >
            <Redo2 className="w-4 h-4" />
            <span className="text-xs hidden sm:inline">Redo</span>
            {redoCount > 0 && (
              <span className="text-xs text-muted-foreground">({redoCount})</span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Redo last edit (Ctrl+Y)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
