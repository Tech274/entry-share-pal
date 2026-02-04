import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Layers, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateLabel {
  label_id: string;
  name: string;
  color: string;
}

interface LabTemplateCardProps {
  template: {
    id?: string;
    name: string;
    description: string;
    category?: string;
    categoryLabel?: string;
    icon?: LucideIcon;
    labels?: TemplateLabel[];
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
  isSelected,
  onToggleSelect,
}: LabTemplateCardProps) => {
  const TemplateIcon = template.icon || categoryIcon || Layers;

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all hover:-translate-y-1 group relative cursor-pointer",
        isSelected && "ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/20"
      )}
      onClick={onToggleSelect}
    >
      {/* Heart favorite button */}
      <button 
        className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 hover:scale-110"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.();
        }}
      >
        <Heart 
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isSelected 
              ? "fill-rose-500 text-rose-500 scale-110" 
              : "text-muted-foreground/50 hover:text-rose-400"
          )}
        />
      </button>

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
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm line-clamp-2 mb-2">
          {template.description}
        </CardDescription>
        {/* Labels and category */}
        <div className="flex flex-wrap gap-1.5">
          {/* Assigned labels */}
          {template.labels && template.labels.length > 0 && (
            template.labels.map((label) => (
              <Badge 
                key={label.label_id}
                className={cn(
                  "text-[10px] text-white border-0 px-2 py-0.5",
                  label.color
                )}
              >
                {label.name}
              </Badge>
            ))
          )}
          {/* Category label */}
          {template.categoryLabel && (
            <Badge 
              variant="outline" 
              className="text-[10px] bg-muted/50 text-muted-foreground border-muted-foreground/20"
            >
              {template.categoryLabel}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LabTemplateCard;
