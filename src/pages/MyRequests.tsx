import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, User, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { supabase } from '@/integrations/external-supabase/client';
import logo from '@/assets/makemylabs-logo.png';

interface RequestSummary {
  id: string;
  type: 'solutions' | 'delivery';
  subject: string;
  status: string;
  potentialId: string;
  requester: string;
  createdAt: string;
}

const MyRequests = () => {
  // Search term state removed - using emailFilter for lookups
  const [emailFilter, setEmailFilter] = useState('');
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async (email: string) => {
    if (!email) {
      setRequests([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch from both tables
      const [labRes, deliveryRes] = await Promise.all([
        supabase
          .from('lab_requests')
          .select('id, lab_name, status, potential_id, requester, created_at')
          .ilike('requester', `%${email}%`)
          .order('created_at', { ascending: false }),
        supabase
          .from('delivery_requests')
          .select('id, training_name, lab_status, potential_id, requester, created_at')
          .ilike('requester', `%${email}%`)
          .order('created_at', { ascending: false }),
      ]);

      const labRequests: RequestSummary[] = (labRes.data || []).map(r => ({
        id: r.id,
        type: 'solutions' as const,
        subject: r.lab_name || 'Untitled',
        status: r.status || 'Pending',
        potentialId: r.potential_id || '',
        requester: r.requester || '',
        createdAt: r.created_at,
      }));

      const deliveryRequests: RequestSummary[] = (deliveryRes.data || []).map(r => ({
        id: r.id,
        type: 'delivery' as const,
        subject: r.training_name || 'Untitled',
        status: r.lab_status || 'Pending',
        potentialId: r.potential_id || '',
        requester: r.requester || '',
        createdAt: r.created_at,
      }));

      // Combine and sort by date
      const combined = [...labRequests, ...deliveryRequests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(combined);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRequests(emailFilter);
  };

  const getStatusIcon = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes('complete') || lower.includes('ready') || lower.includes('sent')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (lower.includes('pending')) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    if (lower.includes('progress')) {
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const lower = status.toLowerCase();
    if (lower.includes('complete') || lower.includes('ready') || lower.includes('sent')) {
      return 'default';
    }
    if (lower.includes('pending')) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <Button variant="outline" className="font-medium bg-primary/10">
                My Requests
              </Button>
              <Button variant="ghost" asChild className="font-medium">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Requests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-bold mb-6">My Requests</h1>

        {/* Email Search */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Find Your Requests</CardTitle>
            <CardDescription>
              Enter your email address to view all requests you've submitted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="max-w-md"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {requests.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              Found {requests.length} request{requests.length !== 1 ? 's' : ''}
            </p>
            
            {requests.map((request) => (
              <Card key={`${request.type}-${request.id}`} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{request.subject}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>ID: {request.potentialId}</span>
                          <span>•</span>
                          <span className="capitalize">{request.type}</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emailFilter && !isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No requests found</h3>
              <p className="text-muted-foreground mb-4">
                No requests were found for "{emailFilter}"
              </p>
              <Button asChild>
                <Link to="/submit-request">Submit a New Request</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter your email address above to view your requests.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MyRequests;
