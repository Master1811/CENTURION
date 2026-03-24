'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, CheckCircle, Sparkles, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useJoinWaitlist, useWaitlistCount } from '@/hooks/useApi';
import { toast } from 'sonner';
import Link from 'next/link';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const joinWaitlist = useJoinWaitlist();
  const { data: countData } = useWaitlistCount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    if (!dpdpConsent) {
      toast.error('Please accept the privacy policy');
      return;
    }

    try {
      await joinWaitlist.mutateAsync({ email });
      setSubmitted(true);
      toast.success('You\'re on the waitlist!');
    } catch (error) {
      toast.error('Failed to join waitlist');
    }
  };

  const waitlistCount = countData?.count || 342;

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{
        background: 'linear-gradient(180deg, #050A10 0%, #0A1628 50%, #050A10 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'rgba(0, 191, 255, 0.05)',
            border: '1px solid rgba(0, 191, 255, 0.2)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,191,255,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              LIMITED BETA ACCESS
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the Beta Waitlist
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Be among the first 50 founders to get exclusive beta access.
              60 days free, plus founding member pricing forever.
            </p>

            {/* Waitlist count */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">{waitlistCount}</span>
              <span className="text-white/50">founders already waiting</span>
            </motion.div>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                {/* Email input */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="founder@startup.com"
                      className="centurion-input pl-12 h-14"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" loading={joinWaitlist.isPending}>
                    Join Waitlist
                  </Button>
                </div>

                {/* DPDP Consent */}
                <label className="flex items-start gap-3 text-left cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dpdpConsent}
                    onChange={(e) => setDpdpConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <span className="text-sm text-white/50">
                    I agree to the{' '}
                    <Link href="/privacy" className="text-cyan-400 hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    and consent to data processing under DPDP Act 2023.
                  </span>
                </label>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  You're on the list! 🎉
                </h3>
                <p className="text-white/60">
                  We'll reach out soon with your beta access.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-[#09090B] mb-6">
            Ready to build your<br />
            <span className="gradient-text-cyan">₹100 Crore</span> journey?
          </h2>
          <p className="text-[#52525B] text-lg mb-10 max-w-2xl mx-auto">
            Join 500+ Indian founders who are tracking their path to ₹100 Crore with clarity and confidence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/?login=true">
              <Button size="xl">
                Get Started Free
              </Button>
            </Link>
            <Link href="/tools/100cr-calculator">
              <Button variant="secondary" size="xl">
                Try Calculator
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function InlineCTA({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark';

  return (
    <section
      className={`py-16 ${isDark ? 'bg-[#09090B]' : 'bg-[#F8F9FC]'}`}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-[#09090B]'}`}>
            Stop guessing. Start knowing.
          </h3>
          <p className={`mb-8 ${isDark ? 'text-white/60' : 'text-[#52525B]'}`}>
            Calculate your path to ₹100 Crore in under 60 seconds.
          </p>
          <Link href="/tools/100cr-calculator">
            <Button size="lg">
              Try Free Calculator
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

