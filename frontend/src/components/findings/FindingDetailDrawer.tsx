import { X } from 'lucide-react';
import { RiskBadge } from '../ui/RiskBadge';
import { Button } from '../ui/Button';
import { getCategoryLabel } from '../../lib/utils';
import type { Finding, ReviewStatus } from '../../types';

export interface FindingDetailDrawerProps {
  finding: Finding | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (findingId: string, newStatus: ReviewStatus) => void;
}

export function FindingDetailDrawer({
  finding,
  isOpen,
  onClose,
  onStatusChange,
}: FindingDetailDrawerProps) {
  if (!isOpen || !finding) return null;

  const sourceLabel =
    finding.trigger_type === 'regulatory_rule'
      ? `Regulatory rule · ${finding.trigger_name}`
      : finding.trigger_type === 'policy'
      ? `Policy · ${finding.trigger_name}`
      : `Rule · ${finding.trigger_name}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-lg border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiskBadge severity={finding.severity} size="sm" />
              <span className="text-xs text-slate-500 font-medium">
                {getCategoryLabel(finding.category)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="mt-2.5 text-base font-semibold text-slate-900 leading-snug">
            {finding.reason}
          </h3>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 text-xs">
          {/* Rule / Policy Source */}
          <div className="space-y-1">
            <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px]">
              Evaluated Rule
            </h4>
            <p className="text-slate-900 font-medium">{sourceLabel}</p>
          </div>

          {/* Exact Citation with Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px]">
                Contract Evidence
              </h4>
              <div className="flex items-center gap-2 text-slate-500">
                <span>Page {finding.page_number}</span>
                {finding.section_reference && (
                  <>
                    <span>·</span>
                    <span>Section {finding.section_reference}</span>
                  </>
                )}
              </div>
            </div>

            <blockquote className="border-l-2 border-slate-300 pl-3 py-1 text-slate-800 leading-relaxed font-normal bg-slate-50/50 rounded-r">
              “{finding.source_quote}”
            </blockquote>

            <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pl-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Verified exact quote from document text
            </p>
          </div>

          {/* Remediation Advice */}
          {finding.remediation_advice && (
            <div className="space-y-1 pt-3 border-t border-slate-100">
              <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px]">
                Recommended Action
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {finding.remediation_advice}
              </p>
            </div>
          )}

          {/* Review Status Control */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h4 className="font-medium text-slate-700 uppercase tracking-wider text-[11px]">
              Review Status
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={finding.review_status === 'needs_review' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(finding.id, 'needs_review')}
                className="text-xs"
              >
                Needs review
              </Button>
              <Button
                variant={finding.review_status === 'reviewed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(finding.id, 'reviewed')}
                className="text-xs"
              >
                Reviewed
              </Button>
              <Button
                variant={finding.review_status === 'dismissed' ? 'subtle' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(finding.id, 'dismissed')}
                className="text-xs"
              >
                Dismissed
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Finding {finding.id}</span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

