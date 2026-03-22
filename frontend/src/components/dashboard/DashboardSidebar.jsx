// Dashboard Sidebar component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
import { useAuth } from '@/context/AuthContext';
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
  Settings,
  LogOut,
  Crown,
  BarChart2,
  Activity,
  Clock,
  MessageSquare,
} from 'lucide-react';

const SAAS_NAV = [
  {
    label: 'Command Centre',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Revenue Intelligence',
    path: '/dashboard/revenue',
    icon: TrendingUp,
  },
  {
    label: 'Forecasting',
    path: '/dashboard/forecasting',
    icon: LineChart,
  },
  {
    label: 'Benchmarks',
    path: '/dashboard/benchmarks',
    icon: BarChart2,
  },
  {
    label: 'Reports',
    path: '/dashboard/reports',
    icon: FileText,
  },
  {
    label: 'AI Growth Coach',
    path: '/dashboard/coach',
    icon: Sparkles,
  },
  {
    label: 'Goals',
    path: '/dashboard/goals',
    icon: Target,
  },
  {
    label: 'Investors',
    path: '/dashboard/investors',
    icon: Users,
  },
  {
    label: 'Connectors',
    path: '/dashboard/connectors',
    icon: Plug,
  },
];

const AGENCY_NAV = [
  {
    label: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Cash Flow Radar',
    path: '/dashboard/cashflow',
    icon: Activity,
    badge: 'New',
  },
  {
    label: 'AR Aging',
    path: '/dashboard/ar-aging',
    icon: Clock,
  },
  {
    label: 'Collections',
    path: '/dashboard/collections',
    icon: MessageSquare,
  },
  {
    label: 'AI Business Coach',
    path: '/dashboard/coach',
    icon: Sparkles,
  },
  {
    label: 'Connectors',
    path: '/dashboard/connectors',
    icon: Plug,
  },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { isSaaS, isAgency, signOut } = useAuth();

  const navItems = isSaaS
    ? SAAS_NAV
    : isAgency
      ? AGENCY_NAV
      : SAAS_NAV;

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 w-64',
      'glass-sidebar',
      'flex flex-col',
      'hidden lg:flex'
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[rgba(0,0,0,0.04)]">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="font-heading font-bold text-[#09090B]">100Cr</span>
          <span className="font-heading text-[#71717A]">Engine</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/dashboard' && location.pathname === '/dashboard');

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium',
                  'transition-all duration-200 ease-[var(--ease-luxury)]',
                  isActive
                    ? 'bg-[#09090B] text-white shadow-md'
                    : 'text-[#52525B] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#09090B] hover:translate-x-1'
                )}
                data-testid={`sidebar-${item.path.split('/').pop()}`}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    !isActive && 'group-hover:scale-110'
                  )}
                  strokeWidth={1.5}
                />
                {item.label}
                {item.badge && (
                  <span className="ml-auto text-xs bg-[#09090B] text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[rgba(0,0,0,0.04)]">
        {/* Plan Badge */}
        <div className={cn(
          'flex items-center gap-2 px-3 py-2.5 mb-3',
          'bg-gradient-to-r from-amber-50/80 to-orange-50/80',
          'backdrop-blur-sm',
          'border border-amber-200/40 rounded-xl',
          'transition-all duration-300 ease-[var(--ease-luxury)]',
          'hover:shadow-sm hover:border-amber-300/50 hover:-translate-y-0.5'
        )}>
          <Crown className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
          <span className="text-sm font-medium text-amber-900">Founder Plan</span>
        </div>

        <Link
          to="/dashboard/settings"
          className="group flex items-center gap-3 px-3 py-2.5 text-sm text-[#52525B] hover:text-[#09090B] hover:bg-[rgba(0,0,0,0.03)] rounded-xl transition-all duration-200 ease-[var(--ease-luxury)] hover:translate-x-1"
        >
          <Settings className="w-4 h-4 transition-transform duration-200 group-hover:rotate-45" strokeWidth={1.5} />
          Settings
        </Link>

        <button
          onClick={signOut}
          className="group w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#52525B] hover:text-red-600 hover:bg-red-50/80 rounded-xl transition-all duration-200 ease-[var(--ease-luxury)]"
        >
          <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
