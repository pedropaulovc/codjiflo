import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { useDiffStore } from './useDiffStore';
import { FileChangeStatus } from '@/api/types';
import * as api from '@/api';

// Store mock reference outside to avoid unbound-method warning
let mockGetFiles: Mock;

// Mock the API
vi.mock('@/api', () => {
  const getFilesFn = vi.fn();
  return {
    githubBackends: {
      review: {
        getReview: vi.fn(),
      },
      file: {
        getFiles: getFilesFn,
      },
    },
    GitHubAPIError: class GitHubAPIError extends Error {
      constructor(public status: number, public statusText: string, message: string) {
        super(message);
        this.name = 'GitHubAPIError';
      }
    },
  };
});

describe('useDiffStore', () => {
  const mockFiles = [
    {
      filename: 'src/file1.ts',
      status: FileChangeStatus.Modified,
      additions: 10,
      deletions: 5,
      changes: 15,
      patch: '@@...',
    },
    {
      filename: 'src/file2.ts',
      status: FileChangeStatus.Added,
      additions: 20,
      deletions: 0,
      changes: 20,
      patch: '@@...',
    },
    {
      filename: 'src/file3.ts',
      status: FileChangeStatus.Deleted,
      additions: 0,
      deletions: 30,
      changes: 30,
      patch: '@@...',
    },
  ];

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockGetFiles = api.githubBackends.file.getFiles as Mock;
    useDiffStore.setState({
      files: [],
      selectedFileIndex: 0,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('loadFiles', () => {
    it('loads files successfully', async () => {
      mockGetFiles.mockResolvedValue(mockFiles);

      await useDiffStore.getState().loadFiles('owner', 'repo', 123);

      expect(useDiffStore.getState().files).toEqual(mockFiles);
      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
      expect(useDiffStore.getState().isLoading).toBe(false);
      expect(useDiffStore.getState().error).toBeNull();
    });

    it('resets selectedFileIndex when loading new files', async () => {
      useDiffStore.setState({ selectedFileIndex: 2 });
      mockGetFiles.mockResolvedValue(mockFiles);

      await useDiffStore.getState().loadFiles('owner', 'repo', 123);

      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
    });
  });

  describe('selectFile', () => {
    beforeEach(() => {
      useDiffStore.setState({ files: mockFiles, selectedFileIndex: 0 });
    });

    it('selects a valid file index', () => {
      useDiffStore.getState().selectFile(1);

      expect(useDiffStore.getState().selectedFileIndex).toBe(1);
    });

    it('does not select invalid index (negative)', () => {
      useDiffStore.getState().selectFile(-1);

      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
    });

    it('does not select invalid index (out of bounds)', () => {
      useDiffStore.getState().selectFile(10);

      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
    });
  });

  describe('selectNextFile', () => {
    beforeEach(() => {
      useDiffStore.setState({ files: mockFiles, selectedFileIndex: 0 });
    });

    it('moves to the next file', () => {
      useDiffStore.getState().selectNextFile();

      expect(useDiffStore.getState().selectedFileIndex).toBe(1);
    });

    it('does not go beyond the last file', () => {
      useDiffStore.setState({ selectedFileIndex: 2 }); // Last file

      useDiffStore.getState().selectNextFile();

      expect(useDiffStore.getState().selectedFileIndex).toBe(2);
    });
  });

  describe('selectPreviousFile', () => {
    beforeEach(() => {
      useDiffStore.setState({ files: mockFiles, selectedFileIndex: 2 });
    });

    it('moves to the previous file', () => {
      useDiffStore.getState().selectPreviousFile();

      expect(useDiffStore.getState().selectedFileIndex).toBe(1);
    });

    it('does not go before the first file', () => {
      useDiffStore.setState({ selectedFileIndex: 0 });

      useDiffStore.getState().selectPreviousFile();

      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      useDiffStore.setState({
        files: mockFiles,
        selectedFileIndex: 1,
        isLoading: true,
        error: 'Some error',
      });

      useDiffStore.getState().reset();

      expect(useDiffStore.getState().files).toEqual([]);
      expect(useDiffStore.getState().selectedFileIndex).toBe(0);
      expect(useDiffStore.getState().isLoading).toBe(false);
      expect(useDiffStore.getState().error).toBeNull();
    });
  });
});
