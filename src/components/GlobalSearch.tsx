import { useState, useMemo } from 'react';
import { Search, X, ClipboardList, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LabRequest } from '@/types/labRequest';
import { DeliveryRequest } from '@/types/deliveryRequest';

interface GlobalSearchProps {
  labRequests: LabRequest[];
  deliveryRequests: DeliveryRequest[];
}

type SearchResult = {
  type: 'solution' | 'delivery';
  id: string;
  title: string;
  subtitle: string;
  ticketNumber: string;
  client: string;
  status: string;
  amount: number;
};

export const GlobalSearch = ({ labRequests, deliveryRequests }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search lab requests
    labRequests.forEach((req) => {
      const matches =
        req.freshDeskTicketNumber?.toLowerCase().includes(query) ||
        req.potentialId?.toLowerCase().includes(query) ||
        req.client?.toLowerCase().includes(query) ||
        req.labName?.toLowerCase().includes(query) ||
        req.requester?.toLowerCase().includes(query) ||
        req.agentName?.toLowerCase().includes(query);

      if (matches) {
        results.push({
          type: 'solution',
          id: req.id,
          title: req.labName || 'Untitled Solution',
          subtitle: `${req.cloud} • ${req.agentName || 'Unassigned'}`,
          ticketNumber: req.freshDeskTicketNumber || req.potentialId || '-',
          client: req.client,
          status: req.status,
          amount: req.totalAmountForTraining || 0,
        });
      }
    });

    // Search delivery requests
    deliveryRequests.forEach((req) => {
      const matches =
        req.freshDeskTicketNumber?.toLowerCase().includes(query) ||
        req.potentialId?.toLowerCase().includes(query) ||
        req.client?.toLowerCase().includes(query) ||
        req.labName?.toLowerCase().includes(query) ||
        req.trainingName?.toLowerCase().includes(query) ||
        req.requester?.toLowerCase().includes(query) ||
        req.agentName?.toLowerCase().includes(query);

      if (matches) {
        results.push({
          type: 'delivery',
          id: req.id,
          title: req.trainingName || req.labName || 'Untitled Delivery',
          subtitle: `${req.cloud} • ${req.agentName || 'Unassigned'}`,
          ticketNumber: req.freshDeskTicketNumber || req.potentialId || '-',
          client: req.client,
          status: req.labStatus,
          amount: req.totalAmount || 0,
        });
      }
    });

    return results;
  }, [searchQuery, labRequests, deliveryRequests]);

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket #, client, lab name, training name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
          )}

          <ScrollArea className="h-[400px]">
            {searchResults.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm">Try searching by ticket number, client, or lab name</p>
              </div>
            )}

            {!searchQuery && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>Start typing to search</p>
                <p className="text-sm">Search across all solutions and deliveries</p>
              </div>
            )}

            <div className="space-y-2">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${result.type === 'solution' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                        {result.type === 'solution' ? (
                          <ClipboardList className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Truck className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{result.title}</p>
                          <Badge variant={result.type === 'solution' ? 'default' : 'secondary'} className="text-xs">
                            {result.type === 'solution' ? 'Solution' : 'Delivery'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.client}</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">₹{result.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">#{result.ticketNumber}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          result.status === 'Solution Sent' || result.status === 'Ready' || result.status === 'Completed'
                            ? 'border-green-500 text-green-600'
                            : result.status === 'In Progress'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
