import { Skeleton } from '@/components/ui/skeleton';

interface CategoryPillSkeletonProps {
  index?: number;
  variant?: 'featured' | 'secondary';
}

export const CategoryPillSkeleton = ({ index = 0, variant = 'featured' }: CategoryPillSkeletonProps) => {
  const isFeatured = variant === 'featured';
  
  return (
    <div 
      className="animate-pulse"
      style={{ 
        animationDelay: `${index * 80}ms`,
        animationDuration: '1.5s',
      }}
    >
      <Skeleton 
        className={
          isFeatured 
            ? "h-10 w-28 rounded-full" 
            : "h-8 w-24 rounded-full"
        } 
      />
    </div>
  );
};

interface CategoryPillSkeletonRowProps {
  count?: number;
  variant?: 'featured' | 'secondary';
}

export const CategoryPillSkeletonRow = ({ count = 6, variant = 'featured' }: CategoryPillSkeletonRowProps) => {
  const widths = variant === 'featured' 
    ? ['w-28', 'w-32', 'w-24', 'w-36', 'w-28', 'w-30']
    : ['w-20', 'w-24', 'w-22', 'w-26', 'w-20', 'w-24'];
  
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="animate-pulse"
          style={{ 
            animationDelay: `${index * 80}ms`,
            animationDuration: '1.5s',
          }}
        >
          <Skeleton 
            className={`${variant === 'featured' ? 'h-10' : 'h-8'} ${widths[index % widths.length]} rounded-full`}
          />
        </div>
      ))}
    </div>
  );
};
