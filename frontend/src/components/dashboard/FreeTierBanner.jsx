// FreeTierBanner Component
// =========================
// Shows upgrade prompts for trial users, beta users (with countdown), and free users.
// Paid users see nothing.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function FreeTierBanner() {
  const navigate = useNavigate();
  const { isBetaUser, isTrialUser, trialDaysRemaining, hasPaidSubscription, profile } = useAuth();

  // Paid users (not trialing) see nothing
  if (hasPaidSubscription && !isTrialUser) return null;

  // Calculate days remaining for beta users
  const betaDaysRemaining = isBetaUser
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.beta_expires_at) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Trial user banner — shows trial countdown
  if (isTrialUser) {
    const isUrgent = trialDaysRemaining <= 2;
    return (
      <div
        className="flex items-center justify-between px-6 py-4 rounded-xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[#09090B]">
            You are on the 7-day trial
          </p>
          <p className={`text-sm mt-0.5 ${isUrgent ? 'text-red-600 font-medium' : 'text-zinc-500'}`}>
            {isUrgent ? '⚠ ' : ''}{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining · Upgrade before trial ends to keep access.
          </p>
        </div>
        <button
          onClick={() => navigate('/checkout?plan=founder')}
          className="flex-shrink-0 ml-6 h-9 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Upgrade now →
        </button>
      </div>
    );
  }

  if (isBetaUser) {
    // Beta user banner — shows expiry countdown
    return (
      <div
        className="flex items-center justify-between px-6 py-4 rounded-xl mb-6"
        style={{
          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[#09090B]">
            You are on the 60-Day Beta
          </p>
          <p className="text-sm text-zinc-500 mt-0.5">
            {betaDaysRemaining > 0
              ? `${betaDaysRemaining} days remaining. Upgrade before expiry to keep access.`
              : 'Your beta access has expired.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/checkout?plan=founder')}
          className="flex-shrink-0 ml-6 h-9 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          Upgrade now →
        </button>
      </div>
    );
  }

  // Standard free user banner — hard paywall
  return (
    <div
      className="flex items-center justify-between px-6 py-4 rounded-xl mb-6"
      style={{
        background: 'linear-gradient(135deg, #FDF8EE, #F5E6C8)',
        border: '1px solid rgba(184,150,46,0.25)',
      }}
    >
      <div>
        <p className="text-sm font-semibold text-[#09090B]">
          Upgrade to access the dashboard
        </p>
        <p className="text-sm text-zinc-500 mt-0.5">
          Unlock AI coaching, check-ins, and board-level insights.
        </p>
      </div>
      <button
        onClick={() => navigate('/checkout?plan=starter')}
        className="flex-shrink-0 ml-6 h-9 px-4 bg-[#B8962E] text-[#09090B] text-sm font-semibold rounded-lg hover:bg-[#D4A853] transition-colors whitespace-nowrap"
      >
        Start for ₹499/mo →
      </button>
    </div>
  );
}

export default FreeTierBanner;
