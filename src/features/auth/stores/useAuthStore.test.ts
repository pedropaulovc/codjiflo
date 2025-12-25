import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';

// Mock the github-client module
vi.mock('@/api/github-client', () => ({
    isValidTokenFormat: (token: string) => token.startsWith('ghp_') || token.startsWith('github_pat_'),
    validateToken: vi.fn(),
}));

import { validateToken } from '@/api/github-client';

const mockValidateToken = vi.mocked(validateToken);

describe('useAuthStore', () => {
    beforeEach(() => {
        useAuthStore.setState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            errorMessage: null,
        });
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    describe('login', () => {
        it('should reject invalid token format', async () => {
            const result = await useAuthStore.getState().login('invalid-token');

            expect(result).toBe(false);
            expect(useAuthStore.getState().error).toBe('invalid_format');
            expect(useAuthStore.getState().errorMessage).toContain('Invalid token format');
        });

        it('should accept ghp_ prefixed tokens', async () => {
            mockValidateToken.mockResolvedValueOnce({
                success: true,
                user: { login: 'testuser', id: 1, avatar_url: 'url', name: 'Test' }
            });

            const result = await useAuthStore.getState().login('ghp_validtoken123');

            expect(result).toBe(true);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
            expect(useAuthStore.getState().token).toBe('ghp_validtoken123');
            expect(useAuthStore.getState().user?.login).toBe('testuser');
        });

        it('should accept github_pat_ prefixed tokens', async () => {
            mockValidateToken.mockResolvedValueOnce({
                success: true,
                user: { login: 'testuser', id: 1, avatar_url: 'url', name: 'Test' }
            });

            const result = await useAuthStore.getState().login('github_pat_validtoken123');

            expect(result).toBe(true);
            expect(useAuthStore.getState().isAuthenticated).toBe(true);
        });

        it('should handle invalid token error', async () => {
            mockValidateToken.mockResolvedValueOnce({
                success: false,
                error: 'invalid_token',
                message: 'Authentication failed. Please check your token.'
            });

            const result = await useAuthStore.getState().login('ghp_invalidtoken');

            expect(result).toBe(false);
            expect(useAuthStore.getState().error).toBe('invalid_token');
            expect(useAuthStore.getState().errorMessage).toContain('Authentication failed');
            expect(useAuthStore.getState().isAuthenticated).toBe(false);
        });

        it('should handle network error', async () => {
            mockValidateToken.mockResolvedValueOnce({
                success: false,
                error: 'network_error',
                message: 'Connection failed.'
            });

            const result = await useAuthStore.getState().login('ghp_validformat');

            expect(result).toBe(false);
            expect(useAuthStore.getState().error).toBe('network_error');
            expect(useAuthStore.getState().errorMessage).toContain('Connection failed');
        });

        it('should set isLoading during login', async () => {
            let resolvePromise: ((value: unknown) => void) | undefined;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            mockValidateToken.mockReturnValueOnce(promise as ReturnType<typeof validateToken>);

            const loginPromise = useAuthStore.getState().login('ghp_testtoken');

            expect(useAuthStore.getState().isLoading).toBe(true);

            if (resolvePromise) {
                resolvePromise({
                    success: true,
                    user: { login: 'testuser', id: 1, avatar_url: 'url', name: 'Test' }
                });
            }

            await loginPromise;
            expect(useAuthStore.getState().isLoading).toBe(false);
        });
    });

    describe('logout', () => {
        it('should clear all auth state', async () => {
            // First login
            mockValidateToken.mockResolvedValueOnce({
                success: true,
                user: { login: 'testuser', id: 1, avatar_url: 'url', name: 'Test' }
            });
            await useAuthStore.getState().login('ghp_token');

            // Then logout
            useAuthStore.getState().logout();

            const state = useAuthStore.getState();
            expect(state.token).toBeNull();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('clearError', () => {
        it('should clear error state', async () => {
            // Trigger an error
            await useAuthStore.getState().login('invalid-token');
            expect(useAuthStore.getState().error).not.toBeNull();

            // Clear the error
            useAuthStore.getState().clearError();

            expect(useAuthStore.getState().error).toBeNull();
            expect(useAuthStore.getState().errorMessage).toBeNull();
        });
    });

    it('should persist state to localStorage', async () => {
        mockValidateToken.mockResolvedValueOnce({
            success: true,
            user: { login: 'testuser', id: 1, avatar_url: 'url', name: 'Test' }
        });
        await useAuthStore.getState().login('ghp_persisted-token');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const storageValue = JSON.parse(localStorage.getItem('auth-storage') ?? '{}');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.token).toBe('ghp_persisted-token');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.isAuthenticated).toBe(true);
    });
});
