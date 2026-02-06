import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIDataEditBarProps {
  tableType: 'delivery' | 'lab_requests';
  onEditComplete?: () => void;
  recordCount?: number;
}

interface EditResult {
  success: boolean;
  action?: string;
  affectedCount?: number;
  description?: string;
  error?: string;
  suggestion?: string;
  requiresConfirmation?: boolean;
  message?: string;
}

export const AIDataEditBar = ({ tableType, onEditComplete, recordCount }: AIDataEditBarProps) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<EditResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!instruction.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setLastResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-data-editor', {
        body: {
          instruction: instruction.trim(),
          context: {
            tableType,
            totalCount: recordCount,
          }
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        setLastResult({
          success: false,
          error: error.message || 'Failed to process request'
        });
        toast({
          title: 'Edit Failed',
          description: error.message || 'Failed to process your request',
          variant: 'destructive',
        });
        return;
      }

      setLastResult(data);
      
      if (data.success) {
        toast({
          title: 'Edit Applied',
          description: data.description || `Updated ${data.affectedCount} record(s)`,
        });
        setInstruction('');
        onEditComplete?.();
      } else if (data.requiresConfirmation) {
        toast({
          title: 'Action Not Allowed',
          description: data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Edit Failed',
          description: data.error || 'Could not process your request',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Request error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setLastResult({
        success: false,
        error: errorMessage
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const examplePrompts = [
    `Change status to Delivered for potential ID P-001`,
    `Set all January 2025 records to Completed`,
    `Update client to "Acme Corp" where ticket is FD-12345`,
    `Change cloud type to AWS for all Public Cloud records`,
  ];

  return (
    <div className="border rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">AI Edit</span>
        </div>
        
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder={`Describe your edit... (e.g., "Change status to Delivered for P-001")`}
            disabled={isProcessing}
            className="pr-10 bg-background/80"
          />
          {isProcessing && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>
        
        <Button 
          type="submit" 
          size="sm" 
          disabled={!instruction.trim() || isProcessing}
          className="gap-1"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Apply</span>
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </form>

      {/* Result Display */}
      {lastResult && (
        <div className={cn(
          "px-3 pb-3 flex items-start gap-2",
          lastResult.success ? "text-primary" : "text-destructive"
        )}>
          {lastResult.success ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          ) : lastResult.requiresConfirmation ? (
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-accent-foreground" />
          ) : (
            <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          )}
          <div className="text-sm">
            <p>{lastResult.description || lastResult.error || lastResult.message}</p>
            {lastResult.suggestion && (
              <p className="text-muted-foreground mt-1">{lastResult.suggestion}</p>
            )}
            {lastResult.affectedCount !== undefined && lastResult.success && (
              <p className="text-muted-foreground">
                {lastResult.affectedCount} record(s) updated
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expanded Examples */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground py-2">Example commands:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setInstruction(prompt);
                  inputRef.current?.focus();
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
