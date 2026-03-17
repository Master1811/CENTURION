// Screenshot Preview Pages
// ========================
// These pages bypass auth for capturing marketing screenshots
// DO NOT use these routes in production

import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import CommandCentre from '@/pages/dashboard/CommandCentre';
import RevenueIntelligence from '@/pages/dashboard/RevenueIntelligence';
import ForecastingEngine from '@/pages/dashboard/ForecastingEngine';
import AIGrowthCoach from '@/pages/dashboard/AIGrowthCoach';
import ReportingEngine from '@/pages/dashboard/ReportingEngine';
import BenchmarkIntelligence from '@/pages/dashboard/BenchmarkIntelligence';
import Connectors from '@/pages/dashboard/Connectors';

const PreviewLayout = ({ children }) => (
  <div className="min-h-screen bg-[#FAFAFA]">
    <DashboardSidebar />
    <main className="lg:ml-64 min-h-screen">
      <div className="p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </main>
  </div>
);

export const PreviewCommandCentre = () => (
  <PreviewLayout><CommandCentre /></PreviewLayout>
);

export const PreviewRevenue = () => (
  <PreviewLayout><RevenueIntelligence /></PreviewLayout>
);

export const PreviewForecasting = () => (
  <PreviewLayout><ForecastingEngine /></PreviewLayout>
);

export const PreviewCoach = () => (
  <PreviewLayout><AIGrowthCoach /></PreviewLayout>
);

export const PreviewReports = () => (
  <PreviewLayout><ReportingEngine /></PreviewLayout>
);

export const PreviewBenchmarks = () => (
  <PreviewLayout><BenchmarkIntelligence /></PreviewLayout>
);

export const PreviewConnectors = () => (
  <PreviewLayout><Connectors /></PreviewLayout>
);
