// Protected Route Component
// ==========================
// Wraps routes that require authentication.
// Implements two-tier access model:
//   - Beta users: time-limited dashboard access
//   - Paid users: full dashboard access
// Standard free users are redirected to pricing.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require authentication and optionally dashboard access.
 * Shows loading state while checking auth status.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access granted
 * @param {boolean} props.requireDashboardAccess - If true, requires beta OR paid subscription
 */
export const ProtectedRoute = ({ children, requireDashboardAccess = false }) => {
  const location = useLocation();
  const {
    isAuthenticated,
    loading,
    isBetaUser,
    hasPaidSubscription,
    canAccessDashboard,
    profile,
  } = useAuth();

  // Wait for auth to initialise
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#B8962E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated at all → landing page
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        state={{ from: location, authRequired: true }}
        replace
      />
    );
  }

  // Dashboard access check (beta OR paid)
  if (requireDashboardAccess && !canAccessDashboard) {
    // Beta expired specifically
    if (
      profile?.beta_status === 'active' &&
      profile?.beta_expires_at &&
      new Date(profile.beta_expires_at) <= new Date()
    ) {
      return (
        <Navigate
          to="/checkout"
          state={{ reason: 'beta_expired' }}
          replace
        />
      );
    }
    // Never had access (standard user, no subscription)
    return (
      <Navigate
        to="/pricing"
        state={{ reason: 'subscription_required' }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
