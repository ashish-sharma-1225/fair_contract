import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ContractTable } from '../contracts/ContractTable';
import { demoStore } from '../../mocks/demo-store';
import { formatShortDate } from '../../lib/utils';
import type { Contract } from '../../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>(() =>
    demoStore.getContracts()
  );
  const [showEmptyState, setShowEmptyState] = useState(false);

  const analyses = demoStore.getAnalyses();

  // Metrics
  const totalContracts = contracts.length;
  const totalAnalyses = analyses.length;
  const highRiskCount = analyses.reduce(
    (acc, a) => acc + (a.findings_count?.high || 0),
    0
  );
  const pendingReviewCount = analyses.reduce((acc, a) => {
    const unreviewed =
      a.findings?.filter(f => f.review_status === 'needs_review').length || 0;
    return acc + unreviewed;
  }, 0);

  const handleDeleteContract = (id: string) => {
    demoStore.deleteContract(id);
    setContracts(demoStore.getContracts());
  };

  // Chart data for risk distribution
  const riskChartData = [
    { name: 'High Risk', count: highRiskCount, color: '#dc2626' },
    {
      name: 'Medium Warning',
      count: analyses.reduce(
        (acc, a) => acc + (a.findings_count?.medium || 0),
        0
      ),
      color: '#f59e0b',
    },
    {
      name: 'Low Notice',
      count: analyses.reduce(
        (acc, a) => acc + (a.findings_count?.low || 0),
        0
      ),
      color: '#0284c7',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <PageHeader
        title="Contract Risk Overview"
        description="Monitor clause risks, verify regulatory alignments, and enforce your custom business terms."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmptyState(!showEmptyState)}
              className="text-xs text-slate-600 hidden sm:inline-flex"
            >
              Toggle Demo State ({showEmptyState ? 'Empty' : 'Active'})
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/contracts/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Analyze New Contract
            </Button>
          </div>
        }
      />

      {showEmptyState ? (
        /* Empty State Demonstration */
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Welcome to ClauseLens
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            You haven't uploaded any contracts yet. Upload your first PDF agreement to run automated clause risk extraction.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/contracts/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Analyze Your First Contract
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowEmptyState(false)}
            >
              Load Sample Workspace
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              title="Total contracts"
              value={totalContracts}
              subtitle="Encrypted local storage"
              icon={<FileText className="w-4 h-4 text-slate-400" />}
              onClick={() => navigate('/contracts')}
            />

            <StatCard
              title="Analyses completed"
              value={totalAnalyses}
              subtitle="Evidence-verified scans"
              icon={<FileCheck className="w-4 h-4 text-slate-400" />}
              onClick={() => navigate('/history')}
            />

            <StatCard
              title="High-risk findings"
              value={highRiskCount}
              subtitle="Requires review"
              icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
              trendText="High priority"
              trendType="negative"
            />

            <StatCard
              title="Pending review"
              value={pendingReviewCount}
              subtitle="Unreviewed clauses"
              icon={<Clock className="w-4 h-4 text-amber-700" />}
              trendText="Awaiting action"
              trendType="neutral"
            />
          </div>

          {/* Quick Notice Banner: Simple, quiet border banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-xs">
            <div>
              <span className="font-medium text-slate-900">
                Sample contract available: Apex Enterprises MSA
              </span>
              <p className="text-slate-500 mt-0.5">
                Inspect simulated findings including Net-90 payment terms and uncapped liability clauses.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analyses/anl_apex_001')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="self-start sm:self-auto shrink-0 text-xs"
            >
              View sample findings
            </Button>
          </div>

          {/* Risk Chart & Recent Analysis Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Risk Distribution Chart */}
            <div className="lg:col-span-1 rounded-lg border border-slate-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Risk Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Flagged clauses across all contracts
                </p>
              </div>
              <div className="h-56 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskChartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                        boxShadow: 'none',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Analysis Activity */}
            <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recent Contract Analyses
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest evaluations performed by ClauseLens
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/history')}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  View all →
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                {analyses.map(analysis => (
                  <div
                    key={analysis.id}
                    onClick={() => navigate(`/analyses/${analysis.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 hover:bg-slate-50/70 transition-colors cursor-pointer px-1 rounded"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-slate-900 hover:text-blue-600 transition-colors truncate">
                        {analysis.contract_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {analysis.summary}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Completed {formatShortDate(analysis.created_at)} · {analysis.model_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center text-xs">
                      <RiskBadge
                        severity={analysis.overall_risk_level}
                        size="sm"
                      />
                      <span className="text-slate-500 text-[11px]">
                        {analysis.findings_count.total} findings
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Contracts Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Uploaded Contracts
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Contracts undergoing extraction, integrity checks, and clause evaluation
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/contracts')}
                className="text-xs"
              >
                Manage contracts ({contracts.length})
              </Button>
            </div>


            <ContractTable
              contracts={contracts}
              onDeleteContract={handleDeleteContract}
            />
          </div>
        </>
      )}
    </div>
  );
}
