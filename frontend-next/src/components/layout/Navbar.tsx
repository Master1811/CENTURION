'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ChevronDown,
  Calculator, TrendingUp, Clock, Percent, FileText,
  LogOut, User, LayoutDashboard, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';

const toolsItems = [
  { label: '100Cr Calculator',          description: 'Calculate your path to ₹100 Crore',       href: '/tools/100cr-calculator',          icon: Calculator  },
  { label: 'ARR Calculator',            description: 'Track annual recurring revenue',            href: '/tools/arr-calculator',            icon: TrendingUp  },
  { label: 'Runway Calculator',         description: 'Forecast your cash runway',                href: '/tools/runway-calculator',         icon: Clock       },
  { label: 'Growth Calculator',         description: 'Model growth scenarios',                   href: '/tools/growth-calculator',         icon: Percent     },
  { label: 'Invoice Health Calculator', description: 'See your collections risk score instantly', href: '/tools/invoice-health-calculator', icon: FileText    },
];

const isDarkPage = (pathname: string) => {
  if (pathname === '/') return true;
  if (pathname.startsWith('/preview')) return true;
  return false;
};

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { isAuthenticated, canAccessDashboard, signOut, user, loading } = useAuth();

  const [scrolled,        setScrolled]        = useState(false);
  const [hidden,          setHidden]          = useState(false);
  const [lastScrollY,     setLastScrollY]     = useState(0);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [toolsOpen,       setToolsOpen]       = useState(false);
  const [userMenuOpen,    setUserMenuOpen]     = useState(false);
  const [authModalOpen,   setAuthModalOpen]    = useState(false);

  const toolsRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  const isDark = isDarkPage(pathname);
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // Scroll handling
  useEffect(() => {
    if (isDashboardPage) return;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY && y > 120) {
        setHidden(true);
        setToolsOpen(false);
        setUserMenuOpen(false);
      } else {
        setHidden(false);
      }
      setScrolled(y > 40);
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isDashboardPage]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (isDashboardPage) return;
    const handleClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isDashboardPage]);

  // Listen for centurion:open-auth event
  useEffect(() => {
    if (isDashboardPage) return;
    const handler = () => setAuthModalOpen(true);
    window.addEventListener('centurion:open-auth', handler);
    return () => window.removeEventListener('centurion:open-auth', handler);
  }, [isDashboardPage]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Don't show navbar on dashboard pages (they have their own sidebar)
  if (isDashboardPage) return null;

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleCTAClick = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-12 inset-x-0 mx-auto z-50',
          'flex items-center justify-between',
          'h-12 md:h-14 px-2 rounded-2xl',
          'transition-all duration-500 ease-out',
          'w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] max-w-[880px]',
          isDark && [
            'border',
            scrolled
              ? 'bg-[rgba(5,10,16,0.82)] backdrop-blur-2xl border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0px_0px_1px_rgba(0,191,255,0.05)]'
              : 'bg-[rgba(5,10,16,0.55)] backdrop-blur-xl border-[rgba(255,255,255,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.25)]',
          ],
          !isDark && [
            'border',
            scrolled
              ? 'bg-[rgba(255,255,255,0.88)] backdrop-blur-2xl border-[rgba(0,0,0,0.06)] shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]'
              : 'bg-[rgba(255,255,255,0.78)] backdrop-blur-xl border-[rgba(0,0,0,0.04)] shadow-[0_2px_16px_rgba(0,0,0,0.05)]',
          ],
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 pl-3 pr-2 shrink-0">
          <span className={cn(
            'font-bold text-[15px] tracking-tight transition-colors duration-200',
            isDark ? 'text-white' : 'text-[#09090B]',
          )}>
            100Cr
          </span>
          <span className={cn(
            'font-medium text-[15px] tracking-tight transition-colors duration-200',
            isDark ? 'text-white/50' : 'text-[#A1A1AA]',
          )}>
            Engine
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {/* Tools Dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-lg',
                'text-[13px] font-medium tracking-wide',
                'transition-all duration-200',
                isDark
                  ? toolsOpen || pathname.includes('/tools')
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                  : toolsOpen || pathname.includes('/tools')
                    ? 'text-[#09090B] bg-black/[0.05]'
                    : 'text-[#71717A] hover:text-[#09090B] hover:bg-black/[0.03]',
              )}
            >
              Free Tools
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform duration-200', toolsOpen && 'rotate-180')}
                strokeWidth={2}
              />
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'absolute top-full left-0 mt-2',
                    'w-64 p-1.5 rounded-xl',
                    isDark
                      ? 'bg-[rgba(8,16,24,0.96)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
                      : 'bg-white/[0.97] backdrop-blur-2xl border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
                  )}
                >
                  {toolsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setToolsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                          'transition-all duration-150',
                          isDark
                            ? isActive ? 'bg-white/10' : 'hover:bg-white/[0.06]'
                            : isActive ? 'bg-[#00BFFF]/[0.06]' : 'hover:bg-black/[0.03]',
                        )}
                      >
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          'transition-colors duration-150',
                          isDark ? 'bg-white/[0.06]' : 'bg-[#00BFFF]/[0.06]',
                        )}>
                          <Icon
                            className={cn('w-4 h-4', isDark ? 'text-white/70' : 'text-[#0099CC]')}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            'text-[13px] font-medium',
                            isDark ? 'text-white/90' : 'text-[#09090B]',
                          )}>{item.label}</p>
                          <p className={cn(
                            'text-[11px] mt-0.5 truncate',
                            isDark ? 'text-white/40' : 'text-[#A1A1AA]',
                          )}>{item.description}</p>
                        </div>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing */}
          <Link
            href="/pricing"
            className={cn(
              'px-3 py-1.5 rounded-lg',
              'text-[13px] font-medium tracking-wide',
              'transition-all duration-200',
              isDark
                ? pathname === '/pricing' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                : pathname === '/pricing' ? 'text-[#09090B] bg-black/[0.05]' : 'text-[#71717A] hover:text-[#09090B] hover:bg-black/[0.03]',
            )}
          >
            Pricing
          </Link>
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-1.5 pr-1.5">
          {loading ? (
            <div className="w-20 h-9 bg-white/5 rounded-xl animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  'flex items-center gap-2 h-9 px-3 rounded-xl',
                  'text-[13px] font-medium transition-all duration-200',
                  isDark
                    ? 'text-white/80 bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] hover:border-white/[0.12]'
                    : 'text-[#52525B] bg-black/[0.03] border border-black/[0.04] hover:bg-black/[0.06] hover:border-black/[0.08]',
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  isDark ? 'bg-white/10' : 'bg-[#00BFFF]/10',
                )}>
                  <User className="w-3 h-3" strokeWidth={2} />
                </div>
                <span className="max-w-[100px] truncate">
                  {user?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown
                  className={cn('w-3.5 h-3.5 transition-transform duration-200', userMenuOpen && 'rotate-180')}
                  strokeWidth={2}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'absolute top-full right-0 mt-2',
                      'w-52 p-1.5 rounded-xl',
                      isDark
                        ? 'bg-[rgba(8,16,24,0.96)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
                        : 'bg-white/[0.97] backdrop-blur-2xl border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
                    )}
                  >
                    {/* User info header */}
                    <div className={cn(
                      'px-3 py-2 mb-1 rounded-lg',
                      isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]',
                    )}>
                      <p className={cn(
                        'text-[13px] font-medium truncate',
                        isDark ? 'text-white/90' : 'text-[#09090B]',
                      )}>{user?.email}</p>
                      <p className={cn(
                        'text-[11px] mt-0.5',
                        isDark ? 'text-white/40' : 'text-[#A1A1AA]',
                      )}>Founder Plan</p>
                    </div>

                    {canAccessDashboard && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]',
                          isDark
                            ? 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                            : 'text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.03]',
                        )}
                      >
                        <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                        Dashboard
                      </Link>
                    )}

                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]',
                        isDark
                          ? 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                          : 'text-[#52525B] hover:text-[#09090B] hover:bg-black/[0.03]',
                      )}
                    >
                      <Settings className="w-4 h-4" strokeWidth={1.5} />
                      Settings
                    </Link>

                    <div className={cn('my-1 h-px', isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]')} />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-500/[0.06] transition-colors"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={handleCTAClick}
              className={cn(
                'h-9 px-5 rounded-xl',
                'text-[13px] font-semibold tracking-wide',
                'transition-all duration-200 border-none outline-none',
                isDark
                  ? 'bg-white text-[#09090B] hover:bg-white/90 shadow-[0_2px_8px_rgba(255,255,255,0.1)]'
                  : 'bg-[#09090B] text-white hover:bg-[#18181B] shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
              )}
            >
              Get Started
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            'md:hidden flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors',
            isDark ? 'text-white/80 hover:bg-white/[0.08]' : 'text-[#52525B] hover:bg-black/[0.04]',
          )}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen
            ? <X className="w-5 h-5" strokeWidth={1.5} />
            : <Menu className="w-5 h-5" strokeWidth={1.5} />
          }
        </button>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'fixed top-[108px] left-4 right-4 z-50',
                'p-2 rounded-2xl md:hidden',
                isDark
                  ? 'bg-[rgba(8,16,24,0.96)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
                  : 'bg-white/[0.97] backdrop-blur-2xl border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
              )}
            >
              <p className={cn(
                'px-3 pt-2 pb-1 text-[11px] font-semibold tracking-widest uppercase',
                isDark ? 'text-white/30' : 'text-[#A1A1AA]',
              )}>
                Free Tools
              </p>
              <div className="space-y-0.5 mb-2">
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                        isDark
                          ? isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.06]'
                          : isActive ? 'bg-[#00BFFF]/[0.06] text-[#09090B]' : 'text-[#71717A] hover:bg-black/[0.03]',
                      )}
                    >
                      <Icon
                        className={cn('w-4 h-4', isDark ? 'text-white/50' : 'text-[#A1A1AA]')}
                        strokeWidth={1.5}
                      />
                      <span className="text-[13px] font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className={cn('h-px mx-2', isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]')} />

              <div className="py-1.5 space-y-0.5">
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 text-[13px] font-medium rounded-xl transition-colors',
                    isDark ? 'text-white/60 hover:bg-white/[0.06]' : 'text-[#71717A] hover:bg-black/[0.03]',
                  )}
                >
                  Pricing
                </Link>
              </div>

              <div className={cn('h-px mx-2', isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]')} />

              <div className="p-2 pt-1.5 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCTAClick();
                  }}
                  className={cn(
                    'w-full h-10 rounded-xl',
                    'text-[13px] font-semibold tracking-wide transition-all duration-200',
                    isDark
                      ? 'bg-white text-[#09090B] hover:bg-white/90'
                      : 'bg-[#09090B] text-white hover:bg-[#18181B]',
                  )}
                >
                  {isAuthenticated ? 'Dashboard' : 'Get Started'}
                </button>

                {isAuthenticated && (
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="w-full h-10 rounded-xl text-[13px] font-medium text-red-500 bg-red-500/[0.06] hover:bg-red-500/[0.1] transition-colors"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}

export default Navbar;
