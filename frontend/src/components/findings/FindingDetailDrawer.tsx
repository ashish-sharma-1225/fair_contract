import {
  X,
  Quote,
  FileSpreadsheet,
  CheckCircle2,
  Lightbulb,
  Shield,
  Scale,
  Sparkles,
} from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative z-10 w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RiskBadge severity={finding.severity} />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {getCategoryLabel(finding.category)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
            {finding.reason}
          </h3>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Trigger Context */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              {finding.trigger_type === 'regulatory_rule' ? (
                <Scale className="w-4 h-4 text-indigo-600" />
              ) : finding.trigger_type === 'policy' ? (
                <Shield className="w-4 h-4 text-blue-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-600" />
              )}
              <span>
                {finding.trigger_type === 'regulatory_rule'
                  ? 'Regulatory Rule Check'
                  : finding.trigger_type === 'policy'
                  ? 'User Business Policy'
                  : 'AI Risk Heuristic'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {finding.trigger_name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Triggered during automated contract evaluation against your configured risk rules.
            </p>
          </div>

          {/* Exact Citation with Verification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Quote className="w-3.5 h-3.5 text-blue-600" />
                <span>Extracted Contract Text</span>
              </div>
              <div className="flex items-center gap-2">
                {finding.section_reference && (
                  <span className="text-xs font-mono text-slate-500">
                    {finding.section_reference}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  Page {finding.page_number}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 font-mono text-xs text-slate-800 leading-relaxed border-l-4 border-l-blue-600">
              "{finding.source_quote}"
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Quotation matched exactly against document extraction (PyMuPDF source verify).
              </span>
            </div>
          </div>

          {/* Analysis & Advice */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Risk Explanation & Legal Implication
            </h4>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                This clause places asymmetric financial or operational obligation on the contractor. If signed in its current form, standard statutory protections or your personal business preferences may be compromised.
              </p>
            </div>
          </div>

          {/* Remediation Advice */}
          {finding.remediation_advice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Suggested Revision / Negotiation Redline</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {finding.remediation_advice}
              </p>
            </div>
          )}

          {/* Review Status Selector */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Update Review Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={finding.review_status === 'needs_review' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onStatusChange(finding.id, 'needs_review')}
                className="text-xs"
              >
                Needs Review
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
                Dismiss
              </Button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Finding ID: {finding.id}</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
