'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile, Subscription } from '@/types';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface AuthContextValue {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;

  // Methods
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getAccessToken: () => string | null;
  refreshProfile: () => Promise<void>;

  // Computed - Access Control
  isAuthenticated: boolean;
  isBetaUser: boolean;
  hasPaidSubscription: boolean;
  canAccessDashboard: boolean;

  // Computed - Persona
  businessModel: 'saas' | 'agency' | null;
  isSaaS: boolean;
  isAgency: boolean;
  hasPersona: boolean;
  hasCompletedOnboarding: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ════════════════════════════════════════════════════════════════════════════

const AuthContext = createContext<AuthContextValue | null>(null);

// ════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ════════════════════════════════════════════════════════════════════════════

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Core auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch user data from backend ─────────────────────────────────────────
  const fetchUserData = useCallback(async (accessToken: string) => {
    if (!accessToken) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setSubscription(data.subscription);
      } else if (response.status === 401) {
        // Token invalid - sign out
        console.warn('Profile fetch returned 401 - signing out');
        await handleSignOut();
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  }, []);

  // ── Handle sign out ──────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    }

    // Clear all state
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('centurion_gate_dismissed');
    }

    router.push('/');
  }, [router]);

  // ── Initialize auth ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserData(session.access_token);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
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
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchUserData]);

  // ── Auth methods ─────────────────────────────────────────────────────────
  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const getAccessToken = useCallback(() => {
    return session?.access_token ?? null;
  }, [session]);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (token) {
      await fetchUserData(token);
    }
  }, [getAccessToken, fetchUserData]);

  // ── Computed values ──────────────────────────────────────────────────────
  const computedValues = useMemo(() => {
    // Persona
    const businessModel = profile?.business_model ?? null;
    const isSaaS = businessModel === 'saas';
    const isAgency = businessModel === 'agency';
    const hasPersona = businessModel !== null;
    const hasCompletedOnboarding = profile?.onboarding_completed ?? false;

    // Beta check
    const isBetaUser = Boolean(
      profile?.beta_status === 'active' &&
        profile?.beta_expires_at &&
        new Date(profile.beta_expires_at) > new Date()
    );

    // Subscription check
    const hasPaidSubscription = Boolean(
      ['founder', 'studio', 'vc_portfolio'].includes(subscription?.plan ?? '') &&
        subscription?.status === 'active' &&
        subscription?.expires_at &&
        new Date(subscription.expires_at) > new Date()
    );

    // Dashboard access
    const canAccessDashboard = isBetaUser || hasPaidSubscription;

    return {
      businessModel,
      isSaaS,
      isAgency,
      hasPersona,
      hasCompletedOnboarding,
      isBetaUser,
      hasPaidSubscription,
      canAccessDashboard,
    };
  }, [profile, subscription]);

  // ── Context value ────────────────────────────────────────────────────────
  const value: AuthContextValue = {
    // State
    user,
    session,
    profile,
    subscription,
    loading,

    // Methods
    signInWithMagicLink,
    signInWithGoogle,
    signOut: handleSignOut,
    getAccessToken,
    refreshProfile,

    // Computed
    isAuthenticated: Boolean(user),
    ...computedValues,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK
// ════════════════════════════════════════════════════════════════════════════

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;



