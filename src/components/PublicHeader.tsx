import { Link, useLocation } from 'react-router-dom';
import { User, Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/mml-logo.png';

const BANNER_DISMISSED_KEY = 'lab-catalog-banner-dismissed';

const PublicHeader = () => {
  const location = useLocation();
  const isOnCatalog = location.pathname === '/lab-catalog';

  const resetBanner = () => {
    localStorage.removeItem(BANNER_DISMISSED_KEY);
    // Reload if on catalog page to show banner
    if (isOnCatalog) {
      window.location.reload();
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MakeMyLabs" className="h-8 object-contain" />
            <span className="font-semibold text-lg hidden sm:inline">MakeMyLabs</span>
          </div>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" asChild className="font-medium">
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild className="font-medium">
              <Link to="/my-requests">My Requests</Link>
            </Button>
            <Button variant="ghost" asChild className="font-medium">
              <Link to="/docs">Docs</Link>
            </Button>
            <Button variant="ghost" asChild className="font-medium">
              <Link to="/lab-catalog">Lab Catalog</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/submit-request">Submit a Request</Link>
            </Button>
            
            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={resetBanner}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Show Catalog Info Banner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
