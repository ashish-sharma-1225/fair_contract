import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Trash2,
  Play,
  Download,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { demoStore } from '../../mocks/demo-store';
import { mockSampleContractText } from '../../mocks/demo-data';
import { formatBytes, formatDate, truncateHash } from '../../lib/utils';


export function ContractDetailPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const navigate = useNavigate();

  const [copiedHash, setCopiedHash] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyses' | 'preview'>('analyses');
  const [previewPageIndex, setPreviewPageIndex] = useState(0);

  const contract = contractId ? demoStore.getContract(contractId) : undefined;
  const analyses = demoStore.getAnalyses().filter(a => a.contract_id === contractId);

  if (!contract) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contract Not Found"
          backTo="/contracts"
          backLabel="Back to Contracts"
        />
        <ErrorState
          title="Contract Record Unavailable"
          message={`Contract with ID "${contractId}" does not exist or may have been deleted.`}
          onRetry={() => navigate('/contracts')}
        />
      </div>
    );
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(contract.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDelete = () => {
    demoStore.deleteContract(contract.id);
    navigate('/contracts');
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
              Contracts
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700">Contract details</span>
          </div>
        }
        title={contract.filename_original}
        description="Contract metadata, cryptographic integrity, and historical clause risk analyses."
        badge={<StatusBadge status={contract.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Download: ' + contract.filename_original)}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Download PDF
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
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs text-slate-500 hover:text-red-700"
              aria-label="Delete contract"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      {/* Metadata Overview */}
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Contract Details & Cryptographic Integrity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 block text-[11px]">Filename</span>
            <span className="font-medium text-slate-900 block mt-0.5 truncate">
              {contract.filename_original}
            </span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">
              {formatBytes(contract.size_bytes)} · {contract.page_count} pages
            </span>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 block text-[11px]">Storage Key</span>
            <span className="font-mono text-slate-700 text-[11px] block mt-0.5 truncate">
              {contract.storage_key}
            </span>
            <span className="text-slate-400 text-[10px] mt-0.5 block">
              Private storage
            </span>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 block text-[11px]">SHA-256 Hash</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-mono text-[11px] text-slate-700">
                {truncateHash(contract.sha256, 8, 8)}
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                title="Copy hash"
              >
                {copiedHash ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <span className="text-emerald-700 text-[10px] font-medium flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Verified integrity
            </span>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50/60">
            <span className="text-slate-400 block text-[11px]">Uploaded Date</span>
            <span className="font-medium text-slate-900 block mt-0.5">
              {formatDate(contract.uploaded_at)}
            </span>
            <span className="text-slate-400 text-[10px] mt-0.5 block">
              Owner: {contract.owner_id}
            </span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('analyses')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analyses'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Past analyses ({analyses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Extracted text preview
          </button>
        </div>

        {/* Tab 1: Past Analyses */}
        {activeTab === 'analyses' && (
          <div className="space-y-2.5">
            {analyses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-xs">
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <h3 className="font-medium text-slate-900">
                  No analyses performed yet
                </h3>
                <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                  Run an analysis on this contract to identify high-risk payment terms and liability conditions.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/contracts/new')}
                  className="mt-3 text-xs"
                >
                  Analyze contract
                </Button>
              </div>
            ) : (
              analyses.map(analysis => (
                <div
                  key={analysis.id}
                  onClick={() => navigate(`/analyses/${analysis.id}`)}
                  className="rounded-lg border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Analysis #{analysis.id}
                      </span>
                      <RiskBadge
                        severity={analysis.overall_risk_level}
                        size="sm"
                      />
                    </div>
                    <p className="text-slate-600 mt-1 line-clamp-1">
                      {analysis.summary}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Completed {formatDate(analysis.created_at)} · {analysis.model_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-medium text-slate-900 block">
                        {analysis.findings_count.total} findings
                      </span>
                      <span className="text-[11px] text-red-700 block">
                        {analysis.findings_count.high} high risk
                      </span>
                    </div>
                    <span className="text-slate-400">→</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Extracted Text Preview */}
        {activeTab === 'preview' && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <h3 className="font-medium text-slate-900">Document Text</h3>
                <p className="text-slate-500">
                  Extracted with page segmentation
                </p>
              </div>
              <div className="flex items-center gap-1">
                {mockSampleContractText.pages.map((p, idx) => (
                  <button
                    key={p.page_number}
                    type="button"
                    onClick={() => setPreviewPageIndex(idx)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      previewPageIndex === idx
                        ? 'bg-slate-800 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Pg {p.page_number}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 text-slate-800 p-3.5 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
              {mockSampleContractText.pages[previewPageIndex]?.text}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Contract Permanently?"
        description={`This will remove "${contract.filename_original}", all extracted text, and ${analyses.length} associated analysis reports from local storage.`}
        confirmLabel="Delete contract"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}

