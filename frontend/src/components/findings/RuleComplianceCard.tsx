import { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Copy,
  Check,
  Clock,
  RefreshCw,
  Scale,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { generateConsolidatedNegotiationEmail } from '../../lib/counter-offer';
import type { Analysis, Finding } from '../../types';

export interface RuleComplianceCardProps {
  analysis: Analysis;
  findings: Finding[];
}

export function RuleComplianceCard({ analysis, findings }: RuleComplianceCardProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute rule compliance stats
  const highViolations = findings.filter(f => f.severity === 'high').length;
  const medViolations = findings.filter(f => f.severity === 'medium').length;

  // Calculate score out of 100
  // Each high penalty = -25%, medium = -10%
  const calculatedScore = Math.max(
    15,
    Math.min(100, Math.round(100 - highViolations * 25 - medViolations * 10))
  );

  // Pillar evaluations based on findings
  const paymentViolated = findings.some(
    f => f.category === 'payment' || f.trigger_name.toLowerCase().includes('pay')
  );
  const renewalViolated = findings.some(
    f => f.category === 'renewal' || f.trigger_name.toLowerCase().includes('renew')
  );
  const liabilityViolated = findings.some(
    f => f.category === 'liability' || f.trigger_name.toLowerCase().includes('liab')
  );
  const jurisdictionViolated = findings.some(
    f => f.category === 'jurisdiction' || f.trigger_name.toLowerCase().includes('jurisdiction')
  );

  const pillars = [
    {
      title: 'Payment Delay',
      rule: 'Max Net 30 Days',
      icon: Clock,
      violated: paymentViolated,
      detail: paymentViolated ? 'Exceeds threshold' : 'Complies with policy',
    },
    {
      title: 'Auto-Renewal',
      rule: 'Min 60d Notice',
      icon: RefreshCw,
      violated: renewalViolated,
      detail: renewalViolated ? 'Notice inadequate' : 'Proper opt-out',
    },
    {
      title: 'Liability Cap',
      rule: 'Capped at Fees',
      icon: Scale,
      violated: liabilityViolated,
      detail: liabilityViolated ? 'Unlimited exposure' : 'Capped balance',
    },
    {
      title: 'Jurisdiction',
      rule: 'Mutual Local Venue',
      icon: ShieldCheck,
      violated: jurisdictionViolated,
      detail: jurisdictionViolated ? 'Remote venue' : 'Standard venue',
    },
  ];

  const fullEmail = generateConsolidatedNegotiationEmail(analysis.contract_name, findings);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 50) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
      {/* Top Banner: Score & Pitch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {/* Radial-styled score badge */}
          <div
            className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border font-bold ${getScoreColor(
              calculatedScore
            )}`}
          >
            <span className="text-xl leading-none">{calculatedScore}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Rule Compliance Score
              </h3>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${getBadgeStyle(
                  calculatedScore
                )}`}
              >
                {calculatedScore >= 80
                  ? 'Low Risk'
                  : calculatedScore >= 50
                  ? 'Moderate Risk'
                  : 'High Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated against your active freelancer & vendor policies.
            </p>
          </div>
        </div>

        {/* 1-Click Polite Pushback Action */}
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEmailModalOpen(true)}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
          >
            Draft Polite Pushback Email
          </Button>
        </div>
      </div>

      {/* Pillars Grid: The 4 Core Problem Statement Rules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pillars.map(pillar => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className={`rounded border p-3 text-xs transition-colors ${
                pillar.violated
                  ? 'border-red-200 bg-red-50/40 text-red-900'
                  : 'border-emerald-200 bg-emerald-50/30 text-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-800">{pillar.title}</span>
                </div>
                {pillar.violated ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">{pillar.rule}</p>
              <span
                className={`inline-block mt-2 font-medium text-[11px] ${
                  pillar.violated ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {pillar.violated ? '⚠️ Policy Flagged' : '✓ Compliant'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal for Consolidated Polite Pushback Email */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Polite Pushback Negotiation Email
                  </h3>
                  <p className="text-xs text-slate-500">
                    Professional, client-friendly email draft ready to copy and send.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Email Body */}
            <div className="rounded border border-slate-200 bg-slate-50 p-4 text-xs font-mono text-slate-800 leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
              {fullEmail}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Addresses all flagged payment, liability, and renewal terms politely.
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyEmail}
                  leftIcon={
                    copied ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )
                  }
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Email Draft'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
