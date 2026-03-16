// AnnouncementBar - dismissible top bar
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';
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
        'relative h-9 flex items-center justify-center',
        'bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.04)] to-transparent',
        'border-b border-[rgba(0,0,0,0.05)]'
      )}
      data-testid="announcement-bar"
    >
      <Link
        to="/tools/100cr-calculator"
        className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#09090B] opacity-30" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#09090B]" />
        </span>
        
        <span>{copy.announcement.text}</span>
        
        <span className="flex items-center gap-1 font-medium text-[#09090B]">
          {copy.announcement.cta}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </span>
      </Link>

      <button
        onClick={handleDismiss}
        className="absolute right-4 p-1 text-[#A1A1AA] hover:text-[#52525B] transition-colors"
        aria-label="Dismiss announcement"
        data-testid="dismiss-announcement"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default AnnouncementBar;
