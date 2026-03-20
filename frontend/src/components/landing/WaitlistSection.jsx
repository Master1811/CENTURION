// Waitlist Section Component
// ==========================
// Beta launch waitlist signup form with DPDP compliance

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, Share2, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Stages matching the backend VALID_STAGES
const STAGES = [
  { value: '', label: 'Select your stage (optional)' },
  { value: 'idea', label: 'Idea / Pre-product' },
  { value: 'mvp', label: 'MVP / Early customers' },
  { value: 'early-traction', label: 'Early traction' },
  { value: 'product-market-fit', label: 'Product-market fit' },
  { value: 'scaling', label: 'Scaling' },
];

export const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  // Get referral from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const referralSource = urlParams.get('ref') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!consent) {
      setError('Please agree to the privacy policy to continue.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || null,
          stage: stage || null,
          referral_source: referralSource || null,
          dpdp_consent_given: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This email is already on the waitlist!');
        } else if (data.detail) {
          setError(typeof data.detail === 'string' ? data.detail : 'Please check your input.');
        } else {
          setError('Something went wrong. Please try again.');
        }
        return;
      }

      setSuccess(data);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (success?.share_url) {
      await navigator.clipboard.writeText(success.share_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section 
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050A10 0%, #0A1628 50%, #050A10 100%)',
      }}
      data-testid="waitlist-section"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {/* Header */}
              <div className="mb-8">
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-400/10 rounded-full mb-4">
                  BETA WAITLIST
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Be first to know when
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    your spot opens
                  </span>
                </h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  Join the waitlist for early access to Centurion. 
                  We'll notify you when it's your turn.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@startup.com"
                  required
                  disabled={loading}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl",
                    "bg-white/5 border border-white/10",
                    "text-white placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
                    "disabled:opacity-50 transition-all"
                  )}
                  data-testid="waitlist-email-input"
                />

                {/* Optional Name Input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  disabled={loading}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl",
                    "bg-white/5 border border-white/10",
                    "text-white placeholder:text-zinc-500",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
                    "disabled:opacity-50 transition-all"
                  )}
                  data-testid="waitlist-name-input"
                />

                {/* Stage Dropdown */}
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  disabled={loading}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl appearance-none cursor-pointer",
                    "bg-white/5 border border-white/10",
                    "text-white",
                    "focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50",
                    "disabled:opacity-50 transition-all",
                    !stage && "text-zinc-500"
                  )}
                  data-testid="waitlist-stage-select"
                >
                  {STAGES.map(s => (
                    <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                      {s.label}
                    </option>
                  ))}
                </select>

                {/* DPDP Consent Checkbox */}
                <label className="flex items-start gap-3 text-left cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={loading}
                    className={cn(
                      "mt-1 w-5 h-5 rounded border-2 border-zinc-600",
                      "bg-transparent checked:bg-cyan-500 checked:border-cyan-500",
                      "focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-0",
                      "cursor-pointer transition-all"
                    )}
                    data-testid="waitlist-consent-checkbox"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    I agree to the processing of my personal data as described in the{' '}
                    <a 
                      href="/privacy" 
                      className="text-cyan-400 hover:text-cyan-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                {/* Error Message */}
                {error && (
                  <p className="text-red-400 text-sm" data-testid="waitlist-error">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !consent}
                  className={cn(
                    "w-full h-12 rounded-xl font-semibold",
                    "bg-gradient-to-r from-cyan-500 to-blue-600",
                    "text-white",
                    "flex items-center justify-center gap-2",
                    "hover:from-cyan-400 hover:to-blue-500",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200",
                    !loading && "hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5"
                  )}
                  data-testid="waitlist-submit-btn"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Joining...
                    </>
                  ) : (
                    <>
                      Join the Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
              data-testid="waitlist-success"
            >
              {/* Success Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-cyan-400" />
              </div>

              {/* Position Number */}
              <div className="mb-6">
                <span className="text-sm text-zinc-400">You are number</span>
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {success.position}
                </div>
                <span className="text-sm text-zinc-400">on the waitlist</span>
              </div>

              {/* Message */}
              <p className="text-zinc-300 mb-8 max-w-md mx-auto">
                {success.message}
              </p>

              {/* Share URL */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Share your link to move up</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={success.share_url}
                    readOnly
                    className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-sm"
                    data-testid="waitlist-share-url"
                  />
                  <button
                    onClick={copyShareUrl}
                    className={cn(
                      "h-10 px-4 rounded-lg font-medium text-sm",
                      "flex items-center gap-2",
                      copied 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
                    )}
                    data-testid="waitlist-copy-btn"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default WaitlistSection;
