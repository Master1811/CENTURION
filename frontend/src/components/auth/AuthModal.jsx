// Sign In / Sign Up Modal Component
// ==================================
// A beautiful modal for magic link authentication.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { copy } from '@/lib/copy';

export const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-full max-w-md',
            'bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)]',
            'overflow-hidden'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
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
                  {initialMode === 'signin' ? 'Welcome back' : 'Get started for free'}
                </h2>
                <p className="text-sm text-[#71717A] mb-6">
                  Enter your email to receive a magic link. No password needed.
                </p>

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
                        'bg-[#F4F4F5] border border-transparent',
                        'text-sm text-[#09090B] placeholder:text-[#A1A1AA]',
                        'focus:outline-none focus:border-[#09090B] focus:bg-white',
                        'transition-all duration-200',
                        'disabled:opacity-50'
                      )}
                      data-testid="auth-email-input"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className={cn(
                      'w-full h-12 rounded-xl',
                      'bg-[#09090B] text-white',
                      'text-sm font-medium',
                      'flex items-center justify-center gap-2',
                      'hover:bg-[#18181B] transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
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
                  By continuing, you agree to our Terms of Service and Privacy Policy.
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
            <div className="px-6 py-4 bg-[#F4F4F5] border-t border-[rgba(0,0,0,0.06)]">
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
