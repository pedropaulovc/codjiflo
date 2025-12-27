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

// Helper to mock useAuthStore with a partial state
function mockAuthStore(partialState: { isAuthenticated: boolean; hasHydrated?: boolean }) {
  const state = { hasHydrated: true, ...partialState };
  (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    <T,>(selector: (state: { isAuthenticated: boolean; hasHydrated: boolean }) => T) => selector(state)
  );
}

describe('useRequireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login when not authenticated', () => {
    mockAuthStore({ isAuthenticated: false });

    renderHook(() => useRequireAuth());

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('should not redirect when authenticated', () => {
    mockAuthStore({ isAuthenticated: true });

    renderHook(() => useRequireAuth());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should return isAuthenticated status', () => {
    mockAuthStore({ isAuthenticated: true });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return false for isAuthenticated when not authenticated', () => {
    mockAuthStore({ isAuthenticated: false });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return isLoading true when not hydrated', () => {
    mockAuthStore({ isAuthenticated: false, hasHydrated: false });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.isLoading).toBe(true);
  });

  it('should not redirect when not hydrated', () => {
    mockAuthStore({ isAuthenticated: false, hasHydrated: false });

    renderHook(() => useRequireAuth());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('useRedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to dashboard when authenticated', () => {
    mockAuthStore({ isAuthenticated: true });

    renderHook(() => useRedirectIfAuthenticated());

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should not redirect when not authenticated', () => {
    mockAuthStore({ isAuthenticated: false });

    renderHook(() => useRedirectIfAuthenticated());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should return isAuthenticated status', () => {
    mockAuthStore({ isAuthenticated: false });

    const { result } = renderHook(() => useRedirectIfAuthenticated());

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return isLoading true when not hydrated', () => {
    mockAuthStore({ isAuthenticated: true, hasHydrated: false });

    const { result } = renderHook(() => useRedirectIfAuthenticated());

    expect(result.current.isLoading).toBe(true);
  });

  it('should not redirect when not hydrated', () => {
    mockAuthStore({ isAuthenticated: true, hasHydrated: false });

    renderHook(() => useRedirectIfAuthenticated());

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
