import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AnimatedCategoryPillProps {
  category: {
    id: string;
    category_id: string;
    label: string;
    icon_name: string;
    gradient_color: string;
  };
  Icon: LucideIcon;
  isActive: boolean;
  count: number;
  onClick: () => void;
  index: number;
  variant?: 'featured' | 'secondary';
}

export const AnimatedCategoryPill = ({
  category,
  Icon,
  isActive,
  count,
  onClick,
  index,
  variant = 'featured',
}: AnimatedCategoryPillProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on index
          setTimeout(() => {
            setIsVisible(true);
          }, index * 50);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, rootMargin: '20px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  const gradientColor = category.gradient_color || 'bg-gradient-to-r from-primary to-primary/80';

  if (variant === 'secondary') {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-all duration-300 text-xs",
          "opacity-0 translate-y-4",
          isVisible && "opacity-100 translate-y-0",
          isActive
            ? `${gradientColor} text-white shadow-lg scale-105`
            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-muted hover:text-foreground"
        )}
        style={{
          transitionDelay: isVisible ? '0ms' : `${index * 50}ms`,
        }}
      >
        <Icon className="h-3 w-3" />
        <span>{category.label}</span>
        {count > 0 && (
          <Badge variant="outline" className={cn(
            "text-[10px] h-4 px-1 transition-colors",
            isActive ? "bg-white/20 text-white border-white/30" : ""
          )}>
            {count}
          </Badge>
        )}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 text-sm",
        "opacity-0 translate-y-4",
        isVisible && "opacity-100 translate-y-0",
        isActive
          ? `${gradientColor} text-white shadow-lg scale-105`
          : "bg-background text-foreground hover:bg-muted border hover:shadow-md hover:scale-[1.02]"
      )}
      style={{
        transitionDelay: isVisible ? '0ms' : `${index * 50}ms`,
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{category.label}</span>
      <Badge variant="secondary" className={cn(
        "text-xs h-5 px-1.5 transition-colors",
        isActive ? "bg-white/20 text-white" : ""
      )}>
        {count}
      </Badge>
    </button>
  );
};
