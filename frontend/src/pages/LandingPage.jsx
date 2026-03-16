// Landing Page - assembles all sections
import React from 'react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { LogoCarousel } from '@/components/landing/LogoCarousel';
import { FeatureStorySection } from '@/components/landing/FeatureStorySection';
import { MetricsSection } from '@/components/landing/MetricsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen" data-testid="landing-page">
      <AnnouncementBar />
      <Navbar />
      <main>
        <HeroSection />
        <LogoCarousel />
        <FeatureStorySection />
        <MetricsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
