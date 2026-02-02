import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GlobalSearch } from '@/components/GlobalSearch';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/roles';
import logo from '@/assets/makemylabs-logo.png';

interface HeaderProps {
  requestCount: number;
  onExportCSV: () => void;
  onExportXLS: () => void;
  onClearAll: () => void;
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

export const Header = ({ requestCount, onExportCSV, onExportXLS, onClearAll, labRequests, deliveryRequests }: HeaderProps) => {
  const { profile, role, signOut, isAdmin, isOpsLead } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const canClearAll = isAdmin || isOpsLead;
  const canExport = isAdmin || isOpsLead || role === 'finance';

  return (
    <header className="bg-primary border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MakeMyLabs" className="h-10 object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm text-primary-foreground/80">
                {requestCount} {requestCount === 1 ? 'entry' : 'entries'} recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlobalSearch labRequests={labRequests} deliveryRequests={deliveryRequests} />
            
            <Link to="/preview">
              <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            
            {canExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={requestCount === 0}>
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
            )}

            {canClearAll && requestCount > 0 && (
              <Button variant="destructive" size="icon" onClick={onClearAll} title="Clear all entries">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {profile?.full_name || profile?.email || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                  {role && (
                    <Badge className={`mt-2 ${ROLE_COLORS[role]}`} variant="outline">
                      {ROLE_LABELS[role]}
                    </Badge>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
