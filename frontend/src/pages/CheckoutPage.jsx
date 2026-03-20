// Checkout Page — Dynamic plan support with Razorpay
// Protected: auth required, redirects to /dashboard if already paid

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Check, Zap, Crown, Clock } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// PLAN CONFIG — SOURCE OF TRUTH
// ═══════════════════════════════════════════════════════════════════════════
const PLAN_CONFIG = {
  starter: {
    key: 'starter',
    label: 'STARTER PLAN',
    price: '₹499',
    period: '/month',
    effectiveLine: null,
    badge: '50% OFF — Launch offer',
    badgeColor: 'amber',
    icon: Zap,
    features: [
      'Everything in Free',
      'Dashboard access',
      'AI Growth Coach',
      'Daily pulse & weekly question',
      '2 board reports/month',
      'Monthly check-ins + Razorpay sync',
    ],
    cta: 'Pay ₹499 with Razorpay →',
    razorpayPlan: 'starter',
    razorpayDescription: 'Centurion Starter Plan — Monthly',
  },
  founder: {
    key: 'founder',
    label: 'FOUNDER PLAN',
    price: '₹3,999',
    period: '/year',
    effectiveLine: '₹333/month · Best value',
    badge: 'Best deal · Save 44%',
    badgeColor: 'gold',
    icon: Crown,
    features: [
      'Everything in Starter',
      '5 board reports/month',
      'Strategy briefs',
      'Investor memo export',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Pay ₹3,999 with Razorpay →',
    razorpayPlan: 'founder',
    razorpayDescription: 'Centurion Founder Plan — Annual',
  },
  trial: {
    key: 'trial',
    label: '7-DAY TRIAL',
    price: '₹99',
    period: 'for 7 days',
    effectiveLine: 'Then ₹499/month · Cancel anytime',
    badge: '7-day trial',
    badgeColor: 'cyan',
    icon: Clock,
    features: [
      'Full Starter plan access',
      'Dashboard + AI Growth Coach',
      'Daily pulse & board questions',
      'Monthly check-ins',
      'Cancel before 7 days — pay nothing more',
    ],
    cta: 'Start trial for ₹99 →',
    razorpayPlan: 'trial',
    razorpayDescription: 'Centurion 7-Day Trial',
  },
};

function CheckmarkIcon() {
  return (
    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, getAccessToken, hasPaidSubscription, refreshProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine plan from URL
  const planParam = searchParams.get('plan') || 'starter';
  const plan = PLAN_CONFIG[planParam] || PLAN_CONFIG.starter;

  // If already subscribed, go to dashboard
  useEffect(() => {
    if (!authLoading && hasPaidSubscription) {
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
        body: JSON.stringify({ plan: plan.razorpayPlan }),
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
        description: plan.razorpayDescription,
        prefill: { email: user?.email || '' },
        notes: { user_id: user?.id || '', plan: plan.razorpayPlan },
        theme: { color: plan.badgeColor === 'gold' ? '#B8962E' : '#6366F1' },
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
                if (['starter', 'founder'].includes(profileData.subscription?.plan)) {
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

  // Loading state
  if (authLoading || hasPaidSubscription) {
    return null;
  }

  const PlanIcon = plan.icon;
  const badgeColors = {
    amber: 'bg-amber-100 text-amber-800',
    gold: 'bg-[#B8962E] text-white',
    cyan: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-zinc-200 p-10 shadow-sm relative overflow-hidden">
          {/* Badge */}
          {plan.badge && (
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[plan.badgeColor]}`}>
                <PlanIcon className="w-3 h-3" strokeWidth={2} />
                {plan.badge}
              </span>
            </div>
          )}

          {/* Plan label */}
          <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${plan.badgeColor === 'gold' ? 'text-[#B8962E]' : plan.badgeColor === 'cyan' ? 'text-cyan-600' : 'text-amber-600'}`}>
            {plan.label}
          </p>

          {/* Price */}
          <div className="flex items-baseline">
            <span className="font-mono text-4xl font-medium text-[#09090B]">{plan.price}</span>
            <span className="text-sm text-zinc-400 ml-2">{plan.period}</span>
          </div>

          {/* Effective monthly */}
          {plan.effectiveLine && (
            <p className="text-sm text-zinc-500 mt-1">{plan.effectiveLine}</p>
          )}

          <div className="border-t border-zinc-100 my-6" />

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
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

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleRazorpay}
            disabled={loading}
            className={`w-full h-11 text-sm font-medium rounded-xl transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              plan.badgeColor === 'gold'
                ? 'bg-[#B8962E] text-[#09090B] hover:bg-[#D4A853]'
                : 'bg-[#09090B] text-white hover:bg-zinc-800'
            }`}
          >
            {loading ? 'Processing...' : plan.cta}
          </button>

          {/* Trial note */}
          {planParam === 'trial' && (
            <p className="text-xs text-zinc-400 text-center mb-3">
              After 7 days, ₹499/month is charged automatically.
              Cancel anytime in Settings before your trial ends.
            </p>
          )}

          <p className="text-xs text-zinc-400 text-center">
            Secure payment · Cancel anytime · Receipt sent to {user?.email || 'your email'}
          </p>
        </div>

        {/* Plan switcher */}
        <div className="flex flex-col items-center gap-2 mt-6">
          {planParam !== 'starter' && (
            <button
              onClick={() => navigate('/checkout?plan=starter')}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Switch to Starter (₹499/mo)
            </button>
          )}
          {planParam !== 'founder' && (
            <button
              onClick={() => navigate('/checkout?plan=founder')}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Switch to Founder (₹3,999/yr) — Save 44%
            </button>
          )}
          {planParam !== 'trial' && (
            <button
              onClick={() => navigate('/checkout?plan=trial')}
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Try 7-day trial for ₹99
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
