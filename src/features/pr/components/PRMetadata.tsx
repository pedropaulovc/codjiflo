import type { Review } from '@/api/types';
import { Badge } from '@/components/ui';

interface PRMetadataProps {
  pr: Review;
}

/**
 * Displays PR metadata: title, author, state badge, branches
 * S-1.2: AC-1.2.1 through AC-1.2.6
 */
export function PRMetadata({ pr }: PRMetadataProps) {
  return (
    <div className="p-6 bg-white">
      {/* Title - H1 per AC-1.2.8 */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {pr.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        {/* Author avatar and name - AC-1.2.3 */}
        <div className="flex items-center gap-2">
          <img
            src={pr.author.avatarUrl}
            alt={`${pr.author.displayName}'s avatar`}
            className="w-8 h-8 rounded-full"
          />
          <span className="font-medium text-gray-900">{pr.author.displayName}</span>
        </div>

        {/* State badge - AC-1.2.4 */}
        <Badge state={pr.state} />

        {/* Branches - AC-1.2.5 */}
        <span className="text-gray-600 text-sm">
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
            {pr.sourceBranch}
          </code>
          <span className="mx-2">into</span>
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
            {pr.targetBranch}
          </code>
        </span>

        {/* Link to GitHub - AC-1.2.6, AC-1.2.10 */}
        <a
          href={pr.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-blue-600 hover:text-blue-800 hover:underline text-sm"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
