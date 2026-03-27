'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCreateRazorpayOrder } from '@/hooks/useApi';
import { CenturionCard, CenturionCardContent } from '@/components/ui/CenturionCard';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import Link from 'next/link';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PLAN = {
  name: 'Founder Plan',
  price: 3999,
  period: 'year',
  features: [
    'Full Dashboard Access',
    'AI Growth Coach (Claude)',
    'Benchmark Intelligence',
    'Board Report Generator',
    'Revenue Forecasting',
    'Goal Architecture',
    'Priority Support',
  ],
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const createOrder = useCreateRazorpayOrder();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system loading, please wait...');
      return;
    }

    setLoading(true);
    try {
      const order = await createOrder.mutateAsync('founder');

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Centurion 100Cr Engine',
        description: 'Founder Plan - Annual Subscription',
        order_id: order.orderId,
        handler: async (response: any) => {
          // Payment successful
          toast.success('Payment successful! Welcome to Centurion!');
          await refreshProfile();
          router.push('/dashboard');
        },
        prefill: {
          email: user?.email || '',
          name: profile?.name || '',
        },
        theme: {
          color: '#00BFFF',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-centurion-dark py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/pricing" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <CenturionCard className="p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Order Summary</h1>

            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-white">{PLAN.name}</span>
                <span className="text-cyan-400 font-bold">₹{PLAN.price}/{PLAN.period}</span>
              </div>
              <p className="text-sm text-white/50">Billed annually</p>
            </div>

            <div className="space-y-3 mb-6">
              {PLAN.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-white/60">Total</span>
                <span className="text-2xl font-bold text-white">₹{PLAN.price}</span>
              </div>
              <p className="text-xs text-white/40 mt-1">Inclusive of all taxes</p>
            </div>
          </CenturionCard>

          {/* Payment */}
          <CenturionCard className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Payment</h2>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <p className="text-sm text-white/60">
                Secure payment powered by Razorpay. Your card details are never stored on our servers.
              </p>
            </div>

            <Button
              onClick={handlePayment}
              loading={loading || createOrder.isPending}
              className="w-full h-14 text-lg"
              disabled={!razorpayLoaded}
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : `Pay ₹${PLAN.price}`}
            </Button>

            <p className="text-xs text-white/40 text-center mt-4">
              By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-6 text-white/40">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs">PCI Compliant</span>
                </div>
              </div>
            </div>
          </CenturionCard>
        </div>
      </div>
    </div>
  );
}


