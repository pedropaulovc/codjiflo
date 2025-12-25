import { useDiffStore } from '../stores';
import { FileListItem } from './FileListItem';
import { Skeleton } from '@/components/ui';

/**
 * List of changed files in the PR
 * S-1.3: AC-1.3.1 through AC-1.3.9
 */
export function FileList() {
  const { files, selectedFileIndex, selectFile, isLoading, error } = useDiffStore();

  if (error) {
    return (
      <div className="p-4 text-red-600" role="alert" aria-live="polite">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-3" role="status" aria-label="Loading files">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No files changed
      </div>
    );
  }

  return (
    <nav aria-label="Changed files">
      {/* AC-1.3.7: File list is keyboard navigable */}
      <ul role="list" className="divide-y divide-gray-200">
        {files.map((file, index) => (
          <FileListItem
            key={file.filename}
            file={file}
            isSelected={index === selectedFileIndex}
            onClick={() => selectFile(index)}
          />
        ))}
      </ul>
    </nav>
  );
}
