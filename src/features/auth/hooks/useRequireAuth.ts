import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Hook that ensures the user is authenticated.
 * Redirects to login page if not authenticated.
 *
 * @returns Object with isAuthenticated status and isLoading state
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { isAuthenticated, isLoading } = useRequireAuth();
 *
 *   if (isLoading || !isAuthenticated) {
 *     return null; // or a loading spinner
 *   }
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return {
    isAuthenticated,
    isLoading: false, // Could be extended to handle hydration state
  };
}

/**
 * Hook that ensures the user is NOT authenticated.
 * Redirects to dashboard if already authenticated.
 * Use this for login/signup pages.
 *
 * @returns Object with isAuthenticated status
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { isAuthenticated } = useRedirectIfAuthenticated();
 *
 *   if (isAuthenticated) {
 *     return null; // Redirecting...
 *   }
 *
 *   return <LoginForm />;
 * }
 * ```
 */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}
