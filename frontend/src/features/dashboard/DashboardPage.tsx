import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  FileCheck,
  Sparkles,
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
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Contracts"
              value={totalContracts}
              subtitle="Stored securely in private storage"
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              iconBgColor="bg-blue-50 text-blue-600"
              onClick={() => navigate('/contracts')}
            />

            <StatCard
              title="Analyses Completed"
              value={totalAnalyses}
              subtitle="Evidence-verified scans"
              icon={<FileCheck className="w-5 h-5 text-emerald-600" />}
              iconBgColor="bg-emerald-50 text-emerald-600"
              onClick={() => navigate('/history')}
            />

            <StatCard
              title="High-Risk Flags"
              value={highRiskCount}
              subtitle="Breaches of policies or laws"
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              iconBgColor="bg-red-50 text-red-600"
              trendText="Requires priority attention"
              trendType="negative"
            />

            <StatCard
              title="Pending Human Reviews"
              value={pendingReviewCount}
              subtitle="Awaiting manual review"
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              iconBgColor="bg-amber-50 text-amber-600"
              trendText="Human review needed"
              trendType="neutral"
            />
          </div>

          {/* Quick Notice Banner */}
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Ready to test with a realistic agreement?
                </h4>
                <p className="text-xs text-slate-600">
                  Try our built-in <strong>Apex Enterprises MSA</strong> sample to observe Net-90 payment detection and uncapped liability warnings.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/analyses/anl_apex_001')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex shrink-0 bg-white"
            >
              View Sample Findings
            </Button>
          </div>

          {/* Risk Chart & Recent Analysis Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Distribution Chart */}
            <Card className="lg:col-span-1 flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Risk Finding Distribution</CardTitle>
                <p className="text-xs text-slate-500">
                  Aggregated clause flags across all analyzed documents
                </p>
              </CardHeader>
              <CardContent className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={riskChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Analysis Activity */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Contract Analyses</CardTitle>
                  <p className="text-xs text-slate-500">
                    Latest clause scans performed by ClauseLens
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/history')}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  View All History
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyses.map(analysis => (
                  <div
                    key={analysis.id}
                    onClick={() => navigate(`/analyses/${analysis.id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {analysis.contract_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {analysis.summary}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Completed {formatShortDate(analysis.created_at)} •{' '}
                          {analysis.model_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <RiskBadge
                        severity={analysis.overall_risk_level}
                        size="sm"
                      />
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800">
                          {analysis.findings_count.total} findings
                        </span>
                        <span className="block text-[10px] text-red-600 font-semibold">
                          {analysis.findings_count.high} high risk
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Contracts Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Uploaded Contracts
                </h3>
                <p className="text-xs text-slate-500">
                  Contracts undergoing extraction, integrity checks, and clause evaluation
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/contracts')}
                className="text-xs"
              >
                Manage All Contracts ({contracts.length})
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
