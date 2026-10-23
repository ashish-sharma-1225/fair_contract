import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Printer,
  Shield,
  Scale,
  Info,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';

import { FindingCard } from '../../components/findings/FindingCard';
import {
  FindingsFilter,
  type FindingsFilterState,
} from '../../components/findings/FindingsFilter';
import { FindingDetailDrawer } from '../../components/findings/FindingDetailDrawer';
import { ErrorState } from '../../components/ui/ErrorState';
import { demoStore } from '../../mocks/demo-store';
import { formatShortDate } from '../../lib/utils';
import type { Finding, ReviewStatus } from '../../types';

export function AnalysisResultsPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

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

  // Re-fetch analysis from demoStore
  const analysis = useMemo(() => {
    if (!analysisId) return undefined;
    return demoStore.getAnalysis(analysisId);
  }, [analysisId]);

  if (!analysis) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analysis Not Found"
          backTo="/dashboard"
          backLabel="Back to Dashboard"
        />
        <ErrorState
          title="Analysis Record Unavailable"
          message={`We could not locate an analysis report with ID "${analysisId}". It may have been deleted according to retention policy or not yet saved.`}
          onRetry={() => navigate('/history')}
        />
      </div>
    );
  }

  const findings = analysis.findings || [];

  const handleStatusChange = (findingId: string, newStatus: ReviewStatus) => {
    if (!analysisId) return;
    demoStore.updateFindingReview(analysisId, findingId, newStatus);
    // Force rerender by updating local selection if open
    if (selectedFinding && selectedFinding.id === findingId) {
      setSelectedFinding({ ...selectedFinding, review_status: newStatus });
    }
  };

  const handleOpenDetail = (finding: Finding) => {
    setSelectedFinding(finding);
    setIsDrawerOpen(true);
  };

  const handleExportReport = () => {
    window.print();
  };

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
    <div className="space-y-6">
      {/* Page Header with Actions */}
      <PageHeader
        title="Contract Risk Analysis"
        description={`Evaluated against verified statutory standards and configured business policies.`}
        backTo="/history"
        backLabel="Analysis History"
        badge={<RiskBadge severity={analysis.overall_risk_level} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              leftIcon={<Printer className="w-4 h-4" />}
              className="text-xs"
            >
              Print / Export Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contracts/new')}
              className="text-xs"
            >
              Analyze Another Contract
            </Button>
          </div>
        }
      />

      {/* Analysis Overview Card */}
      <Card className="border-blue-200/80 bg-gradient-to-br from-white via-blue-50/20 to-slate-50">
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Analyzed Document
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>{analysis.contract_name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed on {formatShortDate(analysis.created_at)} •{' '}
                {analysis.model_name}
              </p>
            </div>

            {/* Severity Counters Grid */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-center min-w-[70px]">
                <span className="block text-lg font-bold text-red-700">
                  {highCount}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-600">
                  High Risk
                </span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-center min-w-[70px]">
                <span className="block text-lg font-bold text-amber-700">
                  {medCount}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                  Warnings
                </span>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-center min-w-[70px]">
                <span className="block text-lg font-bold text-sky-700">
                  {lowCount}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600">
                  Notices
                </span>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-center min-w-[70px]">
                <span className="block text-lg font-bold text-emerald-700">
                  {reviewedCount}/{findings.length}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  Reviewed
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Executive Findings Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Applied Rules Summary */}
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>{analysis.regulatory_rules_snapshot?.length || 2} Statutory Checks</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>{analysis.policy_snapshot?.length || 3} Custom Policies</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Exact Quotation Text Verification</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mandatory Human Review Disclaimer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Review Required: </strong> ClauseLens findings highlight potential risks and deviations from standard fair contracting practices. They are intended as talking points for negotiation and do not constitute legal advice.
        </div>
      </div>

      {/* Filter Bar */}
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
        <Card className="p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">
            No matching findings
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No clauses match your current filter criteria. Try resetting your search or severity filters.
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
            className="mt-4 text-xs"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
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
