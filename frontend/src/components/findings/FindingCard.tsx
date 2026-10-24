import { useState } from 'react';
import { Copy, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';
import { getCategoryLabel, cn } from '../../lib/utils';
import { generateCounterOffer } from '../../lib/counter-offer';
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
  const [showRedline, setShowRedline] = useState(false);
  const [copiedRedline, setCopiedRedline] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const counterOffer = generateCounterOffer(finding);

  const handleCopyRedline = async () => {
    await navigator.clipboard.writeText(counterOffer.proposedText);
    setCopiedRedline(true);
    setTimeout(() => setCopiedRedline(false), 2000);
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(counterOffer.politeEmailSnippet);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

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

      {/* Interactive 1-Click Redline & Polite Pushback Copilot */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowRedline(!showRedline)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>{showRedline ? 'Hide Counter-Offer & Redline' : 'Draft Fair Redline & Polite Pushback'}</span>
          {showRedline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showRedline && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-slate-50/80 p-3.5 space-y-3 text-xs animate-in fade-in duration-200">
            {/* Redline Diff */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Proposed Fair Redline (Balanced Clause)
                </span>
                <button
                  type="button"
                  onClick={handleCopyRedline}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
                >
                  {copiedRedline ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRedline ? 'Copied clause!' : 'Copy redline'}</span>
                </button>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2.5 font-mono text-[11px] leading-relaxed text-slate-800 space-y-1.5">
                <p className="line-through text-red-600 bg-red-50/60 p-1 rounded">
                  {counterOffer.originalText}
                </p>
                <p className="font-semibold text-emerald-800 bg-emerald-50/70 p-1 rounded">
                  + {counterOffer.proposedText}
                </p>
              </div>
            </div>

            {/* Polite Email Snippet */}
            <div className="space-y-1 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Polite Client Pushback (Ready to Send)
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copied text!' : 'Copy phrase'}</span>
                </button>
              </div>
              <p className="text-slate-700 bg-white border border-slate-200 rounded p-2 italic leading-relaxed text-[11px]">
                “{counterOffer.politeEmailSnippet}”
              </p>
            </div>
          </div>
        )}
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

