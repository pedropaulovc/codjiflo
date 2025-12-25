const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    name: string | null;
}

export interface GitHubError {
    message: string;
    documentation_url?: string;
}

export type AuthResult =
    | { success: true; user: GitHubUser }
    | { success: false; error: 'invalid_token' | 'network_error'; message: string };

/**
 * Validates a GitHub Personal Access Token by calling the /user endpoint.
 * Returns the authenticated user on success, or an error type on failure.
 */
export async function validateToken(token: string): Promise<AuthResult> {
    try {
        const response = await fetch(`${GITHUB_API_BASE}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (response.ok) {
            const user = await response.json() as GitHubUser;
            return { success: true, user };
        }

        if (response.status === 401) {
            return {
                success: false,
                error: 'invalid_token',
                message: 'Authentication failed. Please check your token.'
            };
        }

        // Other HTTP errors (403, 500, etc.)
        const errorBody = await response.json() as GitHubError;
        return {
            success: false,
            error: 'invalid_token',
            message: errorBody.message || 'Authentication failed.'
        };
    } catch {
        // Network errors (no internet, DNS failure, etc.)
        return {
            success: false,
            error: 'network_error',
            message: 'Connection failed. Please check your internet connection.'
        };
    }
}

/**
 * Validates token format before making API call.
 * Valid formats: ghp_* (classic PAT) or github_pat_* (fine-grained PAT)
 */
export function isValidTokenFormat(token: string): boolean {
    return token.startsWith('ghp_') || token.startsWith('github_pat_');
}
