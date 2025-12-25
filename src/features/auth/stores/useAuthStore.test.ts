import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore', () => {
    beforeEach(() => {
        useAuthStore.setState({ token: null, isAuthenticated: false });
        localStorage.clear();
    });

    it('should have initial state', () => {
        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it('setToken should update token and isAuthenticated', () => {
        useAuthStore.getState().setToken('test-token');

        const state = useAuthStore.getState();
        expect(state.token).toBe('test-token');
        expect(state.isAuthenticated).toBe(true);
    });

    it('logout should clear token and isAuthenticated', () => {
        useAuthStore.setState({ token: 'test-token', isAuthenticated: true });

        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it('should persist state to localStorage', () => {
        useAuthStore.getState().setToken('persisted-token');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const storageValue = JSON.parse(localStorage.getItem('auth-storage') ?? '{}');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.token).toBe('persisted-token');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(storageValue.state.isAuthenticated).toBe(true);
    });
});
