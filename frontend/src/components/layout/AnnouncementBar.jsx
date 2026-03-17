// AnnouncementBar - dismissible bar below navbar with gradient
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('announcement_dismissed_v2');
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('announcement_dismissed_v2', 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed top-[72px] left-0 right-0 z-40',
            'overflow-hidden'
          )}
          data-testid="announcement-bar"
        >
          <div
            className={cn(
              'h-10 flex items-center justify-center',
              'bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600',
              'text-white',
              'shadow-[0_4px_12px_rgba(124,58,237,0.3)]'
            )}
          >
            <Link
              to="/pricing"
              className="flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
            >
              {/* Animated icon */}
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" strokeWidth={1.5} />
              </motion.div>
              
              <span className="text-white/90 hidden sm:inline">Limited offer:</span>
              <span className="text-white/90 sm:hidden">Get</span>
              
              <span className="font-bold text-white">Founder Plan at ₹899/year</span>
              
              <motion.span 
                className="font-medium text-amber-300 flex items-center gap-1"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Claim Now
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </motion.span>
            </Link>

            <button
              onClick={handleDismiss}
              className="absolute right-4 p-1 text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss announcement"
              data-testid="dismiss-announcement"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
