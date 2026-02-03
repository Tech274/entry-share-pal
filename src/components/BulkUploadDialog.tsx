import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ParsedRow {
  [key: string]: string | number;
}

interface BulkUploadDialogProps<T> {
  title: string;
  description: string;
  templateHeaders: string[];
  onUpload: (data: T[]) => Promise<void>;
  parseRow: (row: ParsedRow, headers: string[]) => T | null;
  trigger?: React.ReactNode;
}

export function BulkUploadDialog<T>({
  title,
  description,
  templateHeaders,
  onUpload,
  parseRow,
  trigger,
}: BulkUploadDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<{ valid: number; invalid: number; data: T[] } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseCSV = (text: string): { headers: string[]; rows: ParsedRow[] } => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row: ParsedRow = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, '') || '';
        // Try to parse as number
        const numValue = Number(value);
        row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
      });
      rows.push(row);
    }

    return { headers, rows };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const text = await file.text();
      const { headers, rows } = parseCSV(text);

      const validData: T[] = [];
      const parseErrors: string[] = [];

      rows.forEach((row, index) => {
        const parsed = parseRow(row, headers);
        if (parsed) {
          validData.push(parsed);
        } else {
          parseErrors.push(`Row ${index + 2}: Invalid or missing required fields`);
        }
      });

      setPreview({
        valid: validData.length,
        invalid: rows.length - validData.length,
        data: validData,
      });
      setErrors(parseErrors.slice(0, 5)); // Show max 5 errors
    } catch (error: any) {
      toast({
        title: 'Parse error',
        description: error.message || 'Failed to parse CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!preview?.data.length) return;

    setIsUploading(true);
    try {
      await onUpload(preview.data);
      toast({
        title: 'Upload successful',
        description: `${preview.data.length} records imported successfully`,
      });
      setOpen(false);
      setPreview(null);
      setErrors([]);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to import records',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = templateHeaders.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setPreview(null);
    setErrors([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetState();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
                  dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag and drop a CSV file or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only .csv files are supported
                  </p>
                </div>
              </div>

              <Button
                variant="link"
                size="sm"
                onClick={handleDownloadTemplate}
                className="text-xs"
              >
                Download CSV template
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">{preview.valid} valid</span>
                  </div>
                  {preview.invalid > 0 && (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">{preview.invalid} invalid</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {errors.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                  <p className="font-medium mb-1">Errors found:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                  {preview.invalid > 5 && (
                    <p className="mt-2 text-xs">...and {preview.invalid - 5} more</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetState}>
                  Choose another file
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={preview.valid === 0 || isUploading}
                >
                  {isUploading ? 'Importing...' : `Import ${preview.valid} records`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
