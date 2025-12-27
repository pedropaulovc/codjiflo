import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequireAuth, useRedirectIfAuthenticated } from './useRequireAuth';
import { useAuthStore } from '../stores/useAuthStore';

// Mock Next.js router
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

// Mock the auth store
vi.mock('../stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: false };
      return selector(state);
    });

    renderHook(() => useRequireAuth());

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('should not redirect when authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: true };
      return selector(state);
    });

    renderHook(() => useRequireAuth());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should return isAuthenticated status', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: true };
      return selector(state);
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return false for isAuthenticated when not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: false };
      return selector(state);
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('useRedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to dashboard when authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: true };
      return selector(state);
    });

    renderHook(() => useRedirectIfAuthenticated());

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should not redirect when not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: false };
      return selector(state);
    });

    renderHook(() => useRedirectIfAuthenticated());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should return isAuthenticated status', () => {
    vi.mocked(useAuthStore).mockImplementation(<T,>(selector: (state: { isAuthenticated: boolean }) => T) => {
      const state = { isAuthenticated: false };
      return selector(state);
    });

    const { result } = renderHook(() => useRedirectIfAuthenticated());

    expect(result.current.isAuthenticated).toBe(false);
  });
});
