import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { oauthConfig } from '../config';

/**
 * Hook for automatic token refresh
 * Checks token expiry and refreshes before it expires
 * Should be mounted at the app root level
 */
export function useTokenRefresh() {
  const { authMethod, isTokenExpiringSoon, refreshAccessToken, isAuthenticated } = useAuthStore();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only handle token refresh for OAuth authentication
    if (!isAuthenticated || authMethod !== 'oauth') {
      return;
    }

    const checkAndRefresh = async () => {
      if (isTokenExpiringSoon()) {
        await refreshAccessToken();
      }
    };

    // Check immediately on mount
    void checkAndRefresh();

    // Set up interval to check periodically
    const intervalId = setInterval(() => {
      void checkAndRefresh();
    }, oauthConfig.refreshThresholdMs / 2); // Check at half the threshold interval

    refreshTimeoutRef.current = intervalId;

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [authMethod, isAuthenticated, isTokenExpiringSoon, refreshAccessToken]);
}

/**
 * Higher-order function to wrap API calls with automatic token refresh
 * Use this when making authenticated requests
 */
export async function withTokenRefresh<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  const { isTokenExpiringSoon, refreshAccessToken, authMethod } = useAuthStore.getState();

  // Check if we need to refresh before making the API call
  if (authMethod === 'oauth' && isTokenExpiringSoon()) {
    await refreshAccessToken();
  }

  return apiCall();
}
