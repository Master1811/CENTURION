'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  BarChart2,
  FileText,
  Sparkles,
  Target,
  Users,
  Plug,
  Settings,
  LogOut,
  Activity,
  Clock,
  MessageSquare,
  Zap,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

const SAAS_NAV: NavItem[] = [
  { label: 'Command Centre', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Revenue Intelligence', path: '/dashboard/revenue', icon: TrendingUp },
  { label: 'Forecasting', path: '/dashboard/forecasting', icon: LineChart },
  { label: 'Benchmarks', path: '/dashboard/benchmarks', icon: BarChart2 },
  { label: 'Reports', path: '/dashboard/reports', icon: FileText },
  { label: 'AI Growth Coach', path: '/dashboard/coach', icon: Sparkles },
  { label: 'Goals', path: '/dashboard/goals', icon: Target },
  { label: 'Investors', path: '/dashboard/investors', icon: Users },
  { label: 'Connectors', path: '/dashboard/connectors', icon: Plug },
];

const AGENCY_NAV: NavItem[] = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cash Flow Radar', path: '/dashboard/cashflow', icon: Activity, badge: 'New' },
  { label: 'AR Aging', path: '/dashboard/ar-aging', icon: Clock },
  { label: 'Collections', path: '/dashboard/collections', icon: MessageSquare },
  { label: 'AI Business Coach', path: '/dashboard/coach', icon: Sparkles },
  { label: 'Connectors', path: '/dashboard/connectors', icon: Plug },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSaaS, isAgency, signOut, profile } = useAuth();

  const navItems = isSaaS ? SAAS_NAV : isAgency ? AGENCY_NAV : SAAS_NAV;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-lg font-bold text-white">
            100<span className="text-cyan-400">Cr</span>
          </span>
        </Link>
        <Link
          href="/"
          className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          title="Back to Home"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/5">
        <Link
          href="/dashboard/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            pathname === '/dashboard/settings'
              ? 'bg-cyan-500/10 text-cyan-400'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors mt-1"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>

        {/* User info */}
        {profile && (
          <div className="mt-3 px-3 py-3 rounded-lg bg-white/5">
            <p className="text-sm text-white font-medium truncate">
              {profile.company_name || profile.name || 'Your Company'}
            </p>
            <p className="text-xs text-white/50 truncate">{profile.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}


