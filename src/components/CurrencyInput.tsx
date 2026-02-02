import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const CurrencyInput = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    setDisplayValue(value ? value.toString() : '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow only numbers and single decimal point
    const sanitized = input.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      // Limit to 2 decimal places
      formatted += '.' + parts[1].slice(0, 2);
    }
    
    setDisplayValue(formatted);
    
    const numValue = parseFloat(formatted) || 0;
    // Prevent negative values
    onChange(Math.max(0, numValue));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
          ₹
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder="0.00"
          disabled={disabled}
          className={cn("pl-8", error && "border-destructive")}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
