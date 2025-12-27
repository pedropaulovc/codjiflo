/**
 * OAuth configuration for GitHub App authentication
 */
export const oauthConfig = {
  /**
   * GitHub App Client ID (public, safe to expose in browser)
   * Set via NEXT_PUBLIC_GITHUB_CLIENT_ID environment variable
   */
  clientId: process.env['NEXT_PUBLIC_GITHUB_CLIENT_ID'] ?? '',

  /**
   * OAuth callback URL
   * Set via NEXT_PUBLIC_APP_URL environment variable
   */
  get redirectUri(): string {
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? '';
    return `${appUrl}/auth/callback`;
  },

  /**
   * GitHub OAuth authorization URL
   */
  authorizationUrl: 'https://github.com/login/oauth/authorize',

  /**
   * Required OAuth scopes for the application
   * - repo: Access to private repositories (read/write)
   * - read:user: Read user profile data
   */
  scopes: ['repo', 'read:user'] as const,

  /**
   * Token refresh threshold in milliseconds
   * Refresh tokens 5 minutes before expiry
   */
  refreshThresholdMs: 5 * 60 * 1000,

  /**
   * Default token expiry in seconds (8 hours for GitHub Apps)
   */
  defaultTokenExpirySeconds: 8 * 60 * 60,
} as const;

/**
 * Builds the GitHub OAuth authorization URL with PKCE parameters
 * @param state - CSRF protection state parameter
 * @param codeChallenge - PKCE code challenge
 * @returns The complete authorization URL
 */
export function buildAuthorizationUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: oauthConfig.clientId,
    redirect_uri: oauthConfig.redirectUri,
    scope: oauthConfig.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${oauthConfig.authorizationUrl}?${params.toString()}`;
}
