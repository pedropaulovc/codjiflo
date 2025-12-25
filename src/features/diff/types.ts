import type { FileChange } from '@/api/types';

export interface DiffState {
  files: FileChange[];
  selectedFileIndex: number;
  isLoading: boolean;
  error: string | null;
  loadFiles: (owner: string, repo: string, number: number) => Promise<void>;
  selectFile: (index: number) => void;
  selectNextFile: () => void;
  selectPreviousFile: () => void;
  reset: () => void;
}

export type DiffLineType = 'addition' | 'deletion' | 'context' | 'header';

export interface ParsedDiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber: number | null;
  newLineNumber: number | null;
}
