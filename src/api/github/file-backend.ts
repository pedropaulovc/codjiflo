import { githubClient } from './github-client';
import type { IFileBackend, FileChange } from '../types';
import { FileChangeStatus } from '../types';
import type { GitHubFile } from './types';

/**
 * GitHub implementation of IFileBackend
 * Transforms GitHub API responses to platform-agnostic FileChange type
 */
export class GitHubFileBackend implements IFileBackend {
  async getFiles(owner: string, repo: string, number: number): Promise<FileChange[]> {
    const data = await githubClient.fetch<GitHubFile[]>(
      `/repos/${owner}/${repo}/pulls/${String(number)}/files`
    );

    return data.map((file): FileChange => {
      const result: FileChange = {
        filename: file.filename,
        status: this.mapStatus(file.status),
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch ?? '',
      };
      if (file.previous_filename) {
        result.previousFilename = file.previous_filename;
      }
      return result;
    });
  }

  private mapStatus(status: GitHubFile['status']): FileChangeStatus {
    switch (status) {
      case 'added':
        return FileChangeStatus.Added;
      case 'removed':
        return FileChangeStatus.Deleted;
      case 'renamed':
        return FileChangeStatus.Renamed;
      default:
        return FileChangeStatus.Modified;
    }
  }
}
