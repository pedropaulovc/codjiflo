import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storeOAuthState,
  retrieveOAuthState,
  OAUTH_STORAGE_KEYS,
} from './pkce';

describe('PKCE utilities', () => {
  describe('generateCodeVerifier', () => {
    it('generates a base64url-encoded string', () => {
      const verifier = generateCodeVerifier();
      // Base64url alphabet: A-Z, a-z, 0-9, -, _
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates strings of consistent length', () => {
      const verifier = generateCodeVerifier();
      // 32 bytes → 43 chars in base64url (no padding)
      expect(verifier.length).toBe(43);
    });

    it('generates unique values each time', () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      expect(verifier1).not.toBe(verifier2);
    });
  });

  describe('generateCodeChallenge', () => {
    it('generates a base64url-encoded string', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates consistent challenges for the same verifier', async () => {
      const verifier = 'test-verifier-123';
      const challenge1 = await generateCodeChallenge(verifier);
      const challenge2 = await generateCodeChallenge(verifier);
      expect(challenge1).toBe(challenge2);
    });

    it('generates different challenges for different verifiers', async () => {
      const challenge1 = await generateCodeChallenge('verifier-1');
      const challenge2 = await generateCodeChallenge('verifier-2');
      expect(challenge1).not.toBe(challenge2);
    });
  });

  describe('generateState', () => {
    it('generates a base64url-encoded string', () => {
      const state = generateState();
      expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates unique values each time', () => {
      const state1 = generateState();
      const state2 = generateState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('OAuth state storage', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('stores OAuth state in sessionStorage', () => {
      const codeVerifier = 'test-verifier';
      const state = 'test-state';

      storeOAuthState(codeVerifier, state);

      expect(sessionStorage.getItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER)).toBe(codeVerifier);
      expect(sessionStorage.getItem(OAUTH_STORAGE_KEYS.STATE)).toBe(state);
    });

    it('retrieves and clears OAuth state from sessionStorage', () => {
      const codeVerifier = 'test-verifier';
      const state = 'test-state';

      storeOAuthState(codeVerifier, state);
      const retrieved = retrieveOAuthState();

      expect(retrieved).toEqual({ codeVerifier, state });
      expect(sessionStorage.getItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER)).toBeNull();
      expect(sessionStorage.getItem(OAUTH_STORAGE_KEYS.STATE)).toBeNull();
    });

    it('returns null when OAuth state is not stored', () => {
      const retrieved = retrieveOAuthState();
      expect(retrieved).toBeNull();
    });

    it('returns null when only code verifier is stored', () => {
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.CODE_VERIFIER, 'test');
      const retrieved = retrieveOAuthState();
      expect(retrieved).toBeNull();
    });

    it('returns null when only state is stored', () => {
      sessionStorage.setItem(OAUTH_STORAGE_KEYS.STATE, 'test');
      const retrieved = retrieveOAuthState();
      expect(retrieved).toBeNull();
    });
  });
});
