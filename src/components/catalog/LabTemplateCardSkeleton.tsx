import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LabTemplateCardSkeletonProps {
  index?: number;
}

export const LabTemplateCardSkeleton = ({ index = 0 }: LabTemplateCardSkeletonProps) => {
  return (
    <Card 
      className="animate-pulse"
      style={{ 
        animationDelay: `${(index % 6) * 100}ms`,
        animationDuration: '1.5s',
      }}
    >
      <CardHeader className="pb-2 pr-10">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export const LabTemplateCardSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <LabTemplateCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
};
