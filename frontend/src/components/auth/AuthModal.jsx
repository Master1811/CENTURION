// Sign In / Sign Up Modal Component
// ==================================
// A beautiful modal for magic link authentication.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { copy } from '@/lib/copy';
import { signInWithGoogle } from '@/lib/auth/google';
import { readAuthIntent, storeAuthIntent } from '@/lib/auth/intent';

const DEFAULT_HEADLINE = 'Sign in to Centurion';

export const AuthModal = ({ isOpen, onClose, initialMode = 'signin', headline: headlineProp }) => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [dpdpConsent, setDpdpConsent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !dpdpConsent) return;

    setLoading(true);
    setError('');

    const { error: authError } = await signInWithMagicLink(email);

    setLoading(false);

    if (authError) {
      setError(authError.message || 'Failed to send magic link. Please try again.');
    } else {
      setSent(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSent(false);
    setError('');
    setDpdpConsent(false);
    onClose();
  };

  if (!isOpen) return null;

  const headline =
    headlineProp ??
    (readAuthIntent()?.intent === 'upgrade' ? 'Create your account to continue' : DEFAULT_HEADLINE);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center glass-backdrop p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'w-full max-w-md',
            'glass-modal',
            'overflow-hidden'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-xl glass-button transition-all duration-200"
            >
              <X className="w-5 h-5 text-[#71717A]" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-1 mb-2">
              <span className="font-heading font-bold text-[#09090B]">100Cr</span>
              <span className="font-heading text-[#71717A]">Engine</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {!sent ? (
              <>
                <h2 className="text-2xl font-heading font-bold text-[#09090B] mb-2">
                  {headline}
                </h2>
                <p className="text-sm text-[#71717A] mb-6">
                  Enter your email to receive a magic link. No password needed.
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={async () => {
                      try {
                        storeAuthIntent({
                          intent: 'signin',
                          redirectTo: '/dashboard',
                        })
                        setLoading(true)
                        setError('')
                        await signInWithGoogle()
                        // Supabase redirects to Google automatically.
                        // No further action needed here.
                      } catch (err) {
                        setLoading(false)
                        setError('Google sign-in failed. Try again.')
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-[rgba(0,0,0,0.12)] bg-white text-sm font-medium text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
                    data-testid="auth-google-btn"
                  >
                    {/* Google SVG icon */}
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                      />
                      <path
                        fill="#34A853"
                        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
                      />
                      <path
                        fill="#EA4335"
                        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#E4E4E7]" />
                    <span className="text-xs text-[#A1A1AA]">or</span>
                    <div className="flex-1 h-px bg-[#E4E4E7]" />
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="relative mb-4">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A1A1AA]" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@startup.com"
                      required
                      disabled={loading}
                      className={cn(
                        'w-full h-12 pl-12 pr-4 rounded-xl',
                        'glass-input',
                        'text-sm text-[#09090B] placeholder:text-[#A1A1AA]',
                        'disabled:opacity-50'
                      )}
                      data-testid="auth-email-input"
                    />
                  </div>

                  {/* DPDP Consent Checkbox */}
                  <label className="flex items-start gap-3 mb-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      disabled={loading}
                      required
                      className={cn(
                        "mt-0.5 w-4 h-4 rounded border-2 border-zinc-300",
                        "bg-transparent checked:bg-[#09090B] checked:border-[#09090B]",
                        "focus:ring-2 focus:ring-[#09090B]/20 focus:ring-offset-0",
                        "cursor-pointer transition-all"
                      )}
                      data-testid="auth-consent-checkbox"
                    />
                    <span className="text-xs text-[#71717A] group-hover:text-[#52525B] transition-colors">
                      I agree to the processing of my personal data as described in the{' '}
                      <a 
                        href="/privacy" 
                        className="text-[#09090B] hover:underline font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  {error && (
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email || !dpdpConsent}
                    className={cn(
                      'w-full h-12 rounded-xl',
                      'bg-[#09090B] text-white',
                      'text-sm font-medium',
                      'flex items-center justify-center gap-2',
                      'hover:bg-[#18181B] transition-all duration-200',
                      'hover:shadow-lg hover:-translate-y-0.5',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                    )}
                    data-testid="auth-submit-btn"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                        </motion.div>
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        Continue with Email
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-xs text-[#A1A1AA] text-center mt-4">
                  By continuing, you agree to our Terms of Service.
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-heading font-semibold text-[#09090B] mb-2">
                  Check your inbox
                </h2>
                <p className="text-sm text-[#71717A] mb-2">
                  We sent a magic link to
                </p>
                <p className="text-sm font-medium text-[#09090B] mb-4">
                  {email}
                </p>
                <p className="text-xs text-[#A1A1AA]">
                  Click the link in the email to sign in. The link expires in 1 hour.
                </p>

                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm text-[#52525B] hover:text-[#09090B]"
                >
                  Use a different email
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer - Benefits */}
          {!sent && (
            <div className="px-6 py-4 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.02)] border-t border-[rgba(0,0,0,0.04)]">
              <p className="text-xs text-[#71717A] mb-2">What you'll get:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2 text-xs text-[#52525B]">
                  <CheckCircle className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                  Unlimited free projections for 7 days
                </li>
                <li className="flex items-center gap-2 text-xs text-[#52525B]">
                  <CheckCircle className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                  Save and share your projections
                </li>
                <li className="flex items-center gap-2 text-xs text-[#52525B]">
                  <CheckCircle className="w-3 h-3 text-emerald-500" strokeWidth={2} />
                  Track your progress monthly
                </li>
              </ul>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
