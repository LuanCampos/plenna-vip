import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn('animate-pulse rounded-lg bg-muted shimmer', className)}
    {...props}
  />
);

export const SkeletonCard = () => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full" />
  </div>
);

interface SkeletonListProps {
  count?: number;
}

export const SkeletonList = ({ count = 3 }: SkeletonListProps) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);
