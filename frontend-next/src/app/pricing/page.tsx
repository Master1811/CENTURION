import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { CenturionCard } from '@/components/ui/CenturionCard';

const PLANS = [
  {
    name: 'Free Tools',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for exploring our calculators',
    features: [
      { name: '100Cr Calculator', included: true },
      { name: 'ARR Calculator', included: true },
      { name: 'Runway Calculator', included: true },
      { name: 'Growth Calculator', included: true },
      { name: 'Invoice Health Calculator', included: true },
      { name: 'Dashboard Access', included: false },
      { name: 'AI Growth Coach', included: false },
      { name: 'Benchmark Intelligence', included: false },
    ],
    cta: 'Start Free',
    href: '/tools/100cr-calculator',
    highlighted: false,
  },
  {
    name: 'Founder',
    price: '₹3,999',
    period: '/year',
    description: 'Everything you need to scale',
    features: [
      { name: 'All Free Tools', included: true },
      { name: 'Full Dashboard Access', included: true },
      { name: 'AI Growth Coach (Claude)', included: true },
      { name: 'Benchmark Intelligence', included: true },
      { name: 'Board Report Generator', included: true },
      { name: 'Revenue Forecasting', included: true },
      { name: 'Goal Architecture', included: true },
      { name: 'Priority Support', included: true },
    ],
    cta: 'Get Started',
    href: '/?login=true',
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-centurion-dark">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-white/60 max-w-xl mx-auto">
              Start free with our calculators. Upgrade when you're ready to unlock the full power of 100Cr Engine.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <CenturionCard
                key={plan.name}
                className={`p-8 ${plan.highlighted ? 'ring-2 ring-cyan-500' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="px-4 py-1 bg-cyan-500 text-slate-900 text-sm font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/50">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-white/20 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-white/80' : 'text-white/40'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CenturionCard>
            ))}
          </div>

          {/* FAQ or additional info */}
          <div className="mt-20 text-center">
            <p className="text-white/60">
              Have questions? Email us at{' '}
              <a href="mailto:support@100crengine.in" className="text-cyan-400 hover:underline">
                support@100crengine.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

