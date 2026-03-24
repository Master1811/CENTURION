'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 text-white overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium text-center">
            <span className="hidden sm:inline">🚀 </span>
            Beta access now open!{' '}
            <Link href="/?login=true" className="underline hover:no-underline">
              Join the waitlist
            </Link>{' '}
            and get 60 days free.
          </p>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

