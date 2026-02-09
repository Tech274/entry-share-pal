import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Database, AlertTriangle, Loader2 } from 'lucide-react';
import { useCloudBilling, CloudBillingEntry, MONTH_OPTIONS } from '@/hooks/useCloudBilling';
import { formatINR, formatPercentage } from '@/lib/formatUtils';
import { useToast } from '@/hooks/use-toast';

const YEAR_OPTIONS = [2024, 2025, 2026];

interface BillingFormData {
  vendor_name: string;
  month: string;
  year: number;
  overall_business: number;
  cloud_cost: number;
  invoiced_to_customer: number;
}

const defaultFormData: BillingFormData = {
  vendor_name: '',
  month: 'January',
  year: 2025,
  overall_business: 0,
  cloud_cost: 0,
  invoiced_to_customer: 0,
};

export const CloudBillingTab = () => {
  const { entries, loading, error, addEntry, updateEntry, deleteEntry, loadSampleData } = useCloudBilling();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CloudBillingEntry | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'aws' | 'azure' | 'gcp'>('aws');
  const [formData, setFormData] = useState<BillingFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group entries by provider
  const awsEntries = entries.filter(e => e.provider === 'aws');
  const azureEntries = entries.filter(e => e.provider === 'azure');
  const gcpEntries = entries.filter(e => e.provider === 'gcp');

  const handleOpenDialog = (provider: 'aws' | 'azure' | 'gcp', entry?: CloudBillingEntry) => {
    setSelectedProvider(provider);
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        vendor_name: entry.vendor_name,
        month: entry.month,
        year: entry.year,
        overall_business: entry.overall_business,
        cloud_cost: entry.cloud_cost,
        invoiced_to_customer: entry.invoiced_to_customer,
      });
    } else {
      setEditingEntry(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.vendor_name.trim()) {
      toast({ title: 'Error', description: 'Vendor name is required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        provider: selectedProvider,
        ...formData,
      };

      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
        toast({ title: 'Updated', description: 'Cloud billing entry updated successfully' });
      } else {
        await addEntry(data);
        toast({ title: 'Added', description: 'Cloud billing entry added successfully' });
      }
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingEntry(null);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save entry', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      await deleteEntry(id);
      toast({ title: 'Deleted', description: 'Cloud billing entry deleted' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' });
    }
  };

  const handleLoadSampleData = async () => {
    if (!window.confirm('This will add sample data for testing. Continue?')) return;
    
    try {
      await loadSampleData();
      toast({ title: 'Sample Data Loaded', description: 'Sample cloud billing data has been added' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load sample data', variant: 'destructive' });
    }
  };

  const renderBillingTable = (provider: 'aws' | 'azure' | 'gcp', data: CloudBillingEntry[], title: string, bgColor: string) => (
    <Card key={provider}>
      <CardHeader className={`${bgColor} text-white py-3 px-4 rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDialog(provider)}
            className="h-7"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-0">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {title.toLowerCase()} data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead className="text-right">Overall Business</TableHead>
                  <TableHead className="text-right">Cost on {provider.toUpperCase()}</TableHead>
                  <TableHead className="text-right">Margins</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="text-right">Invoiced to Customer</TableHead>
                  <TableHead className="text-right">Yet to be Billed</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.month} {entry.year}</TableCell>
                    <TableCell>{entry.vendor_name}</TableCell>
                    <TableCell className="text-right">{formatINR(entry.overall_business)}</TableCell>
                    <TableCell className="text-right">{formatINR(entry.cloud_cost)}</TableCell>
                    <TableCell className="text-right">{formatINR(entry.margins)}</TableCell>
                    <TableCell className="text-right">{formatPercentage(entry.margin_percentage)}</TableCell>
                    <TableCell className="text-right">{formatINR(entry.invoiced_to_customer)}</TableCell>
                    <TableCell className="text-right">{formatINR(entry.yet_to_be_billed)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenDialog(provider, entry)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(entry.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Database Schema Missing</AlertTitle>
        <AlertDescription>
          The cloud_billing_details table doesn't exist. Please run the migration script: <code className="bg-muted px-2 py-1 rounded">supabase/RUN_CLOUD_BILLING.sql</code>
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cloud Billing Details</h2>
        <Button variant="outline" onClick={handleLoadSampleData}>
          <Database className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>
      </div>

      <div className="space-y-6">
        {renderBillingTable('aws', awsEntries, 'AWS', 'bg-orange-500')}
        {renderBillingTable('azure', azureEntries, 'Azure', 'bg-blue-600')}
        {renderBillingTable('gcp', gcpEntries, 'GCP', 'bg-red-500')}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit' : 'Add'} {selectedProvider.toUpperCase()} Billing Entry
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vendor_name">Vendor Name</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={formData.month}
                  onValueChange={(value) => setFormData({ ...formData, month: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="overall_business">Overall Business (₹)</Label>
              <Input
                id="overall_business"
                type="number"
                value={formData.overall_business}
                onChange={(e) => setFormData({ ...formData, overall_business: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cloud_cost">Cost on {selectedProvider.toUpperCase()} (₹)</Label>
              <Input
                id="cloud_cost"
                type="number"
                value={formData.cloud_cost}
                onChange={(e) => setFormData({ ...formData, cloud_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoiced_to_customer">Invoiced to Customer (₹)</Label>
              <Input
                id="invoiced_to_customer"
                type="number"
                value={formData.invoiced_to_customer}
                onChange={(e) => setFormData({ ...formData, invoiced_to_customer: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Margins = Overall Business - Cost = {formatINR(formData.overall_business - formData.cloud_cost)}</p>
              <p>Yet to be Billed = Overall Business - Invoiced = {formatINR(formData.overall_business - formData.invoiced_to_customer)}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingEntry ? 'Update' : 'Add'} Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
