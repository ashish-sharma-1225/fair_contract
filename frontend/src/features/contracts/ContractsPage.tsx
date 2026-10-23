import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText } from 'lucide-react';
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
