// AnnouncementBar - dismissible bar at top of page with gradient
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap } from 'lucide-react';
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
          className="fixed top-0 left-0 right-0 z-[55] overflow-hidden"
          data-testid="announcement-bar"
        >
          <div className={cn(
            'h-9 flex items-center justify-center relative',
            'bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600',
            'text-white',
          )}>
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm hover:opacity-90 transition-opacity"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="shrink-0"
              >
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 fill-amber-300" strokeWidth={1.5} />
              </motion.div>
              
              <span className="text-white/90 hidden sm:inline">Limited offer:</span>
              <span className="font-bold text-white whitespace-nowrap">Founder Plan at ₹899/year</span>
              
              <motion.span 
                className="font-medium text-amber-300 flex items-center gap-0.5 whitespace-nowrap"
                animate={{ x: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Claim Now
                <ArrowRight className="w-3 h-3" strokeWidth={2} />
              </motion.span>
            </Link>

            <button
              onClick={handleDismiss}
              className="absolute right-2 sm:right-4 p-1 text-white/50 hover:text-white transition-colors"
              aria-label="Dismiss announcement"
              data-testid="dismiss-announcement"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
