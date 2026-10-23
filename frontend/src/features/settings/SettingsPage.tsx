import React, { useState } from 'react';
import {
  User,
  Shield,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
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
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <CardTitle>FastAPI Backend Connection</CardTitle>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Architecture Preparation
            </span>
          </div>
          <p className="text-xs text-slate-500">
            ClauseLens connects to a Python FastAPI backend for PyMuPDF text parsing, PostgreSQL persistence, and server-side Gemini 2.5 API execution.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                Configured Backend Endpoint (VITE_API_BASE_URL)
              </span>
              <code className="text-xs font-mono font-bold text-slate-800">
                {API_BASE_URL}
              </code>
            </div>

            <Button
              variant="outline"
              size="sm"
              isLoading={isTestingBackend}
              onClick={handleTestBackend}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs self-start sm:self-auto bg-white"
            >
              Test Backend Connection
            </Button>
          </div>

          {backendStatus === 'online' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{backendMessage}</span>
            </div>
          )}

          {backendStatus === 'offline' && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Simulation Active: </strong>
                <span>{backendMessage}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile & Account Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            <CardTitle>Profile & Organization</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            Account identity associated with uploaded agreements
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Organization / Practice"
                value={profile.organization}
                onChange={e =>
                  setProfile({ ...profile, organization: e.target.value })
                }
              />
              <Input
                label="Role Title"
                value={profile.role}
                onChange={e => setProfile({ ...profile, role: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {isSavedNotice ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Profile updated in local storage
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Settings saved locally in demo mode
                </span>
              )}

              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Retention & Privacy Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <CardTitle>Data Privacy & Document Retention</CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            ClauseLens privacy architecture and confidentiality guarantees
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-600">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">
              Cryptographic Integrity & Private Storage
            </h4>
            <p className="leading-relaxed">
              Every uploaded contract is assigned a unique SHA-256 fingerprint. Original PDF files are stored in private storage with restricted permissions and are never exposed via public URLs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">
              AI Processing Transparency (Google Gemini API)
            </h4>
            <p className="leading-relaxed">
              Only extracted clause snippets relevant to selected policies are sent to the AI review provider. Gemini API credentials are maintained strictly on the FastAPI backend and are never included in browser assets.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Automated Document Deletion Schedule
            </label>
            <select
              value={profile.retention_days}
              onChange={e =>
                setProfile({
                  ...profile,
                  retention_days: Number(e.target.value),
                })
              }
              className="rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Purge after 7 days</option>
              <option value={30}>Purge after 30 days</option>
              <option value={90}>Purge after 90 days (Default)</option>
              <option value={365}>Purge after 1 year</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
              Contracts, text extractions, and findings will be deleted automatically upon schedule expiration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dangerous Actions & Reset */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone & Workspace Reset</CardTitle>
          <p className="text-xs text-red-600">
            Irreversible actions for resetting local state or removing stored documents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-red-200 bg-white">
            <div>
              <h5 className="text-xs font-bold text-slate-900">
                Reset Demo Workspace to Default Seed Data
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restores original sample contracts (Apex MSA, NorthStar Retainer) and standard policy presets.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(true)}
              className="text-xs shrink-0"
            >
              Reset Seed Data
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-red-200 bg-white">
            <div>
              <h5 className="text-xs font-bold text-red-700">
                Purge All Contracts & Custom Policies
              </h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Immediately wipes all contract files, extracted text, and review findings.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteAllDialogOpen(true)}
              className="text-xs shrink-0"
            >
              Purge All Data
            </Button>
          </div>
        </CardContent>
      </Card>

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
