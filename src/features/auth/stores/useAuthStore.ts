import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateToken, isValidTokenFormat, GitHubUser } from '@/api/github-client';

export type AuthError = 'invalid_format' | 'invalid_token' | 'network_error' | null;

interface AuthState {
    token: string | null;
    user: GitHubUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: AuthError;
    errorMessage: string | null;
    login: (token: string) => Promise<boolean>;
    logout: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            errorMessage: null,

            login: async (token: string) => {
                // Validate format first
                if (!isValidTokenFormat(token)) {
                    set({
                        error: 'invalid_format',
                        errorMessage: 'Invalid token format. Token must start with "ghp_" or "github_pat_".',
                        isLoading: false,
                    });
                    return false;
                }

                set({ isLoading: true, error: null, errorMessage: null });

                const result = await validateToken(token);

                if (result.success) {
                    set({
                        token,
                        user: result.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        errorMessage: null,
                    });
                    return true;
                }

                set({
                    error: result.error,
                    errorMessage: result.message,
                    isLoading: false,
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
                return false;
            },

            logout: () => set({
                token: null,
                user: null,
                isAuthenticated: false,
                error: null,
                errorMessage: null,
            }),

            clearError: () => set({ error: null, errorMessage: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
