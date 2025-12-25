import type { Review } from '@/api/types';

export interface PRState {
  currentPR: Review | null;
  isLoading: boolean;
  error: string | null;
  loadPR: (owner: string, repo: string, number: number) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export interface ParsedPRUrl {
  owner: string;
  repo: string;
  number: number;
}
