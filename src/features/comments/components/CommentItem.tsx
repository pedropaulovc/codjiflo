import Markdown from 'react-markdown';
import type { Comment } from '../types';
import { Button } from '@/components';
import { formatTimeAgo } from '@/utils/time';

interface CommentItemProps {
  comment: Comment;
  isCurrentUser: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function CommentItem({ comment, isCurrentUser, onEdit, onDelete }: CommentItemProps) {
  const timeAgo = formatTimeAgo(comment.createdAt);

  return (
    <article
      className="flex gap-3"
      aria-label={`Comment by ${comment.author.login}, ${timeAgo}`}
    >
      <img
        src={comment.author.avatarUrl}
        alt={`${comment.author.login} avatar`}
        className="h-8 w-8 rounded-full border border-gray-200"
      />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{comment.author.login}</span>
          <time dateTime={comment.createdAt.toISOString()}>{timeAgo}</time>
          {comment.isPending && (
            <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-800">
              Pending
            </span>
          )}
        </div>
        <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:bg-gray-50">
          <Markdown
            components={{
              a: ({ children, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {comment.body}
          </Markdown>
        </div>
        {isCurrentUser && (
          <div className="flex gap-2">
            <Button
              label="Edit"
              variant="secondary"
              size="sm"
              className="bg-transparent text-blue-600 hover:bg-blue-50"
              onClick={onEdit}
            />
            <Button
              label="Delete"
              variant="secondary"
              size="sm"
              className="bg-transparent text-red-600 hover:bg-red-50"
              onClick={onDelete}
            />
          </div>
        )}
      </div>
    </article>
  );
}
