import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { LoadingState } from '../../components/ui/LoadingState';
import { apiClient } from '../../lib/api-client';
import { formatShortDate } from '../../lib/utils';
import type { Contract, Analysis } from '../../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedContracts, fetchedAnalyses] = await Promise.all([
        apiClient.getContracts(),
        apiClient.getAnalyses(),
      ]);
      setContracts(fetchedContracts);
      setAnalyses(fetchedAnalyses);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real backend metrics
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboardData}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              className="text-xs"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/contracts/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Analyse New Contract
            </Button>
          </div>
        }
      />

      {/* Error Banner with retry */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData} className="text-xs bg-white text-red-700 border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          title="Total Contracts"
          value={isLoading ? '...' : totalContracts}
          subtitle="Uploaded agreements"
          icon={<FileText className="w-4 h-4 text-slate-400" />}
          onClick={() => navigate('/contracts')}
        />

        <StatCard
          title="Pending Reviews"
          value={isLoading ? '...' : pendingReviewsCount}
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

        {isLoading ? (
          <div className="p-8">
            <LoadingState message="Loading recent contract analyses..." />
          </div>
        ) : analyses.length === 0 ? (
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
                {analyses.slice(0, 10).map(analysis => (
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
