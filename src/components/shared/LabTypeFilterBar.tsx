import { Cloud, Server, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LabTypeCounts {
  all: number;
  publicCloud: number;
  privateCloud: number;
  tpLabs: number;
}

interface LabTypeFilterBarProps {
  counts: LabTypeCounts;
  activeFilter: string;
  onFilterChange: (key: string) => void;
  className?: string;
}

export const LabTypeFilterBar = ({
  counts,
  activeFilter,
  onFilterChange,
  className,
}: LabTypeFilterBarProps) => {
  const options = [
    { key: 'all', label: 'All', count: counts.all, icon: <Building2 className="w-4 h-4" /> },
    { key: 'public', label: 'Public Cloud', count: counts.publicCloud, icon: <Cloud className="w-4 h-4" /> },
    { key: 'private', label: 'Private Cloud', count: counts.privateCloud, icon: <Server className="w-4 h-4" /> },
    { key: 'tp-labs', label: 'TP Labs', count: counts.tpLabs, icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-sm font-medium text-muted-foreground mr-2">Lab Type:</span>
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
