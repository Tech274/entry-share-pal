import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Layers, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabTemplateCardProps {
  template: {
    name: string;
    description: string;
    category?: string;
    categoryLabel?: string;
    icon?: LucideIcon;
  };
  categoryIcon?: LucideIcon;
  isFeatured?: boolean;
  featuredColor?: string;
  isSearching?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const LabTemplateCard = ({
  template,
  categoryIcon,
  isFeatured,
  featuredColor,
  isSearching,
  isSelected,
  onToggleSelect,
}: LabTemplateCardProps) => {
  const TemplateIcon = template.icon || categoryIcon || Layers;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all hover:-translate-y-1 group relative cursor-pointer",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onToggleSelect}
    >
      {/* Selection checkbox */}
      <div 
        className="absolute top-3 right-3 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          className={cn(
            "h-5 w-5 border-2",
            isSelected 
              ? "border-primary bg-primary text-primary-foreground" 
              : "border-muted-foreground/50 bg-background"
          )}
        />
      </div>

      <CardHeader className="pb-2 pr-10">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            isFeatured && featuredColor
              ? featuredColor + " text-white"
              : "bg-primary/10 text-primary"
          )}>
            <TemplateIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
              {template.name}
            </CardTitle>
            {isSearching && template.categoryLabel && (
              <Badge variant="outline" className="mt-1 text-[10px]">
                {template.categoryLabel}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm line-clamp-2">
          {template.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default LabTemplateCard;
