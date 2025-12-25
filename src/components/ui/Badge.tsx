import { ReviewState } from '@/api/types';
import { cn } from '@/utils/cn';

interface BadgeProps {
  state: ReviewState;
  className?: string;
}

const STATE_STYLES: Record<ReviewState, string> = {
  [ReviewState.Open]: 'bg-green-100 text-green-800 border-green-300',
  [ReviewState.Closed]: 'bg-red-100 text-red-800 border-red-300',
  [ReviewState.Merged]: 'bg-purple-100 text-purple-800 border-purple-300',
  [ReviewState.Draft]: 'bg-gray-100 text-gray-800 border-gray-300',
};

const STATE_LABELS: Record<ReviewState, string> = {
  [ReviewState.Open]: 'Open',
  [ReviewState.Closed]: 'Closed',
  [ReviewState.Merged]: 'Merged',
  [ReviewState.Draft]: 'Draft',
};

/**
 * Badge component for displaying PR state
 * Uses color + text for accessibility (not just color)
 */
export function Badge({ state, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        STATE_STYLES[state],
        className
      )}
      aria-label={`Pull request status: ${STATE_LABELS[state]}`}
    >
      {STATE_LABELS[state]}
    </span>
  );
}
