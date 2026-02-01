import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/makemylabs-logo.png';

interface HeaderProps {
  requestCount: number;
  onExportCSV: () => void;
  onExportXLS: () => void;
  onClearAll: () => void;
}

export const Header = ({ requestCount, onExportCSV, onExportXLS, onClearAll }: HeaderProps) => {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MakeMyLabs" className="h-10 object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm text-muted-foreground">
                {requestCount} {requestCount === 1 ? 'entry' : 'entries'} recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/preview">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            
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
