import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RichTextEditor } from '@/components/RichTextEditor';
import { FileUpload } from '@/components/FileUpload';
import logo from '@/assets/makemylabs-logo.png';

const TASK_OPTIONS = ['Lab Request - Solutions', 'Lab Request - Delivery'];
const TENANT_OPTIONS = ['Techademy', 'MakeMyLabs', 'Other'];
const LAB_TYPE_OPTIONS = ['Cloud', 'On-Premise', 'Hybrid', 'Virtual'];
const LOB_OPTIONS = ['Standalone', 'VILT', 'Blended'];

interface RequestFormData {
  requesterEmail: string;
  taskType: string;
  tenantName: string;
  potentialId: string;
  startDate: string;
  endDate: string;
  labType: string;
  lineOfBusiness: string;
  subject: string;
  description: string;
}

interface AttachmentFile {
  url: string;
  name: string;
}

const SubmitRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attachment, setAttachment] = useState<AttachmentFile | null>(null);
  
  const [formData, setFormData] = useState<RequestFormData>({
    requesterEmail: '',
    taskType: '',
    tenantName: '',
    potentialId: '',
    startDate: '',
    endDate: '',
    labType: '',
    lineOfBusiness: '',
    subject: '',
    description: '',
  });

  const handleChange = (field: keyof RequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUploaded = (url: string, name: string) => {
    setAttachment({ url, name });
  };

  const handleFileRemoved = () => {
    setAttachment(null);
  };

  const validateForm = (): boolean => {
    if (!formData.requesterEmail) {
      toast({ title: 'Validation Error', description: 'Requester email is required', variant: 'destructive' });
      return false;
    }
    if (!formData.potentialId) {
      toast({ title: 'Validation Error', description: 'Potential ID is required', variant: 'destructive' });
      return false;
    }
    if (!formData.startDate) {
      toast({ title: 'Validation Error', description: 'Start date is required', variant: 'destructive' });
      return false;
    }
    if (!formData.endDate) {
      toast({ title: 'Validation Error', description: 'End date is required', variant: 'destructive' });
      return false;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({ title: 'Validation Error', description: 'End date must be after start date', variant: 'destructive' });
      return false;
    }
    if (!formData.subject) {
      toast({ title: 'Validation Error', description: 'Subject is required', variant: 'destructive' });
      return false;
    }
    // Check for empty or minimal HTML content
    const strippedDescription = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!strippedDescription) {
      toast({ title: 'Validation Error', description: 'Description is required', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Use edge function to bypass RLS for public submissions
      const { data, error } = await supabase.functions.invoke('submit-request', {
        body: {
          taskType: formData.taskType,
          requesterEmail: formData.requesterEmail,
          tenantName: formData.tenantName,
          potentialId: formData.potentialId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          labType: formData.labType,
          lineOfBusiness: formData.lineOfBusiness,
          subject: formData.subject,
          description: formData.description,
          attachmentUrl: attachment?.url,
          attachmentName: attachment?.name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Send email notification
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'submission',
            recipientEmail: formData.requesterEmail,
            requestDetails: {
              potentialId: formData.potentialId,
              client: formData.tenantName,
              subject: formData.subject,
              taskType: formData.taskType,
            },
          },
        });
        console.log('Notification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the submission if email fails
      }

      toast({
        title: 'Request Submitted',
        description: 'Your request has been submitted successfully. You will receive a confirmation email shortly.',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/my-requests">My Requests</Link>
              </Button>
              <Button variant="outline" className="font-medium bg-primary/10">
                Submit a Request
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
        <div className="flex items-center justify-between mb-6">
          {/* Breadcrumb */}
          <Breadcrumb>
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
                <BreadcrumbPage>Submit a request</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Search */}
          <div className="relative w-64 hidden md:block">
            <Input
              type="text"
              placeholder="Enter the search term here...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Submit a request</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Requester Email */}
            <div className="space-y-2">
              <Label htmlFor="requesterEmail">
                Requester <span className="text-destructive">*</span>
              </Label>
              <Input
                id="requesterEmail"
                type="email"
                placeholder="your.email@company.com"
                value={formData.requesterEmail}
                onChange={(e) => handleChange('requesterEmail', e.target.value)}
              />
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="taskType">Choose your Task</Label>
              <Select value={formData.taskType} onValueChange={(v) => handleChange('taskType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {TASK_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name</Label>
              <Select value={formData.tenantName} onValueChange={(v) => handleChange('tenantName', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {TENANT_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Potential ID */}
            <div className="space-y-2">
              <Label htmlFor="potentialId">
                Potential ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="potentialId"
                type="text"
                placeholder="Enter potential ID"
                value={formData.potentialId}
                onChange={(e) => handleChange('potentialId', e.target.value)}
              />
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                />
              </div>
            </div>

            {/* Lab Type */}
            <div className="space-y-2">
              <Label htmlFor="labType">Lab Type</Label>
              <Select value={formData.labType} onValueChange={(v) => handleChange('labType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {LAB_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Line of Business */}
            <div className="space-y-2">
              <Label htmlFor="lineOfBusiness">Line of Business</Label>
              <Select value={formData.lineOfBusiness} onValueChange={(v) => handleChange('lineOfBusiness', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {LOB_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Enter subject/training name"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
              />
            </div>

            {/* Description - Rich Text Editor */}
            <div className="space-y-2">
              <Label>
                Description <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => handleChange('description', value)}
                placeholder="Type something..."
              />
            </div>

            {/* File Attachment */}
            <div className="space-y-2">
              <Label>Attachment</Label>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                onFileRemoved={handleFileRemoved}
                currentFile={attachment}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip"
                maxSizeMB={10}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SubmitRequest;
