// Navbar component - floating pill with scroll effects
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      
      // Background effect
      setScrolled(currentScrollY > 60);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: copy.nav.calculator, href: '/tools/100cr-calculator' },
    { label: copy.nav.benchmarks, href: '/tools/100cr-calculator#benchmarks' },
    { label: copy.nav.pricing, href: '/pricing' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'min-w-[320px] md:min-w-[700px] max-w-[90vw]',
          'h-[52px] px-4 md:px-6',
          'flex items-center justify-between',
          'rounded-full border border-[rgba(0,0,0,0.06)]',
          'transition-all duration-200',
          scrolled
            ? 'bg-white/90 backdrop-blur-[20px] shadow-nav'
            : 'bg-transparent'
        )}
        data-testid="navbar"
      >
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-1 shrink-0"
          data-testid="navbar-logo"
        >
          <span className="font-heading font-semibold text-[#09090B]">100Cr</span>
          <span className="font-heading text-[#A1A1AA]">Engine</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
              data-testid={`nav-link-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <button
          onClick={() => navigate('/tools/100cr-calculator')}
          className={cn(
            'hidden md:flex items-center gap-2',
            'h-9 px-5 rounded-full',
            'bg-[#09090B] text-white text-sm font-medium',
            'shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_4px_16px_rgba(0,0,0,0.12)]',
            'hover:bg-[#18181B] hover:-translate-y-0.5',
            'transition-all duration-150'
          )}
          data-testid="navbar-cta"
        >
          {copy.nav.getStarted}
        </button>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
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
              'fixed top-[76px] left-4 right-4 z-40',
              'bg-white rounded-2xl border border-[rgba(0,0,0,0.06)]',
              'shadow-card p-4',
              'md:hidden'
            )}
            data-testid="mobile-menu"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm text-[#52525B] hover:bg-[#F4F4F5] rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/tools/100cr-calculator');
                }}
                className={cn(
                  'mt-2 w-full h-11 rounded-full',
                  'bg-[#09090B] text-white text-sm font-medium',
                  'hover:bg-[#18181B]',
                  'transition-colors'
                )}
              >
                {copy.nav.getStarted}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
