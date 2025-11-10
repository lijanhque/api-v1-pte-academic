import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  height?: string;
  className?: string;
}

export function LoadingSkeleton({ height = '20px', className }: LoadingSkeletonProps) {
  return (
    <div 
      className={cn('animate-pulse rounded-md bg-muted', className)} 
      style={{ height }}
    />
  );
}