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
    extracted: { label: 'Text Extracted', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    analyzing: { label: 'Analyzing...', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' },
    analyzed: { label: 'Analyzed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    failed: { label: 'Failed', classes: 'bg-red-50 text-red-700 border-red-200' },
  };

  const current = styles[status] || { label: status, classes: 'bg-slate-100 text-slate-700' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
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
      label: 'Needs Review',
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
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
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
      label: 'Binding Statutory Law',
      classes: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    },
    official_guidance: {
      label: 'Official Guidance',
      classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    standard: {
      label: 'Industry Standard',
      classes: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const current = styles[type] || { label: type, classes: 'bg-slate-100' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        current.classes,
        className
      )}
    >
      {current.label}
    </span>
  );
}
