import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Trash2,
  Play,
  Download,
  Eye,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
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
    <div className="space-y-6">
      <PageHeader
        title={contract.filename_original}
        description="Inspect contract metadata, cryptographic integrity, and historical clause risk scans."
        backTo="/contracts"
        backLabel="All Contracts"
        badge={<StatusBadge status={contract.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Mock download started: ' + contract.filename_original)}
              leftIcon={<Download className="w-4 h-4" />}
              className="text-xs"
            >
              Download PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/contracts/new')}
              leftIcon={<Play className="w-4 h-4" />}
              className="text-xs"
            >
              Run New Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information & Integrity Verification</CardTitle>
          <p className="text-xs text-slate-500">
            Document properties registered in private file storage and database
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* File details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                File Details
              </span>
              <span className="font-bold text-slate-900 mt-1 block truncate">
                {contract.filename_original}
              </span>
              <span className="text-slate-500 text-[11px] mt-0.5 block">
                {formatBytes(contract.size_bytes)} • {contract.page_count} pages
              </span>
            </div>

            {/* Storage key */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                Private Storage Key
              </span>
              <span className="font-mono text-slate-800 text-[11px] mt-1 block truncate">
                {contract.storage_key}
              </span>
              <span className="text-slate-400 text-[10px] mt-0.5 block">
                Restricted access (No public URL)
              </span>
            </div>

            {/* SHA-256 Hash */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                SHA-256 Integrity Hash
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono text-[11px] text-slate-800">
                  {truncateHash(contract.sha256, 8, 8)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Copy full hash"
                >
                  {copiedHash ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                SHA-256 Verified Unchanged
              </span>
            </div>

            {/* Uploaded date */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                Uploaded At
              </span>
              <span className="font-bold text-slate-900 mt-1 block">
                {formatDate(contract.uploaded_at)}
              </span>
              <span className="text-slate-400 text-[10px] mt-0.5 block">
                Owner ID: {contract.owner_id}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Analysis History vs Text Extraction */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('analyses')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'analyses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Past Analyses ({analyses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Extracted Text Preview
          </button>
        </div>

        {/* Tab 1: Past Analyses */}
        {activeTab === 'analyses' && (
          <div className="space-y-3">
            {analyses.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">
                  No analyses performed yet
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Run your first analysis on this contract to identify high-risk payment terms and liability conditions.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/contracts/new')}
                  className="mt-4"
                >
                  Analyze Contract Now
                </Button>
              </Card>
            ) : (
              analyses.map(analysis => (
                <Card
                  key={analysis.id}
                  onClick={() => navigate(`/analyses/${analysis.id}`)}
                  className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            Analysis #{analysis.id}
                          </h4>
                          <RiskBadge
                            severity={analysis.overall_risk_level}
                            size="sm"
                          />
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {analysis.summary}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Completed {formatDate(analysis.created_at)} •{' '}
                          {analysis.model_name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          {analysis.findings_count.total} findings
                        </span>
                        <span className="text-[11px] font-semibold text-red-600 block">
                          {analysis.findings_count.high} high risk
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/analyses/${analysis.id}`)}
                        className="text-xs text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Extracted Text Preview */}
        {activeTab === 'preview' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Document Text Structure</CardTitle>
                  <p className="text-xs text-slate-500">
                    PyMuPDF extraction with page segmentation
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {mockSampleContractText.pages.map((p, idx) => (
                    <button
                      key={p.page_number}
                      type="button"
                      onClick={() => setPreviewPageIndex(idx)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold ${
                        previewPageIndex === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Pg {p.page_number}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-slate-300 bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
                {mockSampleContractText.pages[previewPageIndex]?.text}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Contract Permanently?"
        description={`This will erase "${contract.filename_original}", all extracted text, and ${analyses.length} associated analysis reports from local storage.`}
        confirmLabel="Delete Contract"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
