import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, Info, Filter, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { FindingCard } from '../../components/findings/FindingCard';
import {
  FindingsFilter,
  type FindingsFilterState,
} from '../../components/findings/FindingsFilter';
import { FindingDetailDrawer } from '../../components/findings/FindingDetailDrawer';
import { RuleComplianceCard } from '../../components/findings/RuleComplianceCard';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { apiClient } from '../../lib/api-client';
import { formatShortDate } from '../../lib/utils';
import type { Analysis, Finding, ReviewStatus } from '../../types';

export function AnalysisResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FindingsFilterState>({
    search: '',
    severity: 'all',
    category: 'all',
    reviewStatus: 'all',
    sourceType: 'all',
  });

  const fetchAnalysis = useCallback(async () => {
    if (!analysisId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAnalysis(analysisId);
      setAnalysis(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve analysis report';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const handleStatusChange = async (findingId: string, newStatus: ReviewStatus) => {
    try {
      await apiClient.updateFindingReview(findingId, newStatus);
      setAnalysis(prev => {
        if (!prev || !prev.findings) return prev;
        return {
          ...prev,
          findings: prev.findings.map(f =>
            f.id === findingId ? { ...f, review_status: newStatus } : f
          ),
        };
      });
      if (selectedFinding && selectedFinding.id === findingId) {
        setSelectedFinding({ ...selectedFinding, review_status: newStatus });
      }
    } catch (err: unknown) {
      console.error('Failed to update review status:', err);
    }
  };

  const handleOpenDetail = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  };

  const handleExportReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12">
        <LoadingState message="Loading contract analysis findings..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis Not Found"
          backTo="/dashboard"
          backLabel="Back to Dashboard"
        />
        <ErrorState
          title="Analysis Record Unavailable"
          message={error || `We could not locate an analysis report with ID "${analysisId}".`}
          onRetry={fetchAnalysis}
        />
      </div>
    );
  }

  const findings = analysis.findings || [];

  // Filter logic
  const filteredFindings = findings.filter(f => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchQuote = f.source_quote.toLowerCase().includes(q);
      const matchReason = f.reason.toLowerCase().includes(q);
      const matchTrigger = f.trigger_name.toLowerCase().includes(q);
      if (!matchQuote && !matchReason && !matchTrigger) return false;
    }
    if (filters.severity !== 'all' && f.severity !== filters.severity) {
      return false;
    }
    if (filters.category !== 'all' && f.category !== filters.category) {
      return false;
    }
    if (filters.reviewStatus !== 'all' && f.review_status !== filters.reviewStatus) {
      return false;
    }
    if (filters.sourceType !== 'all') {
      if (filters.sourceType === 'policy' && f.trigger_type !== 'policy') return false;
      if (
        filters.sourceType === 'regulatory_rule' &&
        f.trigger_type !== 'regulatory_rule'
      )
        return false;
    }
    return true;
  });

  // Summary counts
  const highCount = findings.filter(f => f.severity === 'high').length;
  const medCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;
  const reviewedCount = findings.filter(f => f.review_status === 'reviewed').length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        breadcrumb={
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/contracts" className="hover:text-slate-900 transition-colors">
              Contracts History
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700">Analysis</span>
          </div>
        }
        title="Contract Risk Analysis"
        description="Flagged clauses and supporting evidence."
        badge={<RiskBadge severity={analysis.overall_risk_level} size="sm" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalysis}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Export report
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contracts/new')}
              className="text-xs"
            >
              Analyse another
            </Button>
          </div>
        }
      />

      {/* Contract Summary Section */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {analysis.contract_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Completed {formatShortDate(analysis.created_at)} · {analysis.model_provider}
            </p>
          </div>

          {/* Compact inline statistics */}
          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            <span className="font-medium text-red-700">{highCount} high risk</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-amber-800">{medCount} warnings</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-600">{lowCount} notices</span>
            <span className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">{reviewedCount}/{findings.length} reviewed</span>
          </div>
        </div>

        {analysis.summary && (
          <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
            {analysis.summary}
          </p>
        )}
      </section>

      {/* Unique Feature: Rule Compliance Score & 1-Click Polite Pushback Action */}
      <RuleComplianceCard analysis={analysis} findings={findings} />

      {/* Legal disclaimer */}
      <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Review assistance only. Findings are potential issues for human review, not legal advice.
        </span>
      </div>

      {/* Compact Search & Filters Toolbar */}
      <FindingsFilter
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: '',
            severity: 'all',
            category: 'all',
            reviewStatus: 'all',
            sourceType: 'all',
          })
        }
        totalCount={findings.length}
        filteredCount={filteredFindings.length}
      />

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-slate-900">
            No matching findings
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No clauses match your current filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setFilters({
                search: '',
                severity: 'all',
                category: 'all',
                reviewStatus: 'all',
                sourceType: 'all',
              })
            }
            className="mt-3 text-xs"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onStatusChange={handleStatusChange}
              onSelectFinding={handleOpenDetail}
              isSelected={selectedFinding?.id === finding.id}
            />
          ))}
        </div>
      )}

      {/* Side Detail Drawer */}
      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
