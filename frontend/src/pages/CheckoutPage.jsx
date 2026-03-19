// Checkout Page — Founder Plan with Razorpay
// Protected: auth required, redirects to /dashboard if already paid

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const PLAN_FEATURES = [
  'Everything in Free',
  'Monthly check-ins with Razorpay sync',
  'AI Growth Coach — board-level questions',
  'Say/Do ratio tracking',
  'Burn multiple benchmarking',
  'Investor report export',
];

function CheckmarkIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, getAccessToken, hasPaidSubscription, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already subscribed, go to dashboard (after auth state is ready)
  useEffect(() => {
    if (!authLoading && hasPaidSubscription()) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, hasPaidSubscription, navigate]);

  const handleRazorpay = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${baseUrl}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: 'founder' }),
      });
      if (!res.ok) {
        throw new Error('Failed to create order');
      }
      const data = await res.json();
      const { orderId, amount, currency, keyId } = data;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const options = {
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: 'Centurion',
        description: 'Founder Plan — Annual',
        prefill: { email: user?.email || '' },
        notes: { user_id: user?.id || '', plan: 'founder' },
        theme: { color: '#B8962E' },
        handler: async function () {
          setLoading(true);
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          let attempts = 0;
          const maxAttempts = 10;
          const intervalId = setInterval(async () => {
            attempts += 1;
            try {
              const profileRes = await fetch(`${backendUrl}/api/user/profile`, {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
              });
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.subscription?.plan === 'founder') {
                  clearInterval(intervalId);
                  await refreshProfile();
                  navigate('/dashboard?upgraded=true', { replace: true });
                }
              }
            } catch {
              // ignore
            }
            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              navigate('/dashboard?upgraded=pending', { replace: true });
            }
          }, 2000);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setLoading(false));
      rzp.on('modal.close', () => setLoading(false));
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // If already paid or still loading auth, render nothing while redirect runs / loading
  if (authLoading || hasPaidSubscription()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-10 shadow-sm">
        <p className="text-xs font-medium text-[#B8962E] uppercase tracking-widest mb-2">
          FOUNDER PLAN
        </p>
        <div className="flex items-baseline">
          <span className="font-mono text-4xl font-medium text-[#09090B]">₹14,999</span>
          <span className="text-sm text-zinc-400 ml-2">/year</span>
        </div>
        <div className="border-t border-zinc-100 my-6" />
        <ul className="space-y-3 mb-8">
          {PLAN_FEATURES.map((feature) => (
            <li key={feature} className="flex gap-3 items-center">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckmarkIcon />
              </span>
              <span className="text-sm text-zinc-600">{feature}</span>
            </li>
          ))}
        </ul>
        {error && (
          <p className="text-sm text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleRazorpay}
          disabled={loading}
          className="w-full h-11 bg-[#09090B] text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Pay with Razorpay →'}
        </button>
        <p className="text-xs text-zinc-400 text-center">
          Secure payment · Cancel anytime · Receipt sent to {user?.email || 'your email'}
        </p>
      </div>
    </div>
  );
}

export default CheckoutPage;
