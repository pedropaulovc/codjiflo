import type { FileChange } from '@/api/types';
import { FileChangeStatus } from '@/api/types';
import { cn } from '@/utils/cn';

const CHANGE_TYPE_ICONS: Record<FileChangeStatus, string> = {
  [FileChangeStatus.Added]: '+',
  [FileChangeStatus.Modified]: 'M',
  [FileChangeStatus.Deleted]: '−',
  [FileChangeStatus.Renamed]: 'R',
};

const CHANGE_TYPE_COLORS: Record<FileChangeStatus, string> = {
  [FileChangeStatus.Added]: 'text-green-700 bg-green-100',
  [FileChangeStatus.Modified]: 'text-blue-700 bg-blue-100',
  [FileChangeStatus.Deleted]: 'text-red-700 bg-red-100',
  [FileChangeStatus.Renamed]: 'text-purple-700 bg-purple-100',
};

const CHANGE_TYPE_LABELS: Record<FileChangeStatus, string> = {
  [FileChangeStatus.Added]: 'added',
  [FileChangeStatus.Modified]: 'modified',
  [FileChangeStatus.Deleted]: 'deleted',
  [FileChangeStatus.Renamed]: 'renamed',
};

interface FileListItemProps {
  file: FileChange;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Single file item in the file list
 * S-1.3: AC-1.3.1 through AC-1.3.5
 */
export function FileListItem({ file, isSelected, onClick }: FileListItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        type="button"
        aria-selected={isSelected}
        aria-label={`${file.filename}, ${CHANGE_TYPE_LABELS[file.status]}, ${String(file.additions)} additions, ${String(file.deletions)} deletions`}
        className={cn(
          'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
          isSelected && 'bg-blue-50 border-l-4 border-blue-600'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Change type indicator - AC-1.3.2 */}
          <span
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded text-xs font-bold',
              CHANGE_TYPE_COLORS[file.status]
            )}
            aria-hidden="true"
          >
            {CHANGE_TYPE_ICONS[file.status]}
          </span>

          {/* Filename - AC-1.3.1 */}
          <span className="flex-1 text-sm font-mono truncate" title={file.filename}>
            {file.filename}
          </span>
        </div>

        {/* Stats - AC-1.3.3 */}
        <div className="mt-1 flex gap-3 text-xs">
          <span className="text-green-600">+{file.additions}</span>
          <span className="text-red-600">−{file.deletions}</span>
        </div>
      </button>
    </li>
  );
}
