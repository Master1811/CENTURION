export const AUTH_INTENT_KEY = 'centurion_auth_intent';

export function storeAuthIntent(intent) {
  localStorage.setItem(AUTH_INTENT_KEY, JSON.stringify({
    intent: intent?.intent ?? null,
    plan: intent?.plan ?? null,
    price: intent?.price ?? null,
    billing: intent?.billing ?? null,
    redirectTo: intent?.redirectTo ?? '/dashboard',
    storedAt: Date.now(),
  }));
}

export function readAuthIntent() {
  try {
    const raw = localStorage.getItem(AUTH_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - parsed.storedAt > 30 * 60 * 1000) {
      clearAuthIntent();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthIntent() {
  localStorage.removeItem(AUTH_INTENT_KEY);
}

/**
 * Read intent, clear it, and return the redirect path.
 * Used by AuthCallback after successful auth.
 * @returns {string} Path to redirect to (e.g. '/dashboard' or '/checkout')
 */
export function getRedirectPathAfterAuth() {
  const intent = readAuthIntent();
  clearAuthIntent();
  return intent?.redirectTo ?? '/dashboard';
}
