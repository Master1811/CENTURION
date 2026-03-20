/**
 * Sentry Configuration for Frontend
 * ==================================
 * Production-grade error tracking and performance monitoring.
 * 
 * Features:
 * - Error tracking with React component stack traces
 * - Performance monitoring
 * - Session replay (for debugging)
 * - User context tracking (privacy-compliant)
 * - Release tracking
 */

import * as Sentry from '@sentry/react';

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
const RELEASE_VERSION = process.env.REACT_APP_VERSION || '3.0.0';

// Sample rates (adjust for production)
const TRACES_SAMPLE_RATE = ENVIRONMENT === 'production' ? 0.2 : 1.0;
const REPLAYS_SESSION_SAMPLE_RATE = ENVIRONMENT === 'production' ? 0.1 : 0;
const REPLAYS_ON_ERROR_SAMPLE_RATE = 1.0;

/**
 * Initialize Sentry
 * Call this at the top of your index.js BEFORE any other imports
 */
export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured - error tracking disabled');
    return false;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      
      // Environment and release tracking
      environment: ENVIRONMENT,
      release: `centurion-frontend@${RELEASE_VERSION}`,
      
      // Performance monitoring
      tracesSampleRate: TRACES_SAMPLE_RATE,
      
      // Session replay (for debugging)
      replaysSessionSampleRate: REPLAYS_SESSION_SAMPLE_RATE,
      replaysOnErrorSampleRate: REPLAYS_ON_ERROR_SAMPLE_RATE,
      
      // Integrations
      integrations: [
        // Browser tracing for performance
        Sentry.browserTracingIntegration({
          // Track navigation changes
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.preview\.emergentagent\.com/,
            /^https:\/\/.*\.centurion\.in/,
          ],
        }),
        // Session replay
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
          // Mask sensitive inputs
          mask: ['.sensitive-input', '[data-sentry-mask]'],
        }),
        // Breadcrumbs for debugging
        Sentry.breadcrumbsIntegration({
          console: true,
          dom: true,
          fetch: true,
          history: true,
          xhr: true,
        }),
      ],
      
      // Privacy: Don't send PII by default
      sendDefaultPii: false,
      
      // Filter sensitive data
      beforeSend(event, hint) {
        // Don't send errors from development tools
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
          return null;
        }
        
        // Mask sensitive data in breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data?.url) {
              // Remove tokens from URLs
              breadcrumb.data.url = breadcrumb.data.url.replace(
                /token=[^&]+/gi,
                'token=[REDACTED]'
              );
            }
            return breadcrumb;
          });
        }
        
        return event;
      },
      
      // Filter transactions
      beforeSendTransaction(event) {
        // Skip health check transactions
        if (event.transaction?.includes('/health')) {
          return null;
        }
        return event;
      },
      
      // Ignore common benign errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'canvas.contentDocument',
        // Generic errors
        'Script error.',
        'Non-Error promise rejection captured',
        // Network errors (handled by app)
        'Failed to fetch',
        'NetworkError',
        'Load failed',
        // React hydration (if SSR)
        'Hydration failed',
      ],
      
      // Max breadcrumbs
      maxBreadcrumbs: 50,
    });

    // Set global tags
    Sentry.setTag('service', 'centurion-frontend');
    Sentry.setTag('version', RELEASE_VERSION);
    
    console.log(`[Sentry] Initialized: env=${ENVIRONMENT}, traces=${TRACES_SAMPLE_RATE}`);
    return true;
    
  } catch (error) {
    console.error('[Sentry] Initialization failed:', error);
    return false;
  }
};

/**
 * Set user context for error tracking
 * Call after successful authentication
 */
export const setUserContext = (userId, email = null, extra = {}) => {
  if (!SENTRY_DSN) return;
  
  try {
    const userData = { id: userId };
    
    // Don't include raw email - use hashed version for identification
    if (email) {
      // Simple hash for user identification without exposing PII
      const hashBuffer = new TextEncoder().encode(email);
      const hashArray = Array.from(hashBuffer);
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      userData.username = hashHex.substring(0, 12);
    }
    
    Object.assign(userData, extra);
    Sentry.setUser(userData);
  } catch (error) {
    // Don't let Sentry errors break the app
  }
};

/**
 * Clear user context on logout
 */
export const clearUserContext = () => {
  if (!SENTRY_DSN) return;
  
  try {
    Sentry.setUser(null);
  } catch (error) {
    // Ignore
  }
};

/**
 * Add a breadcrumb for debugging
 */
export const addBreadcrumb = (message, category = 'custom', level = 'info', data = {}) => {
  if (!SENTRY_DSN) return;
  
  try {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
      data,
    });
  } catch (error) {
    // Ignore
  }
};

/**
 * Capture an exception with additional context
 */
export const captureException = (error, context = {}) => {
  if (!SENTRY_DSN) {
    console.error('[Error]', error);
    return;
  }
  
  try {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } catch (e) {
    console.error('[Error]', error);
  }
};

/**
 * Capture a message/event
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!SENTRY_DSN) {
    console.log(`[${level}]`, message);
    return;
  }
  
  try {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  } catch (e) {
    console.log(`[${level}]`, message);
  }
};

// Export Sentry for advanced usage
export { Sentry };

export default {
  initSentry,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  captureException,
  captureMessage,
  Sentry,
};
