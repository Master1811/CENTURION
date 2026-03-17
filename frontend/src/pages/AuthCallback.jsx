// Auth Callback Page
// ==================
// Handles magic link callback from Supabase.
// This page is loaded when users click the magic link in their email.

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
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
        setTimeout(() => navigate('/dashboard'), 1500);
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
          // Redirect to dashboard after short delay
          setTimeout(() => navigate('/dashboard'), 1500);
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        {status === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#09090B] animate-spin" strokeWidth={1.5} />
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-heading font-semibold text-[#09090B] mb-2">
              Welcome back!
            </h1>
            <p className="text-sm text-[#71717A]">
              Redirecting you to your dashboard...
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-heading font-semibold text-[#09090B] mb-2">
              Authentication Failed
            </h1>
            <p className="text-sm text-[#71717A] mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/')}
              className={cn(
                'h-10 px-6 rounded-lg',
                'bg-[#09090B] text-white text-sm font-medium',
                'hover:bg-[#18181B] transition-colors'
              )}
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
