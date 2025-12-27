/**
 * Cookie utilities for cross-subdomain OAuth flow
 * Uses cookies with base domain to enable PR preview authentication
 */

/**
 * Cookie names for OAuth flow
 */
export const OAUTH_COOKIE_KEYS = {
  CODE_VERIFIER: 'oauth_code_verifier',
  STATE: 'oauth_state',
  RETURN_ORIGIN: 'oauth_return_origin',
  TOKEN_TRANSFER: 'oauth_token_transfer',
} as const;

/**
 * Gets the base domain for cookie sharing across subdomains
 * e.g., "pr-123.codjiflo.vza.net" -> ".vza.net"
 * For localhost, returns undefined (no domain attribute needed)
 */
export function getBaseDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;

  // Localhost - no domain needed
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return undefined;
  }

  // Extract base domain (last two parts for standard TLDs)
  // e.g., "pr-123.codjiflo.vza.net" -> ".vza.net"
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return '.' + parts.slice(-2).join('.');
  }

  return undefined;
}

/**
 * Sets a cookie with optional domain for cross-subdomain access
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    domain?: string;
  } = {}
): void {
  const {
    maxAge = 600, // 10 minutes default
    path = '/',
    secure = window.location.protocol === 'https:',
    sameSite = 'Lax',
    domain = getBaseDomain(),
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  cookie += `; path=${path}`;
  cookie += `; max-age=${String(maxAge)}`;
  cookie += `; samesite=${sameSite}`;

  if (secure) {
    cookie += '; secure';
  }

  if (domain) {
    cookie += `; domain=${domain}`;
  }

  document.cookie = cookie;
}

/**
 * Gets a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const encodedName = encodeURIComponent(name);

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === encodedName) {
      return decodeURIComponent(cookieValue ?? '');
    }
  }

  return null;
}

/**
 * Deletes a cookie by setting its expiry in the past
 */
export function deleteCookie(name: string, domain?: string): void {
  const baseDomain = domain ?? getBaseDomain();
  let cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;

  if (baseDomain) {
    cookie += `; domain=${baseDomain}`;
  }

  document.cookie = cookie;

  // Also try without domain in case it was set without one
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
}

/**
 * Stores OAuth state in cookies for cross-subdomain access
 */
export function storeOAuthStateCookie(codeVerifier: string, state: string): void {
  setCookie(OAUTH_COOKIE_KEYS.CODE_VERIFIER, codeVerifier);
  setCookie(OAUTH_COOKIE_KEYS.STATE, state);
}

/**
 * Stores the return origin for post-auth redirect
 */
export function storeReturnOrigin(origin: string): void {
  setCookie(OAUTH_COOKIE_KEYS.RETURN_ORIGIN, origin);
}

/**
 * Retrieves and clears OAuth state from cookies
 */
export function retrieveOAuthStateCookie(): { codeVerifier: string; state: string } | null {
  const codeVerifier = getCookie(OAUTH_COOKIE_KEYS.CODE_VERIFIER);
  const state = getCookie(OAUTH_COOKIE_KEYS.STATE);

  if (!codeVerifier || !state) {
    return null;
  }

  // Clear the stored state
  deleteCookie(OAUTH_COOKIE_KEYS.CODE_VERIFIER);
  deleteCookie(OAUTH_COOKIE_KEYS.STATE);

  return { codeVerifier, state };
}

/**
 * Retrieves and clears the return origin
 */
export function retrieveReturnOrigin(): string | null {
  const origin = getCookie(OAUTH_COOKIE_KEYS.RETURN_ORIGIN);

  if (origin) {
    deleteCookie(OAUTH_COOKIE_KEYS.RETURN_ORIGIN);
  }

  return origin;
}

/**
 * Token transfer data structure for cross-subdomain token passing
 */
export interface TokenTransferData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Stores tokens in a cookie for cross-subdomain transfer
 * The token is JSON-encoded and base64-encoded for safe cookie storage
 */
export function storeTokenTransfer(data: TokenTransferData): void {
  const encoded = btoa(JSON.stringify(data));
  setCookie(OAUTH_COOKIE_KEYS.TOKEN_TRANSFER, encoded, {
    maxAge: 60, // 1 minute - short-lived for security
  });
}

/**
 * Retrieves and clears the token transfer data
 */
export function retrieveTokenTransfer(): TokenTransferData | null {
  const encoded = getCookie(OAUTH_COOKIE_KEYS.TOKEN_TRANSFER);

  if (!encoded) {
    return null;
  }

  deleteCookie(OAUTH_COOKIE_KEYS.TOKEN_TRANSFER);

  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded) as TokenTransferData;
  } catch {
    console.error('Failed to decode token transfer data');
    return null;
  }
}
