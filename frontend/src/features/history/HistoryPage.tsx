import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
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
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description="Revisit past contract evaluations, review flagged evidence, and track remediation progress."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/contracts/new')}
          >
            New Analysis
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by contract name or summary..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <select
          value={severityFilter}
          onChange={e =>
            setSeverityFilter(e.target.value as RiskSeverity | 'all')
          }
          className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk Scans</option>
          <option value="medium">Medium Warning Scans</option>
          <option value="low">Low Notice Scans</option>
        </select>
      </div>

      {/* History Items or Empty State */}
      {filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={<History className="w-7 h-7 text-slate-400" />}
          title="No analysis history found"
          description={
            searchQuery || severityFilter !== 'all'
              ? 'No prior analysis matches your filter criteria. Try resetting your search.'
              : 'You have not performed any contract scans yet.'
          }
          actionLabel="Run Contract Analysis"
          onAction={() => navigate('/contracts/new')}
          secondaryActionLabel={
            searchQuery || severityFilter !== 'all' ? 'Reset Filters' : undefined
          }
          onSecondaryAction={() => {
            setSearchQuery('');
            setSeverityFilter('all');
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredAnalyses.map(analysis => (
            <Card
              key={analysis.id}
              onClick={() => navigate(`/analyses/${analysis.id}`)}
              className="hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {analysis.contract_name}
                      </h4>
                      <RiskBadge
                        severity={analysis.overall_risk_level}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {analysis.summary}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 flex-wrap">
                      <span>Report #{analysis.id}</span>
                      <span>•</span>
                      <span>Analyzed {formatDate(analysis.created_at)}</span>
                      <span>•</span>
                      <span>{analysis.model_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {analysis.findings_count.total} Findings Total
                    </span>
                    <span className="text-[11px] font-semibold text-red-600 block">
                      {analysis.findings_count.high} High-Risk Breaches
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/analyses/${analysis.id}`)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="text-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                  >
                    View Findings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
