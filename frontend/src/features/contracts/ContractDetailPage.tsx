import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Play,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { apiClient } from '../../lib/api-client';
import { formatBytes, formatDate, truncateHash } from '../../lib/utils';
import type { Contract, Analysis, ContractExtraction } from '../../types';

export function ContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<Contract | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [extraction, setExtraction] = useState<ContractExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copiedHash, setCopiedHash] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyses' | 'preview'>('analyses');
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const fetchContractData = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedContract, allAnalyses] = await Promise.all([
        apiClient.getContract(contractId),
        apiClient.getAnalyses(),
      ]);
      setContract(fetchedContract);
      setAnalyses(allAnalyses.filter(a => a.contract_id === contractId));

      try {
        const fetchedExtraction = await apiClient.getContractExtraction(contractId);
        setExtraction(fetchedExtraction);
      } catch {
        // Extraction might not be generated yet or optional
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve contract';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchContractData();
  }, [fetchContractData]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12">
        <LoadingState message="Loading contract details..." />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contract Not Found"
          backTo="/contracts"
          backLabel="Back to Contracts"
        />
        <ErrorState
          title="Contract Record Unavailable"
          message={error || `Contract with ID "${contractId}" does not exist or may have been deleted.`}
          onRetry={fetchContractData}
        />
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(contract.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await apiClient.deleteContract(contract.id);
      navigate('/contracts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete contract');
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span
              onClick={() => navigate('/contracts')}
              className="hover:text-slate-900 cursor-pointer transition-colors"
            >
              Contracts History
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700">Contract details</span>
          </div>
        }
        title={contract.filename_original}
        badge={<StatusBadge status={contract.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContractData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contracts/new')}
              leftIcon={<Play className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Run analysis
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-600" />}
              className="text-xs text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* Contract Metadata Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Contract ID</span>
          <span className="font-mono text-slate-700 text-xs">{contract.id}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Uploaded</span>
          <span className="text-slate-800 font-medium">{formatDate(contract.uploaded_at)}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Pages & Size</span>
          <span className="text-slate-800 font-medium">
            {contract.page_count} pages · {formatBytes(contract.size_bytes)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">SHA-256 Hash</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-slate-600 text-[11px] truncate" title={contract.sha256}>
              {truncateHash(contract.sha256, 8, 8)}
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy full hash"
            >
              {copiedHash ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('analyses')}
          className={`pb-2.5 cursor-pointer border-b-2 transition-colors ${
            activeTab === 'analyses'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Analysis History ({analyses.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-2.5 cursor-pointer border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-slate-900 text-slate-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Extracted Text Preview
        </button>
      </div>

      {/* Tab 1: Analyses list */}
      {activeTab === 'analyses' && (
        <div className="space-y-3">
          {analyses.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No analysis reports run on this contract yet. Click "Run analysis" to begin.
            </div>
          ) : (
            analyses.map(analysis => (
              <div
                key={analysis.id}
                onClick={() => navigate(`/analyses/${analysis.id}`)}
                className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors cursor-pointer text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">
                      Report #{analysis.id}
                    </span>
                    <RiskBadge severity={analysis.overall_risk_level} size="sm" />
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-1">{analysis.summary}</p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Completed {formatDate(analysis.created_at)} · {analysis.model_provider}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
                    className="text-xs"
                  >
                    View report
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Extracted Text Preview */}
      {activeTab === 'preview' && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          {extraction && extraction.pages.length > 0 ? (
            <>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 mr-1">Pages:</span>
                {extraction.pages.map((p, idx) => (
                  <button
                    key={p.page_number}
                    type="button"
                    onClick={() => setPreviewPageIndex(idx)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                      previewPageIndex === idx
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Page {p.page_number}
                  </button>
                ))}
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 text-slate-800 p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
                {extraction.pages[previewPageIndex]?.text || 'No text extracted for this page.'}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              No extracted text preview is currently stored for this contract.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Contract?"
        description={`Are you sure you want to permanently delete "${contract.filename_original}" and all associated analysis records?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
