// Pricing Page
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';

export const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      <Navbar />
      <main className="pt-24">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
