import { Search, Filter, RotateCcw } from 'lucide-react';

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
    { label: 'All Categories', value: 'all' },
    { label: 'Payment Terms', value: 'payment' },
    { label: 'Automatic Renewal', value: 'renewal' },
    { label: 'Liability & Indemnity', value: 'liability' },
    { label: 'Jurisdiction', value: 'jurisdiction' },
    { label: 'Other Terms', value: 'other' },
  ];

  const severities: { label: string; value: RiskSeverity | 'all' }[] = [
    { label: 'All Severities', value: 'all' },
    { label: 'High Risk Only', value: 'high' },
    { label: 'Medium Warning', value: 'medium' },
    { label: 'Low Notice', value: 'low' },
  ];

  const reviewStatuses: { label: string; value: ReviewStatus | 'all' }[] = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Needs Review', value: 'needs_review' },
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clause text, quotes, or reasoning..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Count & Reset */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800">{totalCount}</strong> findings
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Select Filters Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Category Dropdown */}
        <select
          value={filters.category}
          onChange={e =>
            onChange({
              ...filters,
              category: e.target.value as ClauseCategory | 'all',
            })
          }
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {/* Severity Dropdown */}
        <select
          value={filters.severity}
          onChange={e =>
            onChange({
              ...filters,
              severity: e.target.value as RiskSeverity | 'all',
            })
          }
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {severities.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Review Status Dropdown */}
        <select
          value={filters.reviewStatus}
          onChange={e =>
            onChange({
              ...filters,
              reviewStatus: e.target.value as ReviewStatus | 'all',
            })
          }
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {reviewStatuses.map(r => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {/* Source Type Dropdown */}
        <select
          value={filters.sourceType}
          onChange={e =>
            onChange({
              ...filters,
              sourceType: e.target.value as 'all' | 'policy' | 'regulatory_rule',
            })
          }
          className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">All Sources</option>
          <option value="policy">User Policy Checks</option>
          <option value="regulatory_rule">Regulatory Rule Checks</option>
        </select>
      </div>
    </div>
  );
}
