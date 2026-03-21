// Authentication Context
// ======================
// Provides authentication state and methods throughout the app.
// Uses Supabase for magic link (passwordless) authentication.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { setUserContext, clearUserContext, addBreadcrumb } from '@/lib/sentry';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state to all children.
 * Handles:
 * - Session management
 * - Magic link authentication
 * - Token refresh
 * - Sign out
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [profile, setProfile] = useState(null);

  /**
   * Fetch user profile and subscription status from backend
   */
  const fetchUserData = useCallback(async (accessToken) => {
    if (!accessToken) return;

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setSubscription(data.subscription);
        
        // Set Sentry user context for error tracking
        if (data.user?.id) {
          setUserContext(data.user.id, data.user.email, {
            plan: data.subscription?.plan || 'free',
          });
          addBreadcrumb('User profile loaded', 'auth', 'info', {
            plan: data.subscription?.plan,
          });
        }
      } else if (response.status === 401) {
        // Token is invalid or expired - sign out user to force re-authentication
        console.warn('[Auth] 401 received from profile endpoint - signing out');
        addBreadcrumb('Profile fetch returned 401 - forcing sign out', 'auth', 'warning');
        
        // Clear local state
        setProfile(null);
        setSubscription(null);
        
        // Sign out from Supabase to clear invalid session
        if (isSupabaseConfigured()) {
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('[Auth] Error during sign out:', signOutError);
          }
        }
        setUser(null);
        setSession(null);
        clearUserContext();
      } else {
        // Other errors (5xx, etc.) - log but don't sign out
        console.error('[Auth] Profile fetch failed with status:', response.status);
        addBreadcrumb(`Profile fetch failed: ${response.status}`, 'auth', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      addBreadcrumb('Profile fetch network error', 'auth', 'error', { error: error.message });
    }
  }, []);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // If Supabase is not configured, use mock auth for development
      setLoading(false);
      return;
    }

    // Get current session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserData(session.access_token);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          await fetchUserData(session.access_token);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authSubscription?.unsubscribe();
    };
  }, [fetchUserData]);

  /**
   * Send magic link to email
   * 
   * @param {string} email - User's email address
   * @returns {Object} - { error?: Error }
   */
  const signInWithMagicLink = async (email) => {
    if (!isSupabaseConfigured()) {
      // Mock sign-in for development
      console.log('Mock magic link sent to:', email);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect back to the app after clicking magic link
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Create user if they don't exist
          shouldCreateUser: true,
        },
      });

      return { error };
    } catch (error) {
      console.error('Magic link error:', error);
      return { error };
    }
  };

  /**
   * Sign in with Google OAuth
   * 
   * @returns {Object} - { error?: Error }
   */
  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      console.log('Mock Google OAuth - Supabase not configured');
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { error };
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    // Clear Sentry user context
    clearUserContext();
    addBreadcrumb('User signed out', 'auth', 'info');
    
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  /**
   * Get the current access token for API calls
   * 
   * @returns {string|null} - Current access token or null
   */
  const getAccessToken = () => {
    return session?.access_token ?? null;
  };

  /**
   * Check if user has an active paid subscription
   * 
   * @returns {boolean}
   */
  const hasPaidSubscription = () => {
    const plan = subscription?.plan;
    const status = subscription?.status;
    const expiresAt = subscription?.expires_at;

    const isActivePaid = ['founder', 'studio', 'vc_portfolio'].includes(plan) && status === 'active' && expiresAt && new Date(expiresAt) > new Date();

    return Boolean(isActivePaid);
  };

  // Computed: Beta user check (active status AND not expired)
  const isBetaUser = Boolean(
    profile?.beta_status === 'active' &&
    profile?.beta_expires_at &&
    new Date(profile.beta_expires_at) > new Date()
  );

  // Computed: Can access dashboard (beta OR paid)
  const paidSubscription = hasPaidSubscription();
  const canAccessDashboard = isBetaUser || paidSubscription;

  /**
   * Check if user has completed onboarding
   * 
   * @returns {boolean}
   */
  const hasCompletedOnboarding = () => {
    return profile?.onboarding_completed ?? false;
  };

  /**
   * Refresh user profile and subscription data from backend
   */
  const refreshProfile = async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      await fetchUserData(accessToken);
    }
  };

  // Context value
  const value = {
    // State
    user,
    session,
    loading,
    profile,
    subscription,
    
    // Methods
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    getAccessToken,
    hasCompletedOnboarding,
    refreshProfile,

    // Computed - access control
    isAuthenticated: Boolean(user),
    isBetaUser,
    hasPaidSubscription: paidSubscription,
    canAccessDashboard,
    isPaid: paidSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Access authentication state and methods from any component.
 * Must be used within an AuthProvider.
 * 
 * @returns {Object} - Auth context value
 * 
 * @example
 * const { user, signOut, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
