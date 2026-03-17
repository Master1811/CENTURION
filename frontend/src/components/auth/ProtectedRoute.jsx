// Protected Route Component
// ==========================
// Wraps routes that require authentication.
// Redirects unauthenticated users to the landing page.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require authentication.
 * Shows loading state while checking auth status.
 * Redirects to home page if not authenticated.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {boolean} props.requirePaid - If true, requires active subscription
 */
export const ProtectedRoute = ({ children, requirePaid = false }) => {
  const { isAuthenticated, loading, hasPaidSubscription } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#09090B] animate-spin" strokeWidth={1.5} />
          <p className="text-sm text-[#71717A]">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirect after login
    return <Navigate to="/" state={{ from: location, authRequired: true }} replace />;
  }

  // Check subscription if required
  if (requirePaid && !hasPaidSubscription()) {
    return <Navigate to="/pricing" state={{ upgradeRequired: true }} replace />;
  }

  return children;
};

export default ProtectedRoute;
