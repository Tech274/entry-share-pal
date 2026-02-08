import { useState, useMemo, useCallback } from 'react';
import { Search, X, ClipboardList, Truck, Sparkles, Loader2 } from 'lucide-react';
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
import { supabase } from '@/integrations/external-supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AISearchCriteria {
  searchTerms?: string[];
  client?: string;
  status?: string;
  cloud?: string;
  type?: 'solution' | 'delivery';
  dateRange?: { from?: string; to?: string };
  amountRange?: { min?: number; max?: number };
}

export const GlobalSearch = ({ labRequests, deliveryRequests }: GlobalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiCriteria, setAiCriteria] = useState<AISearchCriteria | null>(null);
  const { toast } = useToast();

  const performAISearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsAISearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'search',
          messages: [{ role: 'user', content: query }],
        },
      });

      if (error) throw error;

      const content = data?.content;
      if (content) {
        // Parse JSON from AI response - handle markdown code blocks
        let jsonStr = content;
        // Remove markdown code blocks if present
        const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        } else {
          // Try to find raw JSON object
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }
        
        try {
          const criteria = JSON.parse(jsonStr) as AISearchCriteria;
          setAiCriteria(criteria);
        } catch (parseError) {
          console.error('Failed to parse AI search criteria:', parseError);
        }
      }
    } catch (error) {
      console.error('AI search error:', error);
      toast({
        title: 'AI Search Error',
        description: 'Could not process your natural language query. Using basic search.',
        variant: 'destructive',
      });
    } finally {
      setIsAISearching(false);
    }
  }, [toast]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Apply AI criteria if available, otherwise use basic search
    const filterFn = (req: LabRequest | DeliveryRequest, type: 'solution' | 'delivery') => {
      // If AI criteria exists, use smart filtering
      if (aiCriteria) {
        // Filter by type
        if (aiCriteria.type && aiCriteria.type !== type) return false;

        // Filter by client
        if (aiCriteria.client && !req.client?.toLowerCase().includes(aiCriteria.client.toLowerCase())) {
          return false;
        }

        // Filter by cloud
        if (aiCriteria.cloud && !req.cloud?.toLowerCase().includes(aiCriteria.cloud.toLowerCase())) {
          return false;
        }

        // Filter by status
        const status = type === 'solution' ? (req as LabRequest).status : (req as DeliveryRequest).labStatus;
        if (aiCriteria.status && !status?.toLowerCase().includes(aiCriteria.status.toLowerCase())) {
          return false;
        }

        // Filter by amount range
        const amount = type === 'solution' 
          ? (req as LabRequest).totalAmountForTraining 
          : (req as DeliveryRequest).totalAmount;
        if (aiCriteria.amountRange) {
          if (aiCriteria.amountRange.min && amount < aiCriteria.amountRange.min) return false;
          if (aiCriteria.amountRange.max && amount > aiCriteria.amountRange.max) return false;
        }

        // Filter by search terms
        if (aiCriteria.searchTerms && aiCriteria.searchTerms.length > 0) {
          const searchableText = [
            req.freshDeskTicketNumber,
            req.potentialId,
            req.client,
            req.labName,
            req.requester,
            req.agentName,
            type === 'delivery' ? (req as DeliveryRequest).trainingName : '',
          ].filter(Boolean).join(' ').toLowerCase();

          return aiCriteria.searchTerms.some(term => 
            searchableText.includes(term.toLowerCase())
          );
        }

        return true;
      }

      // Basic search fallback
      return (
        req.freshDeskTicketNumber?.toLowerCase().includes(query) ||
        req.potentialId?.toLowerCase().includes(query) ||
        req.client?.toLowerCase().includes(query) ||
        req.labName?.toLowerCase().includes(query) ||
        req.requester?.toLowerCase().includes(query) ||
        req.agentName?.toLowerCase().includes(query) ||
        (type === 'delivery' && (req as DeliveryRequest).trainingName?.toLowerCase().includes(query))
      );
    };

    // Search lab requests
    labRequests.forEach((req) => {
      if (filterFn(req, 'solution')) {
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
      if (filterFn(req, 'delivery')) {
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
  }, [searchQuery, labRequests, deliveryRequests, aiCriteria]);

  const handleClear = () => {
    setSearchQuery('');
    setAiCriteria(null);
  };

  const handleAISearch = () => {
    performAISearch(searchQuery);
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
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Search
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Try: 'Show me all AWS solutions over 50000 from Acme Corp'"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setAiCriteria(null); // Reset AI criteria on new input
              }}
              className="pl-10 pr-24"
              autoFocus
            />
            {searchQuery && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-primary hover:text-primary"
                  onClick={handleAISearch}
                  disabled={isAISearching}
                >
                  {isAISearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {aiCriteria && (
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI Search Active
              </Badge>
              {aiCriteria.client && (
                <Badge variant="outline">Client: {aiCriteria.client}</Badge>
              )}
              {aiCriteria.cloud && (
                <Badge variant="outline">Cloud: {aiCriteria.cloud}</Badge>
              )}
              {aiCriteria.status && (
                <Badge variant="outline">Status: {aiCriteria.status}</Badge>
              )}
              {aiCriteria.type && (
                <Badge variant="outline">Type: {aiCriteria.type}</Badge>
              )}
              {aiCriteria.amountRange && (
                <Badge variant="outline">
                  Amount: {aiCriteria.amountRange.min || 0} - {aiCriteria.amountRange.max || '∞'}
                </Badge>
              )}
            </div>
          )}

          {searchQuery && (
            <div className="text-sm text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              {!aiCriteria && ' (Press AI button for smart search)'}
            </div>
          )}

          <ScrollArea className="h-[400px]">
            {searchResults.length === 0 && searchQuery && !isAISearching && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm">Try the AI search for natural language queries</p>
              </div>
            )}

            {isAISearching && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-12 w-12 mb-4 animate-spin text-primary" />
                <p>AI is analyzing your query...</p>
              </div>
            )}

            {!searchQuery && !isAISearching && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                <p>Start typing to search</p>
                <p className="text-sm text-center max-w-xs mt-2">
                  Try natural language like "Find all Azure deliveries from last month" or "Show pending solutions over ₹100,000"
                </p>
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
