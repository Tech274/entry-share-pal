import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/makemylabs-logo.png';

const PublicHeader = () => {
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
            <Button variant="ghost" size="icon" asChild className="ml-2">
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
