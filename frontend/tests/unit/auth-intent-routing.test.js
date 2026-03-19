/**
 * Unit tests for auth intent routing.
 * Tests getRedirectPathAfterAuth() which reads centurion_auth_intent from
 * localStorage, clears it, and returns the redirect path.
 */

import {
  AUTH_INTENT_KEY,
  getRedirectPathAfterAuth,
} from '../../src/lib/auth/intent';

describe('auth intent routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('TEST CASE 1: signin intent routes to /dashboard', () => {
    it('returns /dashboard and clears localStorage when intent is signin', () => {
      const stored = {
        intent: 'signin',
        redirectTo: '/dashboard',
        storedAt: Date.now(),
      };
      localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(stored));

      const path = getRedirectPathAfterAuth();

      expect(path).toBe('/dashboard');
      expect(localStorage.getItem(AUTH_INTENT_KEY)).toBeNull();
    });
  });

  describe('TEST CASE 2: upgrade intent routes to /checkout', () => {
    it('returns /checkout and clears localStorage when intent is upgrade', () => {
      const stored = {
        intent: 'upgrade',
        plan: 'founder',
        redirectTo: '/checkout',
        storedAt: Date.now(),
      };
      localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(stored));

      const path = getRedirectPathAfterAuth();

      expect(path).toBe('/checkout');
      expect(localStorage.getItem(AUTH_INTENT_KEY)).toBeNull();
    });
  });

  describe('TEST CASE 3: no intent stored → default /dashboard', () => {
    it('returns /dashboard when localStorage has no intent', () => {
      expect(localStorage.getItem(AUTH_INTENT_KEY)).toBeNull();

      const path = getRedirectPathAfterAuth();

      expect(path).toBe('/dashboard');
    });
  });

  describe('TEST CASE 4: expired intent (>30 minutes old) → default /dashboard', () => {
    it('returns /dashboard and clears expired intent from localStorage', () => {
      const stored = {
        intent: 'upgrade',
        plan: 'founder',
        redirectTo: '/checkout',
        storedAt: Date.now() - 31 * 60 * 1000,
      };
      localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(stored));

      const path = getRedirectPathAfterAuth();

      expect(path).toBe('/dashboard');
      expect(localStorage.getItem(AUTH_INTENT_KEY)).toBeNull();
    });
  });
});
