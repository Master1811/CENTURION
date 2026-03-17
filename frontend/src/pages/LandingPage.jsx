// Landing Page - High-conversion layout inspired by codemate.ai
// Structure: Hero → Scroll Story → Quiz → Social Proof → Teaser → Pricing → CTA

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSectionNew';
import { ScrollStorySection } from '@/components/landing/ScrollStorySection';
import { FounderDNAQuiz } from '@/components/landing/FounderDNAQuiz';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { TeaserLockedSection } from '@/components/landing/TeaserLockedSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection, InlineCTA } from '@/components/landing/CTASectionNew';
import { LogoCarousel } from '@/components/landing/LogoCarousel';

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
        
        {/* Founder DNA Quiz - Lead generation */}
        <FounderDNAQuiz />
        
        {/* Social Proof - Testimonials and metrics */}
        <SocialProofSection />
        
        {/* Teaser Locked Features - Premium preview */}
        <TeaserLockedSection />
        
        {/* Inline CTA #2 */}
        <InlineCTA />
        
        {/* Pricing */}
        <PricingSection />
        
        {/* Final CTA */}
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
