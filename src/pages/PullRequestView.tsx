import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePRStore } from '@/features/pr';
import { useDiffStore, FileList, DiffView } from '@/features/diff';
import { PRHeader } from '@/features/pr/components';
import { useKeyboardShortcuts, ShortcutsModal } from '@/features/keyboard';
import { useCommentsStore } from '@/features/comments';

/**
 * Pull Request View page
 * Orchestrates PR metadata, file list, and diff view
 * S-1.2 through S-1.5
 */
export function PullRequestView() {
  const { owner, repo, number } = useParams<{
    owner: string;
    repo: string;
    number: string;
  }>();
  const navigate = useNavigate();

  const { loadPR, reset: resetPR } = usePRStore();
  const { loadFiles, reset: resetDiff } = useDiffStore();
  const { loadThreads, reset: resetComments } = useCommentsStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Activate keyboard shortcuts
  useKeyboardShortcuts();

  // Handle "?" key to show shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          !(target instanceof HTMLInputElement) &&
          !(target instanceof HTMLTextAreaElement) &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setShowShortcuts(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load data when params change
  useEffect(() => {
    if (!owner || !repo || !number) return;

    const prNumber = parseInt(number, 10);
    if (isNaN(prNumber)) return;

    // Load PR, files, and comments in parallel
    void loadPR(owner, repo, prNumber);
    void loadFiles(owner, repo, prNumber);
    void loadThreads(owner, repo, prNumber);

    // Cleanup on unmount
    return () => {
      resetPR();
      resetDiff();
      resetComments();
    };
  }, [owner, repo, number, loadPR, loadFiles, loadThreads, resetPR, resetDiff, resetComments]);

  const handleBackToDashboard = useCallback(() => {
    void navigate('/dashboard');
  }, [navigate]);

  // Error state for invalid params
  if (!owner || !repo || !number) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid URL</h1>
          <p className="text-gray-600 mb-4">Missing required parameters</p>
          <button
            onClick={handleBackToDashboard}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b px-4 py-2 flex items-center gap-4 shrink-0">
        <button
          onClick={handleBackToDashboard}
          className="text-gray-600 hover:text-gray-900"
          aria-label="Back to dashboard"
        >
          ← Back
        </button>
        <span className="text-sm text-gray-500 truncate">
          {owner}/{repo}#{number}
        </span>
        <button
          onClick={() => setShowShortcuts(true)}
          className="ml-auto text-sm text-gray-500 hover:text-gray-900"
          aria-label="Show keyboard shortcuts"
        >
          ? Shortcuts
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: PR metadata + file list */}
        <aside className="w-80 shrink-0 flex flex-col bg-white border-r overflow-hidden">
          <PRHeader />
          <div className="flex-1 overflow-y-auto border-t">
            <FileList />
          </div>
        </aside>

        {/* Right panel: Diff view */}
        <main className="flex-1 overflow-hidden">
          <DiffView />
        </main>
      </div>

      {/* Shortcuts modal - S-1.5: AC-1.5.4 */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
