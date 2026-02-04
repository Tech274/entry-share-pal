import { cn } from '@/lib/utils';
import { getIconComponent } from '@/lib/categoryIcons';

interface CategoryPillPreviewProps {
  label: string;
  iconName: string;
  gradientColor: string;
  isFeatured?: boolean;
}

export const CategoryPillPreview = ({ 
  label, 
  iconName, 
  gradientColor,
  isFeatured = false 
}: CategoryPillPreviewProps) => {
  const IconComponent = getIconComponent(iconName);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Preview</p>
      <div className="p-4 bg-muted rounded-lg flex flex-col items-center gap-3">
        {/* Active/Selected State */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Selected State</p>
          <button
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium text-white transition-all flex items-center gap-2 shadow-md",
              gradientColor
            )}
          >
            <IconComponent className="w-4 h-4" />
            {label || 'Category'}
          </button>
        </div>
        
        {/* Inactive State */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2">Default State</p>
          <button
            className="px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground transition-all flex items-center gap-2"
          >
            <IconComponent className="w-4 h-4" />
            {label || 'Category'}
          </button>
        </div>

        {isFeatured && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            ⭐ Featured
          </span>
        )}
      </div>
    </div>
  );
};
