import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { ContractTable } from './ContractTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { demoStore } from '../../mocks/demo-store';
import type { Contract, ContractStatus } from '../../types';

export function ContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>(() =>
    demoStore.getContracts()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  const handleDeleteContract = (id: string) => {
    demoStore.deleteContract(id);
    setContracts(demoStore.getContracts());
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
    <div className="space-y-6">
      <PageHeader
        title="Contracts Library"
        description="Manage your uploaded PDF agreements, review integrity hashes, and inspect clause risk histories."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/contracts/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Upload Contract
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search contracts by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as ContractStatus | 'all')
            }
            className="rounded-lg border border-slate-300 bg-white py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="analyzed">Analyzed</option>
            <option value="extracted">Extracted</option>
            <option value="uploaded">Uploaded</option>
          </select>
        </div>
      </div>

      {/* Contracts Table or Empty State */}
      {filteredContracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7 text-slate-400" />}
          title="No contracts found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No contracts match your current filter criteria. Try adjusting your search query.'
              : 'You have not uploaded any contracts yet. Get started by analyzing your first agreement.'
          }
          actionLabel="Upload New Contract"
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
