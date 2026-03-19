import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storeAuthIntent } from '@/lib/auth/intent';

export function ResultGate({ onDismiss }) {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Check sessionStorage on mount
  const alreadyDismissed = sessionStorage.getItem(
    'centurion_gate_dismissed'
  ) === 'true';

  if (isAuthenticated || dismissed || alreadyDismissed) {
    return null;
  }

  const handleSave = () => {
    storeAuthIntent({
      intent: 'save-projection',
      redirectTo: '/dashboard',
    });
    // Fire custom event — Navbar listens for this
    window.dispatchEvent(
      new CustomEvent('centurion:open-auth', {
        detail: {
          headline: 'Save your projection',
          subtext: 'Free account. No credit card.',
        }
      })
    );
  };

  const handleDismiss = () => {
    sessionStorage.setItem(
      'centurion_gate_dismissed',
      'true'
    );
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl
                 border border-[rgba(0,0,0,0.06)]"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        background: 'rgba(255,255,255,0.78)',
      }}
    >
      <div className="text-center w-full max-w-md mx-auto px-6 py-6">
        <p className="text-xs font-medium uppercase
                      tracking-widest text-[#B8962E] mb-4">
          YOUR TRAJECTORY IS READY
        </p>
        <h3 className="font-heading text-lg font-bold
                       text-[#09090B] mb-2">
          Save this projection
        </h3>
        <p className="text-sm text-[#52525B] mb-6">
          Free account. Track your progress every month.
          No credit card.
        </p>
        <button
          onClick={handleSave}
          className="w-full h-11 bg-[#09090B] text-white
                     text-sm font-medium rounded-xl mb-3
                     hover:bg-zinc-800 transition-colors"
        >
          Save my projection →
        </button>
        <button
          onClick={handleDismiss}
          className="text-sm text-[#71717A]
                     hover:text-[#09090B] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
