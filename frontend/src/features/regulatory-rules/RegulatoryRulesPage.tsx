import { useState } from 'react';
import {
  Scale,
  ExternalLink,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { RuleTypeBadge } from '../../components/ui/StatusBadge';
import { demoStore } from '../../mocks/demo-store';
import { getCategoryLabel } from '../../lib/utils';
import type { RegulatoryRule } from '../../types';


export function RegulatoryRulesPage() {
  const [rules, setRules] = useState<RegulatoryRule[]>(() =>
    demoStore.getRegulatoryRules()
  );
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');

  const handleToggleRule = (ruleId: string) => {
    demoStore.toggleRegulatoryRule(ruleId);
    setRules(demoStore.getRegulatoryRules());
  };

  const filteredRules = rules.filter(r => {
    if (jurisdictionFilter !== 'all') {
      if (!r.source?.jurisdiction.toLowerCase().includes(jurisdictionFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Regulatory Rule Library"
        description="Curated statutory frameworks and verified commercial codes used to evaluate contract compliance."
      />

      {/* Distinction Explainer Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-950 space-y-1">
            <span className="font-bold">
              Distinguishing Legal Authorities from Personal Preferences:
            </span>
            <p className="leading-relaxed">
              Rules listed here represent official statutory laws and published administrative directives (such as the UK Late Payment Act and EU Unfair Contract Terms Directive). They operate alongside your user-defined business policies to highlight contractual imbalances.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Jurisdiction:</span>
          <select
            value={jurisdictionFilter}
            onChange={e => setJurisdictionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Jurisdictions</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="European Union">European Union</option>
            <option value="United States">United States</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <strong className="text-slate-800">{rules.filter(r => r.is_selected).length}</strong> of{' '}
          <strong className="text-slate-800">{rules.length}</strong> active rules selected for future scans
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map(rule => (
          <Card
            key={rule.id}
            className={`transition-all ${
              rule.is_selected
                ? 'border-indigo-300 bg-white shadow-xs'
                : 'border-slate-200 bg-slate-50/70 opacity-80'
            }`}
          >
            <CardContent className="p-5 space-y-4">
              {/* Header: Rule Code, Type, Jurisdiction, Toggle */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-1 rounded">
                    {rule.rule_code}
                  </span>
                  <RuleTypeBadge type={rule.binding_type} />
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {rule.source?.jurisdiction}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Category: {getCategoryLabel(rule.category)}
                  </span>
                </div>

                <Button
                  variant={rule.is_selected ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleRule(rule.id)}
                  className={`text-xs ${
                    rule.is_selected ? 'bg-indigo-600 hover:bg-indigo-700' : ''
                  }`}
                >
                  {rule.is_selected ? 'Included in Default Scan' : 'Excluded from Scan'}
                </Button>
              </div>

              {/* Rule Statement */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rule Requirement
                </h4>
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {rule.rule_text}
                </p>
              </div>

              {/* Applicability Notes */}
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Scope of Application: </span>
                {rule.applicability_notes}
              </div>

              {/* Official Source & Verification Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>
                    Source: <strong>{rule.source?.title}</strong> ({rule.source?.publisher})
                  </span>
                  {rule.source?.official_url && (
                    <a
                      href={rule.source.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold underline"
                    >
                      <span>Official Statute</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Effective: {rule.source?.effective_date}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified {rule.source?.last_verified_at}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
