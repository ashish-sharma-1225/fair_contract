import { NavLink, useLocation } from 'react-router-dom';

import {
  LayoutDashboard,
  FileSearch,
  FileText,
  ShieldCheck,
  Scale,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { mockUserProfile } from '../../mocks/demo-data';

export interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Analyze Contract',
    path: '/contracts/new',
    icon: FileSearch,
    badge: 'New',
  },
  {
    name: 'Contracts',
    path: '/contracts',
    icon: FileText,
  },
  {
    name: 'Policies',
    path: '/policies',
    icon: ShieldCheck,
  },
  {
    name: 'Regulatory Rules',
    path: '/regulatory-rules',
    icon: Scale,
  },
  {
    name: 'Analysis History',
    path: '/history',
    icon: History,
  },
  {
    name: 'Settings & Privacy',
    path: '/settings',
    icon: Settings,
  },
];

export function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-200">
      {/* Top Header / Logo */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm font-bold tracking-tight">
              <Scale className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  ClauseLens
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-sm">
                    Beta
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Contract Risk Intelligence
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Demo Mode Notice */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 rounded-lg border border-blue-500/30 bg-blue-950/40 p-2.5">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Demo Mode</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-normal">
              Local simulation active. All contract and policy changes run locally in your browser.
            </p>
          </div>
        )}

        {/* Nav Links */}
        <nav className="mt-4 space-y-1 px-2.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={cn(
                  'group flex items-center rounded-lg px-3 py-2.5 text-xs font-medium transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white',
                  isCollapsed ? 'justify-center px-2' : 'justify-between'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={cn(
                      'shrink-0 transition-colors',
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    className={cn(
                      'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-500/20 text-blue-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Disclaimer */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-slate-400 bg-slate-800/40 rounded-md">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Not a replacement for legal counsel</span>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold text-xs text-blue-300">
            {mockUserProfile.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {mockUserProfile.name}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {mockUserProfile.organization}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:block transition-all duration-300 border-r border-slate-800 shrink-0 z-20',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
