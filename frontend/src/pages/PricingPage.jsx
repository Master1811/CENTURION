// Pricing Page
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { HelpWidget } from '@/components/help/HelpWidget';

export const PricingPage = () => {
  return (
    <div
      className="min-h-screen bg-white centurion-tool-typography"
      data-testid="pricing-page"
    >
      <Navbar />
      <main className="pt-24">
        <PricingSection />
      </main>
      <Footer />
      
      {/* Help Widget */}
      <HelpWidget />
    </div>
  );
};

export default PricingPage;
