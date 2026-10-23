import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

import type { RiskSeverity } from '../../types';
import { cn } from '../../lib/utils';

export interface RiskBadgeProps {
  severity: RiskSeverity | 'clean';
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({
  severity,
  size = 'md',
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const configs = {
    high: {
      label: 'High Risk',
      classes: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertCircle,
    },
    medium: {
      label: 'Medium Warning',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
    },
    low: {
      label: 'Low Notice',
      classes: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Info,
    },
    clean: {
      label: 'No Conflicts Flagged',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
  };

  const current = configs[severity];
  const IconComponent = current.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5',
        current.classes,
        className
      )}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
}
