// CheckoutPage — Founder Plan Checkout
// Single plan only. No switching. Plug-and-play Razorpay.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Check, Crown, Shield, RefreshCw } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PLAN CONFIG — SOURCE OF TRUTH
// Only one paid plan exists: founder
// ═══════════════════════════════════════════════════════════════════════════
const FOUNDER_PLAN = {
  key: 'founder',
  label: 'FOUNDER PLAN',
  price: '₹3,999',
  period: '/year',
  effectiveLine: '₹333/month · Cancel anytime',
  badge: 'Founding member price',
  urgency: 'Early founder pricing — will increase soon',
  features: [
    'Everything in Free',
    'Full dashboard access',
    'AI Growth Coach',
    'Habit engine',
    'Board reports',
    'Monthly check-ins',
    'Priority support',
    'Early access to new features',
  ],
  cta: 'Pay ₹3,999 — Become a Founder',
  razorpayPlan: 'founder',
  razorpayDescription: 'Centurion Founder Plan — Annual',
};

// Payments are enabled when the Razorpay key is present in env
const isPaymentsEnabled = Boolean(process.env.REACT_APP_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

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

  const plan = FOUNDER_PLAN;

  // Already subscribed → go to dashboard
  useEffect(() => {
    if (!authLoading && hasPaidSubscription) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, hasPaidSubscription, navigate]);

  const handlePayment = async () => {
    // Graceful fallback when payments are not configured
    if (!isPaymentsEnabled) {
      setError('Payments are being configured. Check back soon or contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated. Please sign in.');

      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const res = await fetch(`${baseUrl}/api/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: plan.razorpayPlan }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) {
          throw new Error('Payment gateway is being configured. Please try again later.');
        }
        throw new Error(data.detail || 'Failed to create order. Please try again.');
      }

      const { orderId, amount, currency, keyId } = await res.json();

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }

      const options = {
        key: keyId,
        order_id: orderId,
        amount,
        currency,
        name: 'Centurion — 100Cr Engine',
        description: plan.razorpayDescription,
        prefill: { email: user?.email || '' },
        notes: { user_id: user?.id || '', plan: plan.razorpayPlan },
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
                if (profileData.subscription?.plan === 'founder' && profileData.subscription?.status === 'active') {
                  clearInterval(intervalId);
                  await refreshProfile();
                  navigate('/dashboard?upgraded=true', { replace: true });
                }
              }
            } catch {
              // ignore transient fetch errors during polling
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
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading || hasPaidSubscription) return null;

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl border p-10 relative overflow-hidden"
          style={{
            background: '#09090B',
            border: '1px solid #B8962E55',
            boxShadow: '0 0 0 1px #B8962E18, 0 24px 60px rgba(0,0,0,0.7), 0 0 60px #B8962E10',
          }}
        >
          {/* Gold top sheen */}
          <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, #B8962E88, transparent)' }} />

          {/* Badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#B8962E] text-[#09090B]">
              <Crown className="w-3 h-3" strokeWidth={2} />
              {plan.badge}
            </span>
            <Crown className="w-5 h-5 text-[#B8962E]" strokeWidth={1.5} />
          </div>

          {/* Plan label */}
          <p className="text-xs font-medium uppercase tracking-widest text-[#B8962E] mb-2">
            {plan.label}
          </p>

          {/* Price */}
          <div className="flex items-baseline mb-1">
            <span className="font-mono text-4xl font-medium text-white">{plan.price}</span>
            <span className="text-sm text-zinc-500 ml-2">{plan.period}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-1">{plan.effectiveLine}</p>
          <p className="text-xs text-[#B8962E] font-medium mb-6">{plan.urgency}</p>

          <div className="border-t border-zinc-800 mb-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 items-center">
                <span className="w-4 h-4 rounded-full bg-emerald-900/60 flex items-center justify-center flex-shrink-0">
                  <CheckmarkIcon />
                </span>
                <span className="text-sm text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-sm text-red-400 mb-4 text-center" role="alert">
              {error}
            </p>
          )}

          {/* CTA */}
          {isPaymentsEnabled ? (
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-12 text-sm font-semibold rounded-xl transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed bg-[#B8962E] text-[#09090B] hover:bg-[#D4A853]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : plan.cta}
            </button>
          ) : (
            <div className="w-full h-12 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 text-sm font-medium mb-4">
              Payments coming soon — join the waitlist
            </div>
          )}

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-5 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Secure Razorpay payment
            </span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>No hidden charges</span>
          </div>

          {user?.email && (
            <p className="text-xs text-zinc-600 text-center mt-3">
              Receipt sent to {user.email}
            </p>
          )}
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/pricing')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to pricing
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
