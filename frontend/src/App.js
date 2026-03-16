import "@/index.css";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LandingPage from "@/pages/LandingPage";
import HundredCrCalculator from "@/pages/tools/HundredCrCalculator";
import PricingPage from "@/pages/PricingPage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/tools/100cr-calculator" element={<HundredCrCalculator />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          {/* Tools redirect */}
          <Route path="/tools" element={<Navigate to="/tools/100cr-calculator" replace />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
