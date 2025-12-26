import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components';
import { cn } from '@/utils/cn';
import type { ReviewThread } from '../types';
import { CommentEditor } from './CommentEditor';
import { CommentItem } from './CommentItem';

interface CommentThreadProps {
  thread: ReviewThread;
  currentUserLogin: string;
  onReply: (threadId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onToggleResolved: (threadId: string) => void;
}

export function CommentThread({
  thread,
  currentUserLogin,
  onReply,
  onEdit,
  onDelete,
  onToggleResolved,
}: CommentThreadProps) {
  const [reply, setReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const threadLabel = useMemo(
    () =>
      `Thread on line ${String(thread.line)} (${
        thread.side === 'LEFT' ? 'deleted' : 'added'
      } line)`,
    [thread.line, thread.side]
  );

  const handleReplySubmit = useCallback(async () => {
    if (!reply.trim()) return;
    setIsReplying(true);
    await onReply(thread.id, reply.trim());
    setReply('');
    setIsReplying(false);
  }, [onReply, reply, thread.id]);

  const handleEditStart = useCallback((commentId: string, body: string) => {
    setEditingCommentId(commentId);
    setEditBody(body);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingCommentId(null);
    setEditBody("");
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editingCommentId) return;
    setIsUpdating(true);
    await onEdit(editingCommentId, editBody.trim());
    setIsUpdating(false);
    handleEditCancel();
  }, [editBody, editingCommentId, handleEditCancel, onEdit]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      const confirmed = window.confirm('Are you sure you want to delete this comment?');
      if (!confirmed) return;
      await onDelete(commentId);
    },
    [onDelete]
  );

  return (
    <section
      className={cn(
        'rounded-md border border-gray-200 bg-white p-4 space-y-4 shadow-sm',
        thread.isResolved && 'opacity-75'
      )}
      aria-label={threadLabel}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>Thread on line {thread.line}</span>
          {thread.isResolved && (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
              Resolved
            </span>
          )}
        </div>
            <Button
              label={thread.isResolved ? 'Unresolve' : 'Resolve conversation'}
              variant="secondary"
              size="sm"
              onClick={() => onToggleResolved(thread.id)}
            />
      </header>
      <div className="space-y-4">
        {thread.comments.map((comment) =>
          editingCommentId === comment.id ? (
            <CommentEditor
              key={comment.id}
              value={editBody}
              onChange={setEditBody}
              onSubmit={() => {
                void handleEditSubmit();
              }}
              onCancel={handleEditCancel}
              isSubmitting={isUpdating}
              submitLabel="Update"
              label="Edit comment"
            />
          ) : (
            <CommentItem
              key={comment.id}
              comment={comment}
              isCurrentUser={comment.author.login === currentUserLogin}
              onEdit={() => handleEditStart(comment.id, comment.body)}
              onDelete={() => {
                void handleDelete(comment.id);
              }}
            />
          )
        )}
      </div>
      <div className="pt-2 border-t border-gray-200">
        <CommentEditor
          value={reply}
          onChange={setReply}
          onSubmit={() => {
            void handleReplySubmit();
          }}
          isSubmitting={isReplying}
          submitLabel="Reply"
          label="Reply to conversation"
        />
      </div>
    </section>
  );
}
