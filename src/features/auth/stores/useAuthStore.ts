import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    error: string | null;
    isValidating: boolean;
    setToken: (token: string) => void;
    logout: () => void;
    validateToken: (token: string) => Promise<boolean>;
    clearError: () => void;
}

/**
 * Validates GitHub Personal Access Token format
 * Valid formats: ghp_* or github_pat_*
 */
export function isValidTokenFormat(token: string): boolean {
    return token.startsWith('ghp_') || token.startsWith('github_pat_');
}

/**
 * Validates token by making a test request to GitHub API
 */
async function validateGitHubToken(token: string): Promise<boolean> {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        return response.ok;
    } catch {
        return false;
    }
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            isAuthenticated: false,
            error: null,
            isValidating: false,
            setToken: (token: string) => set({ token, isAuthenticated: true, error: null }),
            logout: () => set({ token: null, isAuthenticated: false, error: null }),
            clearError: () => set({ error: null }),
            validateToken: async (token: string): Promise<boolean> => {
                // Clear previous errors
                set({ error: null, isValidating: true });

                // Check format first
                if (!isValidTokenFormat(token)) {
                    set({ error: 'Invalid token format. Token must start with "ghp_" or "github_pat_"', isValidating: false });
                    return false;
                }

                // Validate against GitHub API
                const isValid = await validateGitHubToken(token);
                
                if (isValid) {
                    get().setToken(token);
                    set({ isValidating: false });
                    return true;
                } else {
                    set({ error: 'Authentication failed. Please check your token.', isValidating: false });
                    return false;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
