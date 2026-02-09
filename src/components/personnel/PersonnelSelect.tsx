import { usePersonnel, PersonnelEntry } from '@/hooks/usePersonnel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type PersonnelType = 'agents' | 'accountManagers' | 'clients' | 'solutionManagers' | 'deliveryManagers';

interface PersonnelSelectProps {
  type: PersonnelType;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const PersonnelSelect = ({
  type,
  value,
  onChange,
  label,
  placeholder = 'Select...',
  required = false,
  error,
  disabled = false,
  className,
}: PersonnelSelectProps) => {
  const personnel = usePersonnel();
  
  const getOptions = (): PersonnelEntry[] => {
    switch (type) {
      case 'agents':
        return personnel.agents;
      case 'accountManagers':
        return personnel.accountManagers;
      case 'clients':
        return personnel.clients;
      case 'solutionManagers':
        return personnel.solutionManagers;
      case 'deliveryManagers':
        return personnel.deliveryManagers;
      default:
        return [];
    }
  };

  const options = getOptions().filter(p => p.is_active);

  if (personnel.loading) {
    return (
      <div className={`space-y-2 ${className || ''}`}>
        <Label>{label}{required && <span className="text-destructive ml-1">*</span>}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">None</span>
          </SelectItem>
          {options.map(person => (
            <SelectItem key={person.id} value={person.name}>
              {person.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {options.length === 0 && !personnel.loading && (
        <p className="text-xs text-muted-foreground">
          No {type.replace(/([A-Z])/g, ' $1').toLowerCase()} found. Add them in Personnel & Clients.
        </p>
      )}
    </div>
  );
};

// Export a hook for getting personnel data directly
export { usePersonnel } from '@/hooks/usePersonnel';
