import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
  backTo?: string;
  backLabel?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  backTo,
  backLabel = 'Back',
  badge,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-4 border-b border-slate-200 mb-6',
        className
      )}
    >
      <div>
        {breadcrumb && (
          <div className="mb-1 text-xs text-slate-500 font-normal">
            {breadcrumb}
          </div>
        )}
        {!breadcrumb && backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="mb-1.5 inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{backLabel}</span>
          </button>
        )}
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

