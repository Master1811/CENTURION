// Navbar component - centered floating pill with glassmorphism
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Calculator, TrendingUp, Clock, Percent, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { storeAuthIntent } from '@/lib/auth/intent';

const toolsItems = [
  { 
    label: copy.tools.hundredCr.name, 
    description: copy.tools.hundredCr.description,
    href: '/tools/100cr-calculator',
    icon: Calculator 
  },
  { 
    label: copy.tools.arr.name, 
    description: copy.tools.arr.description,
    href: '/tools/arr-calculator',
    icon: TrendingUp 
  },
  { 
    label: copy.tools.runway.name, 
    description: copy.tools.runway.description,
    href: '/tools/runway-calculator',
    icon: Clock 
  },
  { 
    label: copy.tools.revenueGrowth.name, 
    description: copy.tools.revenueGrowth.description,
    href: '/tools/growth-calculator',
    icon: Percent 
  },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalHeadline, setAuthModalHeadline] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, signOut, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
        setToolsOpen(false);
      } else {
        setHidden(false);
      }
      
      setScrolled(currentScrollY > 60);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setToolsOpen(false);
      setUserMenuOpen(false);
    };
    if (toolsOpen || userMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [toolsOpen, userMenuOpen]);

  // Check for auth required redirect
  useEffect(() => {
    if (location.state?.authRequired && !isAuthenticated && !loading) {
      setAuthModalOpen(true);
    }
  }, [location.state, isAuthenticated, loading]);

  // Listen for centurion:open-auth (e.g. from ResultGate, Share button)
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.headline) {
        setAuthModalHeadline(e.detail.headline);
      }
      setAuthModalOpen(true);
    };
    window.addEventListener('centurion:open-auth', handler);
    return () => window.removeEventListener('centurion:open-auth', handler);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      storeAuthIntent({
        intent: 'signin',
        redirectTo: '/dashboard',
      });
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'w-auto max-w-[95vw]',
          'h-[56px] px-2',
          'flex items-center justify-center gap-1',
          'rounded-full',
          'border border-white/20',
          'transition-all duration-300',
          // Glassmorphism
          scrolled
            ? 'bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'bg-white/50 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
        )}
        data-testid="navbar"
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-1 px-4 shrink-0"
          data-testid="navbar-logo"
        >
          <span className="font-heading font-bold text-[#09090B]">100Cr</span>
          <span className="font-heading font-medium text-[#71717A]">Engine</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center">
          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToolsOpen(!toolsOpen);
              }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full',
                'text-sm font-medium',
                'transition-colors duration-150',
                toolsOpen || location.pathname.includes('/tools')
                  ? 'text-[#09090B] bg-black/5'
                  : 'text-[#52525B] hover:text-[#09090B] hover:bg-black/5'
              )}
              data-testid="tools-dropdown-trigger"
            >
              {copy.tools.dropdown}
              <ChevronDown 
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  toolsOpen && 'rotate-180'
                )} 
                strokeWidth={1.5} 
              />
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.22, 1, 0.36, 1] // --ease-luxury
                  }}
                  className={cn(
                    'absolute top-full left-0 mt-2',
                    'w-72 p-2',
                    'bg-white/90 backdrop-blur-xl',
                    'rounded-2xl border border-[rgba(0,0,0,0.08)]',
                    'shadow-[0_16px_48px_rgba(0,0,0,0.12)]'
                  )}
                  onClick={(e) => e.stopPropagation()}
                  data-testid="tools-dropdown-menu"
                >
                  {toolsItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.05,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setToolsOpen(false)}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl',
                            'transition-all duration-200 ease-[var(--ease-luxury)]',
                            'hover:bg-[rgba(0,0,0,0.04)] hover:translate-x-1',
                            location.pathname === item.href && 'bg-[rgba(0,0,0,0.06)]'
                          )}
                          data-testid={`tool-link-${item.href.split('/').pop()}`}
                        >
                          <div className="p-2 rounded-lg bg-[rgba(0,0,0,0.04)] transition-transform duration-200 group-hover:scale-110">
                            <Icon className="w-4 h-4 text-[#09090B]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#09090B]">{item.label}</p>
                            <p className="text-xs text-[#71717A] mt-0.5">{item.description}</p>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/tools/100cr-calculator#benchmarks"
            className="px-4 py-2 text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
          >
            {copy.nav.benchmarks}
          </Link>

          <Link
            to="/pricing"
            className="px-4 py-2 text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
          >
            {copy.nav.pricing}
          </Link>
        </div>

        {/* Desktop CTA / User Menu */}
        {isAuthenticated ? (
          <div className="hidden md:block relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
              }}
              className={cn(
                'flex items-center gap-2',
                'h-10 px-4 ml-2 rounded-full',
                'bg-[#F4F4F5] text-[#09090B] text-sm font-medium',
                'hover:bg-[#E4E4E7]',
                'transition-all duration-200'
              )}
              data-testid="user-menu-trigger"
            >
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span className="max-w-[120px] truncate">{user?.email?.split('@')[0] || 'Account'}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', userMenuOpen && 'rotate-180')} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute top-full right-0 mt-2',
                    'w-56 p-2',
                    'bg-white/90 backdrop-blur-xl',
                    'rounded-2xl border border-[rgba(0,0,0,0.08)]',
                    'shadow-[0_16px_48px_rgba(0,0,0,0.12)]'
                  )}
                  onClick={(e) => e.stopPropagation()}
                  data-testid="user-menu-dropdown"
                >
                  <div className="px-3 py-2 border-b border-[rgba(0,0,0,0.06)] mb-2">
                    <p className="text-sm font-medium text-[#09090B] truncate">{user?.email}</p>
                    <p className="text-xs text-[#71717A]">Founder Plan</p>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'text-sm text-[#52525B]',
                      'hover:bg-[rgba(0,0,0,0.04)] transition-colors'
                    )}
                    data-testid="user-menu-dashboard"
                  >
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'text-sm text-[#52525B]',
                      'hover:bg-[rgba(0,0,0,0.04)] transition-colors'
                    )}
                  >
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
                      'text-sm text-red-600',
                      'hover:bg-red-50 transition-colors'
                    )}
                    data-testid="user-menu-signout"
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
              'hidden md:flex items-center gap-2',
              'h-10 px-5 ml-2 rounded-full',
              'bg-[#09090B] text-white text-sm font-medium',
              'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
              'hover:bg-[#18181B] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
              'transition-all duration-200'
            )}
            data-testid="navbar-cta"
          >
            {copy.nav.ctaButton}
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-3"
          data-testid="mobile-menu-toggle"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed top-[80px] left-4 right-4 z-40',
              'bg-white/90 backdrop-blur-xl',
              'rounded-2xl border border-[rgba(0,0,0,0.08)]',
              'shadow-[0_16px_48px_rgba(0,0,0,0.12)]',
              'p-3',
              'md:hidden'
            )}
            data-testid="mobile-menu"
          >
            <p className="type-label text-[#A1A1AA] px-3 py-2">{copy.tools.dropdown}</p>
            <div className="space-y-1 mb-3">
              {toolsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[rgba(0,0,0,0.04)] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#52525B]" strokeWidth={1.5} />
                    <span className="text-sm text-[#52525B]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="border-t border-[rgba(0,0,0,0.06)] pt-3 space-y-1">
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 text-sm text-[#52525B] hover:bg-[rgba(0,0,0,0.04)] rounded-xl transition-colors"
              >
                {copy.nav.pricing}
              </Link>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (isAuthenticated) {
                  navigate('/dashboard');
                } else {
                  storeAuthIntent({
                    intent: 'signin',
                    redirectTo: '/dashboard',
                  });
                  setAuthModalOpen(true);
                }
              }}
              className={cn(
                'mt-3 w-full h-11 rounded-full',
                'bg-[#09090B] text-white text-sm font-medium',
                'hover:bg-[#18181B]',
                'transition-colors'
              )}
            >
              {isAuthenticated ? copy.nav.dashboard : copy.nav.ctaButton}
            </button>
            
            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className={cn(
                  'mt-2 w-full h-11 rounded-full',
                  'bg-transparent text-red-600 text-sm font-medium border border-red-200',
                  'hover:bg-red-50',
                  'transition-colors'
                )}
              >
                Sign Out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthModalHeadline(null);
        }}
        headline={authModalHeadline}
      />
    </>
  );
};

export default Navbar;
