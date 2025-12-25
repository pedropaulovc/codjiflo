import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateToken, isValidTokenFormat } from './github-client';

describe('github-client', () => {
    describe('isValidTokenFormat', () => {
        it('should return true for ghp_ prefix', () => {
            expect(isValidTokenFormat('ghp_abc123')).toBe(true);
        });

        it('should return true for github_pat_ prefix', () => {
            expect(isValidTokenFormat('github_pat_abc123')).toBe(true);
        });

        it('should return false for invalid prefix', () => {
            expect(isValidTokenFormat('invalid_token')).toBe(false);
            expect(isValidTokenFormat('gho_token')).toBe(false);
            expect(isValidTokenFormat('pat_token')).toBe(false);
            expect(isValidTokenFormat('')).toBe(false);
        });
    });

    describe('validateToken', () => {
        beforeEach(() => {
            vi.stubGlobal('fetch', vi.fn());
        });

        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('should return success with user on valid token', async () => {
            const mockUser = {
                login: 'testuser',
                id: 12345,
                avatar_url: 'https://example.com/avatar.png',
                name: 'Test User'
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser)
            } as Response);

            const result = await validateToken('ghp_validtoken');

            expect(result).toEqual({ success: true, user: mockUser });
            expect(fetch).toHaveBeenCalledWith('https://api.github.com/user', {
                headers: {
                    'Authorization': 'Bearer ghp_validtoken',
                    'Accept': 'application/vnd.github.v3+json',
                }
            });
        });

        it('should return invalid_token error on 401', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ message: 'Bad credentials' })
            } as Response);

            const result = await validateToken('ghp_badtoken');

            expect(result).toEqual({
                success: false,
                error: 'invalid_token',
                message: 'Authentication failed. Please check your token.'
            });
        });

        it('should return error message from API on other HTTP errors', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: () => Promise.resolve({ message: 'API rate limit exceeded' })
            } as Response);

            const result = await validateToken('ghp_ratelimited');

            expect(result).toEqual({
                success: false,
                error: 'invalid_token',
                message: 'API rate limit exceeded'
            });
        });

        it('should return network_error on fetch failure', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const result = await validateToken('ghp_networkfail');

            expect(result).toEqual({
                success: false,
                error: 'network_error',
                message: 'Connection failed. Please check your internet connection.'
            });
        });
    });
});
