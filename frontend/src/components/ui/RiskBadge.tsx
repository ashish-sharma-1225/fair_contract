import type { RiskSeverity } from '../../types';
import { cn } from '../../lib/utils';

export interface RiskBadgeProps {
  severity: RiskSeverity | 'clean';
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function RiskBadge({
  severity,
  size = 'md',
  showDot = true,
  className,
}: RiskBadgeProps) {
  const configs: Record<
    RiskSeverity | 'clean',
    { label: string; textClass: string; bgClass: string; dotClass: string }
  > = {
    high: {
      label: 'High risk',
      textClass: 'text-red-700',
      bgClass: 'bg-red-50/80 border-red-200',
      dotClass: 'bg-red-600',
    },
    medium: {
      label: 'Medium warning',
      textClass: 'text-amber-800',
      bgClass: 'bg-amber-50/80 border-amber-200',
      dotClass: 'bg-amber-600',
    },
    low: {
      label: 'Low notice',
      textClass: 'text-slate-700',
      bgClass: 'bg-slate-100 border-slate-200',
      dotClass: 'bg-slate-500',
    },
    clean: {
      label: 'No risks flagged',
      textClass: 'text-emerald-800',
      bgClass: 'bg-emerald-50/80 border-emerald-200',
      dotClass: 'bg-emerald-600',
    },
  };

  const current = configs[severity] || configs.low;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-md',
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1.5' : 'px-2.5 py-1 text-xs gap-2',
        current.bgClass,
        current.textClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', current.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{current.label}</span>
    </span>
  );
}

