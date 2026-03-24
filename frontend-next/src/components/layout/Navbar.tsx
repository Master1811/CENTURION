'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Calculator,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const FREE_TOOLS = [
  { label: '100Cr Calculator', href: '/tools/100cr-calculator', description: 'Calculate your path to ₹100Cr' },
  { label: 'ARR Calculator', href: '/tools/arr-calculator', description: 'Track annual recurring revenue' },
  { label: 'Runway Calculator', href: '/tools/runway-calculator', description: 'Forecast your runway' },
  { label: 'Growth Calculator', href: '/tools/growth-calculator', description: 'Model growth scenarios' },
  { label: 'Invoice Health', href: '/tools/invoice-health-calculator', description: 'Assess AR health' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, canAccessDashboard, signOut, user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Don't show navbar on dashboard pages (they have their own sidebar)
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-white">
              100<span className="text-cyan-400">Cr</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Free Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-sm text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Calculator className="w-4 h-4" />
                <span>Free Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                  >
                    <div className="p-2">
                      {FREE_TOOLS.map((tool) => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="flex flex-col px-4 py-3 rounded-lg text-sm hover:bg-white/5 transition-colors group"
                        >
                          <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                            {tool.label}
                          </span>
                          <span className="text-white/50 text-xs mt-0.5">
                            {tool.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/pricing"
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                pathname === '/pricing'
                  ? 'text-cyan-400 bg-cyan-400/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Pricing
            </Link>

            {/* Auth buttons */}
            <div className="flex items-center space-x-3 ml-4">
              {loading ? (
                <div className="w-24 h-10 bg-white/5 rounded-lg animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  {canAccessDashboard && (
                    <Link href="/dashboard">
                      <Button variant="secondary" size="sm">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/?login=true">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-2">
              <p className="text-xs text-white/40 uppercase tracking-wider px-3 mb-2">Free Tools</p>
              {FREE_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="block px-3 py-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {tool.label}
                </Link>
              ))}

              <div className="border-t border-white/10 my-3" />

              <Link
                href="/pricing"
                className="block px-3 py-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <div className="border-t border-white/10 my-3" />

              {isAuthenticated ? (
                <>
                  {canAccessDashboard && (
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-cyan-400 rounded-lg hover:bg-cyan-400/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-white/70 hover:text-white rounded-lg hover:bg-white/5"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/?login=true"
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="primary" className="w-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

