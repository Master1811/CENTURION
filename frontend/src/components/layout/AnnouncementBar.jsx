// AnnouncementBar - dismissible bar below navbar
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';

export const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('announcement_dismissed_v1');
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('announcement_dismissed_v1', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'fixed top-[72px] left-0 right-0 z-40',
        'h-10 flex items-center justify-center',
        'bg-[#09090B] text-white',
        'shadow-[0_2px_8px_rgba(0,0,0,0.15)]'
      )}
      data-testid="announcement-bar"
    >
      <Link
        to="/pricing"
        className="flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
      >
        {/* Sparkle icon */}
        <Sparkles className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
        
        <span className="text-white/90">Limited offer: Get Founder Plan at</span>
        
        <span className="font-bold text-white">₹899/year</span>
        
        <span className="text-white/70">→</span>
        
        <span className="font-medium text-amber-400 flex items-center gap-1">
          Claim Now
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
        </span>
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
  );
};

export default AnnouncementBar;
