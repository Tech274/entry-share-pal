import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="py-2 px-4">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="pt-4">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export function DashboardChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-end gap-2" style={{ height }}>
          <Skeleton className="w-12 h-[40%]" />
          <Skeleton className="w-12 h-[60%]" />
          <Skeleton className="w-12 h-[80%]" />
          <Skeleton className="w-12 h-[55%]" />
          <Skeleton className="w-12 h-[70%]" />
          <Skeleton className="w-12 h-[45%]" />
          <Skeleton className="w-12 h-[65%]" />
          <Skeleton className="w-12 h-[50%]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPieSkeleton({ height = 280 }: { height?: number }) {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="pt-4 flex items-center justify-center" style={{ height }}>
        <div className="relative">
          <Skeleton className="h-40 w-40 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-24 w-24 rounded-full bg-background" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardKPIGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center p-4 bg-muted rounded-lg">
              <Skeleton className="h-8 w-12 mx-auto mb-2" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FullDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3 p-4 bg-card border rounded-lg">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20 ml-auto" />
      </div>

      {/* Overview sections */}
      <DashboardOverviewSkeleton />
      <DashboardOverviewSkeleton />

      {/* KPI Grid */}
      <DashboardKPIGridSkeleton />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChartSkeleton />
        <DashboardChartSkeleton />
      </div>
    </div>
  );
}
