// Auth Callback Page
// ==================
// Handles magic link callback from Supabase.
// This page is loaded when users click the magic link in their email.

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getRedirectPathAfterAuth } from '@/lib/auth/intent';
import { cn } from '@/lib/utils';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured()) {
        // Mock auth for development
        setStatus('success');
        const redirectTo = getRedirectPathAfterAuth();
        setTimeout(() => navigate(redirectTo), 1500);
        return;
      }

      try {
        // Supabase client automatically handles the token exchange
        // when detectSessionInUrl is true (which it is in our client)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setErrorMessage(error.message || 'Authentication failed. Please try again.');
          return;
        }

        if (session) {
          setStatus('success');
          const redirectTo = getRedirectPathAfterAuth();
          setTimeout(() => navigate(redirectTo), 1500);
        } else {
          setStatus('error');
          setErrorMessage('No session found. Please try signing in again.');
        }
      } catch (error) {
        console.error('Callback processing error:', error);
        setStatus('error');
        setErrorMessage('Something went wrong. Please try again.');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  // Animation variants for smooth state transitions
  const containerVariants = {
    initial: {
      opacity: 0,
      scale: 0.96,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      filter: 'blur(2px)',
      transition: {
        duration: 0.2,
      }
    }
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.1,
      }
    },
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AnimatePresence mode="wait">
          {status === 'processing' && (
            <motion.div
              key="processing"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Loader2 className="w-12 h-12 text-[#09090B]" strokeWidth={1.5} />
              </motion.div>
              <h1 className="text-xl font-heading font-semibold text-[#09090B] mb-2">
                Signing you in...
              </h1>
              <p className="text-sm text-[#71717A]">
                Please wait while we verify your identity.
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
              </motion.div>
              <motion.h1
                className="text-xl font-heading font-semibold text-[#09090B] mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Welcome back!
              </motion.h1>
              <motion.p
                className="text-sm text-[#71717A]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Redirecting you to your dashboard...
              </motion.p>
              {/* Progress bar for redirect */}
              <motion.div
                className="mt-6 h-1 bg-[#F4F4F5] rounded-full overflow-hidden max-w-[200px] mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.3, ease: 'linear' }}
                />
              </motion.div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center"
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
              </motion.div>
              <motion.h1
                className="text-xl font-heading font-semibold text-[#09090B] mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Authentication Failed
              </motion.h1>
              <motion.p
                className="text-sm text-[#71717A] mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {errorMessage}
              </motion.p>
              <motion.button
                onClick={() => navigate('/')}
                className={cn(
                  'h-10 px-6 rounded-lg',
                  'bg-[#09090B] text-white text-sm font-medium',
                  'will-change-transform'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                whileHover={{ scale: 1.02, backgroundColor: '#18181B' }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthCallback;
