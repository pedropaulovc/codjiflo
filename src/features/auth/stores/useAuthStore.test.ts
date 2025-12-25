import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, isValidTokenFormat } from './useAuthStore';

// Mock fetch
global.fetch = vi.fn();

describe('isValidTokenFormat', () => {
    it('should return true for ghp_ prefix', () => {
        expect(isValidTokenFormat('ghp_1234567890')).toBe(true);
    });

    it('should return true for github_pat_ prefix', () => {
        expect(isValidTokenFormat('github_pat_1234567890')).toBe(true);
    });

    it('should return false for invalid prefix', () => {
        expect(isValidTokenFormat('invalid_token')).toBe(false);
        expect(isValidTokenFormat('ghs_1234567890')).toBe(false);
        expect(isValidTokenFormat('')).toBe(false);
    });
});

describe('useAuthStore', () => {
    beforeEach(() => {
        useAuthStore.setState({ 
            token: null, 
            isAuthenticated: false,
            error: null,
            isValidating: false
        });
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeNull();
        expect(state.isValidating).toBe(false);
    });

    it('setToken should update token and isAuthenticated', () => {
        useAuthStore.getState().setToken('test-token');

        const state = useAuthStore.getState();
        expect(state.token).toBe('test-token');
        expect(state.isAuthenticated).toBe(true);
        expect(state.error).toBeNull();
    });

    it('logout should clear token and isAuthenticated', () => {
        useAuthStore.setState({ token: 'test-token', isAuthenticated: true });

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeNull();
    });

    it('clearError should clear error state', () => {
        useAuthStore.setState({ error: 'Test error' });
        
        useAuthStore.getState().clearError();
        
        expect(useAuthStore.getState().error).toBeNull();
    });

    it('should persist token and isAuthenticated to localStorage', () => {
        useAuthStore.getState().setToken('persisted-token');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const storageValue = JSON.parse(localStorage.getItem('auth-storage') ?? '{}');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.token).toBe('persisted-token');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.isAuthenticated).toBe(true);
    });

    it('validateToken should reject invalid format', async () => {
        const result = await useAuthStore.getState().validateToken('invalid_token');
        
        expect(result).toBe(false);
        const state = useAuthStore.getState();
        expect(state.error).toBe('Invalid token format. Token must start with "ghp_" or "github_pat_"');
        expect(state.isValidating).toBe(false);
        expect(state.isAuthenticated).toBe(false);
    });

    it('validateToken should accept valid format and successful API response', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: true,
        } as Response);

        const result = await useAuthStore.getState().validateToken('ghp_validtoken123');
        
        expect(result).toBe(true);
        const state = useAuthStore.getState();
        expect(state.token).toBe('ghp_validtoken123');
        expect(state.isAuthenticated).toBe(true);
        expect(state.error).toBeNull();
        expect(state.isValidating).toBe(false);
    });

    it('validateToken should reject valid format but failed API response', async () => {
        vi.mocked(global.fetch).mockResolvedValueOnce({
            ok: false,
        } as Response);

        const result = await useAuthStore.getState().validateToken('ghp_invalidtoken123');
        
        expect(result).toBe(false);
        const state = useAuthStore.getState();
        expect(state.error).toBe('Authentication failed. Please check your token.');
        expect(state.isValidating).toBe(false);
        expect(state.isAuthenticated).toBe(false);
    });

    it('validateToken should handle network errors', async () => {
        vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

        const result = await useAuthStore.getState().validateToken('ghp_validtoken123');
        
        expect(result).toBe(false);
        const state = useAuthStore.getState();
        expect(state.error).toBe('Authentication failed. Please check your token.');
        expect(state.isValidating).toBe(false);
    });
});
