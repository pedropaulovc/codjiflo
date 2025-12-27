/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Used to prevent authorization code interception attacks
 */

/**
 * Generates a cryptographically random code verifier
 * The code verifier is a random string between 43-128 characters
 * @returns A random base64url-encoded string
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generates a code challenge from the code verifier
 * The challenge is the SHA-256 hash of the verifier, base64url-encoded
 * @param verifier - The code verifier string
 * @returns A promise that resolves to the code challenge
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Generates a random state parameter for CSRF protection
 * @returns A random base64url-encoded string
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Encodes a Uint8Array to a base64url string
 * Base64url is URL-safe base64 without padding
 * @param buffer - The buffer to encode
 * @returns A base64url-encoded string
 */
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Storage keys for OAuth flow state
 */
export const OAUTH_STORAGE_KEYS = {
  CODE_VERIFIER: 'oauth_code_verifier',
  STATE: 'oauth_state',
} as const;

/**
 * Stores the OAuth flow state in sessionStorage
 * @param codeVerifier - The PKCE code verifier
 * @param state - The CSRF state parameter
 */
export function storeOAuthState(codeVerifier: string, state: string): void {
  sessionStorage.setItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(OAUTH_STORAGE_KEYS.STATE, state);
}

/**
 * Retrieves and clears the OAuth flow state from sessionStorage
 * @returns The stored code verifier and state, or null if not found
 */
export function retrieveOAuthState(): { codeVerifier: string; state: string } | null {
  const codeVerifier = sessionStorage.getItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER);
  const state = sessionStorage.getItem(OAUTH_STORAGE_KEYS.STATE);

  if (!codeVerifier || !state) {
    return null;
  }

  // Clear the stored state
  sessionStorage.removeItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(OAUTH_STORAGE_KEYS.STATE);

  return { codeVerifier, state };
}
