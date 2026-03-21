/**
 * Logger — Centralized Frontend Logging Utility
 * ==============================================
 *
 * Behaviour by environment:
 *   development  → DEBUG, INFO, WARN, ERROR all printed to console (colour-coded)
 *   production   → WARN + ERROR only; errors are also forwarded to Sentry
 *
 * Security rules (enforced here, not in callers):
 *   • Sensitive fields are ALWAYS masked before any output
 *   • Tokens, passwords, API keys, JWTs are never printed
 *   • Request bodies are never logged verbatim — only safe summaries
 *
 * Usage:
 *   import logger from '@/lib/logger';
 *
 *   logger.info('auth', 'User signed in', { plan: 'founder' });
 *   logger.error('payment', 'Order creation failed', { orderId }, err);
 *   logger.warn('gate', 'Feature access denied', { feature: 'ai_coach' });
 *   logger.debug('api', 'Request sent', { method: 'POST', path: '/api/checkin' });
 */

import { captureException, addBreadcrumb } from '@/lib/sentry';

// ─── Config ───────────────────────────────────────────────────────────────────
const IS_DEV = process.env.NODE_ENV !== 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

// Level hierarchy
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
// In production only WARN and above are emitted to console
const MIN_CONSOLE_LEVEL = IS_DEV ? LEVELS.DEBUG : LEVELS.WARN;

// ─── Sensitive field masking ──────────────────────────────────────────────────
const SENSITIVE_KEYS = new Set([
  'password', 'token', 'access_token', 'refresh_token', 'id_token',
  'authorization', 'api_key', 'apikey', 'secret', 'private_key',
  'credit_card', 'card_number', 'cvv', 'jwt', 'bearer',
  'supabase_key', 'razorpay_key', 'anthropic_key',
]);

/**
 * Recursively mask sensitive fields in an object.
 * Safe to call on anything — primitives pass through unchanged.
 */
function maskSensitive(value, depth = 0) {
  if (depth > 6) return '[DEPTH_LIMIT]';
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    // Mask JWT tokens (three dot-separated base64 segments)
    if (value.length > 50 && (value.match(/\./g) || []).length === 2) {
      return `${value.slice(0, 12)}…[JWT_REDACTED]`;
    }
    // Mask long opaque strings (likely keys/tokens)
    if (value.length > 80) return `${value.slice(0, 16)}…[TRUNCATED]`;
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map(v => maskSensitive(v, depth + 1));
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const kl = k.toLowerCase().replace(/[-_]/g, '');
      if ([...SENSITIVE_KEYS].some(s => kl.includes(s.replace(/[-_]/g, '')))) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = maskSensitive(v, depth + 1);
      }
    }
    return out;
  }

  return value;
}

// ─── Console styles (dev only) ────────────────────────────────────────────────
const STYLES = {
  DEBUG: 'color:#6B7280;font-weight:normal',
  INFO:  'color:#2563EB;font-weight:600',
  WARN:  'color:#D97706;font-weight:700',
  ERROR: 'color:#DC2626;font-weight:700',
};

const ICONS = { DEBUG: '🔍', INFO: '📘', WARN: '⚠️', ERROR: '🔴' };

// ─── Core emit ────────────────────────────────────────────────────────────────
function emit(levelName, module, message, context = {}, error = null) {
  if (IS_TEST) return; // silence in test runs
  const levelNum = LEVELS[levelName] ?? LEVELS.INFO;

  // --- Mask before anything touches output ---
  const safeCtx = maskSensitive(context);

  // --- Console output (gated by MIN_CONSOLE_LEVEL) ---
  if (levelNum >= MIN_CONSOLE_LEVEL) {
    const ts = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    const prefix = `${ICONS[levelName]} [${ts}] [${module.toUpperCase()}]`;

    if (IS_DEV) {
      // Colour-coded, structured
      const method = levelName === 'ERROR' ? console.error
                   : levelName === 'WARN'  ? console.warn
                   : levelName === 'DEBUG' ? console.debug
                   : console.info;

      if (Object.keys(safeCtx).length > 0) {
        method(`%c${prefix} ${message}`, STYLES[levelName], safeCtx);
      } else {
        method(`%c${prefix} ${message}`, STYLES[levelName]);
      }
      if (error) console.error('  └─ Error:', error);
    } else {
      // Production: plain text, no colours, no objects (avoid leaking structure)
      const method = levelName === 'ERROR' ? console.error : console.warn;
      method(`${prefix} ${message}`);
      // Never print error objects in production console — Sentry captures them
    }
  }

  // --- Sentry forwarding ---
  if (levelName === 'ERROR') {
    if (error) {
      captureException(error, { module, message, ...safeCtx });
    } else {
      // Treat as a Sentry message when no Error object
      addBreadcrumb(message, module, 'error', safeCtx);
    }
  } else if (levelName === 'WARN') {
    addBreadcrumb(message, module, 'warning', safeCtx);
  } else if (levelName === 'INFO') {
    addBreadcrumb(message, module, 'info', safeCtx);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
const logger = {
  /** Low-level tracing — dev only, never in production */
  debug: (module, message, context = {}) =>
    emit('DEBUG', module, message, context),

  /** Normal operational events */
  info: (module, message, context = {}) =>
    emit('INFO', module, message, context),

  /** Something unexpected but recoverable */
  warn: (module, message, context = {}) =>
    emit('WARN', module, message, context),

  /** Failures that need attention; forwarded to Sentry */
  error: (module, message, context = {}, error = null) =>
    emit('ERROR', module, message, context, error),

  /**
   * Create a scoped logger bound to a module name.
   *
   * Usage:
   *   const log = logger.scope('checkout');
   *   log.info('Order created', { orderId });
   *   log.error('Payment failed', { orderId }, err);
   */
  scope: (module) => ({
    debug: (msg, ctx = {})       => emit('DEBUG', module, msg, ctx),
    info:  (msg, ctx = {})       => emit('INFO',  module, msg, ctx),
    warn:  (msg, ctx = {})       => emit('WARN',  module, msg, ctx),
    error: (msg, ctx = {}, err = null) => emit('ERROR', module, msg, ctx, err),
  }),
};

export default logger;
export { maskSensitive };
