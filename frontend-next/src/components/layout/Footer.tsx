'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: '100Cr Calculator', href: '/tools/100cr-calculator' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-lg font-bold text-white">100Cr Engine</span>
            </Link>
            <p className="text-white/50 text-sm max-w-xs">
              Revenue milestone prediction for Indian SaaS founders.
            </p>
          </div>
          <div className="flex gap-12">
            {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold text-white mb-3">{cat}</h3>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-white/50 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-white/40">
          © {new Date().getFullYear()} 100Cr Engine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

