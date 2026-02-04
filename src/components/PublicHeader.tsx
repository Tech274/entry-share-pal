import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Settings, RotateCcw, Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/mml-logo.png';

const BANNER_DISMISSED_KEY = 'lab-catalog-banner-dismissed';
const NOTIFICATIONS_KEY = 'notification-preferences';

interface NotificationPrefs {
  emailUpdates: boolean;
  statusChanges: boolean;
}

const defaultNotificationPrefs: NotificationPrefs = {
  emailUpdates: true,
  statusChanges: true,
};

const PublicHeader = () => {
  const location = useLocation();
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(defaultNotificationPrefs);
  const isOnCatalog = location.pathname === '/lab-catalog';

  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    if (saved) {
      setNotificationPrefs(JSON.parse(saved));
    }
  }, []);

  const resetBanner = () => {
    localStorage.removeItem(BANNER_DISMISSED_KEY);
    if (isOnCatalog) {
      window.location.reload();
    }
  };

  const toggleNotificationPref = (key: keyof NotificationPrefs) => {
    const updated = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
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
                
                {/* Notifications Submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => toggleNotificationPref('emailUpdates')}>
                        {notificationPrefs.emailUpdates ? (
                          <Bell className="h-4 w-4 mr-2 text-accent" />
                        ) : (
                          <BellOff className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        Email Updates
                        {notificationPrefs.emailUpdates && (
                          <Check className="h-4 w-4 ml-auto text-accent" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleNotificationPref('statusChanges')}>
                        {notificationPrefs.statusChanges ? (
                          <Bell className="h-4 w-4 mr-2 text-accent" />
                        ) : (
                          <BellOff className="h-4 w-4 mr-2 text-muted-foreground" />
                        )}
                        Status Changes
                        {notificationPrefs.statusChanges && (
                          <Check className="h-4 w-4 ml-auto text-accent" />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

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
