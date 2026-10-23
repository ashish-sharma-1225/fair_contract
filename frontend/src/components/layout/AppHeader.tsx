import { Link, useNavigate } from 'react-router-dom';
import { Menu, Plus, LogOut, HelpCircle } from 'lucide-react';
import { Button } from '../ui/Button';


export interface AppHeaderProps {
  onOpenMobileSidebar: () => void;
}

export function AppHeader({ onOpenMobileSidebar }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <span className="hidden sm:inline text-xs text-slate-500 font-normal">
          Review assistance aid · Not legal advice
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/regulatory-rules')}
          leftIcon={<HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
          className="hidden lg:inline-flex text-xs"
        >
          Rules
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/contracts/new')}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Analyze contract
        </Button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors p-1"
          title="Return to Public Landing Page"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Exit</span>
        </Link>
      </div>
    </header>
  );
}

