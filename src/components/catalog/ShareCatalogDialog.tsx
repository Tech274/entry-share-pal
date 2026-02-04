import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Share2, CheckCircle2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.object({
  recipientEmail: z.string().trim().email({ message: "Please enter a valid email address" }),
  recipientName: z.string().trim().max(100, { message: "Name must be less than 100 characters" }).optional(),
  message: z.string().trim().max(500, { message: "Message must be less than 500 characters" }).optional(),
});

interface ShareCatalogDialogProps {
  catalogUrl?: string;
  trigger?: React.ReactNode;
}

const ShareCatalogDialog = ({ catalogUrl, trigger }: ShareCatalogDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use the published URL for sharing
  const shareUrl = catalogUrl || 'https://entry-share-pal.lovable.app/public-catalog';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Catalog link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const resetForm = () => {
    setRecipientEmail('');
    setRecipientName('');
    setPersonalMessage('');
    setErrors({});
    setIsSent(false);
  };

  const handleSendEmail = async () => {
    // Validate inputs
    const validation = emailSchema.safeParse({
      recipientEmail,
      recipientName,
      message: personalMessage,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-catalog-share', {
        body: {
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          personalMessage: personalMessage.trim() || undefined,
          catalogUrl: shareUrl,
        },
      });

      if (error) throw error;

      setIsSent(true);
      toast.success(`Catalog link sent to ${recipientEmail}`);
      
      // Reset after a delay
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error sending share email:', error);
      toast.error(error.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Share2 className="w-4 h-4" />
            Share Catalog
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Lab Catalog
          </DialogTitle>
          <DialogDescription>
            Send the lab catalog link to an account manager or sales manager via email.
          </DialogDescription>
        </DialogHeader>

        {isSent ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium">Email Sent!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The catalog link has been sent to {recipientEmail}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Quick Copy Link */}
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm bg-muted"
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink} title="Copy link">
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or send via email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">
                  Recipient Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="manager@company.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={errors.recipientEmail ? 'border-destructive' : ''}
                />
                {errors.recipientEmail && (
                  <p className="text-xs text-destructive">{errors.recipientEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  type="text"
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={errors.recipientName ? 'border-destructive' : ''}
                />
                {errors.recipientName && (
                  <p className="text-xs text-destructive">{errors.recipientName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalMessage">Personal Message (optional)</Label>
                <Textarea
                  id="personalMessage"
                  placeholder="Check out our lab catalog for training solutions..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className={errors.message ? 'border-destructive' : ''}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  {errors.message ? (
                    <p className="text-destructive">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <span>{personalMessage.length}/500</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSendEmail}
              disabled={isSending || !recipientEmail.trim()}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Catalog Link
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareCatalogDialog;
