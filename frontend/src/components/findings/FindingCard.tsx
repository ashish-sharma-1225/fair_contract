import { RiskBadge } from '../ui/RiskBadge';
import { getCategoryLabel, cn } from '../../lib/utils';
import type { Finding, ReviewStatus } from '../../types';

export interface FindingCardProps {
  finding: Finding;
  onStatusChange: (findingId: string, newStatus: ReviewStatus) => void;
  onSelectFinding?: (finding: Finding) => void;
  isSelected?: boolean;
}

export function FindingCard({
  finding,
  onStatusChange,
  onSelectFinding,
  isSelected = false,
}: FindingCardProps) {
  const sourceLabel =
    finding.trigger_type === 'regulatory_rule'
      ? `Regulatory rule: ${finding.trigger_name}`
      : finding.trigger_type === 'policy'
      ? `Policy: ${finding.trigger_name}`
      : `Rule: ${finding.trigger_name}`;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-4 transition-colors',
        isSelected
          ? 'border-slate-400 shadow-xs'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Top Row: Severity, Category, Source, Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <RiskBadge severity={finding.severity} size="sm" />
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-medium">
            {getCategoryLabel(finding.category)}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 truncate max-w-xs" title={sourceLabel}>
            {sourceLabel}
          </span>
        </div>

        {/* Review Status Dropdown */}
        <div className="flex items-center">
          <label htmlFor={`status-${finding.id}`} className="sr-only">
            Review status
          </label>
          <select
            id={`status-${finding.id}`}
            value={finding.review_status}
            onChange={e =>
              onStatusChange(finding.id, e.target.value as ReviewStatus)
            }
            className="text-xs font-medium rounded border border-slate-200 bg-white py-1 px-2 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="needs_review">Needs review</option>
            <option value="reviewed">Mark reviewed</option>
            <option value="dismissed">Dismiss</option>
          </select>
        </div>
      </div>

      {/* Main Content: Explanation */}
      <div className="mt-3">
        <h4 className="text-sm font-medium text-slate-900 leading-snug">
          {finding.reason}
        </h4>
      </div>

      {/* Source-Evidence Section: Clean Quote */}
      <div className="mt-3 space-y-2">
        <blockquote className="border-l-2 border-slate-300 pl-3 py-0.5 text-xs text-slate-800 leading-relaxed font-normal">
          “{finding.source_quote}”
        </blockquote>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pl-3">
          <div className="flex items-center gap-2">
            <span>Page {finding.page_number}</span>
            {finding.section_reference && (
              <>
                <span>·</span>
                <span>Section {finding.section_reference}</span>
              </>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Verified source quote
          </span>
        </div>
      </div>

      {/* Bottom Row: Concise Recommendation & View Details */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {finding.remediation_advice ? (
          <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">
            <span className="font-medium text-slate-800">Recommended action:</span>{' '}
            {finding.remediation_advice}
          </p>
        ) : (
          <span />
        )}

        {onSelectFinding && (
          <button
            type="button"
            onClick={() => onSelectFinding(finding)}
            className="text-slate-600 hover:text-slate-900 font-medium shrink-0 self-start sm:self-auto cursor-pointer transition-colors"
          >
            View details →
          </button>
        )}
      </div>
    </div>
  );
}

