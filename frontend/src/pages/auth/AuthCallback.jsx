// Auth Callback Page
// ==================
// Handles the redirect from Supabase magic link authentication.
// Creates user profile on first login and redirects to dashboard.

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('Verifying your login...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          setStatus('success');
          setMessage('Development mode - redirecting...');
          setTimeout(() => navigate('/dashboard'), 1500);
          return;
        }

        // Get the session from URL hash (Supabase adds tokens there)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(error.message || 'Authentication failed');
          return;
        }

        if (!session) {
          // Try to exchange code for session (PKCE flow)
          const code = searchParams.get('code');
          if (code) {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              throw exchangeError;
            }
            if (!data.session) {
              throw new Error('No session returned');
            }
          } else {
            setStatus('error');
            setMessage('No authentication code found');
            return;
          }
        }

        // Get the current session after exchange
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          setStatus('success');
          setMessage('Login successful! Creating your profile...');

          // Call backend to create/update profile
          try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentSession.access_token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.status === 404) {
              // Profile doesn't exist, create it
              const createResponse = await fetch(`${API_URL}/api/user/profile`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${currentSession.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: currentSession.user.email,
                  full_name: currentSession.user.user_metadata?.full_name || '',
                }),
              });

              if (!createResponse.ok) {
                console.warn('Failed to create profile, continuing anyway');
              }
            }
          } catch (profileError) {
            console.warn('Profile fetch/create error (non-blocking):', profileError);
          }

          setMessage('Welcome! Redirecting to dashboard...');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Session not established');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during authentication');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user && status === 'processing') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'processing' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-[#09090B] mx-auto" strokeWidth={1.5} />
            </motion.div>
          )}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" strokeWidth={1.5} />
            </motion.div>
          )}
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <XCircle className="w-12 h-12 text-red-500 mx-auto" strokeWidth={1.5} />
            </motion.div>
          )}
        </div>

        {/* Message */}
        <h1 className="text-xl font-semibold text-[#09090B] mb-2">
          {status === 'processing' && 'Signing you in...'}
          {status === 'success' && 'Welcome!'}
          {status === 'error' && 'Oops!'}
        </h1>
        <p className="text-[#71717A]">{message}</p>

        {/* Error action */}
        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 rounded-full bg-[#09090B] text-white text-sm font-medium hover:bg-[#18181B] transition-colors"
          >
            Back to Home
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
