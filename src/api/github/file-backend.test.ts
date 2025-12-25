import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubFileBackend } from './file-backend';
import { githubClient } from './github-client';
import { FileChangeStatus } from '../types';

vi.mock('./github-client', () => ({
  githubClient: {
    fetch: vi.fn(),
  },
}));

describe('GitHubFileBackend', () => {
  let backend: GitHubFileBackend;

  beforeEach(() => {
    backend = new GitHubFileBackend();
    vi.clearAllMocks();
  });

  describe('getFiles', () => {
    it('fetches and transforms file data correctly', async () => {
      const mockFiles = [
        {
          filename: 'src/index.ts',
          status: 'modified',
          additions: 10,
          deletions: 5,
          changes: 15,
          patch: '@@ -1,3 +1,4 @@\n+import foo',
        },
      ];

      vi.mocked(githubClient.fetch).mockResolvedValue(mockFiles);

      const result = await backend.getFiles('owner', 'repo', 42);

      expect(githubClient.fetch).toHaveBeenCalledWith('/repos/owner/repo/pulls/42/files');
      expect(result).toEqual([
        {
          filename: 'src/index.ts',
          status: FileChangeStatus.Modified,
          additions: 10,
          deletions: 5,
          changes: 15,
          patch: '@@ -1,3 +1,4 @@\n+import foo',
        },
      ]);
    });

    it('maps added status correctly', async () => {
      const mockFiles = [{ filename: 'new.ts', status: 'added', additions: 10, deletions: 0, changes: 10 }];
      vi.mocked(githubClient.fetch).mockResolvedValue(mockFiles);

      const result = await backend.getFiles('owner', 'repo', 1);
      expect(result[0].status).toBe(FileChangeStatus.Added);
    });

    it('maps removed status correctly', async () => {
      const mockFiles = [{ filename: 'old.ts', status: 'removed', additions: 0, deletions: 10, changes: 10 }];
      vi.mocked(githubClient.fetch).mockResolvedValue(mockFiles);

      const result = await backend.getFiles('owner', 'repo', 1);
      expect(result[0].status).toBe(FileChangeStatus.Deleted);
    });

    it('maps renamed status correctly', async () => {
      const mockFiles = [
        {
          filename: 'new-name.ts',
          status: 'renamed',
          previous_filename: 'old-name.ts',
          additions: 0,
          deletions: 0,
          changes: 0,
        },
      ];
      vi.mocked(githubClient.fetch).mockResolvedValue(mockFiles);

      const result = await backend.getFiles('owner', 'repo', 1);
      expect(result[0].status).toBe(FileChangeStatus.Renamed);
      expect(result[0].previousFilename).toBe('old-name.ts');
    });

    it('handles missing patch', async () => {
      const mockFiles = [{ filename: 'binary.png', status: 'modified', additions: 0, deletions: 0, changes: 0 }];
      vi.mocked(githubClient.fetch).mockResolvedValue(mockFiles);

      const result = await backend.getFiles('owner', 'repo', 1);
      expect(result[0].patch).toBe('');
    });
  });
});
