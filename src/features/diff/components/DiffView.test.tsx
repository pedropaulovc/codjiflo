import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/tests/helpers';
import { DiffView } from './DiffView';
import { useDiffStore } from '../stores';
import { FileChangeStatus } from '@/api/types';

vi.mock('../stores', () => ({
  useDiffStore: vi.fn(),
}));

describe('DiffView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(useDiffStore).mockReturnValue({
      files: [],
      selectedFileIndex: 0,
      isLoading: true,
    });

    render(<DiffView />);

    expect(screen.getByRole('status', { name: /Loading diff/i })).toBeInTheDocument();
  });

  it('shows empty state when no file selected', () => {
    vi.mocked(useDiffStore).mockReturnValue({
      files: [],
      selectedFileIndex: 0,
      isLoading: false,
    });

    render(<DiffView />);

    expect(screen.getByText(/Select a file to view diff/i)).toBeInTheDocument();
  });

  it('shows message when file has no patch', () => {
    vi.mocked(useDiffStore).mockReturnValue({
      files: [
        {
          filename: 'binary.png',
          status: FileChangeStatus.Modified,
          additions: 0,
          deletions: 0,
          changes: 0,
          patch: '',
        },
      ],
      selectedFileIndex: 0,
      isLoading: false,
    });

    render(<DiffView />);

    expect(screen.getByText(/No diff available/i)).toBeInTheDocument();
    expect(screen.getByText(/binary file or too large/i)).toBeInTheDocument();
  });

  it('renders diff content with file header', () => {
    vi.mocked(useDiffStore).mockReturnValue({
      files: [
        {
          filename: 'src/index.ts',
          status: FileChangeStatus.Modified,
          additions: 1,
          deletions: 0,
          changes: 1,
          patch: '@@ -1,3 +1,4 @@\n context\n+added line',
        },
      ],
      selectedFileIndex: 0,
      isLoading: false,
    });

    render(<DiffView />);

    expect(screen.getByRole('heading', { name: 'src/index.ts' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Diff content for src\/index.ts/i })).toBeInTheDocument();
  });
});
