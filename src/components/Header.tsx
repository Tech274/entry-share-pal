import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  requestCount: number;
  onExportCSV: () => void;
  onExportXLS: () => void;
  onClearAll: () => void;
}

export const Header = ({ requestCount, onExportCSV, onExportXLS, onClearAll }: HeaderProps) => {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MML Lab Request</h1>
              <p className="text-sm text-muted-foreground">
                {requestCount} {requestCount === 1 ? 'entry' : 'entries'} recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={requestCount === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportXLS}>
                  Export as XLS (Excel)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {requestCount > 0 && (
              <Button variant="destructive" size="icon" onClick={onClearAll} title="Clear all entries">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
