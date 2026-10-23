import { useState } from 'react';
import {
  RefreshCw,
} from 'lucide-react';

import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { apiClient, API_BASE_URL } from '../../lib/api-client';
import { demoStore } from '../../mocks/demo-store';
import { mockUserProfile } from '../../mocks/demo-data';

export function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState(mockUserProfile);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Backend test state
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    'idle' | 'online' | 'offline'
  >('idle');
  const [backendMessage, setBackendMessage] = useState('');

  // Dialogs
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    setBackendStatus('idle');
    try {
      const res = await apiClient.checkHealth();
      setBackendStatus('online');
      setBackendMessage(`FastAPI service reachable at ${API_BASE_URL} (Status: ${res.status})`);
    } catch {
      setBackendStatus('offline');
      setBackendMessage(
        `FastAPI backend is currently offline at ${API_BASE_URL}. Operating in Local Demo Simulation Mode.`
      );
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleResetDemoData = () => {
    demoStore.reset();
    setIsResetDialogOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & Privacy"
        description="Manage your account profile, data retention policies, and backend API integration settings."
      />

      {/* Backend Integration Status */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Backend API Connection</h2>
          <p className="text-slate-500 mt-0.5">
            Connects to a FastAPI service for document parsing, database persistence, and model execution.
          </p>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Backend URL (VITE_API_BASE_URL)</span>
            <code className="font-mono text-slate-800">
              {API_BASE_URL}
            </code>
          </div>

          <Button
            variant="outline"
            size="sm"
            isLoading={isTestingBackend}
            onClick={handleTestBackend}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs self-start sm:self-auto"
          >
            Test connection
          </Button>
        </div>

        {backendStatus === 'online' && (
          <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {backendMessage}
          </div>
        )}

        {backendStatus === 'offline' && (
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {backendMessage}
          </div>
        )}
      </div>

      {/* Profile & Account Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Profile & Organization</h2>
          <p className="text-slate-500 mt-0.5">
            Account identity associated with uploaded agreements
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Email Address"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Organization"
              value={profile.organization}
              onChange={e =>
                setProfile({ ...profile, organization: e.target.value })
              }
            />
            <Input
              label="Role"
              value={profile.role}
              onChange={e => setProfile({ ...profile, role: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isSavedNotice ? (
              <span className="text-xs text-emerald-700 font-medium">
                Profile updated
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Saved in local simulation
              </span>
            )}

            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Save changes
            </Button>
          </div>
        </form>
      </div>

      {/* Data Retention & Privacy Controls */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3.5 text-xs text-slate-600">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Data Privacy & Document Retention</h2>
          <p className="text-slate-500 mt-0.5">
            Confidentiality guarantees and automated deletion schedule
          </p>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 space-y-1">
          <h3 className="font-medium text-slate-900 text-xs">
            Cryptographic Integrity & Local Isolation
          </h3>
          <p className="leading-relaxed">
            Every uploaded contract is assigned a unique SHA-256 fingerprint. File bytes are kept in local storage and never publicly indexed.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Automated document deletion schedule
          </label>
          <select
            value={profile.retention_days}
            onChange={e =>
              setProfile({
                ...profile,
                retention_days: Number(e.target.value),
              })
            }
            className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value={7}>Purge after 7 days</option>
            <option value={30}>Purge after 30 days</option>
            <option value={90}>Purge after 90 days (Default)</option>
            <option value={365}>Purge after 1 year</option>
          </select>
          <p className="mt-1 text-[11px] text-slate-400">
            Contracts and analyses expire automatically according to this schedule.
          </p>
        </div>
      </div>

      {/* Workspace Reset */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 text-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Workspace Management</h2>
          <p className="text-slate-500 mt-0.5">
            Actions for resetting demo data or clearing local storage
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">
                Reset Demo Workspace
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Restores original sample contracts (Apex MSA, NorthStar Retainer) and policies.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-xs shrink-0"
            >
              Reset seed data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-slate-200">
            <div>
              <p className="font-medium text-red-700">
                Purge All Data
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Clears all contract files, extractions, and analyses from local storage.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteAllDialogOpen(true)}
              className="text-xs shrink-0 text-red-700 hover:bg-red-50 hover:border-red-200"
            >
              Purge all data
            </Button>
          </div>
        </div>
      </div>


      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetDialogOpen}
        title="Reset Demo Workspace?"
        description="This will reset all contracts, policies, and analyses back to the initial sample state."
        confirmLabel="Reset to Default"
        variant="primary"
        onConfirm={handleResetDemoData}
        onClose={() => setIsResetDialogOpen(false)}
      />

      {/* Delete All Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAllDialogOpen}
        title="Purge All Data?"
        description="Are you sure you want to delete all local contracts, policies, and analyses? This cannot be undone."
        confirmLabel="Purge Everything"
        variant="danger"
        onConfirm={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onClose={() => setIsDeleteAllDialogOpen(false)}
      />
    </div>
  );
}
