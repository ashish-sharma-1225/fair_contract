import { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { RuleTypeBadge } from '../../components/ui/StatusBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { apiClient } from '../../lib/api-client';
import { getCategoryLabel } from '../../lib/utils';
import type { RegulatoryRule } from '../../types';

export function RegulatoryRulesPage() {
  const [rules, setRules] = useState<RegulatoryRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getRegulatoryRules();
      setRules(data);
    } catch (err: unknown) {
      console.error('Failed to load regulatory rules:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, is_selected: !r.is_selected } : r))
    );
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
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRules}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            Refresh
          </Button>
        }
      />

      {/* Filter and stats toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between py-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Jurisdiction:</span>
          <select
            aria-label="Filter jurisdiction"
            value={jurisdictionFilter}
            onChange={e => setJurisdictionFilter(e.target.value)}
            className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All jurisdictions</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="European Union">European Union</option>
            <option value="United States">United States</option>
          </select>
        </div>

        <div className="text-slate-500">
          <span className="font-medium text-slate-800">{rules.filter(r => r.is_selected).length}</span> of{' '}
          <span className="font-medium text-slate-800">{rules.length}</span> active rules selected
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <LoadingState message="Loading statutory rules..." />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRules.map(rule => (
            <div
              key={rule.id}
              className={`rounded-lg border p-4 transition-colors text-xs ${
                rule.is_selected
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-slate-200 bg-slate-50/70 opacity-80'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Rule Code, Type, Jurisdiction, Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-medium text-slate-800">
                      {rule.rule_code}
                    </span>
                    <RuleTypeBadge type={rule.binding_type} />
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      {rule.source?.jurisdiction}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      {getCategoryLabel(rule.category)}
                    </span>
                  </div>

                  <Button
                    variant={rule.is_selected ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                    className="text-xs"
                  >
                    {rule.is_selected ? 'Included in scan' : 'Excluded from scan'}
                  </Button>
                </div>

                {/* Rule Statement */}
                <div>
                  <p className="text-sm font-medium text-slate-900 leading-snug">
                    {rule.rule_text}
                  </p>
                  <p className="text-slate-600 mt-1">
                    <span className="text-slate-700 font-medium">Scope:</span> {rule.applicability_notes}
                  </p>
                </div>

                {/* Official Source & Verification Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span>
                      Source: {rule.source?.title} ({rule.source?.publisher})
                    </span>
                    {rule.source?.official_url && (
                      <a
                        href={rule.source.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                      >
                        <span>Statute</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span>Effective {rule.source?.effective_date}</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified {rule.source?.last_verified_at}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
