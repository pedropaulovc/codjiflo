import { useAuthStore } from '@/features/auth/stores/useAuthStore';

/**
 * GitHub API Error with status code
 */
export class GitHubAPIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

/**
 * GitHub REST API client
 * Injects auth token from useAuthStore
 */
export class GitHubClient {
  private baseURL = 'https://api.github.com';

  async fetch<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async request<T>(
    endpoint: string,
    options?: { method?: string; body?: unknown }
  ): Promise<T> {
    const token = useAuthStore.getState().token;
    if (!token) {
      throw new GitHubAPIError(401, 'Unauthorized', 'Not authenticated');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: options?.method ?? 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : null,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json() as { message?: string };
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Use statusText if response body can't be parsed
      }
      throw new GitHubAPIError(
        response.status,
        response.statusText,
        errorMessage
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

export const githubClient = new GitHubClient();
