import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Plus,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { demoStore } from '../../mocks/demo-store';
import { formatShortDate } from '../../lib/utils';
import type { Contract } from '../../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [contracts] = useState<Contract[]>(() =>
    demoStore.getContracts()
  );

  const analyses = demoStore.getAnalyses();

  // Metrics from actual store data
  const totalContracts = contracts.length;
  const pendingReviewsCount = analyses.reduce((acc, a) => {
    const unreviewed =
      a.findings?.filter(f => f.review_status === 'needs_review').length || 0;
    return acc + unreviewed;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/contracts/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Analyse New Contract
          </Button>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Total Contracts"
          value={totalContracts}
          subtitle="Uploaded agreements"
          icon={<FileText className="w-4 h-4 text-slate-400" />}
          onClick={() => navigate('/contracts')}
        />

        <StatCard
          title="Pending Reviews"
          value={pendingReviewsCount}
          subtitle="Clauses awaiting review"
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          onClick={() => navigate('/contracts')}
        />

        <div
          onClick={() => navigate('/contracts/new')}
          className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Quick Action</span>
            <h3 className="text-sm font-semibold text-slate-900 mt-1">
              Analyse New Contract
            </h3>
          </div>
          <div className="flex items-center justify-between pt-2 text-xs font-medium text-blue-600">
            <span>Upload & scan</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recent Contract Analysis Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recent Contract Analysis
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/contracts')}
            className="text-xs text-slate-600 hover:text-slate-900"
          >
            View all →
          </Button>
        </div>

        {analyses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No contracts analyzed yet. Click "Analyse New Contract" to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Contract Name</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {analyses.map(analysis => (
                  <tr
                    key={analysis.id}
                    onClick={() => navigate(`/analyses/${analysis.id}`)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs sm:max-w-md truncate">
                      {analysis.contract_name}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatShortDate(analysis.created_at)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <RiskBadge severity={analysis.overall_risk_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/analyses/${analysis.id}`);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
