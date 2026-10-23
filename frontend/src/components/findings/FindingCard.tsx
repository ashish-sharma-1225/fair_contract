import {
  Quote,
  CheckCircle2,
  FileSpreadsheet,
  Lightbulb,
  ExternalLink,
  Shield,
  Scale,
  Sparkles,
} from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';
import { getCategoryBadgeClasses, getCategoryLabel, cn } from '../../lib/utils';
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
  return (
    <div
      className={cn(
        'group rounded-xl border bg-white p-5 transition-all duration-200 shadow-xs hover:shadow-md',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200 hover:border-slate-300'
      )}
    >
      {/* Top Header: Severity, Category, Trigger Type */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge severity={finding.severity} size="sm" />

          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
              getCategoryBadgeClasses(finding.category)
            )}
          >
            {getCategoryLabel(finding.category)}
          </span>

          {/* Trigger Source Pill */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border',
              finding.trigger_type === 'regulatory_rule'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : finding.trigger_type === 'policy'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            )}
          >
            {finding.trigger_type === 'regulatory_rule' && (
              <Scale className="w-3 h-3 text-indigo-600" />
            )}
            {finding.trigger_type === 'policy' && (
              <Shield className="w-3 h-3 text-blue-600" />
            )}
            {finding.trigger_type === 'ai_heuristic' && (
              <Sparkles className="w-3 h-3 text-purple-600" />
            )}
            <span>
              {finding.trigger_type === 'regulatory_rule'
                ? 'Regulatory Rule'
                : finding.trigger_type === 'policy'
                ? 'User Policy'
                : 'AI Analysis'}
              : {finding.trigger_name}
            </span>
          </span>
        </div>

        {/* Review Status Control */}
        <div className="flex items-center gap-1.5">
          <select
            value={finding.review_status}
            onChange={e =>
              onStatusChange(finding.id, e.target.value as ReviewStatus)
            }
            className="text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 py-1 px-2.5 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="needs_review">Needs Review</option>
            <option value="reviewed">Mark as Reviewed</option>
            <option value="dismissed">Dismiss Flag</option>
          </select>
        </div>
      </div>

      {/* Explanation & Reason */}
      <div className="mt-3.5">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
          {finding.reason}
        </h4>
      </div>

      {/* Evidence Quote Block */}
      <div className="mt-3.5 rounded-lg border border-slate-200 bg-slate-50/80 p-3.5">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 mb-1.5">
          <div className="flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5 text-blue-600" />
            <span>Exact Contract Clause Citation</span>
          </div>

          <div className="flex items-center gap-2">
            {finding.section_reference && (
              <span className="text-[11px] text-slate-500 font-mono">
                {finding.section_reference}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              <FileSpreadsheet className="w-3 h-3 text-slate-400" />
              Page {finding.page_number}
            </span>
          </div>
        </div>

        <blockquote className="text-xs text-slate-800 font-mono italic leading-relaxed border-l-2 border-blue-500 pl-3 py-0.5 bg-white rounded-r-md">
          "{finding.source_quote}"
        </blockquote>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Source Verified Against Extracted PDF Text
          </span>
          {onSelectFinding && (
            <button
              type="button"
              onClick={() => onSelectFinding(finding)}
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Examine Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Remediation / Counter-proposal */}
      {finding.remediation_advice && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50/60 p-2.5 text-xs text-blue-900 border border-blue-100">
          <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-950">Recommended Action: </span>
            <span className="text-blue-900/90 leading-relaxed">
              {finding.remediation_advice}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
