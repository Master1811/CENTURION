import "@/index.css";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Auth Provider
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/layout/PageTransition";

// Pages
import LandingPage from "@/pages/LandingPage";
import HundredCrCalculator from "@/pages/tools/HundredCrCalculator";
import ARRCalculator from "@/pages/tools/ARRCalculator";
import RunwayCalculator from "@/pages/tools/RunwayCalculator";
import GrowthCalculator from "@/pages/tools/GrowthCalculator";
import PricingPage from "@/pages/PricingPage";
import AuthCallback from "@/pages/AuthCallback";
import CheckoutPage from "@/pages/CheckoutPage";
import PrivacyPage from "@/pages/PrivacyPage";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Dashboard Pages
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import CommandCentre from "@/pages/dashboard/CommandCentre";
import RevenueIntelligence from "@/pages/dashboard/RevenueIntelligence";
import ForecastingEngine from "@/pages/dashboard/ForecastingEngine";
import BenchmarkIntelligence from "@/pages/dashboard/BenchmarkIntelligence";
import ReportingEngine from "@/pages/dashboard/ReportingEngine";
import AIGrowthCoach from "@/pages/dashboard/AIGrowthCoach";
import GoalArchitecture from "@/pages/dashboard/GoalArchitecture";
import InvestorRelations from "@/pages/dashboard/InvestorRelations";
import Connectors from "@/pages/dashboard/Connectors";
import Settings from "@/pages/dashboard/Settings";

// Preview Pages (for screenshots - no auth)
import {
  PreviewCommandCentre,
  PreviewRevenue,
  PreviewForecasting,
  PreviewCoach,
  PreviewReports,
  PreviewBenchmarks,
  PreviewConnectors,
  PreviewSettings,
} from "@/pages/preview/PreviewPages";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/pricing" element={<PageTransition><PricingPage /></PageTransition>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/privacy" element={<PageTransition><PrivacyPage /></PageTransition>} />
        
        {/* Free Tools */}
        <Route path="/tools" element={<Navigate to="/tools/100cr-calculator" replace />} />
        <Route path="/tools/100cr-calculator" element={<PageTransition><HundredCrCalculator /></PageTransition>} />
        <Route path="/tools/arr-calculator" element={<PageTransition><ARRCalculator /></PageTransition>} />
        <Route path="/tools/runway-calculator" element={<PageTransition><RunwayCalculator /></PageTransition>} />
        <Route path="/tools/growth-calculator" element={<PageTransition><GrowthCalculator /></PageTransition>} />
        
        {/* Preview routes (for screenshots - no auth) */}
        <Route path="/preview/command-centre" element={<PreviewCommandCentre />} />
        <Route path="/preview/revenue" element={<PreviewRevenue />} />
        <Route path="/preview/forecasting" element={<PreviewForecasting />} />
        <Route path="/preview/coach" element={<PreviewCoach />} />
        <Route path="/preview/reports" element={<PreviewReports />} />
        <Route path="/preview/benchmarks" element={<PreviewBenchmarks />} />
        <Route path="/preview/connectors" element={<PreviewConnectors />} />
        <Route path="/preview/settings" element={<PreviewSettings />} />
        
        {/* Dashboard (Protected) */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireDashboardAccess={true}>
            <PageTransition><DashboardLayout /></PageTransition>
          </ProtectedRoute>
        }>
          <Route index element={<CommandCentre />} />
          <Route path="revenue" element={<RevenueIntelligence />} />
          <Route path="forecasting" element={<ForecastingEngine />} />
          <Route path="benchmarks" element={<BenchmarkIntelligence />} />
          <Route path="reports" element={<ReportingEngine />} />
          <Route path="coach" element={<AIGrowthCoach />} />
          <Route path="goals" element={<GoalArchitecture />} />
          <Route path="investors" element={<InvestorRelations />} />
          <Route path="connectors" element={<Connectors />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Checkout (Protected) */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <PageTransition><CheckoutPage /></PageTransition>
          </ProtectedRoute>
        } />
        
        {/* Admin Panel */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <PageTransition><AdminDashboard /></PageTransition>
          </ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
