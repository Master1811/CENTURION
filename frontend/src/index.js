// Initialize Sentry FIRST before any other imports
import { initSentry, Sentry } from '@/lib/sentry';
initSentry();

import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary 
      fallback={({ error, resetError }) => (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">We've been notified and are working on it.</p>
            <button 
              onClick={resetError}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      showDialog
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
