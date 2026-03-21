// Dashboard Layout - wraps all dashboard pages
import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { HelpWidget } from '@/components/help/HelpWidget';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Users,
  FileText,
  Sparkles,
  Target,
  Briefcase,
  Plug,
  Menu,
} from 'lucide-react';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
  { icon: TrendingUp, label: 'Revenue', href: '/dashboard/revenue' },
  { icon: LineChart, label: 'Forecast', href: '/dashboard/forecasting' },
  { icon: Sparkles, label: 'Coach', href: '/dashboard/coach' },
  { icon: Plug, label: 'Connect', href: '/dashboard/connectors' },
];

export const DashboardLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-white border-b border-[rgba(0,0,0,0.06)]">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-heading font-bold text-[#09090B]">100Cr</span>
            <span className="font-heading text-[#71717A]">Engine</span>
          </Link>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 flex items-center justify-around bg-white border-t border-[rgba(0,0,0,0.06)]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2',
                isActive ? 'text-[#09090B]' : 'text-[#A1A1AA]'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Help Widget */}
      <HelpWidget variant="dashboard" />
    </div>
  );
};

export default DashboardLayout;
