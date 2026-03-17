import "@/index.css";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Provider
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import LandingPage from "@/pages/LandingPage";
import HundredCrCalculator from "@/pages/tools/HundredCrCalculator";
import ARRCalculator from "@/pages/tools/ARRCalculator";
import RunwayCalculator from "@/pages/tools/RunwayCalculator";
import GrowthCalculator from "@/pages/tools/GrowthCalculator";
import PricingPage from "@/pages/PricingPage";
import AuthCallback from "@/pages/AuthCallback";

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
} from "@/pages/preview/PreviewPages";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Free Tools */}
            <Route path="/tools" element={<Navigate to="/tools/100cr-calculator" replace />} />
            <Route path="/tools/100cr-calculator" element={<HundredCrCalculator />} />
            <Route path="/tools/arr-calculator" element={<ARRCalculator />} />
            <Route path="/tools/runway-calculator" element={<RunwayCalculator />} />
            <Route path="/tools/growth-calculator" element={<GrowthCalculator />} />
            
            {/* Preview routes (for screenshots - no auth) */}
            <Route path="/preview/command-centre" element={<PreviewCommandCentre />} />
            <Route path="/preview/revenue" element={<PreviewRevenue />} />
            <Route path="/preview/forecasting" element={<PreviewForecasting />} />
            <Route path="/preview/coach" element={<PreviewCoach />} />
            <Route path="/preview/reports" element={<PreviewReports />} />
            <Route path="/preview/benchmarks" element={<PreviewBenchmarks />} />
            <Route path="/preview/connectors" element={<PreviewConnectors />} />
            
            {/* Dashboard (Protected - Requires Authentication) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
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
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
