'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Navbar } from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { ScrollStorySection } from '@/components/landing/ScrollStorySection';
import { LogoCarousel, SocialProofSection } from '@/components/landing/SocialProofSection';
import { InlineCTA, CTASection, WaitlistSection } from '@/components/landing/WaitlistSection';
import { FounderDNAQuiz } from '@/components/landing/FounderDNAQuiz';
import { TeaserLockedSection } from '@/components/landing/TeaserLockedSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { HelpWidget } from '@/components/help/HelpWidget';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/context/AuthContext';

function LandingContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('login') === 'true' && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [searchParams, isAuthenticated]);

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Navigation */}
      <AnnouncementBar />
      <Navbar />

      <main>
        {/* Hero - Above the fold with animated chart */}
        <HeroSection />

        {/* Logo Carousel - Trust signals */}
        <LogoCarousel />

        {/* Scroll Story - 5 feature sections */}
        <ScrollStorySection />

        {/* Inline CTA #1 */}
        <InlineCTA variant="dark" />

        {/* Founder DNA Quiz - lead generation */}
        <FounderDNAQuiz />

        {/* Premium preview feature block */}
        <SocialProofSection />

        <TeaserLockedSection />

        {/* FAQ */}
        <FAQSection />

        {/* Inline CTA #2 */}
        <InlineCTA />

        {/* Beta Waitlist */}
        <WaitlistSection />

        {/* Final CTA */}
        <CTASection />
      </main>

      <Footer />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Help Widget */}
      <HelpWidget />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LandingContent />
    </Suspense>
  );
}
