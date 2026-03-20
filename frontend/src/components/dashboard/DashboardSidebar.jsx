// Dashboard Sidebar component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { copy } from '@/lib/copy';
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
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Command Centre', href: '/dashboard' },
  { icon: TrendingUp, label: 'Revenue Intelligence', href: '/dashboard/revenue' },
  { icon: LineChart, label: 'Forecasting Engine', href: '/dashboard/forecasting' },
  { icon: Users, label: 'Benchmark Intelligence', href: '/dashboard/benchmarks' },
  { icon: FileText, label: 'Reporting Engine', href: '/dashboard/reports' },
  { icon: Sparkles, label: 'AI Growth Coach', href: '/dashboard/coach' },
  { icon: Target, label: 'Goal Architecture', href: '/dashboard/goals' },
  { icon: Briefcase, label: 'Investor Relations', href: '/dashboard/investors' },
  { icon: Plug, label: 'API Connectors', href: '/dashboard/connectors' },
];

export const DashboardSidebar = () => {
  const location = useLocation();

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
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/dashboard');
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium',
                  'transition-all duration-200 ease-[var(--ease-luxury)]',
                  isActive
                    ? 'bg-[#09090B] text-white shadow-md'
                    : 'text-[#52525B] hover:bg-[rgba(0,0,0,0.03)] hover:text-[#09090B] hover:translate-x-1'
                )}
                data-testid={`sidebar-${item.href.split('/').pop()}`}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    !isActive && 'group-hover:scale-110'
                  )}
                  strokeWidth={1.5}
                />
                {item.label}
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
          onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.href = '/';
          }}
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
