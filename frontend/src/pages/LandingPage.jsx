// Landing Page - Figma-inspired layout (with 100Cr Engine branding)
// Structure: Hero → Scroll Story → Inline CTA → Quiz → Social Proof → Teaser → FAQ → Waitlist → CTA

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSectionNew';
import { ScrollStorySection } from '@/components/landing/ScrollStorySection';
import { LogoCarousel } from '@/components/landing/LogoCarousel';
import { InlineCTA, CTASection } from '@/components/landing/CTASectionNew';
import { FounderDNAQuiz } from '@/components/landing/FounderDNAQuiz';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { TeaserLockedSection } from '@/components/landing/TeaserLockedSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { WaitlistSection } from '@/components/landing/WaitlistSection';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* Navigation */}
      <Navbar />
      <AnnouncementBar />
      
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

        {/* Beta Waitlist - below the hero */}
        <WaitlistSection />

        {/* Final CTA */}
        <CTASection />
      </main>
      
      <Footer />
      
      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
};

export default LandingPage;
