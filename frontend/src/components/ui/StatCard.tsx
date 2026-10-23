import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  trendText?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trendText,
  trendType = 'neutral',
  onClick,
  className,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 transition-colors',
        onClick && 'cursor-pointer hover:border-slate-300',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
          {trendText && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'font-medium',
                  trendType === 'positive' && 'text-emerald-700',
                  trendType === 'negative' && 'text-red-700',
                  trendType === 'neutral' && 'text-slate-500'
                )}
              >
                {trendText}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-slate-400 shrink-0 mt-0.5">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

