import { ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterOption {
  key: string;
  label: string;
  count: number;
  icon?: React.ReactNode;
}

interface StatusFilterBarProps {
  options: FilterOption[];
  activeFilter: string;
  onFilterChange: (key: string) => void;
  className?: string;
}

export const StatusFilterBar = ({
  options,
  activeFilter,
  onFilterChange,
  className,
}: StatusFilterBarProps) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-sm font-medium text-muted-foreground mr-2 flex items-center gap-1">
        <ListFilter className="w-4 h-4" />
        Filter:
      </span>
      {options.map((option) => (
        <Button
          key={option.key}
          variant={activeFilter === option.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(option.key)}
          className="gap-2"
        >
          {option.icon}
          {option.label}
          <Badge variant="secondary" className="ml-1">
            {option.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};
