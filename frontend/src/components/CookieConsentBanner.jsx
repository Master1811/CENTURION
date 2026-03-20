// Cookie Consent Banner Component
// ================================
// DPDP Act compliant cookie consent

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONSENT_KEY = 'centurion_cookie_consent';

// Check if user has already made a choice
const getStoredConsent = () => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading consent:', e);
  }
  return null;
};

// Store consent choice
const storeConsent = (accepted) => {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      accepted,
      timestamp: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Error storing consent:', e);
  }
};

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    // Check if user has already made a choice
    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored);
      setShowBanner(false);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    storeConsent(true);
    setConsent({ accepted: true, timestamp: new Date().toISOString() });
    setShowBanner(false);
    
    // Here you would initialize analytics scripts
    console.log('[Cookies] User accepted cookies');
  };

  const handleDecline = () => {
    storeConsent(false);
    setConsent({ accepted: false, timestamp: new Date().toISOString() });
    setShowBanner(false);
    
    // Do NOT load analytics if declined
    console.log('[Cookies] User declined cookies - analytics disabled');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
          data-testid="cookie-consent-banner"
        >
          <div className={cn(
            "max-w-3xl mx-auto",
            "bg-zinc-900/95 backdrop-blur-xl",
            "border border-zinc-700/50 rounded-2xl",
            "shadow-2xl shadow-black/50",
            "p-4 sm:p-6"
          )}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Icon */}
              <div className="hidden sm:flex w-12 h-12 bg-cyan-500/20 rounded-xl items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-cyan-400" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-cyan-400 sm:hidden" />
                  Cookie Preferences
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  We use cookies to enhance your experience and analyze site usage. 
                  By clicking "Accept", you consent to our use of cookies as described 
                  in our{' '}
                  <a 
                    href="/privacy" 
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Privacy Policy
                  </a>
                  . You can change your preferences at any time.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-medium",
                      "bg-cyan-500 hover:bg-cyan-400 text-black",
                      "transition-colors duration-200"
                    )}
                    data-testid="cookie-accept-btn"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    className={cn(
                      "px-6 py-2.5 rounded-xl font-medium",
                      "bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300",
                      "border border-zinc-600/50",
                      "transition-colors duration-200"
                    )}
                    data-testid="cookie-decline-btn"
                  >
                    Decline
                  </button>
                </div>
              </div>

              {/* Close button (X) - closes without saving preference */}
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-3 right-3 sm:static p-2 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook to check if analytics should be loaded
export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    const stored = getStoredConsent();
    setConsent(stored);
  }, []);

  return {
    hasConsented: consent?.accepted === true,
    hasDeclined: consent?.accepted === false,
    consentTimestamp: consent?.timestamp,
    isLoading: consent === null,
  };
};

export default CookieConsentBanner;
