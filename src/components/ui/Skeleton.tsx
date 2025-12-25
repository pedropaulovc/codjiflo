import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

/**
 * Skeleton loading placeholder with pulse animation
 */
export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 rounded',
        className
      )}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Text-line skeleton for loading states
 */
export function SkeletonText({ className, lines = 1 }: { className?: string; lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 rounded h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
