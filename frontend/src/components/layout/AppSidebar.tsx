import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSearch,
  ShieldCheck,
  Scale,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
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
    name: 'Analyse Contract',
    path: '/contracts/new',
    icon: FileSearch,
  },
  {
    name: 'Contract Policies',
    path: '/policies',
    icon: ShieldCheck,
  },
  {
    name: 'Contracts History',
    path: '/contracts',
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
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-300 select-none">
      {/* Top Header / Logo */}
      <div>
        <div className="flex h-14 items-center justify-between px-3.5 border-b border-slate-800">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
            onClick={onCloseMobile}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-800 text-slate-200">
              <Scale className="w-4 h-4 text-slate-200" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white tracking-tight">
                  ClauseLens
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Contract risk review
                </span>
              </div>
            )}
          </NavLink>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-3 space-y-0.5 px-2">
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
                  'group flex items-center rounded px-2.5 py-2 text-xs transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200',
                  isCollapsed ? 'justify-center px-2' : 'justify-between'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={cn(
                      'shrink-0 transition-colors',
                      isCollapsed ? 'w-4 h-4' : 'w-4 h-4',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Disclaimer */}
      <div className="border-t border-slate-800 p-2.5 space-y-2">
        {!isCollapsed && (
          <div className="px-2 py-1 text-[11px] text-slate-500 leading-tight">
            Review assistance only. Not legal advice.
          </div>
        )}

        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-800 font-medium text-xs text-slate-300">
            {mockUserProfile.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                {mockUserProfile.name}
              </span>
              <span className="text-[11px] text-slate-500 truncate">
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
          'hidden md:block transition-all duration-200 border-r border-slate-800 shrink-0 z-20',
          isCollapsed ? 'w-14' : 'w-56'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-lg z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

