import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { demoStore } from '../../mocks/demo-store';
import { formatDate } from '../../lib/utils';
import type { RiskSeverity } from '../../types';

export function HistoryPage() {
  const navigate = useNavigate();
  const [analyses] = useState(() => demoStore.getAnalyses());

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | 'all'>('all');

  const filteredAnalyses = analyses.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!a.contract_name.toLowerCase().includes(q) && !a.summary.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (severityFilter !== 'all' && a.overall_risk_level !== severityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analysis History"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/contracts/new')}
          >
            Analyse Contract
          </Button>
        }
      />

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between py-1 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            aria-label="Search analyses"
            placeholder="Search by contract name or summary..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-slate-400 bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        <select
          aria-label="Filter severity"
          value={severityFilter}
          onChange={e =>
            setSeverityFilter(e.target.value as RiskSeverity | 'all')
          }
          className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          <option value="all">All risk levels</option>
          <option value="high">High risk</option>
          <option value="medium">Medium warning</option>
          <option value="low">Low notice</option>
        </select>
      </div>

      {/* History Items or Empty State */}
      {filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={<History className="w-7 h-7 text-slate-400" />}
          title="No analysis history found"
          description={
            searchQuery || severityFilter !== 'all'
              ? 'No prior analysis matches your filter criteria.'
              : 'You have not performed any contract scans yet.'
          }
          actionLabel="Run contract analysis"
          onAction={() => navigate('/contracts/new')}
          secondaryActionLabel={
            searchQuery || severityFilter !== 'all' ? 'Reset filters' : undefined
          }
          onSecondaryAction={() => {
            setSearchQuery('');
            setSeverityFilter('all');
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredAnalyses.map(analysis => (
            <div
              key={analysis.id}
              onClick={() => navigate(`/analyses/${analysis.id}`)}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors cursor-pointer text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900 text-sm">
                    {analysis.contract_name}
                  </span>
                  <RiskBadge
                    severity={analysis.overall_risk_level}
                    size="sm"
                  />
                </div>
                <p className="text-slate-600 mt-1 line-clamp-1 leading-relaxed">
                  {analysis.summary}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                  <span>Report #{analysis.id}</span>
                  <span>·</span>
                  <span>Completed {formatDate(analysis.created_at)}</span>
                  <span>·</span>
                  <span>{analysis.model_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="font-medium text-slate-800 block">
                    {analysis.findings_count.total} findings
                  </span>
                  <span className="text-[11px] text-red-700 block">
                    {analysis.findings_count.high} high risk
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/analyses/${analysis.id}`)}
                  rightIcon={<ArrowRight className="w-3 h-3" />}
                  className="text-xs"
                >
                  View report
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

