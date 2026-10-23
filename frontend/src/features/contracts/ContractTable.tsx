import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Play,
  Eye,
  Hash,
  Copy,
  Check,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

import { formatBytes, formatShortDate, truncateHash } from '../../lib/utils';
import type { Contract } from '../../types';

export interface ContractTableProps {
  contracts: Contract[];
  onDeleteContract: (contractId: string) => void;
  isLoading?: boolean;
}

export function ContractTable({
  contracts,
  onDeleteContract,
}: ContractTableProps) {
  const navigate = useNavigate();
  const [deletingContractId, setDeletingContractId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const selectedContractForDeletion = contracts.find(
    c => c.id === deletingContractId
  );

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Contract Name</th>
              <th className="py-3 px-4">Uploaded</th>
              <th className="py-3 px-4">Pages / Size</th>
              <th className="py-3 px-4">SHA-256 Integrity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Risk Summary</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {contracts.map(contract => (
              <tr
                key={contract.id}
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                {/* Name */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block max-w-xs sm:max-w-md truncate">
                        {contract.filename_original}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {contract.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Uploaded */}
                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                  {formatShortDate(contract.uploaded_at)}
                </td>

                {/* Pages / Size */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-medium text-slate-800">
                    {contract.page_count} pgs
                  </span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-slate-500 font-mono">
                    {formatBytes(contract.size_bytes)}
                  </span>
                </td>

                {/* SHA-256 */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={e => handleCopyHash(contract.sha256, e)}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                    title={`Full Hash: ${contract.sha256} (Click to copy)`}
                  >
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>{truncateHash(contract.sha256, 6, 6)}</span>
                    {copiedHash === contract.sha256 ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={contract.status} />
                </td>

                {/* Risk Summary */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  {contract.risk_summary ? (
                    <div className="flex items-center gap-1.5">
                      {contract.risk_summary.high > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                          {contract.risk_summary.high} High
                        </span>
                      )}
                      {contract.risk_summary.medium > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800">
                          {contract.risk_summary.medium} Med
                        </span>
                      )}
                      {contract.risk_summary.low > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-sky-100 text-sky-800">
                          {contract.risk_summary.low} Low
                        </span>
                      )}
                      {contract.risk_summary.total === 0 && (
                        <span className="text-[11px] text-emerald-600 font-medium">
                          No Flags
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      Not yet analyzed
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {contract.latest_analysis_id ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/analyses/${contract.latest_analysis_id}`)
                        }
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Analysis Results"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/contracts/new')}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Analyze Contract"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingContractId(contract.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Contract"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingContractId}
        title="Permanently Delete Contract?"
        description={`Are you sure you want to delete "${selectedContractForDeletion?.filename_original}"? This action will remove the contract, extracted text, and all associated risk analyses according to your retention policy.`}
        confirmLabel="Delete Contract"
        variant="danger"
        onConfirm={() => {
          if (deletingContractId) {
            onDeleteContract(deletingContractId);
            setDeletingContractId(null);
          }
        }}
        onClose={() => setDeletingContractId(null)}
      />
    </>
  );
}
