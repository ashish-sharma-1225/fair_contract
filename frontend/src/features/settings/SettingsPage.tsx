import { useState, useEffect } from 'react';
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

  // Auto test on mount
  useEffect(() => {
    handleTestBackend();
  }, []);

  const handleResetDemoData = () => {
    demoStore.reset();
    setIsResetDialogOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        title="Settings & Privacy"
      />

      {/* Backend Integration Status */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 text-xs">
        <h2 className="text-sm font-semibold text-slate-900">Backend API Connection</h2>

        <div className="rounded border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">API URL</span>
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
        <h2 className="text-sm font-semibold text-slate-900">Profile & Organization</h2>

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
                Saved
              </span>
            ) : (
              <span />
            )}

            <Button type="submit" variant="primary" size="sm" className="text-xs">
              Save
            </Button>
          </div>
        </form>
      </div>

      {/* Data Retention & Privacy Controls */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3.5 text-xs text-slate-600">
        <h2 className="text-sm font-semibold text-slate-900">Data Retention</h2>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Retention Schedule
          </label>
          <select
            value={profile.retention_days}
            onChange={e =>
              setProfile({
                ...profile,
                retention_days: Number(e.target.value),
              })
            }
            className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 cursor-pointer"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {/* Workspace Reset */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 text-xs">
        <h2 className="text-sm font-semibold text-slate-900">Workspace Management</h2>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-slate-200">
            <div>
              <p className="font-medium text-slate-900">
                Reset Demo Workspace
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Restores original sample agreements and policies.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-xs shrink-0"
            >
              Reset
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded border border-slate-200">
            <div>
              <p className="font-medium text-red-700">
                Purge All Data
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Clears all files and analyses from local storage.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteAllDialogOpen(true)}
              className="text-xs shrink-0 text-red-700 hover:bg-red-50 hover:border-red-200"
            >
              Purge
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
