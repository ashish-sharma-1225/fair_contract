import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, ShieldAlert, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';


export interface AppHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function AppHeader({ onOpenMobileSidebar }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Informational Review Aid</span>
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500 font-medium">
            Review assistance, not legal counsel
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/regulatory-rules')}
          leftIcon={<HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
          className="hidden lg:inline-flex text-xs"
        >
          Rule Library
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/contracts/new')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="text-xs font-semibold"
        >
          Analyze Contract
        </Button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors p-1.5"
          title="Return to Public Landing Page"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Exit to Landing</span>
        </Link>
      </div>
    </header>
  );
}
