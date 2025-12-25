import { useMemo } from 'react';
import { useDiffStore } from '../stores';
import { parsePatch, detectLanguage } from '../utils';
import { DiffLine } from './DiffLine';
import { Skeleton } from '@/components/ui';

/**
 * Unified diff view for the selected file
 * S-1.4: AC-1.4.1 through AC-1.4.10
 */
export function DiffView() {
  const { files, selectedFileIndex, isLoading } = useDiffStore();
  const selectedFile = files[selectedFileIndex];

  // Parse the patch and detect language
  const patch = selectedFile?.patch;
  const filename = selectedFile?.filename;
  const { diffLines, language } = useMemo(() => {
    if (!patch) {
      return { diffLines: [], language: 'plaintext' };
    }
    return {
      diffLines: parsePatch(patch),
      language: detectLanguage(filename ?? ''),
    };
  }, [patch, filename]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2" role="status" aria-label="Loading diff">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-8">
        Select a file to view diff
      </div>
    );
  }

  if (!selectedFile.patch) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No diff available</p>
        <p className="text-sm mt-1">(binary file or too large)</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky file header */}
      <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b z-10">
        <h2 className="font-mono text-sm font-semibold truncate" title={selectedFile.filename}>
          {selectedFile.filename}
        </h2>
      </div>

      {/* AC-1.4.7: Horizontal scroll for long lines */}
      {/* AC-1.4.8: Accessible code block */}
      <div
        className="flex-1 overflow-auto"
        role="region"
        aria-label={`Diff content for ${selectedFile.filename}`}
        tabIndex={0}
      >
        <table className="w-full border-collapse text-sm">
          <tbody>
            {diffLines.map((line, index) => (
              <DiffLine
                key={index}
                line={line}
                language={language}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
