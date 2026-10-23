import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ContractTable } from './ContractTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { apiClient } from '../../lib/api-client';
import type { Contract, ContractStatus } from '../../types';

export function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getContracts();
      setContracts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve contracts from backend';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const handleDeleteContract = async (id: string) => {
    try {
      await apiClient.deleteContract(id);
      // Immediately refresh list from backend
      await fetchContracts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete contract';
      setError(msg);
    }
  };

  const filteredContracts = contracts.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.filename_original.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contracts History"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContracts}
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
              Analyse Contract
            </Button>
          </div>
        }
      />

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchContracts} className="text-xs bg-white text-red-700 border-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between py-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            aria-label="Search contracts"
            placeholder="Search contracts by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded border border-slate-200 focus:outline-none focus:border-slate-400 bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as ContractStatus | 'all')
            }
            className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-700 hover:border-slate-300 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="analyzed">Analyzed</option>
            <option value="extracted">Extracted</option>
            <option value="uploaded">Uploaded</option>
          </select>
        </div>
      </div>

      {/* Contracts Table or Empty State */}
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12">
          <LoadingState message="Loading contracts history..." />
        </div>
      ) : filteredContracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7 text-slate-400" />}
          title="No contracts found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No contracts match your search.'
              : 'No contracts uploaded yet.'
          }
          actionLabel="Analyse Contract"
          onAction={() => navigate('/contracts/new')}
          secondaryActionLabel={
            searchQuery || statusFilter !== 'all' ? 'Reset Filters' : undefined
          }
          onSecondaryAction={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <ContractTable
          contracts={filteredContracts}
          onDeleteContract={handleDeleteContract}
        />
      )}
    </div>
  );
}
