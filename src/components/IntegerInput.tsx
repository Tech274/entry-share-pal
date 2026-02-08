import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface IntegerInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
}

export const IntegerInput = ({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  min = 1,
}: IntegerInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow only digits
    const sanitized = input.replace(/[^0-9]/g, '');
    
    const numValue = parseInt(sanitized, 10) || 0;
    onChange(numValue);
  };

  const handleBlur = () => {
    // Ensure minimum value on blur
    if (value < min && value !== 0) {
      onChange(min);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={min.toString()}
        disabled={disabled}
        className={cn(error && "border-destructive")}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
