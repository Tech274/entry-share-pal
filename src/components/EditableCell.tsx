import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface EditableCellProps {
  value: string | number;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number' | 'select' | 'date' | 'currency' | 'percentage';
  options?: string[];
  className?: string;
  align?: 'left' | 'center' | 'right';
  prefix?: string;
  suffix?: string;
}

export const EditableCell = ({
  value,
  onSave,
  type = 'text',
  options = [],
  className,
  align = 'left',
  prefix,
  suffix,
}: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setEditValue(String(value));
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    let newValue: string | number = editValue;
    if (type === 'number' || type === 'currency' || type === 'percentage') {
      newValue = parseFloat(editValue) || 0;
      // Clamp percentage to 0-100
      if (type === 'percentage') {
        newValue = Math.min(100, Math.max(0, newValue));
      }
      // Ensure non-negative for currency
      if (type === 'currency') {
        newValue = Math.max(0, newValue);
      }
    }
    if (newValue !== value) {
      onSave(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(value));
    }
  };

  const formatDisplayValue = () => {
    if (value === '' || (value === 0 && type !== 'number' && type !== 'currency' && type !== 'percentage')) {
      return '-';
    }
    
    let displayStr = '';
    if (type === 'currency') {
      displayStr = `₹${typeof value === 'number' ? value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`;
    } else if (type === 'percentage') {
      displayStr = `${typeof value === 'number' ? value.toFixed(2) : value}%`;
    } else if (prefix) {
      displayStr = `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}`;
    } else if (suffix) {
      displayStr = `${typeof value === 'number' ? value.toLocaleString() : value}${suffix}`;
    } else {
      displayStr = String(value);
    }
    return displayStr;
  };

  const displayValue = formatDisplayValue();

  if (type === 'select' && isEditing) {
    return (
      <Select
        value={editValue}
        onValueChange={(v) => {
          setEditValue(v);
          setIsEditing(false);
          onSave(v);
        }}
        open={isEditing}
        onOpenChange={(open) => !open && setIsEditing(false)}
      >
        <SelectTrigger className="h-7 text-xs border-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (isEditing) {
    const inputType = type === 'date' ? 'date' : (type === 'number' || type === 'currency' || type === 'percentage') ? 'number' : 'text';
    return (
      <div className="relative">
        {type === 'currency' && (
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">₹</span>
        )}
        <Input
          ref={inputRef}
          type={inputType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-7 text-xs min-w-[60px]",
            type === 'currency' && "pl-4",
            type === 'percentage' && "pr-5"
          )}
          step={(type === 'number' || type === 'currency' || type === 'percentage') ? '0.01' : undefined}
          min={type === 'currency' ? '0' : type === 'percentage' ? '0' : undefined}
          max={type === 'percentage' ? '100' : undefined}
        />
        {type === 'percentage' && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={cn(
        'cursor-pointer hover:bg-primary/10 px-1 py-0.5 rounded min-h-[24px] transition-colors',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      title="Double-click to edit"
    >
      {displayValue}
    </div>
  );
};
