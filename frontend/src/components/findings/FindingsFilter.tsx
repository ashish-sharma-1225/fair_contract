import { Search, RotateCcw } from 'lucide-react';

import type { ClauseCategory, ReviewStatus, RiskSeverity } from '../../types';

export interface FindingsFilterState {
  search: string;
  severity: RiskSeverity | 'all';
  category: ClauseCategory | 'all';
  reviewStatus: ReviewStatus | 'all';
  sourceType: 'all' | 'policy' | 'regulatory_rule';
}

export interface FindingsFilterProps {
  filters: FindingsFilterState;
  onChange: (newFilters: FindingsFilterState) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export function FindingsFilter({
  filters,
  onChange,
  onReset,
  totalCount,
  filteredCount,
}: FindingsFilterProps) {
  const categories: { label: string; value: ClauseCategory | 'all' }[] = [
    { label: 'All categories', value: 'all' },
    { label: 'Payment terms', value: 'payment' },
    { label: 'Automatic renewal', value: 'renewal' },
    { label: 'Liability & indemnity', value: 'liability' },
    { label: 'Jurisdiction', value: 'jurisdiction' },
    { label: 'Other terms', value: 'other' },
  ];

  const severities: { label: string; value: RiskSeverity | 'all' }[] = [
    { label: 'All severities', value: 'all' },
    { label: 'High risk', value: 'high' },
    { label: 'Medium warning', value: 'medium' },
    { label: 'Low notice', value: 'low' },
  ];

  const reviewStatuses: { label: string; value: ReviewStatus | 'all' }[] = [
    { label: 'All review statuses', value: 'all' },
    { label: 'Needs review', value: 'needs_review' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Dismissed', value: 'dismissed' },
  ];

  const hasActiveFilters =
    filters.search !== '' ||
    filters.severity !== 'all' ||
    filters.category !== 'all' ||
    filters.reviewStatus !== 'all' ||
    filters.sourceType !== 'all';

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 py-1">
      {/* Search Input & Selects */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            aria-label="Filter findings"
            placeholder="Filter findings..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-slate-400 bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Category */}
        <select
          aria-label="Category filter"
          value={filters.category}
          onChange={e =>
            onChange({
              ...filters,
              category: e.target.value as ClauseCategory | 'all',
            })
          }
          className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Severity */}
        <select
          aria-label="Severity filter"
          value={filters.severity}
          onChange={e =>
            onChange({
              ...filters,
              severity: e.target.value as RiskSeverity | 'all',
            })
          }
          className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          {severities.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Review Status */}
        <select
          aria-label="Review status filter"
          value={filters.reviewStatus}
          onChange={e =>
            onChange({
              ...filters,
              reviewStatus: e.target.value as ReviewStatus | 'all',
            })
          }
          className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          {reviewStatuses.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          aria-label="Source filter"
          value={filters.sourceType}
          onChange={e =>
            onChange({
              ...filters,
              sourceType: e.target.value as 'all' | 'policy' | 'regulatory_rule',
            })
          }
          className="h-8 rounded border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          <option value="all">All sources</option>
          <option value="policy">User policies</option>
          <option value="regulatory_rule">Regulatory rules</option>
        </select>
      </div>

      {/* Counts & Reset */}
      <div className="flex items-center justify-between lg:justify-end gap-3 text-xs text-slate-500 shrink-0">
        <span>
          Showing <span className="font-medium text-slate-800">{filteredCount}</span> of{' '}
          <span className="font-medium text-slate-800">{totalCount}</span>
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

