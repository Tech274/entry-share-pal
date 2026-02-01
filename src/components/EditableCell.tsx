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
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  className?: string;
  align?: 'left' | 'center' | 'right';
  prefix?: string;
}

export const EditableCell = ({
  value,
  onSave,
  type = 'text',
  options = [],
  className,
  align = 'left',
  prefix,
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
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
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

  const displayValue = value === 0 || value === '' ? '-' : 
    prefix ? `${prefix}${typeof value === 'number' ? value.toLocaleString() : value}` : String(value);

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
    return (
      <Input
        ref={inputRef}
        type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 text-xs px-1 min-w-[60px]"
        step={type === 'number' ? '0.01' : undefined}
      />
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
