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
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500 font-medium">
            <tr>
              <th className="py-2.5 px-3.5">Contract</th>
              <th className="py-2.5 px-3.5">Uploaded</th>
              <th className="py-2.5 px-3.5">Pages</th>
              <th className="py-2.5 px-3.5">SHA-256</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5">Risk Findings</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {contracts.map(contract => (
              <tr
                key={contract.id}
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                {/* Name */}
                <td className="py-2.5 px-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900 block max-w-xs sm:max-w-md truncate">
                        {contract.filename_original}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {contract.id}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Uploaded */}
                <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">
                  {formatShortDate(contract.uploaded_at)}
                </td>

                {/* Pages / Size */}
                <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600">
                  <span>{contract.page_count} pgs</span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {formatBytes(contract.size_bytes)}
                  </span>
                </td>

                {/* SHA-256 */}
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={e => handleCopyHash(contract.sha256, e)}
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title={`Full Hash: ${contract.sha256} (Click to copy)`}
                  >
                    <Hash className="w-3 h-3 text-slate-400" />
                    <span>{truncateHash(contract.sha256, 6, 6)}</span>
                    {copiedHash === contract.sha256 ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                    )}
                  </button>
                </td>

                {/* Status */}
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <StatusBadge status={contract.status} />
                </td>

                {/* Risk Summary */}
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  {contract.risk_summary ? (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      {contract.risk_summary.high > 0 && (
                        <span className="font-medium text-red-700">
                          {contract.risk_summary.high} high
                        </span>
                      )}
                      {contract.risk_summary.high > 0 && contract.risk_summary.medium > 0 && (
                        <span className="text-slate-300">·</span>
                      )}
                      {contract.risk_summary.medium > 0 && (
                        <span className="font-medium text-amber-800">
                          {contract.risk_summary.medium} med
                        </span>
                      )}
                      {(contract.risk_summary.high > 0 || contract.risk_summary.medium > 0) &&
                        contract.risk_summary.low > 0 && (
                          <span className="text-slate-300">·</span>
                        )}
                      {contract.risk_summary.low > 0 && (
                        <span className="text-slate-500 font-medium">
                          {contract.risk_summary.low} low
                        </span>
                      )}
                      {contract.risk_summary.total === 0 && (
                        <span className="text-emerald-700 font-medium">
                          No flags
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      Not yet analyzed
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
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
                        className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="View analysis report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/contracts/new')}
                        className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
                        title="Analyze contract"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingContractId(contract.id)}
                      className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                      title="Delete contract"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
