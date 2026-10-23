import { cn } from '../../lib/utils';
import type { BindingType, ContractStatus, ReviewStatus } from '../../types';

export function StatusBadge({
  status,
  className,
}: {
  status: ContractStatus;
  className?: string;
}) {
  const styles: Record<ContractStatus, { label: string; classes: string }> = {
    uploaded: { label: 'Uploaded', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
    extracted: { label: 'Text extracted', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
    analyzing: { label: 'Analyzing', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    analyzed: { label: 'Analyzed', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    failed: { label: 'Failed', classes: 'bg-red-50 text-red-700 border-red-200' },
  };

  const current = styles[status] || { label: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        current.classes,
        className
      )}
    >
      {current.label}
    </span>
  );
}

export function ReviewStatusBadge({
  status,
  className,
}: {
  status: ReviewStatus;
  className?: string;
}) {
  const styles: Record<ReviewStatus, { label: string; classes: string }> = {
    needs_review: {
      label: 'Needs review',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    reviewed: {
      label: 'Reviewed',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    dismissed: {
      label: 'Dismissed',
      classes: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  };

  const current = styles[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        current.classes,
        className
      )}
    >
      {current.label}
    </span>
  );
}

export function RuleTypeBadge({
  type,
  className,
}: {
  type: BindingType;
  className?: string;
}) {
  const styles: Record<BindingType, { label: string; classes: string }> = {
    binding_law: {
      label: 'Statutory law',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    official_guidance: {
      label: 'Official guidance',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    standard: {
      label: 'Industry standard',
      classes: 'bg-slate-50 text-slate-600 border-slate-200',
    },
  };

  const current = styles[type] || { label: type, classes: 'bg-slate-100 border-slate-200 text-slate-700' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-normal border',
        current.classes,
        className
      )}
    >
      {current.label}
    </span>
  );
}

