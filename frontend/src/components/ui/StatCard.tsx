import type { ReactNode } from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;

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
  iconBgColor = 'bg-blue-50 text-blue-600',
  trendText,
  trendType = 'neutral',
  onClick,
  className,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 transition-all duration-200 hover:shadow-md border-slate-200/80',
        onClick && 'cursor-pointer hover:border-blue-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
          {trendText && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
              <span
                className={cn(
                  trendType === 'positive' && 'text-emerald-600',
                  trendType === 'negative' && 'text-red-600',
                  trendType === 'neutral' && 'text-slate-500'
                )}
              >
                {trendText}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            iconBgColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
