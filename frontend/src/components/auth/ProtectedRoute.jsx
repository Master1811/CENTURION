// Protected Route Component
// ==========================
// Wraps routes that require authentication.
// Implements multi-tier access model:
//   - Beta users: time-limited dashboard access
//   - Paid users: full dashboard access
//   - Admin users: admin panel access (hidden from non-admins)
// Standard free users are redirected to pricing.

import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Admin email list - MUST match backend ADMIN_EMAILS environment variable
// In production, consider fetching this from a secure API endpoint
const getAdminEmails = () => {
  const envEmails = process.env.REACT_APP_ADMIN_EMAILS || '';
  return envEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
};

/**
 * ProtectedRoute Component
 *
 * Guards routes that require authentication and optionally dashboard/admin access.
 * Shows loading state while checking auth status.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if access granted
 * @param {boolean} props.requireDashboardAccess - If true, requires beta OR paid (founder) subscription
 * @param {boolean} props.requireAdmin - If true, requires admin role (silently redirects non-admins)
 */
export const ProtectedRoute = ({ 
  children, 
  requireDashboardAccess = false,
  requireAdmin = false 
}) => {
  const location = useLocation();
  const {
    isAuthenticated,
    loading,
    user,
    canAccessDashboard,
    profile,
  } = useAuth();

  // Check if user is admin (memoized for performance)
  const isAdmin = useMemo(() => {
    if (!requireAdmin) return true; // Not required, skip check
    if (!user?.email) return false;
    
    const adminEmails = getAdminEmails();
    return adminEmails.includes(user.email.toLowerCase());
  }, [requireAdmin, user?.email]);

  // Wait for auth to initialize
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B]">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#B8962E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Verifying access...</p>
        </div>
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

  // Admin access check - SILENTLY redirect non-admins to home
  // This prevents discovery of admin routes
  if (requireAdmin && !isAdmin) {
    // Log attempt for security monitoring (client-side)
    console.warn('[Security] Non-admin user attempted to access protected admin route');
    
    // Redirect to home without revealing admin exists
    return <Navigate to="/" replace />;
  }

  // Dashboard access check (beta OR paid founder)
  if (requireDashboardAccess && !canAccessDashboard) {
    // Beta expired specifically
    if (
      profile?.beta_status === 'active' &&
      profile?.beta_expires_at &&
      new Date(profile.beta_expires_at) <= new Date()
    ) {
      return (
        <Navigate
          to="/checkout?plan=founder"
          state={{ reason: 'beta_expired' }}
          replace
        />
      );
    }

    // No subscription — redirect to pricing
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
